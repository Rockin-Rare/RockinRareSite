-- Neon schema for Collector Club, Pro entitlements, billing, and website-side gate state.
-- Card Intake Router remains the owner of inventory records and listing mutations.

create schema if not exists collector_club;
create schema if not exists billing;
create extension if not exists pgcrypto;

do $$ begin
  create type collector_club.member_tier as enum (
    'free',
    'pro_waitlist',
    'founding_pro_invited',
    'founding_pro_active',
    'pro_active',
    'admin'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type billing.subscription_status as enum (
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists collector_club.members (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  tier collector_club.member_tier not null default 'free',
  collecting_focus text not null default 'Pokemon',
  favorite_sets text,
  wishlist text,
  discord_username text,
  discord_user_id text,
  interested_in_pro boolean not null default false,
  signup_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collector_club_members_tier_idx on collector_club.members (tier);
create index if not exists collector_club_members_discord_user_id_idx on collector_club.members (discord_user_id);

create table if not exists collector_club.wishlist_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references collector_club.members (id) on delete set null,
  email text not null,
  collecting_focus text not null,
  wishlist text not null,
  priority boolean not null default false,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists collector_club.custom_bundle_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references collector_club.members (id) on delete set null,
  email text not null,
  budget_cents integer,
  preferences text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists collector_club.collection_estimate_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references collector_club.members (id) on delete set null,
  email text not null,
  description text not null,
  priority boolean not null default false,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists billing.stripe_customers (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references collector_club.members (id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists billing.subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references collector_club.members (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  status billing.subscription_status not null,
  price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists billing.store_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references collector_club.members (id) on delete cascade,
  amount_cents integer not null,
  reason text not null,
  stripe_subscription_id text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists billing.webhook_events (
  event_id text primary key,
  provider text not null default 'stripe',
  event_type text not null,
  status text not null default 'processing',
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
