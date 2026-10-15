export default function cloudinaryLoader({ src, width }: { src: string; width: number }) {
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    // f_auto, q_auto:best para otimização inteligente
    // e_sharpen:40 para compensar a perda de nitidez no redimensionamento
    return src.replace('/upload/', `/upload/f_auto,q_auto:best,w_${width},c_limit,e_sharpen:40/`);
  }
  return src;
}
