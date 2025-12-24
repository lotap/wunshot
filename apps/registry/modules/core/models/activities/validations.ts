import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

import { activities } from "./schemas";

//// PRIMITIVES ////

const insertPrimitive = createInsertSchema(activities).entries;

const selectPrimitive = createSelectSchema(activities).entries;

//// INSERT ////

const insertBaseVariant = {
  label: insertPrimitive.label,
  userId: v.nullish(v.unwrap(insertPrimitive.userId), null),
  meta: v.nullish(v.unwrap(insertPrimitive.meta), null),
};

export const Insert = v.variant("success", [
  v.object({
    ...insertBaseVariant,
    success: v.literal(true),
    failureCause: v.nullish(v.null(), null),
  }),
  /**
   * You could use another tier of variant schemas keying on the failureCause here.
   * That's how it was originally written, but it became complicated to update/maintain
   **/
  v.object({
    ...insertBaseVariant,
    success: v.literal(false),
    failureCause: v.nonNullish(insertPrimitive.failureCause),
  }),
]);

//// SELECT ////

export const Select = v.object({ id: selectPrimitive.id });
