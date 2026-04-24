import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let _pool: pg.Pool | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getConnection() {
  if (!process.env["DATABASE_URL"]) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  if (!_pool) {
    _pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
    _db = drizzle(_pool, { schema });
  }
  return { pool: _pool, db: _db! };
}

export const pool = new Proxy({} as pg.Pool, {
  get(_target, prop) {
    return getConnection().pool[prop as keyof pg.Pool];
  },
});

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return getConnection().db[prop as keyof ReturnType<typeof drizzle<typeof schema>>];
  },
});

export * from "./schema";
