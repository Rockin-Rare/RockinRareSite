import { getNeonSql, hasNeonDatabase } from "../db/neon";
import type { CollectorClubEntitlement, CollectorClubProfile, CollectorClubSignup, CollectorClubTier } from "./types";

type CollectorClubMemberRow = {
  id: string;
  email: string;
  tier: CollectorClubTier;
};

type CollectorClubProfileRow = CollectorClubMemberRow & {
  name: string;
  collecting_focus: string;
  favorite_sets: string | null;
  wishlist: string | null;
  discord_username: string | null;
  interested_in_pro: boolean;
  created_at: Date | string;
  updated_at: Date | string;
};

export function normalizeCollectorClubEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function saveCollectorClubSignup(signup: CollectorClubSignup) {
  if (!hasNeonDatabase()) {
    return { stored: false as const, reason: "database_unconfigured" as const };
  }

  const sql = getNeonSql();
  if (!sql) {
    return { stored: false as const, reason: "database_unconfigured" as const };
  }

  const email = normalizeCollectorClubEmail(signup.email);
  const requestedTier = signup.interestedInPro ? "pro_waitlist" : "free";

  const rows = (await sql`
    insert into collector_club.members (
      email,
      name,
      tier,
      collecting_focus,
      favorite_sets,
      wishlist,
      discord_username,
      interested_in_pro,
      signup_source,
      updated_at
    )
    values (
      ${email},
      ${signup.name},
      ${requestedTier},
      ${signup.collectingFocus},
      ${signup.favoriteSets || null},
      ${signup.wishlist || null},
      ${signup.discordUsername || null},
      ${signup.interestedInPro},
      ${signup.source || "website"},
      now()
    )
    on conflict (email) do update set
      name = excluded.name,
      tier = case
        when collector_club.members.tier = 'free' and excluded.tier = 'pro_waitlist' then 'pro_waitlist'
        else collector_club.members.tier
      end,
      collecting_focus = excluded.collecting_focus,
      favorite_sets = excluded.favorite_sets,
      wishlist = excluded.wishlist,
      discord_username = excluded.discord_username,
      interested_in_pro = collector_club.members.interested_in_pro or excluded.interested_in_pro,
      signup_source = coalesce(collector_club.members.signup_source, excluded.signup_source),
      updated_at = now()
    returning id, email, tier
  `) as unknown as CollectorClubMemberRow[];

  const member = rows[0] as CollectorClubMemberRow | undefined;

  return member ? { stored: true as const, member } : { stored: false as const, reason: "member_not_returned" as const };
}

export async function getCollectorClubEntitlementByMemberId(memberId: string, email: string): Promise<CollectorClubEntitlement | null> {
  const sql = getNeonSql();
  if (!sql) return null;

  const rows = (await sql`
    select email, tier
    from collector_club.members
    where id = ${memberId}
      and email = ${normalizeCollectorClubEmail(email)}
    limit 1
  `) as unknown as Array<Pick<CollectorClubMemberRow, "email" | "tier">>;
  const member = rows[0] as Pick<CollectorClubMemberRow, "email" | "tier"> | undefined;

  return member ? { email: member.email, tier: member.tier } : null;
}

export async function getCollectorClubEntitlementByEmail(email: string): Promise<CollectorClubEntitlement | null> {
  const sql = getNeonSql();
  if (!sql) return null;

  const rows = (await sql`
    select email, tier
    from collector_club.members
    where email = ${normalizeCollectorClubEmail(email)}
    limit 1
  `) as unknown as Array<Pick<CollectorClubMemberRow, "email" | "tier">>;
  const member = rows[0] as Pick<CollectorClubMemberRow, "email" | "tier"> | undefined;

  return member ? { email: member.email, tier: member.tier } : null;
}

export async function getCollectorClubProfileByEmail(email: string): Promise<CollectorClubProfile | null> {
  const sql = getNeonSql();
  if (!sql) return null;

  const rows = (await sql`
    select
      id,
      email,
      name,
      tier,
      collecting_focus,
      favorite_sets,
      wishlist,
      discord_username,
      interested_in_pro,
      created_at,
      updated_at
    from collector_club.members
    where email = ${normalizeCollectorClubEmail(email)}
    limit 1
  `) as unknown as CollectorClubProfileRow[];
  const member = rows[0] as CollectorClubProfileRow | undefined;

  if (!member) return null;

  return {
    id: member.id,
    email: member.email,
    name: member.name,
    tier: member.tier,
    collectingFocus: member.collecting_focus,
    favoriteSets: member.favorite_sets ?? "",
    wishlist: member.wishlist ?? "",
    discordUsername: member.discord_username ?? "",
    interestedInPro: member.interested_in_pro,
    createdAt: toIsoString(member.created_at),
    updatedAt: toIsoString(member.updated_at)
  };
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}
