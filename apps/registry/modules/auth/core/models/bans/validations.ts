import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import * as v from "valibot";

import {
  IpAddress,
  PGVerboseInterval,
} from "@/modules/auth/core/helpers/validators";
import { FailedCredential } from "@/modules/auth/core/models/activities---bans/validators";

import { INITIAL_PENALTY_INTERVAL } from "./consts";
import { activeTable } from "./schemas";

//// PRIMITIVES ////

const insertPrimitive = createInsertSchema(activeTable).entries;

const selectPrimitive = createSelectSchema(activeTable).entries;

const {
  IP_ADDRESS,
  USER,
  ARCHIVED_USER,
  FAILED_CREDENTIAL,
  GUEST,
  ARCHIVED_GUEST,
} = insertPrimitive.scope.enum;

const failedCredential = FailedCredential;
const penaltyInterval = v.optional(PGVerboseInterval, INITIAL_PENALTY_INTERVAL);

//// INSERT ////

const insertBaseVariant = {
  ipAddress: v.nullish(IpAddress, null),
  failedCredential,
  userId: v.nullish(v.unwrap(insertPrimitive.userId), null),
  usersArchiveId: v.nullish(v.unwrap(insertPrimitive.usersArchiveId), null),
  activityIds: v.nullish(v.unwrap(insertPrimitive.activityIds), null),
  activitiesArchiveIds: v.nullish(
    v.unwrap(insertPrimitive.activitiesArchiveIds),
    null
  ),
  penaltyInterval,
};

const insertVariants = [
  v.object({
    ...insertBaseVariant,
    scope: v.literal(IP_ADDRESS),
    ipAddress: IpAddress,
  }),
  v.object({
    ...insertBaseVariant,
    scope: v.literal(USER),
    userId: v.nonNullish(insertPrimitive.userId),
  }),
  v.object({
    ...insertBaseVariant,
    scope: v.literal(ARCHIVED_USER),
    usersArchiveId: v.nonNullish(insertPrimitive.usersArchiveId),
  }),
  v.object({
    ...insertBaseVariant,
    scope: v.literal(FAILED_CREDENTIAL),
    failedCredential: v.nonNullish(failedCredential),
  }),
  v.object({
    ...insertBaseVariant,
    scope: v.literal(GUEST),
    guestId: v.nonNullish(insertPrimitive.guestId),
  }),
  v.object({
    ...insertBaseVariant,
    scope: v.literal(ARCHIVED_GUEST),
    guestsArchiveId: v.nonNullish(insertPrimitive.guestsArchiveId),
  }),
];

export const Insert = v.variant("scope", insertVariants);

//// UPDATE ////

export const AppendActivities = v.object({
  id: selectPrimitive.id,
  activityIds: v.nonNullish(insertPrimitive.activityIds),
  penaltyInterval,
});
