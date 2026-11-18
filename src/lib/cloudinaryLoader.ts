export default function cloudinaryLoader({ src, width }: { src: string; width: number }) {
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    // f_auto + q_auto:good: bom equilíbrio entre qualidade e peso (sem sharpen, que inflava o arquivo)
    return src.replace('/upload/', `/upload/f_auto,q_auto:good,w_${width},c_limit/`);
  }
  return src;
}
