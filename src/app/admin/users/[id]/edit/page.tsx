import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function EditUser({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, parseInt(id)))
    .limit(1)
    .then((r) => r[0]);

  if (!user) notFound();

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Edit User</h1>

      <form
        action={`/api/users/${id}`}
        method="POST"
        className="space-y-4 rounded-lg border p-6"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            name="userLogin"
            defaultValue={user.userLogin}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Display Name</label>
          <input
            type="text"
            name="displayName"
            defaultValue={user.displayName}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="userEmail"
            defaultValue={user.userEmail}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            New Password{" "}
            <span className="text-xs text-muted-foreground">(leave blank to keep current)</span>
          </label>
          <input
            type="password"
            name="password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="••••••••"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Update User
          </button>
          <a
            href="/admin/users"
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
