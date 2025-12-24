import { pgTable } from "drizzle-orm/pg-core";

// import {
//   archivedAt,
//   archiveId,
//   createdAt,
//   id,
//   updatedAt,
// } from "@/modules/core/helpers/cols";
import { activeTable, archiveTable } from "@/modules/core/helpers/tables";

/** Columns with identical definitions in the active and archive tables */
// const usersBaseCols = {
//   updatedAt,
// };

/** The active users table */
// export const users = pgTable("users", {
//   ...usersBaseCols,
//   // cols with defaults
//   id: id.primaryKey().defaultRandom(),
//   createdAt: createdAt.defaultNow(),
// });
export const users = activeTable("users");

/** The users archive table. Preserves relations while keeping the users table small and efficient */
// export const usersArchive = pgTable("users_archive", {
//   ...usersBaseCols,
//   id,
//   createdAt,
//   // archive cols
//   archiveId,
//   archivedAt,
// });
export const usersArchive = archiveTable("users_archive");
