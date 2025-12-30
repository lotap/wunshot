import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

import { FailedCredential } from "@/modules/auth/core/models/activities---bans/validators";

import { activeTable } from "./schemas";

//// PRIMITIVES ////

const insertPrimitive = createInsertSchema(activeTable).entries;

const selectPrimitive = createSelectSchema(activeTable).entries;

//// INSERT ////

const insertBaseVariant = {
  userId: v.nullish(v.unwrap(insertPrimitive.userId), null),
  label: insertPrimitive.label,
  meta: v.nullish(v.unwrap(insertPrimitive.meta), null),
  guestId: v.nullish(v.unwrap(insertPrimitive.guestId), null),
  guestsArchiveId: v.nullish(v.unwrap(insertPrimitive.guestsArchiveId), null),
  ipAddress: insertPrimitive.ipAddress,
  weight: v.optional(v.unwrap(insertPrimitive.weight), 1),
};

export const Insert = v.variant("success", [
  v.object({
    ...insertBaseVariant,
    success: v.literal(true),
    failureCause: v.nullish(v.null(), null),
    failedCredential: v.nullish(v.null(), null),
  }),
  /**
   * You could use another tier of variant schemas keying on the failureCause here.
   * That's how it was originally written, but it became complicated to update/maintain
   **/
  v.object({
    ...insertBaseVariant,
    success: v.literal(false),
    failureCause: v.nonNullish(insertPrimitive.failureCause),
    failedCredential: FailedCredential,
  }),
]);

//// SELECT ////

export const Select = v.object({ id: selectPrimitive.id });
