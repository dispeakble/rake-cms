"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTagForm({
  taxonomy,
  label,
}: {
  taxonomy: string;
  label: string;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), taxonomy }),
      });

      if (res.ok) {
        setName("");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1">
        <label className="block text-xs font-medium mb-1">
          Add New {label}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`${label} name`}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "..." : "Add"}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}
