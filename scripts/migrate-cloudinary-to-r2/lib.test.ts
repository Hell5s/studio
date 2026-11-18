import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {
  assetKey,
  collectCloudinaryLeaves,
  findCloudinaryUrls,
  originalUrl,
  parseCloudinaryUrl,
  renderVariants,
  replaceUrls,
  slugForPublicId,
  targetUrl,
} from './lib';

const BASE = 'https://res.cloudinary.com/djtuzexfd';

test('parse: public_id ignora transformação, versão e extensão', () => {
  const urls = [
    `${BASE}/image/upload/v1712345/produtos/vestido_azul.jpg`,
    `${BASE}/image/upload/f_auto,q_auto:eco,w_640,c_limit/v1712345/produtos/vestido_azul.jpg`,
    `${BASE}/image/upload/c_fill,w_500/e_sharpen/produtos/vestido_azul.webp`,
    `${BASE}/image/upload/produtos/vestido_azul`,
  ];
  const parsed = urls.map((u) => parseCloudinaryUrl(u)!);
  for (const p of parsed) {
    assert.equal(p.publicId, 'produtos/vestido_azul');
    assert.equal(p.resourceType, 'image');
    assert.equal(p.cloud, 'djtuzexfd');
  }
  assert.equal(new Set(parsed.map(assetKey)).size, 1);
  assert.deepEqual(parsed.map((p) => p.transformed), [false, true, true, false]);
  assert.equal(parsed[0].version, '1712345');
});

test('parse: pasta com "_" não é confundida com transformação', () => {
  assert.equal(parseCloudinaryUrl(`${BASE}/image/upload/my_folder/foto.png`)!.publicId, 'my_folder/foto');
});

test('parse: vídeo mantém extensão para a URL original', () => {
  const p = parseCloudinaryUrl(`${BASE}/video/upload/q_auto/v99/banners/hero.mp4`)!;
  assert.equal(p.resourceType, 'video');
  assert.equal(p.publicId, 'banners/hero');
  assert.equal(originalUrl(p), `${BASE}/video/upload/v99/banners/hero.mp4`);
});

test('parse: formatos não suportados retornam null', () => {
  assert.equal(parseCloudinaryUrl(`${BASE}/image/fetch/https://x.com/a.jpg`), null);
  assert.equal(parseCloudinaryUrl(`${BASE}/raw/upload/doc.pdf`), null);
  assert.equal(parseCloudinaryUrl('https://example.com/a.jpg'), null);
});

test('originalUrl de imagem não tem transformação nem extensão', () => {
  const p = parseCloudinaryUrl(`${BASE}/image/upload/w_300/v5/a/b c.jpg`)!;
  assert.equal(originalUrl(p), `${BASE}/image/upload/v5/a/b%20c`);
});

test('findCloudinaryUrls acha URL dentro de texto/HTML e tira pontuação final', () => {
  const s = `Veja <img src="${BASE}/image/upload/a.jpg"> e ${BASE}/image/upload/b.png.`;
  assert.deepEqual(findCloudinaryUrls(s), [`${BASE}/image/upload/a.jpg`, `${BASE}/image/upload/b.png`]);
});

test('slug é estável, seguro e único', () => {
  const a = slugForPublicId('Produtos/Vestido Ação');
  assert.match(a, /^produtos-vestido-acao-[0-9a-f]{8}$/);
  assert.equal(a, slugForPublicId('Produtos/Vestido Ação'));
  assert.notEqual(slugForPublicId('a/b'), slugForPublicId('a-b'));
});

test('targetUrl: imagem vira 1080.webp, vídeo fica como está', () => {
  assert.equal(targetUrl('img/x-1', 'https://pub.r2.dev/'), 'https://pub.r2.dev/img/x-1/1080.webp');
  assert.equal(targetUrl('https://pub.r2.dev/vid/v.mp4', 'https://pub.r2.dev'), 'https://pub.r2.dev/vid/v.mp4');
});

test('replaceUrls preserva forma e não toca o que não está no mapping', () => {
  const a = `${BASE}/image/upload/v1/a.jpg`;
  const b = `${BASE}/image/upload/v1/b.jpg`;
  const ts = new Date(0); // simula tipo não-plano (Timestamp etc.)
  const map: Record<string, string> = { [a]: 'NEW_A' };
  const doc = {
    image: a,
    images: [a, { url: a, originalUrl: a }, b],
    variations: [{ image: { url: a }, images: [b] }],
    html: `<p><img src="${a}"></p>`,
    createdAt: ts,
    price: 10,
  };
  const out = replaceUrls(doc, (u) => map[u]);
  assert.deepEqual(out, {
    image: 'NEW_A',
    images: ['NEW_A', { url: 'NEW_A', originalUrl: 'NEW_A' }, b],
    variations: [{ image: { url: 'NEW_A' }, images: [b] }],
    html: '<p><img src="NEW_A"></p>',
    createdAt: ts,
    price: 10,
  });
  assert.equal(out.createdAt, ts);
  assert.equal(out.variations[0].images, doc.variations[0].images); // sem mudança = mesma referência
  assert.equal(doc.image, a); // entrada não é mutada
  const untouched = { x: [b] };
  assert.equal(replaceUrls(untouched, (u) => map[u]), untouched);
});

test('collectCloudinaryLeaves devolve caminhos', () => {
  const a = `${BASE}/image/upload/a.jpg`;
  assert.deepEqual(
    collectCloudinaryLeaves({ items: [{ image: { url: a } }], other: 'x' }).map((l) => l.path),
    ['items[0].image.url'],
  );
});

test('renderVariants: não amplia, aplica EXIF e gera 7 arquivos', async () => {
  // 700x300 com orientação 6 (girar 90°) => 300x700 depois do rotate
  const input = await sharp({ create: { width: 700, height: 300, channels: 3, background: '#c33' } })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer();
  const v = await renderVariants(input);
  assert.deepEqual(Object.keys(v).sort(), ['1080.webp', '1600.webp', '320.webp', '480.webp', '640.webp', '828.webp', 'orig.webp']);
  const m320 = await sharp(v['320.webp']).metadata();
  assert.equal(m320.format, 'webp');
  assert.equal(m320.width, 300); // 300 < 320: não amplia
  assert.equal(m320.height, 700);
  const m1600 = await sharp(v['1600.webp']).metadata();
  assert.equal(m1600.width, 300);
  assert.equal(m1600.orientation, undefined);
});
