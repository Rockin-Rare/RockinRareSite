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
  const [highlightedItemId, setHighlightedItemId] = useState("");
  const previousItemCountRef = useRef(items.length);
  const editingItem = useMemo(() => items.find((item) => item.id === editingItemId), [editingItemId, items]);
  const isEditing = Boolean(editingItem);

  useEffect(() => {
    if (items.length > previousItemCountRef.current) {
      const addedItemId = items[0]?.id ?? "";
      setStatusMessage("Added to your Rare Radar.");
      setHighlightedItemId(addedItemId);
      const timeoutId = window.setTimeout(() => {
        setStatusMessage("");
        setHighlightedItemId("");
      }, 3200);
      previousItemCountRef.current = items.length;
      return () => window.clearTimeout(timeoutId);
    }

    previousItemCountRef.current = items.length;
    return undefined;
  }, [items]);

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

        {statusMessage ? (
          <p className="mb-3 rounded-xl border border-vault-gold/30 bg-vault-gold/10 px-4 py-3 text-sm font-semibold text-vault-highlight" role="status">
            {statusMessage}
          </p>
        ) : null}

        {items.length > 0 ? (
          <ul className="grid gap-2">
            {items.map((item) => {
              const selected = item.id === editingItem?.id;
              const highlighted = item.id === highlightedItemId;
              const metadata = wishlistItemMeta(item);

              return (
                <li
                  className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3 transition ${
                    selected || highlighted ? "border-vault-gold bg-vault-gold/10" : "border-vault-border bg-vault-secondary/70"
                  }`}
                  key={item.id}
                >
                  <span className="grid min-w-0 gap-1">
                    <span className="min-w-0 truncate text-sm font-semibold text-vault-text">{item.productName}</span>
                    {metadata ? <span className="min-w-0 truncate text-xs text-vault-muted">{metadata}</span> : null}
                  </span>
                  <button
                    className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-bold uppercase transition ${
                      selected ? "border-vault-gold text-vault-highlight" : "border-vault-border text-vault-secondaryText hover:border-vault-gold hover:text-vault-highlight"
                    }`}
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
            Start with one chase card. Search by name, then set a max price if you want deal alerts.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">{isEditing ? "Edit wishlist item" : "Add wishlist item"}</p>
            <h2 className="mt-2 text-2xl font-black text-vault-text">{isEditing ? `Editing: ${editingItem?.productName}` : "Add to Rare Radar"}</h2>
            <p className="mt-2 text-sm leading-6 text-vault-secondaryText">
              Search the catalog first, then add price or notes. Detailed fields are available when you need them.
            </p>
          </div>
          {isEditing ? (
            <Button className="shrink-0" onClick={() => setEditingItemId("")} type="button" variant="secondary">
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

function wishlistItemMeta(item: RareRadarWishlistItem) {
  return [item.game, item.setName, item.cardNumber ? `#${item.cardNumber}` : "", item.language].filter(Boolean).join(" / ");
}
