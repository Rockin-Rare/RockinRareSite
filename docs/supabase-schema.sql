-- Legacy draft schema from the original Supabase-ready v1 plan.
-- Current implementation direction is Neon Postgres through Card Intake Router boundaries.
-- Use docs/neon-collector-club-schema.sql for Collector Club and Pro tables.

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  franchise text not null,
  set_name text,
  card_number text,
  language text,
  condition text,
  grade_company text,
  grade text,
  price numeric(10, 2),
  quantity integer default 1,
  status text not null default 'needs_review',
  public_status text not null default 'coming_soon',
  description text,
  condition_notes text,
  image_urls text[] default '{}',
  primary_image_url text,
  external_listing_url text,
  external_listing_platform text,
  actual_photo boolean default true,
  condition_reviewed boolean default false,
  scan_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sell_trade_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  preferred_contact_method text,
  description text not null,
  franchise text,
  approximate_quantity text,
  condition_estimate text,
  image_urls text[] default '{}',
  message text,
  created_at timestamptz default now()
);

create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz default now()
);
