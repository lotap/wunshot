import { createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

import { activeTable } from "./schemas";

//// PRIMITIVES ////

const selectPrimitive = createSelectSchema(activeTable).entries;

//// INSERT ////

export const Insert = v.object({});

//// SELECT ////

export const Select = v.object({ id: selectPrimitive.id });
