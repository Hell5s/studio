// Baldes fixos limitam as variantes únicas por foto (cada variante = 1 transformação cobrada).
export const IMAGE_BUCKETS = [320, 480, 640, 828, 1080, 1600];

export const bucketWidth = (width: number) =>
  IMAGE_BUCKETS.find((b) => b >= width) ?? IMAGE_BUCKETS[IMAGE_BUCKETS.length - 1];

export default function cloudinaryLoader({ src, width }: { src: string; width: number }) {
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    return src.replace('/upload/', `/upload/f_auto,q_auto:eco,w_${bucketWidth(width)},c_limit/`);
  }
  return src;
}
