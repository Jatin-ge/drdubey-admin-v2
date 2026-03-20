import { lookup } from 'mime-types';

export const getMimeType = (filename: string, fallbackType?: string): string => {
  const mimeType = lookup(filename);
  if (!mimeType) {
    if (!fallbackType) {
      throw new Error(`Could not determine MIME type for file: ${filename}`);
    }
    return fallbackType;
  }
  return mimeType;
};

export const WHATSAPP_MEDIA_TYPES = {
  IMAGE: ['image/jpeg', 'image/png'] as const,
  VIDEO: ['video/mp4'] as const,
  DOCUMENT: ['application/pdf'] as const
} as const; 