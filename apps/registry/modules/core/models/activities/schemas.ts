import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { id, timestamp, archivedAt } from "@/modules/core/helpers/cols";
import { users, usersArchive } from "@/modules/core/models/users/schemas";

const activitiesBaseCols = {
  userId: uuid("user_id").references(() => users.id),
  usersArchiveId: uuid("users_archive_id").references(() => usersArchive.id),
  label: text("label").notNull(), // Could be an enum, but it gets difficult to manage as ops are added
  success: boolean("success").notNull(),
  failureCause: text("failure_cause"), // Could be an enum, but it gets difficult to manage as ops are added
  meta: jsonb("meta"),
};

export const activities = pgTable(
  "activities",
  {
    ...activitiesBaseCols,
    id: id.generatedAlwaysAsIdentity(),
    timestamp: timestamp.defaultNow(),
  },
  (table) => [index().on(table.timestamp)]
);

/**
 * Used to preserve relations while keep the activites table small and efficient
 * @todo set up a cron job to move old activites to the archive automatically
 */
export const activitiesArchive = pgTable("activities_archive", {
  ...activitiesBaseCols,
  id,
  timestamp,
  archivedAt,
});
