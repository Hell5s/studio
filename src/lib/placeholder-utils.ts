import { PlaceHolderImages } from './placeholder-images';

export const getPlaceholderById = (id: string) => {
  return PlaceHolderImages.find(img => img.id === id);
};
