"use client";
import { useState } from "react";

export default function CommentForm({ postId }: { postId: number }) {
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          author: author.trim() || "Anonymous",
          email: email.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setContent("");
      } else {
        setError(data.error || "Failed to submit comment.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-8 rounded-lg border bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Thank you! Your comment has been submitted{email ? " and is now visible" : " and awaits moderation"}.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-xs text-primary underline"
        >
          Leave another comment
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 border-t pt-8">
      <h3 className="text-lg font-semibold">Leave a Comment</h3>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="comment-author" className="block text-sm font-medium mb-1">
            Name <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="comment-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="comment-email" className="block text-sm font-medium mb-1">
            Email <span className="text-muted-foreground">(for auto-approval)</span>
          </label>
          <input
            id="comment-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="comment-content" className="block text-sm font-medium mb-1">
          Comment *
        </label>
        <textarea
          id="comment-content"
          required
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}
