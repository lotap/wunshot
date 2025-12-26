import { sql } from "drizzle-orm";
import {
  bigint,
  cidr,
  index,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import {
  ARCHIVE_ID_CONFIG,
  TIMESTAMPTZ_CONFIG,
} from "@/modules/core/helpers/consts";
import {
  createActiveTable,
  createArchiveTable,
} from "@/modules/core/helpers/tables";
import {
  activeTable as activities,
  archiveTable as activitiesArchive,
} from "@/modules/core/models/activities/schemas";
import { banScopes } from "@/modules/auth/core/models/activities---bans/schemas";
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
  scope: banScopes().notNull(),
  ipAddress: cidr(),
  failedCredential: varchar({ length: 255 }),
  activityIds: uuid()
    .references(() => activities.id)
    .notNull()
    .array(),
  activitiesArchiveIds: bigint(ARCHIVE_ID_CONFIG)
    .references(() => activitiesArchive.archiveId)
    .notNull()
    .array(),
  guestId: uuid().references(() => guests.id),
  guestsArchiveId: bigint(ARCHIVE_ID_CONFIG).references(
    () => guestsArchive.archiveId
  ),
  userId: uuid().references(() => users.id),
  usersArchiveId: bigint(ARCHIVE_ID_CONFIG).references(
    () => usersArchive.archiveId
  ),
};

export const activeTable = createActiveTable(
  "bans",
  {
    ...baseCols,
    expiresAt: timestamp(TIMESTAMPTZ_CONFIG).default(
      sql`now() + interval '10 minutes'`
    ), // Cannot use INITIAL_PENALTY_INTERVAL directly - drizzle doesn't allow params in default values
  },
  (table) => [
    index().on(table.expiresAt),
    index().using("hash", table.ipAddress),
    /**
     * @todo benchmark the existing indexes with common queries. They are based on my best guesses about how the data will be used, but using real performance metrics would be better.
     * @todo consider adding a GiST/GIN index on activityIds to speed up the join aggregation on selectActiveBansAndExcessiveActivitiesByTargetsStmt
     */
  ]
);

export const archiveTable = createArchiveTable("bans_archive", {
  ...baseCols,
  expiresAt: timestamp(TIMESTAMPTZ_CONFIG),
});
