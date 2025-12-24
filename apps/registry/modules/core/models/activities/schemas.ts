import {
  bigint,
  boolean,
  index,
  jsonb,
  // pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

// import {
//   archivedAt,
//   archiveId,
//   id,
//   timestamp,
// } from "@/modules/core/helpers/cols";
import { users, usersArchive } from "@/modules/core/models/users/schemas";
import { activeLogTable, archiveLogTable } from "../../helpers/tables";

/** Columns with identical definitions in the active and archive tables */
const activitiesBaseCols = {
  userId: uuid("user_id").references(() => users.id),
  usersArchiveId: bigint("users_archive_id", { mode: "bigint" }).references(
    () => usersArchive.archiveId
  ),
  label: text("label").notNull(), // Could be an enum, but it gets difficult to manage as ops are added
  success: boolean("success").notNull(),
  failureCause: text("failure_cause"), // Could be an enum, but it gets difficult to manage as ops are added
  meta: jsonb("meta"),
};

/** The active activities table */
// export const activities = pgTable(
//   "activities",
//   {
//     ...activitiesBaseCols,
//     // cols with defaults
//     id: id.primaryKey().defaultRandom(),
//     timestamp: timestamp.defaultNow(),
//   },
//   (table) => [index().on(table.timestamp)]
// );
export const activities = activeLogTable(
  "activities",
  activitiesBaseCols,
  (table) => [index().on(table.timestamp)]
);

/**
 * The activities archive table. Preserves relations while keeping the activites table small and efficient
 * @todo set up a cron job to move old activites to the archive automatically
 */
// export const activitiesArchive = pgTable("activities_archive", {
//   ...activitiesBaseCols,
//   id,
//   timestamp,
//   // archive cols
//   archiveId,
//   archivedAt,
// });
export const activitiesArchive = archiveLogTable(
  "activities_archive",
  activitiesBaseCols
);
