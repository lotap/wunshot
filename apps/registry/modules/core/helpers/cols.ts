import { bigint, timestamp as pgTimestamp, uuid } from "drizzle-orm/pg-core";

import { TIMESTAMPTZ_CONFIG } from "./consts";

//// Ids ////

export const id = bigint("id", { mode: "bigint" }).primaryKey();

export const randomId = uuid("id").primaryKey();

//// Timestamps ////

export const timestamp = pgTimestamp("timestamp", TIMESTAMPTZ_CONFIG).notNull();

export const createdAt = pgTimestamp(
  "created_at",
  TIMESTAMPTZ_CONFIG
).notNull();

export const updatedAt = pgTimestamp("updated_at", TIMESTAMPTZ_CONFIG);

export const archivedAt = pgTimestamp("archived_at", TIMESTAMPTZ_CONFIG)
  .notNull()
  .defaultNow();
