"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { WishlistItemForm } from "@/components/wishlist/WishlistItemForm";
import type { RareRadarWishlistItem } from "@/lib/rare-radar/wishlist";
import type { WishlistDeleteResult, WishlistSaveResult } from "@/app/wishlist/actions";

type WishlistWorkspaceProps = {
  createAction: (formData: FormData) => Promise<WishlistSaveResult>;
  deleteAction: (formData: FormData) => Promise<WishlistDeleteResult>;
  items: RareRadarWishlistItem[];
  updateAction: (formData: FormData) => Promise<WishlistSaveResult>;
};

export function WishlistWorkspace({ createAction, deleteAction, items, updateAction }: WishlistWorkspaceProps) {
  const [wishlistItems, setWishlistItems] = useState(items);
  const [editingItemId, setEditingItemId] = useState("");
  const [editingInitialUpdatedAt, setEditingInitialUpdatedAt] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [highlightedItemId, setHighlightedItemId] = useState("");
  const [previewItem, setPreviewItem] = useState<RareRadarWishlistItem | null>(null);
  const [, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const previousItemCountRef = useRef(wishlistItems.length);
  const statusTimeoutRef = useRef<number | null>(null);
  const formPanelRef = useRef<HTMLDivElement | null>(null);
  const editingItem = useMemo(() => wishlistItems.find((item) => item.id === editingItemId), [editingItemId, wishlistItems]);
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
    setWishlistItems(items);
  }, [items]);

  useEffect(() => {
    if (wishlistItems.length > previousItemCountRef.current) {
      const addedItemId = wishlistItems[0]?.id ?? "";
      showStatus("Added to your Rare Radar.", addedItemId);
    } else if (wishlistItems.length < previousItemCountRef.current) {
      showStatus("Removed from your Rare Radar.");
    }

    previousItemCountRef.current = wishlistItems.length;
  }, [wishlistItems]);

  useEffect(() => {
    if (editingItemId && !wishlistItems.some((item) => item.id === editingItemId)) {
      setEditingItemId("");
      setEditingInitialUpdatedAt("");
    }
  }, [editingItemId, wishlistItems]);

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

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setPreviewItem(null);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [previewItem]);

  function startEditing(item: RareRadarWishlistItem) {
    setEditingItemId(item.id);
    setEditingInitialUpdatedAt(item.updatedAt);

    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        formPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function handleSave(formData: FormData) {
    setIsSaving(true);
    startTransition(async () => {
      try {
        const result = isEditing ? await updateAction(formData) : await createAction(formData);

        if (!result.ok) {
          showStatus(result.error);
          return;
        }

        if (isEditing) {
          setWishlistItems((current) => current.map((item) => (item.id === result.item.id ? result.item : item)));
          setEditingItemId("");
          setEditingInitialUpdatedAt("");
          showStatus("Changes saved.", result.item.id);
        } else {
          setWishlistItems((current) => [result.item, ...current]);
        }
      } catch {
        showStatus("Unable to save this wishlist item.");
      } finally {
        setIsSaving(false);
      }
    });
  }

  function handleDelete(item: RareRadarWishlistItem) {
    setIsSaving(true);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("itemId", item.id);
        const result = await deleteAction(formData);

        if (!result.ok) {
          showStatus(result.error);
          return;
        }

        setWishlistItems((current) => current.filter((wishlistItem) => wishlistItem.id !== result.itemId));
        if (editingItemId === result.itemId) {
          setEditingItemId("");
          setEditingInitialUpdatedAt("");
        }
      } catch {
        showStatus("Unable to delete this wishlist item.");
      } finally {
        setIsSaving(false);
      }
    });
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)] lg:items-start">
      <div className="order-2 rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault lg:order-1">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase text-vault-gold">Your saved radar</p>
            <h2 className="mt-2 text-2xl font-black text-vault-text">Current List</h2>
          </div>
          <p className="shrink-0 text-sm text-vault-secondaryText">{wishlistItems.length} saved</p>
        </div>

        {statusMessage ? (
          <p className="mb-3 rounded-xl border border-vault-gold/30 bg-vault-gold/10 px-4 py-3 text-sm font-semibold text-vault-highlight" role="status">
            {statusMessage}
          </p>
        ) : null}

        {wishlistItems.length > 0 ? (
          <ul className="grid gap-3">
            {wishlistItems.map((item) => {
              const selected = item.id === editingItem?.id;
              const highlighted = item.id === highlightedItemId;
              const metadata = wishlistItemMeta(item);
              const hasImage = Boolean(item.imageUrl);

              return (
                <li
                  className={`grid min-w-0 rounded-xl border p-3 transition sm:items-center ${
                    selected || highlighted ? "border-vault-gold bg-vault-gold/10" : "border-vault-border bg-vault-secondary/70"
                  } ${hasImage ? "gap-4 sm:grid-cols-[144px_minmax(0,1fr)_auto]" : "gap-3 sm:grid-cols-[72px_minmax(0,1fr)_auto]"}`}
                  key={item.id}
                >
                  <span className={`grid min-w-0 items-center gap-3 sm:contents ${hasImage ? "grid-cols-[112px_1fr]" : "grid-cols-[72px_1fr]"}`}>
                    {hasImage ? (
                      <button
                        aria-label={`View larger image for ${item.productName}`}
                        title={`View larger image for ${item.productName}`}
                        className="group relative aspect-[144/202] w-28 overflow-hidden rounded-lg border border-vault-border bg-vault-card p-1.5 transition hover:border-vault-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vault-gold sm:w-36"
                        onClick={() => setPreviewItem(item)}
                        type="button"
                      >
                        <img
                          alt=""
                          className="h-full w-full object-contain"
                          decoding="async"
                          height={202}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          src={item.imageUrl}
                          width={144}
                        />
                        <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full border border-vault-border bg-vault-bg/80 text-vault-secondaryText opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                            open_in_full
                          </span>
                        </span>
                      </button>
                    ) : (
                      <span className="flex aspect-[144/202] w-[72px] items-center justify-center rounded-lg border border-dashed border-vault-border bg-vault-card/60 px-1.5 text-center">
                        <span className="text-[9px] font-bold uppercase leading-3 text-vault-muted">Image pending</span>
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
                      aria-label={`Edit ${item.productName}`}
                      title={`Edit ${item.productName}`}
                      className={`grid size-10 place-items-center rounded-lg border transition ${
                        selected ? "border-vault-gold text-vault-highlight" : "border-vault-border text-vault-secondaryText hover:border-vault-gold hover:text-vault-highlight"
                      }`}
                      onClick={() => startEditing(item)}
                      type="button"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined">
                        edit
                      </span>
                    </button>
                    <button
                      aria-label={`Delete ${item.productName}`}
                      disabled={isSaving}
                      title={`Delete ${item.productName}`}
                      className="grid size-10 place-items-center rounded-lg border border-vault-error/40 text-vault-error/70 transition hover:border-vault-error hover:bg-vault-error/10 hover:text-vault-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vault-error"
                      onClick={() => handleDelete(item)}
                      type="button"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined">
                        delete
                      </span>
                    </button>
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

      <div
        className="order-1 scroll-mt-24 rounded-2xl border border-vault-border bg-vault-card p-4 shadow-vault lg:sticky lg:top-24 lg:order-2 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain"
        ref={formPanelRef}
      >
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
          buttonLabel={isEditing ? "Save Changes" : "Add to Rare Radar"}
          isPending={isSaving}
          item={editingItem}
          key={editingItem?.id ?? `add-${wishlistItems.length}`}
          onSubmit={handleSave}
          pendingLabel={isEditing ? "Saving..." : "Adding..."}
        />
      </div>

      {previewItem?.imageUrl ? (
        <div
          aria-label={`${previewItem.productName} larger card image`}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6"
          onClick={() => setPreviewItem(null)}
          role="dialog"
        >
          <div
            className="flex h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col gap-3 sm:h-[calc(100dvh-3rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-vault-border bg-vault-card/95 px-3 py-2 shadow-vault">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-vault-text">{previewItem.productName}</p>
                <p className="truncate text-sm text-vault-secondaryText">{wishlistItemMeta(previewItem)}</p>
              </div>
              <button
                aria-label="Close image preview"
                className="grid size-10 shrink-0 place-items-center rounded-lg border border-vault-border bg-vault-card text-vault-secondaryText transition hover:border-vault-gold hover:text-vault-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vault-gold"
                onClick={() => setPreviewItem(null)}
                type="button"
              >
                <span aria-hidden="true" className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-vault-border bg-vault-card p-2 shadow-vault sm:p-3">
              <img
                alt={`${previewItem.productName} card art`}
                className="max-h-full max-w-full object-contain"
                decoding="async"
                referrerPolicy="no-referrer"
                src={previewItem.imageUrl}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function wishlistItemMeta(item: RareRadarWishlistItem) {
  return [item.game, item.setName, item.cardNumber ? `#${item.cardNumber}` : "", item.language].filter(Boolean).join(" / ");
}
