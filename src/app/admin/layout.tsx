import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="text-lg font-bold">Rake CMS</Link>
        </div>
        <nav className="space-y-1 p-4">
          <NavItem href="/admin" label="Dashboard" icon="H" />
          <NavItem href="/admin/posts" label="Posts" icon="P" />
          <NavItem href="/admin/media" label="Media" icon="M" />
          <NavItem href="/admin/categories" label="Categories" icon="C" />
          <NavItem href="/admin/users" label="Users" icon="U" />
          <NavItem href="/admin/settings" label="Settings" icon="S" />
        </nav>
        <div className="absolute bottom-0 left-0 w-64 border-t p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground">
              {session.user?.name?.[0] || "U"}
            </div>
            <div className="flex-1 truncate text-sm">{session.user?.name || "User"}</div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded border text-xs font-medium">{icon}</span>
      {label}
    </Link>
  );
}
