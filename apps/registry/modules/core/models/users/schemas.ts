import { pgTable } from "drizzle-orm/pg-core";

import {
  archivedAt,
  archiveId,
  createdAt,
  randomId,
  updatedAt,
} from "@/modules/core/helpers/cols";

export const users = pgTable("users", {
  id: randomId.primaryKey().defaultRandom(),
  createdAt: createdAt.defaultNow(),
  updatedAt,
});

export const usersArchive = pgTable("users_archive", {
  id: randomId,
  createdAt,
  updatedAt,
  // archive cols
  archiveId,
  archivedAt,
});
