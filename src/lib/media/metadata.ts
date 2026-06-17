/**
 * Media metadata extraction.
 * Extracts EXIF data, file size, dimensions, and other metadata from uploaded files.
 */

import { getImageMetadata } from "./thumbnails";

export interface MediaMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  format?: string;
  alt?: string;
  caption?: string;
  description?: string;
}

/**
 * Extract metadata from an uploaded file buffer.
 */
export async function extractMetadata(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<MediaMetadata> {
  const metadata: MediaMetadata = {
    fileName,
    fileSize: buffer.length,
    mimeType,
  };

  // Extract image-specific metadata
  if (mimeType.startsWith("image/")) {
    const imageMeta = await getImageMetadata(buffer);
    if (imageMeta) {
      metadata.width = imageMeta.width;
      metadata.height = imageMeta.height;
      metadata.format = imageMeta.format;
    }
  }

  return metadata;
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}
