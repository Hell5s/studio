
import data from '@/app/lib/placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Use the consolidated JSON from src/app/lib
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
