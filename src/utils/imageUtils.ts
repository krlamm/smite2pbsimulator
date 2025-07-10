// src/utils/imageUtils.ts
import { Character } from '../types';

export const getGodImageUrl = (god: Character): string => {
  // Assuming god.image already contains the full URL or relative path
  // If your image paths are different, adjust this logic
  return god.image;
};