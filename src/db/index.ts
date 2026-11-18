import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it in Vercel or .env.local.");
  }
  return drizzle(neon(url), { schema });
}

let instance: ReturnType<typeof createDb> | undefined;

// Connect on first use, so the build doesn't need the database.
export function db() {
  if (!instance) instance = createDb();
  return instance;
}

export * from "./schema";
