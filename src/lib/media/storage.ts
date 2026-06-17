/**
 * Media Storage Abstraction.
 * Supports local filesystem (dev) and S3-compatible storage (prod).
 */

import fs from "fs/promises";
import path from "path";
import { existsSync, createReadStream, createWriteStream } from "fs";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

type StorageType = "local" | "s3";

interface StorageConfig {
  type: StorageType;
  localPath?: string;
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
}

interface UploadResult {
  url: string;
  path: string;
  size: number;
  mimetype: string;
}

interface StoredFile {
  path: string;
  url: string;
  size: number;
  mimetype: string;
}

/**
 * Get storage configuration from environment.
 */
function getConfig(): StorageConfig {
  const type = (process.env.MEDIA_STORAGE || "local") as StorageType;
  return {
    type,
    localPath: process.env.MEDIA_LOCAL_PATH || "public/media",
    s3Bucket: process.env.S3_BUCKET,
    s3Region: process.env.S3_REGION,
    s3AccessKey: process.env.S3_ACCESS_KEY,
    s3SecretKey: process.env.S3_SECRET_KEY,
  };
}

/**
 * Generate a unique filename preserving the original extension.
 */
function generateFilename(original: string): string {
  const ext = path.extname(original);
  const name = path.basename(original, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .substring(0, 50);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${name}-${timestamp}-${random}${ext}`;
}

/**
 * Generate /YYYY/MM folder path.
 */
function generateDatePath(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}/${month}`;
}

/**
 * Create a new S3 client instance.
 */
function createS3Client(config: StorageConfig) {
  if (!config.s3Region || !config.s3AccessKey || !config.s3SecretKey) {
    throw new Error("S3 configuration incomplete: region, access key, and secret key required");
  }
  return new S3Client({
    region: config.s3Region,
    credentials: {
      accessKeyId: config.s3AccessKey,
      secretAccessKey: config.s3SecretKey,
    },
  });
}

/**
 * Upload a file to local storage.
 */
async function uploadToLocal(
  buffer: Buffer,
  relativePath: string,
  mimetype: string,
  config: StorageConfig
): Promise<UploadResult> {
  const basePath = config.localPath || "public/media";
  const fullPath = path.join(process.cwd(), basePath, relativePath);

  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);

  return {
    url: `/media/${relativePath}`,
    path: relativePath,
    size: buffer.length,
    mimetype,
  };
}

/**
 * Upload a file to S3.
 */
async function uploadToS3(
  buffer: Buffer,
  relativePath: string,
  mimetype: string,
  config: StorageConfig
): Promise<UploadResult> {
  if (!config.s3Bucket) throw new Error("S3 bucket not configured");

  const client = createS3Client(config);
  const key = `uploads/${relativePath}`;

  await client.send(
    new PutObjectCommand({
      Bucket: config.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  const url = `https://${config.s3Bucket}.s3.${config.s3Region}.amazonaws.com/${key}`;

  return {
    url,
    path: key,
    size: buffer.length,
    mimetype,
  };
}

/**
 * Upload a file (buffer) to the configured storage.
 */
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimetype: string
): Promise<UploadResult> {
  const config = getConfig();
  const filename = generateFilename(originalName);
  const datePath = generateDatePath();
  const relativePath = `${datePath}/${filename}`;

  if (config.type === "s3") {
    return uploadToS3(buffer, relativePath, mimetype, config);
  }

  return uploadToLocal(buffer, relativePath, mimetype, config);
}

/**
 * List files in local storage.
 */
async function listLocalFiles(config: StorageConfig): Promise<StoredFile[]> {
  const basePath = path.join(process.cwd(), config.localPath || "public/media");
  const files: StoredFile[] = [];

  if (!existsSync(basePath)) return files;

  async function scanDir(dir: string, relativeDir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.join(relativeDir, entry.name);

      if (entry.isDirectory()) {
        await scanDir(full, rel);
      } else {
        const stat = await fs.stat(full);
        files.push({
          path: rel,
          url: `/media/${rel}`,
          size: stat.size,
          mimetype: getMimeType(entry.name),
        });
      }
    }
  }

  await scanDir(basePath, "");
  return files;
}

/**
 * List files in S3 storage.
 */
async function listS3Files(config: StorageConfig): Promise<StoredFile[]> {
  if (!config.s3Bucket) throw new Error("S3 bucket not configured");

  const client = createS3Client(config);
  const files: StoredFile[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: config.s3Bucket,
        Prefix: "uploads/",
        ContinuationToken: continuationToken,
      })
    );

    for (const obj of response.Contents || []) {
      if (obj.Key && !obj.Key.endsWith("/")) {
        files.push({
          path: obj.Key,
          url: `https://${config.s3Bucket}.s3.${config.s3Region}.amazonaws.com/${obj.Key}`,
          size: obj.Size || 0,
          mimetype: getMimeType(obj.Key),
        });
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return files;
}

/**
 * List all stored media files.
 */
export async function listFiles(): Promise<StoredFile[]> {
  const config = getConfig();
  if (config.type === "s3") {
    return listS3Files(config);
  }
  return listLocalFiles(config);
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(filePath: string): Promise<void> {
  const config = getConfig();

  if (config.type === "s3") {
    if (!config.s3Bucket) throw new Error("S3 bucket not configured");
    const client = createS3Client(config);
    await client.send(
      new DeleteObjectCommand({
        Bucket: config.s3Bucket,
        Key: filePath,
      })
    );
  } else {
    const basePath = path.join(process.cwd(), config.localPath || "public/media");
    const fullPath = path.join(basePath, filePath);
    await fs.unlink(fullPath);
  }
}

/**
 * Determine MIME type from file extension.
 */
function getMimeType(filename: string): string {
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
  };
  return types[ext] || "application/octet-stream";
}

export { getMimeType };
