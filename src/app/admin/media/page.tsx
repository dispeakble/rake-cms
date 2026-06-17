import { listFiles } from "@/lib/media/storage";
import { formatFileSize } from "@/lib/media/metadata";

export default async function AdminMedia() {
  let files: Awaited<ReturnType<typeof listFiles>> = [];
  let error: string | null = null;

  try {
    files = await listFiles();
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{files.length} items</span>
          <label className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
            Upload New
            <input type="file" className="hidden" multiple accept="image/*,video/*,audio/*,application/pdf" />
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Upload area */}
      <div className="rounded-lg border-2 border-dashed p-12 text-center hover:border-muted-foreground/50">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <span className="text-lg">📁</span>
        </div>
        <p className="text-sm font-medium">Drop files here or click to upload</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Images, videos, audio, documents — max 10MB per file
        </p>
      </div>

      {/* Grid view */}
      {files.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {files.map((file) => (
            <div
              key={file.path}
              className="group relative overflow-hidden rounded-lg border"
            >
              <div className="aspect-square bg-muted">
                {file.mimetype.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">
                    {getFileIcon(file.mimetype)}
                  </div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs text-white">
                  {file.path.split("/").pop()}
                </p>
                <p className="text-xs text-white/70">{formatFileSize(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          {error ? "Error loading media library." : "No files uploaded yet. Upload your first file above."}
        </div>
      )}
    </div>
  );
}

function getFileIcon(mimetype: string): string {
  if (mimetype.startsWith("video/")) return "🎬";
  if (mimetype.startsWith("audio/")) return "🎵";
  if (mimetype === "application/pdf") return "📄";
  if (mimetype.includes("zip") || mimetype.includes("rar")) return "📦";
  return "📎";
}
