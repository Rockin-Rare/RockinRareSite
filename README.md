# Rockin Rare Collectibles

V1 legitimacy-first website for Rockin Rare Collectibles, a collector-first trading card business supporting Pokemon, One Piece, Riftbound, Magic: The Gathering, Japanese cards, English singles, sealed product, slabs, collector bundles, and collection buying/trading.

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
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
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
CARD_INTAKE_ADMIN_BASE_URL=
CARD_INTAKE_QUOTE_API_URL=
CARD_INTAKE_WISHLIST_API_URL=
```

The sell/trade and contact forms work locally without webhooks, but submissions are only delivered to Discord when `DISCORD_SELL_TRADE_WEBHOOK_URL` and `DISCORD_CONTACT_WEBHOOK_URL` are set. Collector Club signups are saved to Neon when `DATABASE_URL` is set and can also be mirrored to Discord when `DISCORD_COLLECTOR_CLUB_WAITLIST_WEBHOOK_URL` is set. Set `COLLECTOR_CLUB_SESSION_SECRET` to issue signed Collector Club session cookies after signup. Rare Radar user accounts use Neon Auth; set `NEON_AUTH_BASE_URL` and a 32+ character `NEON_AUTH_COOKIE_SECRET`, then apply `docs/neon-collector-club-schema.sql` so wishlist items can be stored. Supabase values are legacy placeholders from the original v1 plan.

## Current V1 Features

- Home page with trust-first brand positioning and inventory preview
- Inventory catalog with client-side search, filters, sorting, sold states, and empty states
- Product detail pages for all mock products
- Sell / Trade intake form with front-photo camera scanning, instant quote estimates, computer uploads, phone QR uploads, validation, and Discord webhook route
- Contact form with validation and Discord webhook route
- Rare Radar account sign-in/sign-up and authenticated wishlist management
- About and FAQ pages
- Typed mock product data that imitates scanner output
- Supabase schema draft and safe client placeholders

Direct checkout is implemented with Stripe Checkout.

## Listing Admin Handoff

Set `ROCKIN_RARE_ADMIN_TOKEN` to enable the password-protected listing handoff at `/admin`. The website admin list is read-only and opens source inventory records in Card Intake Router.

Set `CARD_INTAKE_ADMIN_BASE_URL` to the Card Intake Router origin, for example:

```text
https://card-intake.example.com
```

The website links listings to:

```text
${CARD_INTAKE_ADMIN_BASE_URL}/inventory/:scanOrSkuOrProductId/edit
```

Inventory fields such as language, grade company, grade, condition, pricing, status, description, and condition notes should be edited in Card Intake Router. The website should not PATCH inventory data.

## Inventory Data

Public inventory is loaded through `lib/products.ts`. If `CARD_INTAKE_API_BASE_URL` is set, the site reads public-safe inventory from the Card Intake Router public API. If no API URL is present, it falls back to `lib/mock-products.ts`.

The inventory page renders the first page server-side, then uses `/api/inventory` for client-side load-more requests. Supported query parameters are `limit`, `offset`, `search`, `category`, `franchise`, `language`, `condition`, `availability`, and `sort`. The Card Intake Router response should include `products`, `total`, `pageInfo`, and `filters` so the storefront can paginate without receiving the full inventory list up front.

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
CARD_INTAKE_QUOTE_API_URL=
CARD_INTAKE_WISHLIST_API_URL=
CARD_INTAKE_INTERNAL_MATCHES_URL=
CARD_INTAKE_INTERNAL_API_TOKEN=
```

The About page wishlist can pull public-safe card catalog records from Card Intake Router. By default it reads:

```text
${CARD_INTAKE_API_BASE_URL}/api/public/wishlist
```

Set `CARD_INTAKE_WISHLIST_API_URL` if that feed lives at a different URL. If the wishlist endpoint is unavailable, the site keeps rendering local fallback wishlist items.

The Rare Radar admin page can use Card Intake Router private inventory matching before items are public. Set `CARD_INTAKE_INTERNAL_MATCHES_URL` to the Card Intake endpoint, or omit it to use:

```text
${CARD_INTAKE_API_BASE_URL}/api/internal/rare-radar/matches
```

Set `CARD_INTAKE_INTERNAL_API_TOKEN` to the same value configured in Card Intake Router. If the internal endpoint is unavailable, `/admin/wishlist` falls back to public storefront inventory matching.

The Sell / Trade scanner can post seller front photos to Card Intake Router for quotes. Set `CARD_INTAKE_QUOTE_API_URL` for an explicit endpoint, or the site will try:

```text
${CARD_INTAKE_API_BASE_URL}/api/public/seller-quotes
```

If no Card Intake quote endpoint is configured or reachable, `/api/sell-trade/quote` returns a preliminary local estimate and labels it as a site estimate. Final seller submissions include the quote summary in the Discord notification.

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
