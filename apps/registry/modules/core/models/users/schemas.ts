import { pgTable } from "drizzle-orm/pg-core";

import {
  archivedAt,
  createdAt,
  randomId,
  updatedAt,
} from "@/modules/core/helpers/cols";

export const users = pgTable("users", {
  id: randomId.defaultRandom(),
  createdAt: createdAt.defaultNow(),
  updatedAt,
});

export const usersArchive = pgTable("users_archive", {
  id: randomId,
  createdAt,
  updatedAt,
  archivedAt,
});
