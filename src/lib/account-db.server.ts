import { Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler, type CompiledQuery, type DatabaseConnection, type QueryResult } from "kysely";

type Result = { rows: Record<string, unknown>[]; fields: { name: string; dataTypeID: number }[]; rowCount: number | null; command: string };
/** Request-scoped HTTP transport. Writes are never retried; no simulated transactions. */
export function accountDbConfigured() {
  return Boolean(process.env["DATABASE_URL"] || (process.env["LOVABLE_API_KEY"] && process.env["NEON_API_KEY"]));
}

export async function accountSql(query: string, params: unknown[] = []): Promise<Result> {
  const values = params.map((p) => p instanceof Date ? p.toISOString() : p);
  const databaseUrl = process.env["DATABASE_URL"];
  if (databaseUrl) {
    // External hosts (Cloudflare/Render): direct Neon HTTP using the owner's connection string.
    const { neon } = await import("@neondatabase/serverless");
    const run = neon(databaseUrl, { fullResults: true });
    try {
      const r = await run.query(query, values);
      return { rows: r.rows as Record<string, unknown>[], fields: r.fields.map((f) => ({ name: f.name, dataTypeID: f.dataTypeID })), rowCount: r.rowCount, command: r.command };
    } catch {
      // Never log parameters: auth queries contain passwords, session and reset tokens.
      throw new Error("Account database request failed. Refresh before retrying a change.");
    }
  }
  const apiKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["NEON_API_KEY"];
  if (!apiKey || !connectionKey) throw new Error("Account database is not configured.");
  const response = await fetch("https://connector-gateway.lovable.dev/neon/sql", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "X-Connection-Api-Key": connectionKey, "Content-Type": "application/json" },
    body: JSON.stringify({ query, params: values }),
  });
  if (!response.ok) {
    // Never log parameters: auth queries contain passwords, session and reset tokens.
    throw new Error(`Account database request failed (${response.status}). Refresh before retrying a change.`);
  }
  return response.json() as Promise<Result>;
}

class Connection implements DatabaseConnection {
  async executeQuery<R>(compiled: CompiledQuery): Promise<QueryResult<R>> {
    const result = await accountSql(compiled.sql, [...compiled.parameters]);
    const dates = result.fields.filter((f) => f.dataTypeID === 1184 || f.dataTypeID === 1114).map((f) => f.name);
    const rows = result.rows.map((row) => {
      const converted = { ...row };
      for (const name of dates) if (typeof converted[name] === "string") converted[name] = new Date(String(converted[name]));
      // Better Auth's rate limiter expects epoch milliseconds as a number.
      if (typeof converted["lastRequest"] === "string") converted["lastRequest"] = Number(converted["lastRequest"]);
      return converted as R;
    });
    return result.command === "SELECT" ? { rows } : { rows, numAffectedRows: BigInt(result.rowCount ?? 0) };
  }
  async *streamQuery<R>(query: CompiledQuery): AsyncIterableIterator<QueryResult<R>> { yield await this.executeQuery<R>(query); }
}

export function createAccountDatabase() {
  const unsupported = async () => { throw new Error("Interactive transactions are unsupported by the account HTTP driver."); };
  return new Kysely<Record<string, Record<string, unknown>>>({ dialect: {
    createAdapter: () => new PostgresAdapter(),
    createQueryCompiler: () => new PostgresQueryCompiler(),
    createIntrospector: (db) => new PostgresIntrospector(db),
    createDriver: () => ({ init: async () => {}, acquireConnection: async () => new Connection(), releaseConnection: async () => {}, destroy: async () => {}, beginTransaction: unsupported, commitTransaction: unsupported, rollbackTransaction: unsupported }),
  } });
}