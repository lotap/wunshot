import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

import { IpAddress } from "@/modules/auth/core/helpers/validators";

import { activeTable, archiveTable } from "./schemas";

//// PRIMITIVES ////

const selectPrimitive = createSelectSchema(activeTable).entries;

const archiveInsertPrimitive = createInsertSchema(archiveTable).entries;

//// INSERT ////

export const ArchiveInsert = v.object({
  id: archiveInsertPrimitive.id,
  userId: v.nonNullish(archiveInsertPrimitive.userId),
  ipAddresses: v.array(IpAddress),
  createdAt: archiveInsertPrimitive.createdAt,
  updatedAt: archiveInsertPrimitive.updatedAt,
});

//// SELECT ////

export const Select = v.object({ id: selectPrimitive.id });
