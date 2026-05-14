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
