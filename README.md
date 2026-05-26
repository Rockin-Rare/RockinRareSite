# Rockin Rare Collectibles

V1 legitimacy-first website for Rockin Rare Collectibles, a collector-first trading card business focused first on Pokemon, then One Piece and Magic: The Gathering, followed by Japanese cards, English singles, sealed product, slabs, collector bundles, and collection buying/trading.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready data and storage placeholders
- Discord webhook contact and sell/trade notifications
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

Copy `.env.example` to `.env.local` and set the values you need:

```bash
DISCORD_SELL_TRADE_WEBHOOK_URL=
DISCORD_CONTACT_WEBHOOK_URL=
DISCORD_COLLECTOR_CLUB_WAITLIST_WEBHOOK_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
COLLECTOR_CLUB_SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SHIPPING_RATE_ID=
STRIPE_TAX_ENABLED=
DISCORD_SALES_WEBHOOK_URL=
CARD_INTAKE_SALES_WEBHOOK_URL=
CARD_INTAKE_SALES_WEBHOOK_TOKEN=
CARD_INTAKE_RESERVATION_URL=
ROCKIN_RARE_ADMIN_TOKEN=
CARD_INTAKE_LISTING_EDIT_URL=
CARD_INTAKE_LISTING_EDIT_TOKEN=
```

The sell/trade and contact forms work locally without webhooks, but submissions are only delivered to Discord when `DISCORD_SELL_TRADE_WEBHOOK_URL` and `DISCORD_CONTACT_WEBHOOK_URL` are set. Collector Club signups are saved to Neon when `DATABASE_URL` is set and can also be mirrored to Discord when `DISCORD_COLLECTOR_CLUB_WAITLIST_WEBHOOK_URL` is set. Set `COLLECTOR_CLUB_SESSION_SECRET` to issue signed Collector Club session cookies after signup. Supabase values are legacy placeholders from the original v1 plan.

## Current V1 Features

- Home page with trust-first brand positioning and inventory preview
- Inventory catalog with client-side search, filters, sorting, sold states, and empty states
- Product detail pages for all mock products
- Sell / Trade intake form with photo uploads, phone QR option, validation, and Discord webhook route
- Contact form with validation and Discord webhook route
- About and FAQ pages
- Typed mock product data that imitates scanner output
- Supabase schema draft and safe client placeholders

Direct checkout is implemented with Stripe Checkout. User accounts are not implemented in v1.

## Listing Editor

Set `ROCKIN_RARE_ADMIN_TOKEN` to enable the password-protected listing editor at `/admin`. The editor updates public listing metadata such as language, grade company, grade, condition, pricing, status, description, and condition notes.

Inventory edits are sent back to Card Intake Router instead of writing website tables directly. Set `CARD_INTAKE_LISTING_EDIT_URL` when the write endpoint has a custom URL, or the site defaults to:

```text
${CARD_INTAKE_API_BASE_URL}/api/admin/inventory/:productId
```

`CARD_INTAKE_LISTING_EDIT_TOKEN` is used as the bearer token for edits. If it is not set, the site falls back to `CARD_INTAKE_API_TOKEN`.

## Inventory Data

Public inventory is loaded through `lib/products.ts`. If `CARD_INTAKE_API_BASE_URL` is set, the site reads public-safe inventory from the Card Intake Router public API. If no API URL is present, it falls back to `lib/mock-products.ts`.

Set `INVENTORY_SOURCE=mock` to force the local mock catalog for QA, screenshots, or development even when API env vars are present.

- `getProducts()`
- `getPublishedProducts()`
- `getProductBySlug(slug)`
- `getFeaturedProducts()`
- `getRelatedProducts(product)`

Commerce metadata is optional on incoming product records. If Card Intake Router does not provide these fields, the website derives safe defaults:

- `sku` falls back to `scanId` or `id`
- `sitePrice` falls back to `price`
- `primaryChannel` is inferred from category, price, and external listing platform
- `checkoutEnabled` defaults to true for available/listed items and false for coming soon items

Supported commerce fields:

```bash
sku
sitePrice
ebayPrice
tcgplayerPrice
primaryChannel # site | ebay | tcgplayer | multi | hold
checkoutEnabled
reservedUntil
soldAt
soldChannel
accessTier # public | collector_club | pro
earlyAccessStartsAt
publicStartsAt
proOnlyUntil
dropId
dropName
```

Required website env vars:

```bash
CARD_INTAKE_API_BASE_URL=
CARD_INTAKE_API_TOKEN=
```

## Stripe Checkout

Set these values to enable direct website checkout:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
STRIPE_SECRET_KEY=sk_live_or_test...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SHIPPING_RATE_ID=shr_...
STRIPE_TAX_ENABLED=true
DISCORD_SALES_WEBHOOK_URL=
```

Checkout sessions are created through `POST /api/checkout`. Stripe should send webhooks to:

```text
/api/stripe/webhook
```

The webhook handles `checkout.session.completed` and `checkout.session.expired`. When `CARD_INTAKE_SALES_WEBHOOK_URL` is configured, completed and expired checkout events are posted to that URL so Card Intake Router can mark the item sold or release future reservations.

Before creating a Stripe Checkout Session, `POST /api/checkout` reserves the item with Card Intake Router. By default it posts to:

```text
${CARD_INTAKE_API_BASE_URL}/api/public/reservations
```

Set `CARD_INTAKE_RESERVATION_URL` if the reservation endpoint lives elsewhere. The endpoint should accept `action: "reserve"` and `action: "release"` payloads. Paid and expired Stripe webhooks require `CARD_INTAKE_SALES_WEBHOOK_URL`; failures return a non-2xx response so Stripe retries instead of silently leaving inventory out of sync.

## Replacing Mock Data With Supabase

Use `docs/supabase-schema.sql` as the starting schema. Replace the mock reads in `lib/products.ts` with Supabase queries from `lib/supabase/server.ts`, mapping snake_case database columns back into the `Product` type in `lib/types.ts`.

Collector Club and Pro data should use Neon tables in `docs/neon-collector-club-schema.sql`. Card Intake Router remains the owner of inventory visibility, reservations, and sold-state write-backs.

See `docs/collector-club-foundation.md` for the current lightweight Collector Club operating model and manual Founding Pro workflow.

The sell/trade form sends submission details and attached photos to Discord. Supported photo types are JPG, PNG, WebP, GIF, HEIC, and HEIF, up to 8 photos, 8 MB each, and 24 MB total. The phone QR opens a photo-only upload page tied to the desktop form session; phone photos are held temporarily in memory until the main form is submitted.

## Scanner Integration

`lib/scanner-adapter.ts` includes `RawScannerProduct` and `normalizeScannerProduct(raw)`. Scanner records default to `status = "needs_review"` and `publicStatus = "coming_soon"` unless a reviewed publish flag is present.

Expected flow:

Scanner app -> inventory database -> admin review -> published website catalog.

## Vercel Deployment

1. Push the project to a Git repository.
2. Import the repo into Vercel.
3. Set `DISCORD_SELL_TRADE_WEBHOOK_URL`, `DISCORD_CONTACT_WEBHOOK_URL`, and `DISCORD_COLLECTOR_CLUB_WAITLIST_WEBHOOK_URL` for form notifications.
4. Deploy with the default Next.js build command: `npm run build`.

## Future Roadmap

- Supabase product database
- Supabase image uploads
- Admin dashboard
- External listing sync
- Automated eBay delisting after direct Stripe sale
- Stored photo archive for sell/trade submissions
- SEO collection buying pages
