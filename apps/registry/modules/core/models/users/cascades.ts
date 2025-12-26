import { eq } from "drizzle-orm";

import { createArchiveFn } from "@/modules/core/helpers/funcs";
import { activeTable as activities } from "@/modules/core/models/activities/schemas";

import * as queries from "./queries";
import { activeTable, archiveTable } from "./schemas";

/** Adds given id to the usersArchive, handles related cascades, and removes it from users */
export const archive = createArchiveFn({
  selectFn: queries.select,
  activeTable,
  archiveTable,
  cascades: (tx, id, [archiveId]) => [
    tx
      .update(activities)
      .set({ usersArchiveId: archiveId, userId: null })
      .where(eq(activities.userId, id)),
  ],
});
