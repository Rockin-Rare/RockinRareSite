# Scanner Integration

The v1 site uses typed mock inventory through `lib/products.ts`. The intended production flow is:

1. Scanner app creates a raw inventory record with detected metadata and image URLs.
2. Raw records are normalized by `lib/scanner-adapter.ts`.
3. Normalized products are stored in the inventory database with `status = "needs_review"` by default.
4. An admin review step verifies name, category, condition, price, images, and listing destination.
5. Only reviewed records with `status = "listed"` appear in public inventory.

Scanner records should never auto-publish unless a trusted review process explicitly marks the item reviewed and published.
