import { bigint, boolean, index, jsonb, text, uuid } from "drizzle-orm/pg-core";

import { activeLogTable, archiveLogTable } from "@/modules/core/helpers/tables";
import { users, usersArchive } from "@/modules/core/models/users/schemas";

/** Columns with identical definitions in the active and archive tables */
const baseCols = {
  userId: uuid().references(() => users.id),
  usersArchiveId: bigint({ mode: "bigint" }).references(
    () => usersArchive.archiveId
  ),
  label: text().notNull(), // Could be an enum, but it gets difficult to manage as ops are added
  success: boolean().notNull(),
  failureCause: text(), // Could be an enum, but it gets difficult to manage as ops are added
  meta: jsonb(),
};

/** The active activities table */
export const activities = activeLogTable("activities", baseCols, (table) => [
  index().on(table.timestamp),
]);

/**
 * The activities archive table. Preserves relations while keeping the activites table small and efficient
 * @todo set up a cron job to move old activites to the archive automatically
 */
export const activitiesArchive = archiveLogTable(
  "activities_archive",
  baseCols
);
