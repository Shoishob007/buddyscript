import { Pool, QueryResult, QueryResultRow } from "pg";

const globalForDb = globalThis as unknown as { dbPool?: Pool };

function buildConnectionString() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "5432";
  const database = process.env.DB_NAME;

  if (!user || password === undefined || !database) {
    throw new Error(
      "Database configuration is missing. Set DATABASE_URL or DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, and DB_NAME.",
    );
  }

  if (
    password === "YOUR_LOCAL_POSTGRES_PASSWORD" ||
    password === "YOUR_POSTGRES_PASSWORD"
  ) {
    throw new Error(
      "DB_PASSWORD is still a placeholder. Set your real local PostgreSQL password in .env.",
    );
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
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
