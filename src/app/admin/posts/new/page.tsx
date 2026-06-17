import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewPost() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Add New Post</h1>
      <div className="space-y-4 rounded-lg border p-6">
        <input
          type="text"
          placeholder="Post title"
          className="w-full rounded-md border border-input bg-background px-4 py-3 text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="min-h-[300px] rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
          Block editor will render here.
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Publish</button>
          <button className="rounded-md border px-4 py-2 text-sm">Save Draft</button>
        </div>
      </div>
    </div>
  );
}
