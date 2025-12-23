import { createArchiveFn } from "@/modules/core/helpers/funcs";

import * as queries from "@/modules/core/models/activities/queries";
import {
  activities,
  activitiesArchive,
} from "@/modules/core/models/activities/schemas";

/** Adds given id to the activitiesArchive, handles related cascades, and removes it from activities */
export const archive = createArchiveFn({
  selectFn: queries.select,
  activeTable: activities,
  archiveTable: activitiesArchive,
});
