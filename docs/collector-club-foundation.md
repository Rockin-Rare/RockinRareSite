# Collector Club Foundation

This is the lightweight foundation to keep in place while Rockin Rare collects real signup, traffic, and buyer interest.

## What is active now

- Free Collector Club signup form.
- Neon persistence for signups when `DATABASE_URL` is configured.
- Optional Discord signup mirror through `DISCORD_COLLECTOR_CLUB_WAITLIST_WEBHOOK_URL`.
- Signed member session cookies when `COLLECTOR_CLUB_SESSION_SECRET` is configured.
- Member-aware inventory gates for `public`, `collector_club`, and `pro` products.
- Manual Founding Pro tier support.

## What is intentionally deferred

- Stripe subscription billing.
- Store credit automation.
- Discord role sync.
- Wishlist matching automation.
- Custom bundle workflow automation.
- Discord bots and slash commands.

## Required setup

Apply `docs/neon-collector-club-schema.sql` to the Neon database used for website-side Collector Club data.

Set these website environment variables:

```bash
DATABASE_URL=
COLLECTOR_CLUB_SESSION_SECRET=
DISCORD_COLLECTOR_CLUB_WAITLIST_WEBHOOK_URL=
```

`DATABASE_URL` should use a least-privilege website role. It should not be the same broad admin role used for inventory operations.

`COLLECTOR_CLUB_SESSION_SECRET` should be a long random string. Rotating it signs everyone out.

## Manual Founding Pro workflow

Collector Club signups with Pro interest enter as `pro_waitlist`. Founding Pro is enabled manually while the offer is being tested.

Invite a member:

```sql
update collector_club.members
set tier = 'founding_pro_invited',
    updated_at = now()
where email = 'collector@example.com';
```

Activate Founding Pro:

```sql
update collector_club.members
set tier = 'founding_pro_active',
    updated_at = now()
where email = 'collector@example.com';
```

Remove Founding Pro access:

```sql
update collector_club.members
set tier = 'free',
    updated_at = now()
where email = 'collector@example.com';
```

Because the website resolves the tier from Neon on each request, the member does not need a new session cookie after a manual tier change.

## Card Intake gate fields

Card Intake Router remains the owner of inventory. To test member-gated products, its public inventory payload can include:

```text
accessTier # public | collector_club | pro
publicStartsAt
proOnlyUntil
dropId
dropName
```

The website enforces these gates again in `/api/checkout`, so hidden checkout buttons are not the only protection.
