# Card Intake Router Integration

The website should consume Card Intake Router through its public inventory API instead of connecting directly to Neon or R2.

Collector Club and billing tables can live in the same Neon project, but inventory ownership should remain behind the Card Intake Router API. The website should not directly update product, listing, scan, reservation, or sold-state inventory tables.

## Website Environment

Set these values in `.env.local` for local development and in Vercel for production:

```bash
CARD_INTAKE_API_BASE_URL=
CARD_INTAKE_API_TOKEN=
CARD_INTAKE_QUOTE_API_URL=
CARD_INTAKE_WISHLIST_API_URL=
CARD_INTAKE_ADMIN_BASE_URL=
```

`CARD_INTAKE_ADMIN_BASE_URL` is optional. When set, the website admin listing view opens Card Intake Router edit pages instead of editing inventory in the website.

`CARD_INTAKE_QUOTE_API_URL` is optional. When set, the Sell / Trade scanner posts seller photos and collection details there for instant quote generation. When omitted, the website tries `${CARD_INTAKE_API_BASE_URL}/api/public/seller-quotes`. If no Card Intake quote route is available, the website returns a preliminary local estimate and marks it as a site estimate.

`CARD_INTAKE_WISHLIST_API_URL` is optional. When omitted, the About page tries `${CARD_INTAKE_API_BASE_URL}/api/public/wishlist` for collector wishlist cards. If the endpoint is not available, the page uses local fallback wishlist items.

If these are not set, the website falls back to mock inventory.

## Card Intake Router Environment

Set these in Card Intake Router:

```bash
CARD_INTAKE_PUBLIC_API_TOKEN=
CARD_INTAKE_PUBLIC_IMAGE_SECRET=
CARD_INTAKE_PUBLIC_BASE_URL=
CARD_INTAKE_PUBLIC_INVENTORY_LIMIT=250
```

`CARD_INTAKE_PUBLIC_API_TOKEN` protects JSON inventory endpoints. `CARD_INTAKE_PUBLIC_IMAGE_SECRET` signs image URLs so the website can render product photos without exposing R2/S3 credentials.

## API Endpoints

```text
GET /api/public/inventory
GET /api/public/inventory/:slug
GET /api/public/wishlist
POST /api/public/seller-quotes
GET /api/public/images/:key?sig=...
```

Wishlist payloads should return public-safe card catalog data, not owned inventory state:

```json
{
  "items": [
    {
      "id": "umbreon-vmax-alt-art",
      "name": "Umbreon VMAX Alt Art",
      "franchise": "Pokemon",
      "setName": "Evolving Skies",
      "cardNumber": "215/203",
      "language": "English",
      "desiredCondition": "Clean raw or graded",
      "notes": "Looking for strong centering and clean edges.",
      "imageUrl": "https://..."
    }
  ]
}
```

Seller quote requests are multipart form posts from the website:

```text
photos[] # Front photos only. JPG, PNG, WebP, GIF, HEIC, or HEIF, up to 8 files
photoSession # optional website phone QR upload session
franchise
approximateQuantity
conditionEstimate
description
```

Expected seller quote response:

```json
{
  "id": "quote_123",
  "status": "quoted",
  "confidence": "medium",
  "cashOfferCents": 5500,
  "tradeCreditCents": 7000,
  "rangeLowCents": 4500,
  "rangeHighCents": 6500,
  "detectedCards": [
    {
      "name": "Charizard ex",
      "franchise": "Pokemon",
      "condition": "Near Mint",
      "marketPriceCents": 10000,
      "confidence": 0.82
    }
  ],
  "notes": ["Final offer requires condition review."]
}
```

## Public Rules

Card Intake Router owns public visibility rules. Its API excludes `DO_NOT_LIST` records and only returns inventory that is listable or in `READY_FOR_DRAFT`, `DRAFT_CREATED`, or `LISTED`.

Operational scan IDs, cost basis, owner names, and route rationale are not returned to the website.

Card finish is returned as:

```text
isFoil # boolean; true for scanned-card foil or batch-level all-cards-foil inventory
```

## Optional Commerce Fields

The website can accept these public-safe commerce fields when Card Intake Router is ready to send them:

```text
sku
sitePrice
ebayPrice
tcgplayerPrice
primaryChannel
checkoutEnabled
reservedUntil
soldAt
soldChannel
accessTier
earlyAccessStartsAt
publicStartsAt
proOnlyUntil
dropId
dropName
```

`primaryChannel` should be one of:

```text
site
ebay
tcgplayer
multi
hold
```

If these fields are omitted, the website derives defaults from `id`, `scanId`, `price`, category, and external listing fields.

Collector Club gate fields are public-safe controls:

```text
accessTier # public | collector_club | pro
earlyAccessStartsAt # ISO timestamp for early access window start
publicStartsAt # ISO timestamp when public checkout should begin
proOnlyUntil # ISO timestamp before which checkout requires Pro access
dropId # optional public drop identifier
dropName # optional public drop display name
```

The website treats omitted `accessTier` as `public`. Checkout must still be validated by the website API and reservation endpoint; client-side hiding is not a security boundary.

## Optional Sales Callback

For direct Stripe sales, the website can post checkout events back to Card Intake Router if these environment variables are configured:

```bash
CARD_INTAKE_SALES_WEBHOOK_URL=
CARD_INTAKE_SALES_WEBHOOK_TOKEN=
CARD_INTAKE_RESERVATION_URL=
```

Before creating a Stripe Checkout Session, the website reserves the product. If `CARD_INTAKE_RESERVATION_URL` is not set, it posts to:

```text
${CARD_INTAKE_API_BASE_URL}/api/public/reservations
```

Reserve payload:

```json
{
  "action": "reserve",
  "productId": "prod-001",
  "sku": "scan-151-box-001",
  "slug": "japanese-pokemon-151-booster-box",
  "reservedUntil": "2026-05-15T12:30:00.000Z"
}
```

Expected response:

```json
{
  "reservationId": "res_...",
  "reservedUntil": "2026-05-15T12:30:00.000Z"
}
```

Release payload:

```json
{
  "action": "release",
  "productId": "prod-001",
  "sku": "scan-151-box-001",
  "slug": "japanese-pokemon-151-booster-box",
  "reservationId": "res_..."
}
```

Payload shape:

```json
{
  "productId": "prod-001",
  "sku": "scan-151-box-001",
  "slug": "japanese-pokemon-151-booster-box",
  "reservationId": "res_...",
  "reservedUntil": "2026-05-15T12:30:00.000Z",
  "soldChannel": "site",
  "status": "paid",
  "stripeSessionId": "cs_test_...",
  "stripePaymentIntentId": "pi_...",
  "amountTotal": 18999,
  "currency": "usd",
  "customerEmail": "buyer@example.com",
  "soldAt": "2026-05-15T12:00:00.000Z"
}
```
