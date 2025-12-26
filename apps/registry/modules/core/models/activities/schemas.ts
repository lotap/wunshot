import { bigint, boolean, index, jsonb, text, uuid } from "drizzle-orm/pg-core";

import { ARCHIVE_ID_CONFIG } from "@/modules/core/helpers/consts";
import {
  createActiveLogTable,
  createArchiveLogTable,
} from "@/modules/core/helpers/tables";
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
};

/** The active activities table */
export const activeTable = createActiveLogTable(
  "activities",
  baseCols,
  (table) => [index().on(table.timestamp)]
);

/**
 * The activities archive table. Preserves relations while keeping the activites table small and efficient
 * @todo set up a cron job to move old activites to the archive automatically
 */
export const archiveTable = createArchiveLogTable(
  "activities_archive",
  baseCols
);
