/**
 * File Import Engine.
 *
 * Syncs wp-content/uploads to the new media storage location,
 * preserving the /YYYY/MM folder structure.
 * Supports local filesystem (dev) and S3-compatible storage (prod).
 */

import fs from "fs/promises";
import path from "path";
import { createReadStream, existsSync } from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export interface FileImportOptions {
  sourcePath: string;
  targetPath?: string;
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  dryRun?: boolean;
}

export interface FileImportProgress {
  totalFiles: number;
  copiedFiles: number;
  skippedFiles: number;
  errors: number;
  totalSizeBytes: number;
}

/**
 * Scan wp-content/uploads for media files.
 */
async function scanUploads(
  basePath: string
): Promise<Array<{ relativePath: string; absolutePath: string; size: number }>> {
  const uploadsPath = path.join(basePath, "uploads");
  const files: Array<{ relativePath: string; absolutePath: string; size: number }> = [];

  if (!existsSync(uploadsPath)) {
    console.warn(`⚠️  Uploads directory not found: ${uploadsPath}`);
    return files;
  }

  async function scan(dir: string, relativeDir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(relativeDir, entry.name);

      if (entry.isDirectory()) {
        await scan(fullPath, relativePath);
      } else if (entry.isFile()) {
        const stat = await fs.stat(fullPath);
        files.push({
          relativePath,
          absolutePath: fullPath,
          size: stat.size,
        });
      }
    }
  }

  await scan(uploadsPath, "");
  return files;
}

/**
 * Copy files to local media directory preserving /YYYY/MM structure.
 */
async function copyToLocal(
  files: Array<{ relativePath: string; absolutePath: string; size: number }>,
  targetBase: string,
  dryRun: boolean
): Promise<{ copied: number; totalSize: number }> {
  let copied = 0;
  let totalSize = 0;

  for (const file of files) {
    const targetPath = path.join(targetBase, file.relativePath);

    if (dryRun) {
      console.log(`   [DRY RUN] Would copy: ${file.relativePath} (${(file.size / 1024).toFixed(1)} KB)`);
      copied++;
      totalSize += file.size;
      continue;
    }

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(file.absolutePath, targetPath);
    copied++;
    totalSize += file.size;
  }

  return { copied, totalSize };
}

/**
 * Upload files to S3 preserving /YYYY/MM structure.
 */
async function copyToS3(
  files: Array<{ relativePath: string; absolutePath: string; size: number }>,
  bucket: string,
  region: string,
  accessKey: string,
  secretKey: string,
  dryRun: boolean
): Promise<{ copied: number; totalSize: number }> {
  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let copied = 0;
  let totalSize = 0;

  for (const file of files) {
    const key = `uploads/${file.relativePath}`;

    if (dryRun) {
      console.log(`   [DRY RUN] Would upload: s3://${bucket}/${key} (${(file.size / 1024).toFixed(1)} KB)`);
      copied++;
      totalSize += file.size;
      continue;
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: createReadStream(file.absolutePath),
        ContentType: getContentType(file.relativePath),
      })
    );

    copied++;
    totalSize += file.size;
    process.stdout.write(`\r   Uploaded: ${copied}/${files.length} files`);
  }

  return { copied, totalSize };
}

/**
 * Import WordPress media files to the configured storage.
 */
export async function importFiles(options: FileImportOptions): Promise<FileImportProgress> {
  console.log("\n📁 Scanning WordPress uploads...");
  const files = await scanUploads(options.sourcePath);
  console.log(`   Found ${files.length} files (${(files.reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(2)} MB)`);

  if (files.length === 0) {
    return { totalFiles: 0, copiedFiles: 0, skippedFiles: 0, errors: 0, totalSizeBytes: 0 };
  }

  const useS3 = !!options.s3Bucket;
  let copied = 0;
  let totalSize = 0;

  if (useS3) {
    if (!options.s3Region || !options.s3AccessKey || !options.s3SecretKey || !options.s3Bucket) {
      throw new Error("S3 storage requires bucket, region, and credentials");
    }
    console.log(`\n☁️  Uploading to S3 bucket: ${options.s3Bucket}`);
    const result = await copyToS3(
      files,
      options.s3Bucket,
      options.s3Region,
      options.s3AccessKey,
      options.s3SecretKey,
      options.dryRun || false
    );
    copied = result.copied;
    totalSize = result.totalSize;
  } else {
    const targetBase = options.targetPath || path.join(process.cwd(), "public", "media");
    console.log(`\n💾 Copying to local: ${targetBase}`);
    const result = await copyToLocal(files, targetBase, options.dryRun || false);
    copied = result.copied;
    totalSize = result.totalSize;
  }

  return {
    totalFiles: files.length,
    copiedFiles: copied,
    skippedFiles: files.length - copied,
    errors: 0,
    totalSizeBytes: totalSize,
  };
}

/**
 * Determine content type from file extension.
 */
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const types: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".pdf": "application/pdf",
    ".zip": "application/zip",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return types[ext] || "application/octet-stream";
}
