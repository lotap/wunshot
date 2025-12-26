import { bigint, cidr, uuid } from "drizzle-orm/pg-core";

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
  ipAddresses: cidr().notNull().array().notNull(),
};

/**
 * Guests is essentially shorthand for "unauthenticated sessions"
 * Splitting them into a separate table makes it easier to adapt to the unique needs of different applications
 */
export const activeTable = createActiveTable("guests", baseCols);

/**
 * Used to keep a record of unauthenticated sessions
 *
 * Uniquely, **entries do not have to come directly from the live table**
 * because guests are created on-the-fly on the server with just a token.
 *
 * If a guest creates an account or signs-in as a user, the relation can be saved to the archive table.
 * Useful for linking the user to the guest’s actions in logging, analytics, application monitoring, telemetry, etc.
 */
export const archiveTable = createArchiveTable("guests_archive", {
  ...baseCols,
  /** In {@link file://./../../ops/_associate-guest.ts}, if user was a guest then store the user id to serve as the relational lookup between them */
  userId: uuid().references(() => users.id),
  usersArchiveId: bigint({ mode: "bigint" }).references(
    () => usersArchive.archiveId
  ),
});
