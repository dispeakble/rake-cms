"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PostEditorProps {
  initialData?: {
    id: number;
    postTitle: string;
    postContent: string;
    postExcerpt: string;
    postStatus: string;
    postType: string;
    postName: string;
    postParent: number;
    postAuthor: number;
  } | null;
  categories?: { id: number; name: string; slug: string }[];
  tags?: { id: number; name: string; slug: string }[];
  pages?: { id: number; postTitle: string; postParent: number }[];
  media?: { url: string; path: string }[];
}

export default function PostEditor({ initialData, categories = [], tags = [], pages = [], media = [] }: PostEditorProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.postTitle || "");
  const [slug, setSlug] = useState(initialData?.postName || "");
  const [content, setContent] = useState(initialData?.postContent || "");
  const [excerpt, setExcerpt] = useState(initialData?.postExcerpt || "");
  const [status, setStatus] = useState(initialData?.postStatus || "draft");
  const [type, setType] = useState(initialData?.postType || "post");
  const [parentId, setParentId] = useState(initialData?.postParent || 0);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-slug from title
  useEffect(() => {
    if (!isEditing || !initialData?.postName) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
          .substring(0, 200)
      );
    }
  }, [title, isEditing, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("excerpt", excerpt);
    formData.append("status", status);
    formData.append("type", type);
    formData.append("slug", slug);
    formData.append("parentId", String(parentId));
    formData.append("featuredImage", featuredImage);
    formData.append("categoryIds", JSON.stringify(selectedCategories));
    formData.append("tagIds", JSON.stringify(selectedTags));

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `/api/posts/${initialData!.id}`
        : "/api/posts";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.redirect) {
          router.push(data.redirect);
        } else {
          router.push("/admin/posts");
        }
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save post");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrash = async () => {
    if (!confirm("Move this post to trash?")) return;

    try {
      await fetch(`/api/posts/${initialData!.id}`, { method: "DELETE" });
      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("Failed to trash post");
    }
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-4 lg:col-span-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add title"
            required
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          {/* Slug */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Permalink:</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs font-mono"
              placeholder="post-slug"
            />
          </div>

          {/* Content Editor */}
          <div className="min-h-[300px] rounded-md border">
            <div className="border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
              Content
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here... (HTML or block JSON)"
              rows={15}
              className="w-full resize-y border-0 bg-background p-4 text-sm font-mono focus:outline-none"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description for archives and search results"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="text-sm font-semibold">Publish</h3>
            <div>
              <label className="block text-xs font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending Review</option>
                <option value="publish">Published</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Saving..." : isEditing ? "Update" : "Save"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleTrash}
                  className="rounded-md border border-destructive/30 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  Trash
                </button>
              )}
            </div>
          </div>

          {/* Post Type */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="text-sm font-semibold">Post Type</h3>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="post">Post</option>
              <option value="page">Page</option>
            </select>

            {type === "page" && pages.length > 0 && (
              <div>
                <label className="block text-xs font-medium mb-1">Parent Page</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(parseInt(e.target.value) || 0)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={0}>(no parent)</option>
                  {pages
                    .filter((p) => p.id !== initialData?.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.postTitle || "Untitled"}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Featured Image */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="text-sm font-semibold">Featured Image</h3>
            {featuredImage ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featuredImage} alt="" className="w-full h-32 object-cover rounded border" />
                <button
                  type="button"
                  onClick={() => setFeaturedImage("")}
                  className="absolute top-1 right-1 rounded-full bg-destructive/80 p-1 text-white text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">No image selected</p>
                {media.length > 0 && (
                  <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                    {media.filter(m => m.url?.match(/\.(jpg|jpeg|png|gif|webp)/i)).slice(0, 12).map((m) => (
                      <button
                        key={m.path}
                        type="button"
                        onClick={() => setFeaturedImage(m.url)}
                        className="aspect-square rounded border overflow-hidden hover:ring-2 hover:ring-primary"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Categories */}
          {type === "post" && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="text-sm font-semibold">Categories</h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {categories.length === 0 && (
                  <p className="text-xs text-muted-foreground">No categories yet.</p>
                )}
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="rounded border-gray-300"
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {type === "post" && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="text-sm font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 && (
                  <p className="text-xs text-muted-foreground">No tags yet.</p>
                )}
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-2.5 py-1 text-xs transition ${
                      selectedTags.includes(tag.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
