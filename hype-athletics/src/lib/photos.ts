import type { ImageMetadata } from 'astro';

const files = import.meta.glob<ImageMetadata>('../assets/{photos,team}/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });

const byKey: Record<string, ImageMetadata> = {};
for (const [path, img] of Object.entries(files)) {
  const key = path.split('/').pop()!.replace(/\.[a-z]+$/, '');
  byKey[key] = img;
}

export function photo(key: string): ImageMetadata {
  const img = byKey[key];
  if (!img) throw new Error(`Unknown photo: ${key}`);
  return img;
}
