import { createArchiveFn } from "@/modules/core/helpers/funcs";

import * as queries from "./queries";
import { activeTable, archiveTable } from "./schemas";

/** Adds given id to the activitiesArchive, handles related cascades, and removes it from activities */
export const archive = createArchiveFn({
  selectFn: queries.select,
  activeTable,
  archiveTable,
});
