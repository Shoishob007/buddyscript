import { Pool, QueryResult, QueryResultRow } from "pg";

const globalForDb = globalThis as unknown as { dbPool?: Pool };

function buildConnectionString() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required. Set your Neon Postgres connection string in environment variables.",
    );
  }
  return connectionString;
}

export const db =
  globalForDb.dbPool ||
  new Pool({
    connectionString: buildConnectionString(),
    max: Number(process.env.PG_POOL_MAX || 20),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
    connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT_MS || 5000),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbPool = db;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return db.query<T>(text, params);
}
