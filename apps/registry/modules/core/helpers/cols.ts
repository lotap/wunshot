import { bigint, timestamp as pgTimestamp, uuid } from "drizzle-orm/pg-core";

import { TIMESTAMPTZ_CONFIG } from "./consts";

//// Ids ////

export const id = bigint("id", { mode: "bigint" });

export const randomId = uuid("id");

export const archiveId = bigint("archive_id", { mode: "bigint" })
  .primaryKey()
  .generatedByDefaultAsIdentity();

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
