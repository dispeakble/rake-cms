import { NextRequest, NextResponse } from "next/server";
import { uploadFile, listFiles, deleteFile } from "@/lib/media/storage";
import { generateThumbnails, saveThumbnails } from "@/lib/media/thumbnails";
import { extractMetadata, formatFileSize } from "@/lib/media/metadata";
import { auth } from "@/auth";
import { getClientIp, sanitizeFilename } from "@/lib/security/validation";
import { uploadLimiter, apiLimiter } from "@/lib/security/rate-limiter";

/**
 * GET /api/media — List all media files.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const ip = getClientIp(request);
  const limitCheck = apiLimiter.check(`api:${ip}`);
  if (limitCheck.blocked) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: Math.ceil(limitCheck.resetInMs / 1000) },
      { status: 429 }
    );
  }

  try {
    const files = await listFiles();
    return NextResponse.json({ files });
  } catch (error) {
    console.error("List files error:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/media — Upload a file with validation.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const ip = getClientIp(request);
  const limitCheck = uploadLimiter.check(`upload:${ip}`);
  if (limitCheck.blocked) {
    return NextResponse.json(
      { error: "Too many uploads. Try again later." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Client-side file validation
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/webm",
      "audio/mpeg", "audio/wav", "audio/ogg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type '${file.type}' is not allowed` },
        { status: 400 }
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large (max ${maxSize / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = sanitizeFilename(file.name);

    // Content-type verification — check magic bytes for images
    if (file.type.startsWith("image/")) {
      const magicBytesCheck = validateImageMagicBytes(buffer, file.type);
      if (!magicBytesCheck.valid) {
        return NextResponse.json(
          { error: `File content does not match declared type: ${magicBytesCheck.reason}` },
          { status: 400 }
        );
      }
    }

    const result = await uploadFile(buffer, safeName || "file", file.type);

    // Generate thumbnails for images
    let thumbnailInfo = {};
    if (file.type.startsWith("image/") && file.type !== "image/svg+xml" && file.type !== "image/gif") {
      try {
        const sizes = await generateThumbnails(buffer, file.type);
        thumbnailInfo = { thumbnails: Object.keys(sizes).length };
      } catch (err) {
        console.warn("Thumbnail generation skipped:", (err as Error).message);
      }
    }

    const metadata = await extractMetadata(buffer, safeName || file.name, file.type);

    return NextResponse.json({
      success: true,
      file: {
        ...result,
        metadata,
        sizeFormatted: formatFileSize(result.size),
        ...thumbnailInfo,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media — Delete a file.
 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { path: filePath } = body;

    if (!filePath || typeof filePath !== "string") {
      return NextResponse.json({ error: "No file path provided" }, { status: 400 });
    }

    // Prevent path traversal
    const sanitized = filePath.replace(/\.\.\//g, "").replace(/\.\.\\/g, "");
    if (sanitized !== filePath) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    await deleteFile(sanitized);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}

/**
 * Validate image magic bytes to ensure the file content matches its declared MIME type.
 */
function validateImageMagicBytes(
  buffer: Buffer,
  declaredType: string
): { valid: boolean; reason?: string } {
  if (buffer.length < 8) {
    return { valid: false, reason: "File too small to validate" };
  }

  const magicBytes: Record<string, [number[], number]> = {
    "image/jpeg": [[0xFF, 0xD8, 0xFF], 3],
    "image/png": [[0x89, 0x50, 0x4E, 0x47], 4],
    "image/gif": [[0x47, 0x49, 0x46], 3],
    "image/webp": [[0x52, 0x49, 0x46, 0x46], 4], // Starts with "RIFF"
    "image/avif": [[0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66], 12],
  };

  const expected = magicBytes[declaredType];
  if (!expected) return { valid: true }; // Skip non-image types

  const [bytes, length] = expected;
  for (let i = 0; i < length; i++) {
    if (buffer[i] !== bytes[i]) {
      return { valid: false, reason: `MIME type is ${declaredType} but magic bytes indicate a different format` };
    }
  }

  return { valid: true };
}
