# Rockin Rare Collectibles

V1 legitimacy-first website for Rockin Rare Collectibles, a collector-first trading card business focused on Pokemon, Japanese cards, English singles, sealed product, slabs, collector bundles, and collection buying/trading.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready data and storage placeholders
- Vercel-ready deployment

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Environment Variables

Copy `.env.example` to `.env.local` when Supabase is ready:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The site does not require these values for v1. Supabase clients return `null` when env vars are missing.

## Current V1 Features

- Home page with trust-first brand positioning and inventory preview
- Inventory catalog with client-side search, filters, sorting, sold states, and empty states
- Product detail pages for all mock products
- Sell / Trade intake form with validation and success state
- Contact form with validation and success state
- About and FAQ pages
- Typed mock product data that imitates scanner output
- Supabase schema draft and safe client placeholders

No checkout, payment flow, user accounts, or admin dashboard are implemented in v1.

## Inventory Data

Public inventory is loaded through `lib/products.ts`. If `CARD_INTAKE_API_BASE_URL` is set, the site reads public-safe inventory from the Card Intake Router public API. If no API URL is present, it falls back to `lib/mock-products.ts`.

Set `INVENTORY_SOURCE=mock` to force the local mock catalog for QA, screenshots, or development even when API env vars are present.

- `getProducts()`
- `getPublishedProducts()`
- `getProductBySlug(slug)`
- `getFeaturedProducts()`
- `getRelatedProducts(product)`

Required website env vars:

```bash
CARD_INTAKE_API_BASE_URL=
CARD_INTAKE_API_TOKEN=
```

## Replacing Mock Data With Supabase

Use `docs/supabase-schema.sql` as the starting schema. Replace the mock reads in `lib/products.ts` with Supabase queries from `lib/supabase/server.ts`, mapping snake_case database columns back into the `Product` type in `lib/types.ts`.

Future image storage buckets:

- `product-images`
- `submission-images`

The sell/trade form includes TODO comments for uploading submission photos before creating a `sell_trade_submissions` row.

## Scanner Integration

`lib/scanner-adapter.ts` includes `RawScannerProduct` and `normalizeScannerProduct(raw)`. Scanner records default to `status = "needs_review"` and `publicStatus = "coming_soon"` unless a reviewed publish flag is present.

Expected flow:

Scanner app -> inventory database -> admin review -> published website catalog.

## Vercel Deployment

1. Push the project to a Git repository.
2. Import the repo into Vercel.
3. Set Supabase environment variables later when production data is connected.
4. Deploy with the default Next.js build command: `npm run build`.

## Future Roadmap

- Supabase product database
- Supabase image uploads
- Admin dashboard
- External listing sync
- Direct checkout with Stripe
- Email notifications for sell/trade submissions
- SEO collection buying pages
