import { Character } from '../types';

export const getGodImageUrl = (character: Character): string => {
  const isPlaceholder = character.image.includes('placeholder');
  if (!isPlaceholder) {
    return character.image;
  }
  
  // Generate slug from god name
  const slug = character.name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // remove punctuation
    .trim()
    .replace(/\s+/g, '-');
    
  return `https://webcdn.hirezstudios.com/smite/god-icons/${slug}.jpg`;
}; 