"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const router = useRouter();
  const { token } = use(searchParams);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"validating" | "valid" | "invalid" | "success" | "error">("validating");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    // Validate token
    fetch(`/api/auth/reset-password?token=${token}`)
      .then((res) => res.json())
      .then((data) => setStatus(data.valid ? "valid" : "invalid"))
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords don't match.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setMessage(data.error || "Reset failed.");
        setStatus("error");
      }
    } catch {
      setMessage("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "validating") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 shadow-sm text-center">
          <p className="text-sm text-muted-foreground">Validating your reset link...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 shadow-sm text-center">
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            Invalid or expired reset link.
          </div>
          <Link href="/forgot-password" className="text-sm text-primary underline hover:text-primary/80">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 shadow-sm text-center">
          <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
            Password updated successfully! Redirecting to login...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a strong password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="token" value={token || ""} />
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <p className="text-xs text-destructive">{message}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
