const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (err) => reject(err));
    image.src = url;
  });

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Recorta uma imagem e aplica ampliação em uma única etapa se necessário.
 * O recorte é sempre interno à imagem original.
 */
export async function getCroppedImgBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  minLongSide: number = 1800
): Promise<Blob> {
  if (!pixelCrop || 
      !Number.isFinite(pixelCrop.width) || pixelCrop.width <= 0 ||
      !Number.isFinite(pixelCrop.height) || pixelCrop.height <= 0 ||
      !Number.isFinite(pixelCrop.x) || 
      !Number.isFinite(pixelCrop.y)) {
    throw new Error('Parâmetros de recorte inválidos.');
  }

  const image = await createImage(imageSrc);
  
  const currentLongSide = Math.max(pixelCrop.width, pixelCrop.height);
  
  let scale = 1;
  if (currentLongSide < minLongSide) {
    scale = Math.min(2, minLongSide / currentLongSide);
  }

  let targetWidth = Math.round(pixelCrop.width * scale);
  let targetHeight = Math.round(pixelCrop.height * scale);

  // Limite absoluto de 2400px
  const finalLongSide = Math.max(targetWidth, targetHeight);
  if (finalLongSide > 2400) {
    const finalScale = 2400 / finalLongSide;
    targetWidth = Math.round(targetWidth * finalScale);
    targetHeight = Math.round(targetHeight * finalScale);
    scale = targetWidth / pixelCrop.width;
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível criar o contexto do canvas');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // O recorte agora é sempre interno, desenhamos a sub-região da imagem no canvas inteiro
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Falha ao gerar o blob da imagem'));
    }, 'image/jpeg', 0.98);
  });
}
