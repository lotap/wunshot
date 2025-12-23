import { eq } from "drizzle-orm";

import { createArchiveFn } from "@/modules/core/helpers/funcs";
import { activities } from "@/modules/core/models/activities/schemas";

import * as queries from "@/modules/core/models/users/queries";
import { users, usersArchive } from "@/modules/core/models/users/schemas";

/** Adds given id to the usersArchive, handles related cascades, and removes it from users */
export const archive = createArchiveFn({
  selectFn: queries.select,
  activeTable: users,
  archiveTable: usersArchive,
  cascades: (tx, id) => [
    tx
      .update(activities)
      .set({ usersArchiveId: id, userId: null })
      .where(eq(activities.userId, id)),
  ],
});
