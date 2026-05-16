# Card Intake Router Integration

The website should consume Card Intake Router through its public inventory API instead of connecting directly to Neon or R2.

## Website Environment

Set these values in `.env.local` for local development and in Vercel for production:

```bash
CARD_INTAKE_API_BASE_URL=
CARD_INTAKE_API_TOKEN=
```

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
GET /api/public/images/:key?sig=...
```

## Public Rules

Card Intake Router owns public visibility rules. Its API excludes `DO_NOT_LIST` records and only returns inventory that is listable or in `READY_FOR_DRAFT`, `DRAFT_CREATED`, or `LISTED`.

Operational scan IDs, cost basis, owner names, and route rationale are not returned to the website.

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

## Optional Sales Callback

For direct Stripe sales, the website can post checkout events back to Card Intake Router if these environment variables are configured:

```bash
CARD_INTAKE_SALES_WEBHOOK_URL=
CARD_INTAKE_SALES_WEBHOOK_TOKEN=
```

Payload shape:

```json
{
  "productId": "prod-001",
  "sku": "scan-151-box-001",
  "slug": "japanese-pokemon-151-booster-box",
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
