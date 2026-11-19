// Baldes fixos limitam as variantes únicas por foto (cada variante = 1 transformação cobrada).
export const IMAGE_BUCKETS = [320, 480, 640, 828, 1080, 1600];

export const bucketWidth = (width: number) =>
  IMAGE_BUCKETS.find((b) => b >= width) ?? IMAGE_BUCKETS[IMAGE_BUCKETS.length - 1];

const R2_HOST = 'pub-537c513e694c430d98df40c79ed7e7c6.r2.dev';
const R2_IMG = /(?:^https:\/\/pub-537c513e694c430d98df40c79ed7e7c6\.r2\.dev|^\/fotos)(\/img\/[^/]+\/)(?:\d+|orig)\.webp/;

export const isR2Url = (src?: string) => !!src && (src.includes(R2_HOST) || src.startsWith('/fotos/'));

// Foto R2 -> caminho relativo /fotos/... (cache no CDN da Vercel) com a variante pedida.
export const r2Url = (src: string, width?: number) => {
  const m = src.match(R2_IMG);
  if (!m) return src.replace(`https://${R2_HOST}`, '/fotos');
  return `/fotos${m[1]}${width ? bucketWidth(Math.round(width * 1.4)) : 1080}.webp`;
};

export default function cloudinaryLoader({ src, width }: { src: string; width: number }) {
  if (isR2Url(src)) return r2Url(src, width);
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    return src.replace('/upload/', `/upload/f_auto,q_auto:best,w_${bucketWidth(width)},c_limit,e_sharpen:40/`);
  }
  return src;
}
