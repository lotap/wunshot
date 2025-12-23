import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

import { activities } from "./schemas";

//// PRIMITIVES ////

const { id } = createSelectSchema(activities).entries;

const { label, failureCause, meta, userId } =
  createInsertSchema(activities).entries;

//// INSERT ////

const insertBaseVariant = {
  label,
  userId: v.nullish(v.unwrap(userId), null),
  meta: v.nullish(v.unwrap(meta), null),
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
    failureCause: v.nonNullish(failureCause),
  }),
]);

//// SELECT ////

export const Select = v.object({ id });
