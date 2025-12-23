import { createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

import { users } from "@/modules/core/models/users/schemas";

//// PRIMITIVES ////

const { id } = createSelectSchema(users).entries;

//// INSERT ////

export const Insert = v.object({});

//// SELECT ////

export const Select = v.object({ id });
