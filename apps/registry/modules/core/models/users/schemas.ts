import { activeTable, archiveTable } from "@/modules/core/helpers/tables";

/** The active users table */
export const users = activeTable("users");

/** The users archive table. Preserves relations while keeping the users table small and efficient */
export const usersArchive = archiveTable("users_archive");
