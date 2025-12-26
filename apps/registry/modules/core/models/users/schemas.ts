import {
  createActiveTable,
  createArchiveTable,
} from "@/modules/core/helpers/tables";

/** The active users table */
export const activeTable = createActiveTable("users");

/** The users archive table. Preserves relations while keeping the users table small and efficient */
export const archiveTable = createArchiveTable("users_archive");
