import { drizzle } from "drizzle-orm/node-postgres";

const { DB_URL } = process.env;
if (!DB_URL) throw new Error("Missing db url");

export const db = drizzle({
  connection: { connectionString: DB_URL },
  casing: "snake_case",
  // logger: true,
});
