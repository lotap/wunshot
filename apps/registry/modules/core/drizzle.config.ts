import { defineConfig } from "drizzle-kit";

const { DB_URL } = process.env;
if (!DB_URL) throw new Error("Missing db url");

export default defineConfig({
  dialect: "postgresql",
  out: "./db/migrations",
  schema: "./db/models/**/*(schema|view)s.ts",
  dbCredentials: { url: DB_URL },
  casing: "snake_case",
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
});
