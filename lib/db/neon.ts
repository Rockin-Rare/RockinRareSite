import { neon } from "@neondatabase/serverless";

type NeonSql = ReturnType<typeof neon>;

let cachedSql: NeonSql | null = null;

export function hasNeonDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getNeonSql() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  cachedSql ??= neon(connectionString);
  return cachedSql;
}
