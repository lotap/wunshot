import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

import { Argon2Hash, IpAddress } from "@/modules/auth/core/helpers/validators";

import { activeTable } from "./schemas";

//// PRIMITIVES ////

const insertPrimitive = createInsertSchema(activeTable).entries;

const selectPrimitive = createSelectSchema(activeTable).entries;

//// INSERT ////

export const Insert = v.object({
  userId: insertPrimitive.userId,
  ipAddress: IpAddress,
  nonceHash: Argon2Hash,
});

//// SELECT ////

export const Select = v.object({ id: selectPrimitive.id });

export const ByUser = v.object({ userId: selectPrimitive.userId });

//// UPDATE ////

export const UpdateNonceHash = v.object({
  id: selectPrimitive.id,
  ipAddress: IpAddress,
  nonceHash: Argon2Hash,
});
