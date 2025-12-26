import { gte, sql } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";

import { activeTable } from "./schemas";

export const currentBans = pgView("current_bans").as((qb) =>
  qb
    .select()
    .from(activeTable)
    .where(gte(activeTable.expiresAt, sql`now()`))
);
