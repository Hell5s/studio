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
 * Recorta uma imagem e, se necessário, aplica upscaling suave para manter a qualidade na loja.
 */
export async function getCroppedImgBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  minLongSide: number = 1800
): Promise<Blob> {
  const image = await createImage(imageSrc);
  
  let currentWidth = pixelCrop.width;
  let currentHeight = pixelCrop.height;
  const currentLongSide = Math.max(currentWidth, currentHeight);
  
  let targetWidth = currentWidth;
  let targetHeight = currentHeight;

  // Se o recorte for muito pequeno, calculamos o tamanho alvo para ampliação (limite de 3x)
  if (currentLongSide < minLongSide) {
    const scale = Math.min(3, minLongSide / currentLongSide);
    targetWidth = Math.round(currentWidth * scale);
    targetHeight = Math.round(currentHeight * scale);
  }

  // Passo 1: Extrair o recorte original
  let canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  let ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível criar o contexto do canvas');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Passo 2: Ampliação iterativa (max 2x por passo) para melhor qualidade
  while (currentWidth < targetWidth || currentHeight < targetHeight) {
    const stepScale = Math.min(2, targetWidth / currentWidth);
    const nextWidth = Math.min(targetWidth, Math.round(currentWidth * stepScale));
    const nextHeight = Math.min(targetHeight, Math.round(currentHeight * stepScale));

    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = nextWidth;
    nextCanvas.height = nextHeight;
    const nextCtx = nextCanvas.getContext('2d');
    if (!nextCtx) break;

    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = 'high';
    
    nextCtx.drawImage(
      canvas,
      0, 0, currentWidth, currentHeight,
      0, 0, nextWidth, nextHeight
    );

    canvas = nextCanvas;
    currentWidth = nextWidth;
    currentHeight = nextHeight;
  }

  return new Promise((resolve, reject) => {
    // Exportação em alta qualidade (0.98)
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Falha ao gerar o blob da imagem recortada'));
    }, 'image/jpeg', 0.98);
  });
}
