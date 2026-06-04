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
  const [editingInitialUpdatedAt, setEditingInitialUpdatedAt] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [highlightedItemId, setHighlightedItemId] = useState("");
  const [previewItem, setPreviewItem] = useState<RareRadarWishlistItem | null>(null);
  const previousItemCountRef = useRef(items.length);
  const statusTimeoutRef = useRef<number | null>(null);
  const editingItem = useMemo(() => items.find((item) => item.id === editingItemId), [editingItemId, items]);
  const isEditing = Boolean(editingItem);

  function showStatus(message: string, highlightedId = "") {
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
    }

    setStatusMessage(message);
    setHighlightedItemId(highlightedId);
    statusTimeoutRef.current = window.setTimeout(() => {
      setStatusMessage("");
      setHighlightedItemId("");
      statusTimeoutRef.current = null;
    }, 3200);
  }

  useEffect(() => {
    if (items.length > previousItemCountRef.current) {
      const addedItemId = items[0]?.id ?? "";
      showStatus("Added to your Rare Radar.", addedItemId);
    } else if (items.length < previousItemCountRef.current) {
      showStatus("Removed from your Rare Radar.");
    }

    previousItemCountRef.current = items.length;
  }, [items]);

  useEffect(() => {
    if (editingItemId && !items.some((item) => item.id === editingItemId)) {
      setEditingItemId("");
      setEditingInitialUpdatedAt("");
    }
  }, [editingItemId, items]);

  useEffect(() => {
    if (editingItem && editingInitialUpdatedAt && editingItem.updatedAt !== editingInitialUpdatedAt) {
      const savedItemId = editingItem.id;
      setEditingItemId("");
      setEditingInitialUpdatedAt("");
      showStatus("Changes saved.", savedItemId);
    }
  }, [editingInitialUpdatedAt, editingItem]);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        window.clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!previewItem) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setPreviewItem(null);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [previewItem]);

  function startEditing(item: RareRadarWishlistItem) {
    setEditingItemId(item.id);
    setEditingInitialUpdatedAt(item.updatedAt);
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)] lg:items-start">
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
          <ul className="grid gap-3">
            {items.map((item) => {
              const selected = item.id === editingItem?.id;
              const highlighted = item.id === highlightedItemId;
              const metadata = wishlistItemMeta(item);

              return (
                <li
                  className={`grid min-w-0 gap-3 rounded-xl border p-3 transition sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:items-center ${
                    selected || highlighted ? "border-vault-gold bg-vault-gold/10" : "border-vault-border bg-vault-secondary/70"
                  }`}
                  key={item.id}
                >
                  <span className="grid min-w-0 grid-cols-[88px_1fr] items-center gap-3 sm:contents">
                    {item.imageUrl ? (
                      <button
                        aria-label={`View larger image for ${item.productName}`}
                        className="aspect-[5/7] w-[88px] overflow-hidden rounded-lg border border-vault-border bg-vault-card p-1.5 transition hover:border-vault-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vault-gold sm:w-[104px]"
                        onClick={() => setPreviewItem(item)}
                        type="button"
                      >
                        <img
                          alt=""
                          className="h-full w-full object-contain"
                          decoding="async"
                          height={146}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          src={item.imageUrl}
                          width={104}
                        />
                      </button>
                    ) : (
                      <span className="flex aspect-[5/7] w-[88px] items-center justify-center rounded-lg border border-dashed border-vault-border bg-vault-card/60 px-2 text-center sm:w-[104px]">
                        <span className="text-[10px] font-bold uppercase leading-4 text-vault-muted">Image pending</span>
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block min-w-0 text-base font-bold leading-snug text-vault-text sm:text-lg">{item.productName}</span>
                      {metadata ? <span className="mt-1 block min-w-0 text-sm font-medium leading-5 text-vault-secondaryText">{metadata}</span> : null}
                      {item.maxPriceCents ? (
                        <span className="mt-2 block text-sm font-semibold text-vault-secondaryText">Up to ${(item.maxPriceCents / 100).toFixed(2)}</span>
                      ) : null}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
                    <button
                      className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase transition sm:min-w-20 ${
                        selected ? "border-vault-gold text-vault-highlight" : "border-vault-border text-vault-secondaryText hover:border-vault-gold hover:text-vault-highlight"
                      }`}
                      onClick={() => startEditing(item)}
                      type="button"
                    >
                      Edit
                    </button>
                    <form action={deleteAction}>
                      <input name="itemId" type="hidden" value={item.id} />
                      <button
                        className="rounded-lg border border-vault-error/40 px-3 py-2 text-xs font-bold uppercase text-vault-error/70 transition hover:border-vault-error hover:bg-vault-error/10 hover:text-vault-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vault-error sm:min-w-20"
                        type="submit"
                      >
                        Delete
                      </button>
                    </form>
                  </span>
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

      <div className="rounded-2xl border border-vault-border bg-vault-card p-4 shadow-vault lg:sticky lg:top-24">
        <div className="mb-4 grid gap-3">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">{isEditing ? "Edit wishlist item" : "Add wishlist item"}</p>
            <h2 className="mt-2 text-xl font-black text-vault-text">{isEditing ? `Editing: ${editingItem?.productName}` : "Add to Rare Radar"}</h2>
            <p className="mt-2 text-sm leading-5 text-vault-secondaryText">
              {isEditing
                ? "Save changes to return to adding cards."
                : "Search the catalog, then add price or notes."}
            </p>
          </div>
          {isEditing ? (
            <Button
              className="shrink-0"
              onClick={() => {
                setEditingItemId("");
                setEditingInitialUpdatedAt("");
              }}
              type="button"
              variant="secondary"
            >
              Back to Add New Item
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
      </div>

      {previewItem?.imageUrl ? (
        <div
          aria-label={`${previewItem.productName} larger card image`}
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 px-4 py-6"
          onClick={() => setPreviewItem(null)}
          role="dialog"
        >
          <div className="grid max-h-full w-full max-w-md gap-3" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-vault-text">{previewItem.productName}</p>
                <p className="truncate text-sm text-vault-secondaryText">{wishlistItemMeta(previewItem)}</p>
              </div>
              <button
                className="rounded-lg border border-vault-border bg-vault-card px-3 py-2 text-xs font-bold uppercase text-vault-secondaryText transition hover:border-vault-gold hover:text-vault-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vault-gold"
                onClick={() => setPreviewItem(null)}
                type="button"
              >
                Close
              </button>
            </div>
            <img
              alt={`${previewItem.productName} card art`}
              className="max-h-[82vh] w-full rounded-xl border border-vault-border bg-vault-card object-contain p-3 shadow-vault"
              decoding="async"
              referrerPolicy="no-referrer"
              src={previewItem.imageUrl}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function wishlistItemMeta(item: RareRadarWishlistItem) {
  return [item.game, item.setName, item.cardNumber ? `#${item.cardNumber}` : "", item.language].filter(Boolean).join(" / ");
}
