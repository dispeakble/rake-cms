import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function AdminUsers() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const allUsers = await db
    .select({
      id: users.id,
      userLogin: users.userLogin,
      displayName: users.displayName,
      userEmail: users.userEmail,
      userRegistered: users.userRegistered,
    })
    .from(users)
    .orderBy(desc(users.userRegistered));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <span className="text-sm text-muted-foreground">{allUsers.length} users</span>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
          <div className="col-span-3">Username</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Registered</div>
          <div className="col-span-1">Actions</div>
        </div>
        <div className="divide-y">
          {allUsers.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center"
            >
              <div className="col-span-3 font-medium truncate">
                {user.userLogin}
              </div>
              <div className="col-span-3 text-muted-foreground truncate">
                {user.displayName || "—"}
              </div>
              <div className="col-span-3 text-muted-foreground truncate">
                {user.userEmail}
              </div>
              <div className="col-span-2 text-muted-foreground text-xs">
                {new Date(user.userRegistered).toLocaleDateString()}
              </div>
              <div className="col-span-1">
                <Link
                  href={`/admin/users/${user.id}/edit`}
                  className="text-xs text-primary underline"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
