import { sql } from "drizzle-orm";
import { bigint, cidr, text, timestamp, uuid } from "drizzle-orm/pg-core";

import {
  ARCHIVE_ID_CONFIG,
  TIMESTAMPTZ_CONFIG,
} from "@/modules/core/helpers/consts";
import {
  createActiveTable,
  createArchiveTable,
} from "@/modules/core/helpers/tables";
import {
  activeTable as users,
  archiveTable as usersArchive,
} from "@/modules/core/models/users/schemas";

/** Columns with identical definitions in the active and archive tables */
const baseCols = {
  userId: uuid()
    .notNull()
    .references(() => users.id),
  ipAddresses: cidr().notNull().array().notNull(),
  nonceHash: text().notNull(),
};

/** The active sessions table */
export const activeTable = createActiveTable("sessions", {
  ...baseCols,
  expiresAt: timestamp(TIMESTAMPTZ_CONFIG)
    .notNull()
    .default(sql`now() + interval '14 days'`), // drizzle doesn't allow params in default values
});

/** The sessions archive table. Preserves relations while keeping the users table small and efficient */
export const archiveTable = createArchiveTable("sessions_archive", {
  ...baseCols,
  usersArchiveId: bigint(ARCHIVE_ID_CONFIG).references(
    () => usersArchive.archiveId
  ),
  expiresAt: timestamp(TIMESTAMPTZ_CONFIG).notNull(),
});
