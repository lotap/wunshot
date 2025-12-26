import { eq } from "drizzle-orm";
import { parse, type InferInput } from "valibot";

import { db } from "@/modules/core/index";
import { type Tx } from "@/modules/core/helpers/types";
import { activeTable as activities } from "@/modules/auth/core/models/activities/schemas";
import { activeTable as bans } from "@/modules/auth/core/models/bans/schemas";

import { activeTable, archiveTable } from "./schemas";
import { ArchiveInsert } from "./validations";
import * as queries from "./queries";

/**
 * Adds given id to the guestsArchive, handles related cascades, and removes it from guests if it exists
 *
 * Cannot use createArchiveFn, because the row may not exist in the activeTable before it's archived
 */
export function archive(
  input: InferInput<typeof ArchiveInsert>,
  externalTx?: Tx
) {
  /** Validate input parameters */
  const { id, userId, ipAddresses, createdAt, updatedAt } = parse(
    ArchiveInsert,
    input
  );

  /** Define internal function to be wrapped in a transaction  */
  const _archive = async (tx: Tx) => {
    /** Find existing guest data */
    const [guest] = await queries.select(
      { id },
      { tx, label: "archive_guest" }
    );

    /**
     * A unique property of guests is that they may not exist in the database before archiving
     * So there is no error if no rows match the id
     */

    /** Insert the guest data into the archive table */
    const [{ archiveId }] = await tx
      .insert(archiveTable)
      .values({
        id,
        userId,
        ipAddresses: guest
          ? [...new Set([...guest.ipAddresses, ...ipAddresses])]
          : ipAddresses,
        createdAt,
        updatedAt,
      })
      .returning({ archiveId: archiveTable.archiveId });

    /** Process all cascades concurrently */
    await Promise.all([
      /** Update activities to reference the archived guest */
      guest &&
        tx
          .update(activities)
          .set({ guestsArchiveId: archiveId, guestId: null })
          .where(eq(activities.guestId, id)),

      /** Update bans to reference the archived guest */
      guest &&
        tx
          .update(bans)
          .set({ guestsArchiveId: archiveId, guestId: null })
          .where(eq(bans.guestId, id)),
    ]);

    /** Delete the guest from the guests table */
    await tx.delete(activeTable).where(eq(activeTable.id, id));

    return { id };
  };

  /** Process with an external transaction if it exists */
  if (externalTx) return _archive(externalTx);

  /** Process with a newly generated transaction */
  return db.transaction((tx) => _archive(tx));
}
