import {
  bigint,
  cidr,
  timestamp as pgTimestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { TIMESTAMPTZ_CONFIG } from "@/modules/core/helpers/consts";

//// Ids ////

export const id = uuid("id");

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

export const expiresAt = pgTimestamp(
  "expires_at",
  TIMESTAMPTZ_CONFIG
).notNull();

//// Misc ////

export const ipAddresses = cidr("ip_addresses").notNull().array().notNull();

export const failedCredential = varchar("failed_credential", { length: 255 });
