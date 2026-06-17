import { NextRequest, NextResponse } from "next/server";
import { uploadFile, listFiles, deleteFile } from "@/lib/media/storage";
import { generateThumbnails, saveThumbnails } from "@/lib/media/thumbnails";
import { extractMetadata, formatFileSize } from "@/lib/media/metadata";
import { auth } from "@/auth";

/**
 * GET /api/media — List all media files.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const files = await listFiles();
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list files", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/media — Upload a file.
 * Accepts multipart/form-data with a "file" field.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile(buffer, file.name, file.type);

    // Generate thumbnails for images
    let thumbnails = {};
    if (file.type.startsWith("image/")) {
      const sizes = await generateThumbnails(buffer, file.type);
      // Note: thumbnails would be saved alongside; simplified for now
    }

    // Extract metadata
    const metadata = await extractMetadata(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      file: {
        ...result,
        metadata,
        sizeFormatted: formatFileSize(result.size),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media — Delete a file.
 * Expects JSON body with { path: string }.
 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { path: filePath } = await request.json();
    if (!filePath) {
      return NextResponse.json({ error: "No file path provided" }, { status: 400 });
    }

    await deleteFile(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Delete failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
