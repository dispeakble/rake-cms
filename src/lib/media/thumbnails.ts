/**
 * Thumbnail generation via Sharp.
 * Creates multiple sizes: thumbnail (150x150), medium (300x300), large (1024x1024).
 */

import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

export interface ThumbnailSizes {
  thumbnail?: Buffer;
  medium?: Buffer;
  large?: Buffer;
}

export interface ThumbnailPaths {
  thumbnail?: string;
  medium?: string;
  large?: string;
}

const SIZES = {
  thumbnail: { width: 150, height: 150, fit: "cover" as const },
  medium: { width: 300, height: 300, fit: "inside" as const },
  large: { width: 1024, height: 1024, fit: "inside" as const },
};

/**
 * Generate thumbnails from an image buffer.
 */
export async function generateThumbnails(
  buffer: Buffer,
  mimetype: string
): Promise<ThumbnailSizes> {
  const sizes: ThumbnailSizes = {};

  // Only generate for image types
  if (!mimetype.startsWith("image/") || mimetype === "image/svg+xml" || mimetype === "image/gif") {
    return sizes;
  }

  for (const [name, opts] of Object.entries(SIZES)) {
    try {
      sizes[name as keyof ThumbnailSizes] = await sharp(buffer)
        .resize(opts.width, opts.height, { fit: opts.fit })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.warn(`⚠️  Failed to generate ${name} thumbnail:`, (error as Error).message);
    }
  }

  return sizes;
}

/**
 * Save thumbnails alongside the original file.
 */
export async function saveThumbnails(
  thumbnails: ThumbnailSizes,
  originalPath: string
): Promise<ThumbnailPaths> {
  const paths: ThumbnailPaths = {};
  const dir = path.dirname(originalPath);
  const ext = path.extname(originalPath);
  const base = path.basename(originalPath, ext);

  for (const [name, buffer] of Object.entries(thumbnails)) {
    if (!buffer) continue;

    const thumbFilename = `${base}-${name}.webp`;
    const thumbPath = path.join(dir, thumbFilename);

    await fs.writeFile(thumbPath, buffer);
    paths[name as keyof ThumbnailPaths] = thumbFilename;
  }

  return paths;
}

/**
 * Extract image metadata (dimensions, format, etc.).
 */
export async function getImageMetadata(
  buffer: Buffer
): Promise<{ width: number; height: number; format: string } | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || "unknown",
    };
  } catch {
    return null;
  }
}
