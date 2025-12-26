import { createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

import { IpAddress } from "@/modules/auth/core/helpers/validators";
import { activeTable as activities } from "@/modules/auth/core/models/activities/schemas";

import { banScopes } from "./schemas";
import { FailedCredential } from "./validators";

export const BanScope = createSelectSchema(banScopes);

export type BanScope = v.InferOutput<typeof BanScope>;

const selectPrimitive = createSelectSchema(activities).entries;

/**
 * @todo test to ensure at least one field is truthy: "someValue" validator
 */
export const ByTargets = v.object({
  failedCredential: FailedCredential,
  guestId: v.nullish(selectPrimitive.guestId, null),
  guestsArchiveId: v.nullish(selectPrimitive.guestsArchiveId, null),
  ipAddress: v.nullish(IpAddress, null),
  userId: v.nullish(selectPrimitive.userId, null),
  usersArchiveId: v.nullish(selectPrimitive.usersArchiveId, null),
});
