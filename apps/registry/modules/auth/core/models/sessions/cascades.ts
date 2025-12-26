import { createArchiveFn } from "@/modules/core/helpers/funcs";

import * as queries from "./queries";
import { activeTable, archiveTable } from "./schemas";

/** Adds given id to the sessionsArchive, handles related cascades, and removes it from sessions */
export const archive = createArchiveFn({
  selectFn: queries.select,
  activeTable,
  archiveTable,
});

export const archiveManyByUserId = createArchiveFn({
  selectFn: queries.selectManyByUser,
  selectBy: "userId",
  activeTable,
  archiveTable,
});
