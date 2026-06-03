"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { WishlistItemForm } from "@/components/wishlist/WishlistItemForm";
import type { RareRadarWishlistItem } from "@/lib/rare-radar/wishlist";

type WishlistWorkspaceProps = {
  createAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  items: RareRadarWishlistItem[];
  updateAction: (formData: FormData) => Promise<void>;
};

export function WishlistWorkspace({ createAction, deleteAction, items, updateAction }: WishlistWorkspaceProps) {
  const [editingItemId, setEditingItemId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const previousItemCountRef = useRef(items.length);
  const editingItem = useMemo(() => items.find((item) => item.id === editingItemId), [editingItemId, items]);
  const isEditing = Boolean(editingItem);

  useEffect(() => {
    if (items.length > previousItemCountRef.current) {
      setStatusMessage("Added to your Rare Radar.");
      const timeoutId = window.setTimeout(() => setStatusMessage(""), 3200);
      previousItemCountRef.current = items.length;
      return () => window.clearTimeout(timeoutId);
    }

    previousItemCountRef.current = items.length;
    return undefined;
  }, [items.length]);

  useEffect(() => {
    if (editingItemId && !items.some((item) => item.id === editingItemId)) {
      setEditingItemId("");
    }
  }, [editingItemId, items]);

  return (
    <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <div className="rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">Your saved radar</p>
            <h2 className="mt-2 text-2xl font-black text-vault-text">Current List</h2>
          </div>
          <p className="shrink-0 text-sm text-vault-secondaryText">{items.length} saved</p>
        </div>

        {items.length > 0 ? (
          <ul className="grid gap-2">
            {items.map((item) => {
              const selected = item.id === editingItem?.id;

              return (
                <li
                  className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3 transition ${
                    selected ? "border-vault-gold bg-vault-gold/10" : "border-vault-border bg-vault-secondary/70"
                  }`}
                  key={item.id}
                >
                  <span className="min-w-0 truncate text-sm font-semibold text-vault-text">{item.productName}</span>
                  <button
                    className="shrink-0 rounded-lg border border-vault-border px-3 py-2 text-xs font-bold uppercase text-vault-secondaryText transition hover:border-vault-gold hover:text-vault-highlight"
                    onClick={() => setEditingItemId(item.id)}
                    type="button"
                  >
                    Edit
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-vault-border bg-vault-secondary/50 p-5 text-sm leading-6 text-vault-secondaryText">
            No wishlist items yet. Add your first chase to start building your Rare Radar.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">{isEditing ? "Edit wishlist item" : "Add wishlist item"}</p>
            <h2 className="mt-2 text-2xl font-black text-vault-text">{isEditing ? editingItem?.productName : "Add to Rare Radar"}</h2>
            <p className="mt-2 text-sm leading-6 text-vault-secondaryText">
              Keep entries specific when you can. Set names, card numbers, and max prices make matching more reliable.
            </p>
          </div>
          {isEditing ? (
            <Button onClick={() => setEditingItemId("")} type="button" variant="secondary">
              Add New
            </Button>
          ) : null}
        </div>

        <WishlistItemForm
          action={isEditing ? updateAction : createAction}
          buttonLabel={isEditing ? "Save Changes" : "Add to Rare Radar"}
          item={editingItem}
          key={editingItem?.id ?? `add-${items.length}`}
          pendingLabel={isEditing ? "Saving..." : "Adding..."}
        />

        {statusMessage ? (
          <p className="mt-3 rounded-xl border border-vault-gold/30 bg-vault-gold/10 px-4 py-3 text-sm font-semibold text-vault-highlight" role="status">
            {statusMessage}
          </p>
        ) : null}

        {isEditing && editingItem ? (
          <form action={deleteAction} className="mt-3">
            <input name="itemId" type="hidden" value={editingItem.id} />
            <Button type="submit" variant="ghost">
              Delete Item
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
