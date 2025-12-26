import {
  bigint,
  boolean,
  cidr,
  index,
  jsonb,
  smallint,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { ARCHIVE_ID_CONFIG } from "@/modules/core/helpers/consts";
import {
  createActiveLogTable,
  createArchiveLogTable,
} from "@/modules/core/helpers/tables";
import {
  activeTable as guests,
  archiveTable as guestsArchive,
} from "@/modules/auth/core/models/guests/schemas";
import {
  activeTable as users,
  archiveTable as usersArchive,
} from "@/modules/core/models/users/schemas";

/** Columns with identical definitions in the active and archive tables */
const baseCols = {
  userId: uuid().references(() => users.id),
  usersArchiveId: bigint(ARCHIVE_ID_CONFIG).references(
    () => usersArchive.archiveId
  ),
  label: text().notNull(), // Could be an enum, but it gets difficult to manage as ops are added
  success: boolean().notNull(),
  failureCause: text(), // Could be an enum, but it gets difficult to manage as ops are added
  meta: jsonb(),
  failedCredential: text(),
  guestId: uuid().references(() => guests.id),
  guestsArchiveId: bigint(ARCHIVE_ID_CONFIG).references(
    () => guestsArchive.archiveId
  ),
  ipAddress: cidr().notNull(),
};

/** The active activities table */
export const activeTable = createActiveLogTable(
  "activities",
  {
    ...baseCols,
    weight: smallint().notNull().default(1),
  },
  (table) => [
    index().on(table.timestamp),
    index().using("hash", table.ipAddress),
    /**
     * @todo benchmark the existing indexes with common queries. They are based on my best guesses about how the data will be used, but using real performance metrics would be better.
     * @todo add indexes for failedCredential/userId/archivedUserId if the table gets large and query performance of the excessiveActivities needs improvement
     * @todo consider a combined index for id/weight to potentially speed up the calculation of total_weight in excessiveActivities
     */
  ]
);

/**
 * The activities archive table. Preserves relations while keeping the activites table small and efficient
 * @todo set up a cron job to move old activites to the archive automatically
 */
export const archiveTable = createArchiveLogTable("activities_archive", {
  ...baseCols,
  weight: smallint().notNull(),
});
