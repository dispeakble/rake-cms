"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface NavMenu {
  id: number;
  name: string;
  slug: string;
  description: string;
  items: number;
}

interface MenuItem {
  id: number;
  title: string;
  url: string;
  parentId: number;
  order: number;
}

export default function AdminNavMenus() {
  const router = useRouter();
  const [menus, setMenus] = useState<NavMenu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<string>("");
  const [menuName, setMenuName] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMenus();
  }, []);

  async function loadMenus() {
    try {
      const res = await fetch("/api/menus/list");
      const data = await res.json();
      setMenus(data.menus || []);
    } catch {
      setError("Failed to load menus");
    } finally {
      setLoading(false);
    }
  }

  async function createMenu() {
    if (!menuName.trim()) return;
    setError("");

    const res = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name: menuName }),
    });

    if (res.ok) {
      setMenuName("");
      await loadMenus();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create menu");
    }
  }

  async function deleteMenu(slug: string) {
    if (!confirm("Delete this menu and all its items?")) return;

    const res = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", slug }),
    });

    if (res.ok) {
      if (selectedMenu === slug) {
        setSelectedMenu("");
        setItems([]);
      }
      await loadMenus();
    }
  }

  async function addItem() {
    if (!newItemTitle.trim() || !selectedMenu) return;
    setError("");

    const res = await fetch("/api/menus/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_item",
        menuSlug: selectedMenu,
        title: newItemTitle,
        url: newItemUrl,
        type: newItemUrl ? "custom" : "post_type",
      }),
    });

    if (res.ok) {
      setNewItemTitle("");
      setNewItemUrl("");
      await loadItems(selectedMenu);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add item");
    }
  }

  async function removeItem(itemId: number) {
    if (!confirm("Remove this item from the menu?")) return;

    const res = await fetch("/api/menus/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove_item", itemId }),
    });

    if (res.ok) {
      await loadItems(selectedMenu);
    }
  }

  async function loadItems(slug: string) {
    const res = await fetch(`/api/menus/items?menuSlug=${slug}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
    }
  }

  async function selectMenu(slug: string) {
    setSelectedMenu(slug);
    if (slug) {
      await loadItems(slug);
    } else {
      setItems([]);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Navigation Menus</h1>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column — Menu Management */}
        <div className="space-y-6 lg:col-span-1">
          {/* Create Menu */}
          <div className="rounded-lg border p-4 space-y-3">
            <h2 className="text-sm font-semibold">Create Menu</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="Menu name"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === "Enter" && createMenu()}
              />
              <button
                onClick={createMenu}
                disabled={!menuName.trim()}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>

          {/* Menu List */}
          <div className="rounded-lg border divide-y">
            {menus.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No menus yet. Create one above.
              </p>
            )}
            {menus.map((menu) => (
              <div
                key={menu.slug}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition ${
                  selectedMenu === menu.slug ? "bg-muted" : ""
                }`}
                onClick={() => selectMenu(menu.slug)}
              >
                <div>
                  <p className="text-sm font-medium">{menu.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {menu.items} items
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMenu(menu.slug);
                  }}
                  className="text-xs text-destructive hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column — Menu Items */}
        <div className="space-y-6 lg:col-span-2">
          {selectedMenu ? (
            <>
              {/* Add Item */}
              <div className="rounded-lg border p-4 space-y-3">
                <h2 className="text-sm font-semibold">Add Menu Item</h2>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Link Text"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                  />
                  <input
                    type="text"
                    value={newItemUrl}
                    onChange={(e) => setNewItemUrl(e.target.value)}
                    placeholder="URL (optional — leave blank for internal)"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                  />
                  <button
                    onClick={addItem}
                    disabled={!newItemTitle.trim()}
                    className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    Add to Menu
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="rounded-lg border divide-y">
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30">
                  Menu Items ({items.length})
                </div>
                {items.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No items in this menu yet. Add items above.
                  </p>
                )}
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-5">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.url || "/"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
              Select a menu from the left panel to manage its items.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
