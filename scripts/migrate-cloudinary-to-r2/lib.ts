// Funções puras da migração Cloudinary -> R2 (sem rede/Firestore; testadas em lib.test.ts).
import { createHash } from 'node:crypto';
import sharp from 'sharp';

export const CLOUD_NAME = 'djtuzexfd';
export const WIDTHS = [320, 480, 640, 828, 1080, 1600] as const;
export const CANONICAL_WIDTH = 1080;

// URL Cloudinary dentro de qualquer string (campo puro, HTML, CSS url(...)).
const URL_RE = /https?:\/\/res\.cloudinary\.com\/[^\s"'<>()\\]+/g;

// Parâmetros de transformação Cloudinary (prefixo antes do "_").
const TX_KEYS = new Set([
  'a', 'ac', 'af', 'b', 'bo', 'br', 'c', 'co', 'cs', 'd', 'dl', 'dn', 'dpr', 'du', 'e', 'eo',
  'f', 'fl', 'fn', 'fps', 'g', 'h', 'if', 'ki', 'l', 'o', 'p', 'pg', 'q', 'r', 'so', 'sp', 't',
  'u', 'vc', 'vs', 'w', 'x', 'y', 'z',
]);
const MEDIA_EXT = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'heif', 'bmp', 'tif', 'tiff', 'svg',
  'mp4', 'webm', 'mov', 'm4v', 'ogv', 'avi', 'mkv',
]);

export type ResourceType = 'image' | 'video';

export interface ParsedUrl {
  cloud: string;
  resourceType: ResourceType;
  version?: string; // "v123" sem o "v"
  publicId: string; // sem transformação, versão e extensão
  ext?: string;
  transformed: boolean;
}

export function findCloudinaryUrls(s: string): string[] {
  return (s.match(URL_RE) ?? []).map(trimUrl);
}

function trimUrl(u: string): string {
  return u.replace(/[.,;:]+$/, '');
}

function isTransformSegment(seg: string): boolean {
  return seg.split(',').every((part) => {
    const i = part.indexOf('_');
    return i > 0 && (TX_KEYS.has(part.slice(0, i)) || part.startsWith('$'));
  });
}

/** Extrai cloud/tipo/public_id de uma URL de entrega. null = formato não suportado (fetch, private, raw...). */
export function parseCloudinaryUrl(url: string): ParsedUrl | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.hostname !== 'res.cloudinary.com') return null;
  const segs = u.pathname.split('/').filter(Boolean);
  const [cloud, rt, type, ...rest] = segs;
  if ((rt !== 'image' && rt !== 'video') || type !== 'upload' || rest.length === 0) return null;
  let transformed = false;
  let version: string | undefined;
  let i = 0;
  // Transformações vêm antes da versão; depois da versão tudo é public_id.
  while (i < rest.length - 1 && isTransformSegment(rest[i])) {
    transformed = true;
    i++;
  }
  if (i < rest.length - 1 && /^v\d+$/.test(rest[i])) {
    version = rest[i].slice(1);
    i++;
  }
  let id = rest.slice(i).join('/');
  let ext: string | undefined;
  const m = id.match(/\.([A-Za-z0-9]+)$/);
  if (m && MEDIA_EXT.has(m[1].toLowerCase())) {
    ext = m[1].toLowerCase();
    id = id.slice(0, -m[0].length);
  }
  if (!id) return null;
  let publicId: string;
  try {
    publicId = decodeURIComponent(id);
  } catch {
    return null;
  }
  return { cloud, resourceType: rt, version, publicId, ext, transformed };
}

/** Gera as variantes WebP (c_limit: nunca amplia; EXIF aplicado e removido). Chave = nome do arquivo. */
export async function renderVariants(input: Buffer): Promise<Record<string, Buffer>> {
  // shortcut: GIF/WebP animado vira só o 1º quadro; tratar se a loja tiver imagens animadas.
  const base = () => sharp(input, { failOn: 'none' }).rotate();
  const out: Record<string, Buffer> = {};
  for (const w of WIDTHS) {
    out[`${w}.webp`] = await base().resize({ width: w, withoutEnlargement: true }).webp({ quality: 90, smartSubsample: true, effort: 5 }).toBuffer();
  }
  out['orig.webp'] = await base().webp({ quality: 95, smartSubsample: true, effort: 5 }).toBuffer();
  return out;
}

/** Chave estável de dedupe: tipo + public_id. */
export function assetKey(p: Pick<ParsedUrl, 'resourceType' | 'publicId'>): string {
  return `${p.resourceType}:${p.publicId}`;
}

/** Slug legível + hash curto: único e seguro para chave R2. */
export function slugForPublicId(publicId: string): string {
  const slug = publicId
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const hash = createHash('sha1').update(publicId).digest('hex').slice(0, 8);
  return slug ? `${slug}-${hash}` : hash;
}

/** URL do original sem transformação para download. */
export function originalUrl(p: ParsedUrl): string {
  const v = p.version ? `v${p.version}/` : '';
  const id = p.publicId.split('/').map(encodeURIComponent).join('/');
  const ext = p.resourceType === 'video' && p.ext ? `.${p.ext}` : '';
  return `https://res.cloudinary.com/${p.cloud}/${p.resourceType}/upload/${v}${id}${ext}`;
}

/** Valor do mapping -> URL final gravada no Firestore. */
export function targetUrl(mappingValue: string, publicBase: string): string {
  if (/^https?:\/\//.test(mappingValue)) return mappingValue; // vídeo: já é URL
  return `${publicBase.replace(/\/+$/, '')}/${mappingValue}/${CANONICAL_WIDTH}.webp`;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (v === null || typeof v !== 'object') return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

export interface Leaf {
  path: string; // ex: images[2].url
  value: string;
}

/** Todas as strings que contêm URL Cloudinary, com caminho. Ignora Timestamp/GeoPoint/Ref etc. */
export function collectCloudinaryLeaves(data: unknown, path = ''): Leaf[] {
  if (typeof data === 'string') return data.includes('res.cloudinary.com') ? [{ path, value: data }] : [];
  if (Array.isArray(data)) return data.flatMap((v, i) => collectCloudinaryLeaves(v, `${path}[${i}]`));
  if (isPlainObject(data)) {
    return Object.entries(data).flatMap(([k, v]) => collectCloudinaryLeaves(v, path ? `${path}.${k}` : k));
  }
  return [];
}

/**
 * Troca URLs presentes em `replace` (url antiga -> url nova) preservando a forma:
 * string continua string, arrays/objetos mantêm chaves e ordem. Retorna o MESMO objeto se nada mudou.
 */
export function replaceUrls<T>(data: T, replace: (url: string) => string | undefined): T {
  if (typeof data === 'string') {
    const out = data.replace(URL_RE, (raw) => {
      const url = trimUrl(raw);
      const next = replace(url);
      return next === undefined ? raw : next + raw.slice(url.length);
    });
    return (out === data ? data : out) as T;
  }
  if (Array.isArray(data)) {
    let changed = false;
    const out = data.map((v) => {
      const n = replaceUrls(v, replace);
      if (n !== v) changed = true;
      return n;
    });
    return (changed ? out : data) as T;
  }
  if (isPlainObject(data)) {
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      out[k] = replaceUrls(v, replace);
      if (out[k] !== v) changed = true;
    }
    return (changed ? out : data) as T;
  }
  return data;
}

/** Caminho de campo genérico: troca índices por [] para agrupar no inventário (images[3].url -> images[].url). */
export function fieldPattern(path: string): string {
  return path.replace(/\[\d+\]/g, '[]');
}
