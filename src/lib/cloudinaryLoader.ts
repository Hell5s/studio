export default function cloudinaryLoader({ src, width }: { src: string; width: number }) {
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    return src.replace('/upload/', `/upload/f_auto,q_auto:best,w_${width},c_limit/`);
  }
  return src;
}
