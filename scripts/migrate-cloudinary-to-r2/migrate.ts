// Migração Cloudinary -> Cloudflare R2. Uso: ver README.md nesta pasta.
// Nunca loga valores de credenciais.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import {
  FieldPath,
  getFirestore,
  type CollectionReference,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  CLOUD_NAME,
  WIDTHS,
  assetKey,
  collectCloudinaryLeaves,
  fieldPattern,
  findCloudinaryUrls,
  originalUrl,
  parseCloudinaryUrl,
  renderVariants,
  replaceUrls,
  slugForPublicId,
  targetUrl,
  type ParsedUrl,
} from './lib';

const PROJECT_ID = 'studio-6696860128-c7a6f';
const OUT_DIR = path.join(__dirname, 'out'); // gitignored
const MAPPING_FILE = path.join(OUT_DIR, 'mapping.json');
const CACHE_CONTROL = 'public, max-age=31536000, immutable';
const CONCURRENCY = 4;
const BATCH_SIZE = 400;
const PAGE_SIZE = 300;

// Campos já inventariados; o resto é reportado como "inesperado".
const KNOWN_FIELDS: Record<string, RegExp> = {
  products: /^(image|images\[\]|variations\[\]\.(image|images\[\]))(\.(url|originalUrl))?$/,
  categories: /^image(\.(url|sourceUrl))?$/,
  banners: /^imageUrl$/,
  orders: /^items\[\]\.image(\.url)?$/,
};

// ---------- env ----------
function loadEnv(required: string[]) {
  const envFile = process.env.MIGRATION_ENV;
  if (!envFile || !existsSync(envFile)) throw new Error('MIGRATION_ENV precisa apontar para um .env existente (fora do repo).');
  dotenv.config({ path: envFile });
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Variáveis ausentes no .env: ${missing.join(', ')}`);
}

// ---------- Firestore ----------
function firestore(): Firestore {
  initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
  return getFirestore();
}

async function* walkCollection(coll: CollectionReference): AsyncGenerator<QueryDocumentSnapshot> {
  let last: QueryDocumentSnapshot | undefined;
  for (;;) {
    let q = coll.orderBy(FieldPath.documentId()).limit(PAGE_SIZE);
    if (last) q = q.startAfter(last);
    const snap = await q.get();
    for (const doc of snap.docs) {
      yield doc;
      // shortcut: 1 listCollections por documento; lento com dezenas de milhares de docs.
      for (const sub of await doc.ref.listCollections()) yield* walkCollection(sub);
    }
    if (snap.size < PAGE_SIZE) return;
    last = snap.docs[snap.docs.length - 1];
  }
}

async function* allDocs(db: Firestore) {
  for (const coll of await db.listCollections()) yield* walkCollection(coll);
}

// "users/abc/orders" -> "users/*/orders"
function collectionPattern(doc: QueryDocumentSnapshot): string {
  return doc.ref.parent.path.split('/').map((s, i) => (i % 2 ? '*' : s)).join('/');
}

interface Hit {
  collection: string;
  docPath: string;
  docId: string;
  field: string;
  value: string;
  urls: string[];
}

interface Asset {
  parsed: ParsedUrl;
  urls: Set<string>;
}

interface Scan {
  hits: Hit[];
  assets: Map<string, Asset>;
  unsupported: Set<string>;
}

async function scan(db: Firestore): Promise<Scan> {
  const hits: Hit[] = [];
  const assets = new Map<string, Asset>();
  const unsupported = new Set<string>();
  let docs = 0;
  for await (const doc of allDocs(db)) {
    docs++;
    for (const leaf of collectCloudinaryLeaves(doc.data())) {
      const urls = findCloudinaryUrls(leaf.value);
      hits.push({ collection: collectionPattern(doc), docPath: doc.ref.path, docId: doc.id, field: leaf.path, value: leaf.value, urls });
      for (const url of urls) {
        const p = parseCloudinaryUrl(url);
        if (!p || p.cloud !== CLOUD_NAME) {
          unsupported.add(url);
          continue;
        }
        const k = assetKey(p);
        const a = assets.get(k) ?? { parsed: p, urls: new Set() };
        if (!a.parsed.version && p.version) a.parsed = p; // prefere URL com versão para baixar
        a.urls.add(url);
        assets.set(k, a);
      }
    }
  }
  console.log(`Documentos lidos: ${docs}`);
  return { hits, assets, unsupported };
}

function printInventory(s: Scan) {
  const groups = new Map<string, Set<string>>();
  for (const h of s.hits) {
    const k = `${h.collection} :: ${fieldPattern(h.field)}`;
    const set = groups.get(k) ?? new Set();
    h.urls.forEach((u) => set.add(u));
    groups.set(k, set);
  }
  const unexpected: string[] = [];
  console.log('\nURLs únicas por coleção/campo:');
  for (const [k, set] of [...groups].sort()) {
    const [coll, field] = k.split(' :: ');
    const known = KNOWN_FIELDS[coll]?.test(field);
    if (!known) unexpected.push(k);
    console.log(`  ${known ? ' ' : '!'} ${k}: ${set.size}`);
  }
  const allUrls = new Set(s.hits.flatMap((h) => h.urls));
  const assets = [...s.assets.values()];
  const transformed = [...allUrls].filter((u) => parseCloudinaryUrl(u)?.transformed);
  console.log(`\nTotal de URLs Cloudinary únicas: ${allUrls.size}`);
  console.log(`public_ids únicos: ${assets.length} (imagens ${assets.filter((a) => a.parsed.resourceType === 'image').length}, vídeos ${assets.filter((a) => a.parsed.resourceType === 'video').length})`);
  console.log(`URLs com transformação salva (será descartada, original é usado): ${transformed.length}`);
  transformed.slice(0, 10).forEach((u) => console.log(`    ${u}`));
  if (unexpected.length) console.log(`\nCampos inesperados (!): ${unexpected.length}\n${unexpected.map((u) => `    ${u}`).join('\n')}`);
  if (s.unsupported.size) console.log(`\nURLs não suportadas (outra conta, fetch, private...): ${s.unsupported.size}\n${[...s.unsupported].map((u) => `    ${u}`).join('\n')}`);
  return allUrls.size;
}

// ---------- helpers ----------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class HttpError extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

async function retry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      const permanent = e instanceof HttpError && e.status >= 400 && e.status < 500 && e.status !== 408 && e.status !== 429;
      if (permanent || i >= attempts) throw e;
      await sleep(500 * 2 ** i + Math.random() * 250);
    }
  }
}

async function download(url: string): Promise<{ buf: Buffer; type: string | null }> {
  const res = await fetch(url);
  if (!res.ok) throw new HttpError(res.status, `HTTP ${res.status} em ${url}`);
  return { buf: Buffer.from(await res.arrayBuffer()), type: res.headers.get('content-type') };
}

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function writeOut(name: string, data: unknown) {
  mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, name);
  writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}

// ---------- modos ----------
async function backup(db: Firestore) {
  const s = await scan(db);
  const rows = s.hits.map((h) => ({ colecao: h.collection, docPath: h.docPath, docId: h.docId, campo: h.field, valorAntigo: h.value }));
  console.log(`Backup gravado: ${writeOut(`backup-${stamp()}.json`, rows)} (${rows.length} valores)`);
}

const VIDEO_TYPES: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'video/ogg': 'ogv' };

async function upload(db: Firestore) {
  const bucket = process.env.R2_BUCKET!;
  const publicBase = process.env.R2_PUBLIC_URL!.replace(/\/+$/, '');
  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
  });
  const list = async (prefix: string) =>
    (await retry(() => s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix })))).Contents?.map((o) => o.Key!) ?? [];
  const put = (Key: string, Body: Buffer, ContentType: string) =>
    retry(() => s3.send(new PutObjectCommand({ Bucket: bucket, Key, Body, ContentType, CacheControl: CACHE_CONTROL })));

  const s = await scan(db);
  const assets = [...s.assets.values()];
  const mapping: Record<string, string> = existsSync(MAPPING_FILE) ? JSON.parse(readFileSync(MAPPING_FILE, 'utf8')) : {};
  const report = { ok: 0, pulados: 0, falhas: [] as { publicId: string; erro: string }[] };
  const needed = [...WIDTHS.map((w) => `${w}.webp`), 'orig.webp'];
  let done = 0;

  await pool(assets, CONCURRENCY, async ({ parsed, urls }) => {
    const id = slugForPublicId(parsed.publicId);
    try {
      let value: string;
      if (parsed.resourceType === 'image') {
        const prefix = `img/${id}/`;
        const existing = new Set(await list(prefix));
        if (!process.env.FORCE && needed.every((n) => existing.has(prefix + n))) report.pulados++;
        else {
          const { buf } = await retry(() => download(originalUrl(parsed)));
          const variants = await renderVariants(buf);
          // orig por último: se ele existe, o conjunto está completo.
          for (const name of needed) await put(prefix + name, variants[name], 'image/webp');
          report.ok++;
        }
        value = `img/${id}`;
      } else {
        const existing = await list(`vid/${id}.`);
        let key = existing[0];
        if (key) report.pulados++;
        else {
          const { buf, type } = await retry(() => download(originalUrl(parsed)));
          // shortcut: vídeo inteiro em memória; ok para banners curtos, usar stream se passar de centenas de MB.
          const ct = type?.split(';')[0].trim() ?? 'video/mp4';
          key = `vid/${id}.${parsed.ext ?? VIDEO_TYPES[ct] ?? 'mp4'}`;
          await put(key, buf, ct.startsWith('video/') ? ct : 'video/mp4');
          report.ok++;
        }
        value = `${publicBase}/${key}`;
      }
      for (const u of urls) mapping[u] = value;
    } catch (e) {
      report.falhas.push({ publicId: parsed.publicId, erro: (e as Error).message });
    }
    done++;
    if (done % 20 === 0) console.log(`  ${done}/${assets.length}`);
  });

  console.log(`mapping: ${writeOut('mapping.json', mapping)} (${Object.keys(mapping).length} URLs)`);
  const rf = writeOut(`upload-report-${stamp()}.json`, report);
  console.log(`\nUpload: ok ${report.ok}, já existiam ${report.pulados}, falhas ${report.falhas.length} (detalhes em ${rf})`);
  report.falhas.forEach((f) => console.log(`  FALHA ${f.publicId}: ${f.erro}`));
  if (report.falhas.length) process.exitCode = 1;
}

async function rewrite(db: Firestore, apply: boolean) {
  if (!existsSync(MAPPING_FILE)) throw new Error('mapping.json não encontrado: rode --upload antes.');
  const mapping: Record<string, string> = JSON.parse(readFileSync(MAPPING_FILE, 'utf8'));
  const publicBase = process.env.R2_PUBLIC_URL!;
  const replace = (url: string) => (mapping[url] ? targetUrl(mapping[url], publicBase) : undefined);

  let batch = db.batch();
  let inBatch = 0;
  let docsChanged = 0;
  let values = 0;
  const batchErrors: string[] = [];
  const commit = async () => {
    if (!inBatch) return;
    try {
      await batch.commit();
    } catch (e) {
      // Precondição falhou (doc editado no meio) ou erro de rede: o lote inteiro não grava; rodar de novo resolve.
      batchErrors.push((e as Error).message);
    }
    batch = db.batch();
    inBatch = 0;
  };

  for await (const doc of allDocs(db)) {
    const data = doc.data();
    const changes: [FieldPath, unknown][] = [];
    for (const [k, v] of Object.entries(data)) {
      const nv = replaceUrls(v, replace);
      if (nv === v) continue;
      changes.push([new FieldPath(k), nv]);
      for (const leaf of collectCloudinaryLeaves(v, k)) {
        const after = replaceUrls(leaf.value, replace);
        if (after === leaf.value) continue;
        values++;
        console.log(`${doc.ref.path} :: ${leaf.path}\n  - ${leaf.value}\n  + ${after}`);
      }
    }
    if (!changes.length) continue;
    docsChanged++;
    if (apply) {
      const args = changes.flat();
      // lastUpdateTime: não sobrescreve doc alterado depois da leitura (ex.: pedido novo).
      (batch.update as (...a: unknown[]) => unknown)(doc.ref, ...args, { lastUpdateTime: doc.updateTime });
      if (++inBatch >= BATCH_SIZE) await commit();
    }
  }
  await commit();

  console.log(`\n${apply ? 'APLICADO' : 'DRY-RUN (nada gravado; use --apply)'}: ${values} valores em ${docsChanged} documentos.`);
  if (batchErrors.length) {
    console.log(`Lotes com erro: ${batchErrors.length}. Rode --rewrite --apply de novo.`);
    batchErrors.forEach((m) => console.log(`  ${m}`));
    process.exitCode = 1;
  }
  if (apply) {
    console.log('\nVerificação final (inventário pós-rewrite):');
    const left = printInventory(await scan(db));
    console.log(left === 0 ? 'OK: 0 URLs Cloudinary restantes.' : `ATENÇÃO: ${left} URLs Cloudinary restantes (listadas acima).`);
    if (left) process.exitCode = 1;
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const modes = ['--inventory', '--backup', '--upload', '--rewrite'].filter((m) => args.has(m));
  if (modes.length !== 1) {
    console.log('Uso: tsx migrate.ts --inventory | --backup | --upload | --rewrite [--dry-run|--apply]');
    process.exitCode = 1;
    return;
  }
  const mode = modes[0];
  const r2 = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_URL'];
  loadEnv(['GOOGLE_APPLICATION_CREDENTIALS', ...(mode === '--upload' ? r2 : mode === '--rewrite' ? ['R2_PUBLIC_URL'] : [])]);
  const db = firestore();
  if (mode === '--inventory') printInventory(await scan(db));
  else if (mode === '--backup') await backup(db);
  else if (mode === '--upload') await upload(db);
  else await rewrite(db, args.has('--apply') && !args.has('--dry-run'));
}

main().catch((e) => {
  console.error(`ERRO: ${(e as Error).message}`);
  process.exitCode = 1;
});
