import { serializeError } from "serialize-error";
import type { InferInput } from "valibot";

import * as activitiesQueries from "@/modules/auth/core/models/activities/queries";
import type { Insert as ActivitiesInsert } from "@/modules/auth/core/models/activities/validations";
import * as activitiesBansQueries from "@/modules/auth/core/models/activities---bans/queries";
import * as bansQueries from "@/modules/auth/core/models/bans/queries";
import type { Insert as BansInsert } from "@/modules/auth/core/models/bans/validations";

import { calculatePenaltyTime } from "./_calc-penalty-time";

/** Prints an error to the console with some basic style formatting */
function printError({ error, label = "" }: { error: unknown; label?: string }) {
  console.group(`\x1b[31m//// ${label ? `${label} ` : ""}ERROR ////\x1b[0m`);
  console.error(error);
  console.groupEnd();
}

/**
 * Add specified activity to the activities_log table.
 * Update bans that are associated with the new activity entry.
 * If adding the new activity crosses the threshold for "excessive", add a new ban.
 *
 * WARNING: There are race-conditions for updating and adding bans.
 * If a bad actor is able to make a burst of requests, then it could result in missing or duplicate bans added.
 *
 * @todo postgres triggers are a better solution for creating/updating bans from an activity entry,
 * but they are not directly supported by drizzle and would require manually modifying the migration files.
 * This will be considered in a future version.
 */
async function logActivityAndHandleBans(
  input: Parameters<typeof activitiesQueries.insert>[0]
) {
  const [rowData] = await activitiesQueries.insert(input);

  const { id: activityId } = rowData!; // drizzle will fire an error if there is an issue inserting the row

  const { ipAddress, failedCredential, userId, guestId } = input;

  const currentBansAndExcessiveActivities =
    await activitiesBansQueries.selectCurrentAndExcessiveByTargets({
      ipAddress,
      failedCredential,
      userId,
      guestId,
    });

  const updateBansPromises: ReturnType<typeof bansQueries.appendActivities>[] =
    [];
  const existingBansScopes: (typeof currentBansAndExcessiveActivities)[number]["scope"][] =
    [];

  for (const currentBanOrExcessiveActivities of currentBansAndExcessiveActivities) {
    const { id, scope, source, totalWeight } = currentBanOrExcessiveActivities;
    if (source === "active_bans") {
      updateBansPromises.push(
        bansQueries.appendActivities({
          id: id as string,
          activityIds: [activityId],
          penaltyInterval: calculatePenaltyTime(totalWeight),
        })
      );

      existingBansScopes.push(scope);
    }
  }

  const newBans = currentBansAndExcessiveActivities.filter(
    ({ source, scope }) =>
      source === "excessive_activities" && !existingBansScopes.includes(scope)
  );

  const bansInsertPromise = newBans.length
    ? bansQueries.insertMany(
        newBans.map((ban) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, source, totalWeight, ...rest } = ban;
          return {
            ...rest,
            penaltyInterval: calculatePenaltyTime(totalWeight),
          };
        }) as InferInput<typeof BansInsert>[]
      )
    : undefined;

  const results = await Promise.allSettled([
    ...updateBansPromises,
    bansInsertPromise,
  ]);

  for (const result of results) {
    if (result.status === "rejected") printError(result.reason);
  }
}

type ActivityInsertInput = InferInput<typeof ActivitiesInsert>;

/**
 * Extends error to include an activity property.
 * The activity property includes data used to insert a row into the activities table
 * It is intended to be processed by {@link logFailedActivity} after being caught
 */
export class ActivityError<M extends string> extends Error {
  readonly activity;
  declare readonly message: M;
  constructor({
    activity,
    message = "Something went wrong" as M,
  }: {
    activity: Omit<
      Exclude<ActivityInsertInput, { success: true }>,
      "label" | "success" | "ipAddress"
    > & { weight: number };
    message?: M;
  }) {
    super(message, { cause: activity.failureCause });
    this.name = "ActivityError";
    this.activity = activity;
  }
}

/**
 * Logs a given error as a failed activity.
 * Automatically formats unknown errors for database entry.
 */
async function logFailedActivity({
  error,
  ...passThrough
}: {
  error: unknown;
  label: ActivityInsertInput["label"];
  ipAddress: ActivityInsertInput["ipAddress"];
}) {
  try {
    if (error instanceof ActivityError) {
      if (process.env.NODE_ENV === "development")
        printError({ error, label: "ACTIVITY" });

      return await logActivityAndHandleBans({
        ...error.activity,
        ...passThrough,
        success: false,
      } as ActivityInsertInput);
    } else {
      if (process.env.NODE_ENV === "development")
        printError({ error, label: "UNKNOWN" });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { stack, ...errorProps } = serializeError(error) as Record<
        string,
        unknown
      >;

      return await logActivityAndHandleBans({
        ...passThrough,
        success: false,
        failureCause: "UNKNOWN",
        meta: errorProps,
        weight: 1,
      });
    }
  } catch (error) {
    /**
     * DANGER: NOT SUITED FOR PRODUCTION. UNHANDLED ERRORS SHOULD BE REPORTED/STORED SOMEWHERE
     * @todo add production logging service
     * If adding to activities_log fails, print the error to the console
     * this is a last-ditch attempt to capture an error
     */
    printError({ error, label: "UNHANDLED" });
  }
}

/** Logs given activity as a success */
async function logSuccessfulActivity(
  input: Omit<Extract<ActivityInsertInput, { success: true }>, "success">
) {
  try {
    logActivityAndHandleBans({
      ...input,
      success: true,
    });
  } catch (error) {
    /**
     * DANGER: NOT SUITED FOR PRODUCTION. UNHANDLED ERRORS SHOULD BE REPORTED/STORED SOMEWHERE
     * @todo add production logging service
     * If adding to activities_log fails, print the error to the console
     * this is a last-ditch attempt to capture an error
     */
    printError({ error, label: "UNHANDLED" });
  }
}

/** Apply a given label and ipAddress to {@link logSuccessfulActivity} and {@link logFailedActivity} */
export function createLogFns({
  label,
  ipAddress,
}: {
  label: ActivityInsertInput["label"];
  ipAddress: ActivityInsertInput["ipAddress"];
}) {
  return {
    logSuccess: (
      input: Omit<
        Parameters<typeof logSuccessfulActivity>[0],
        "label" | "ipAddress"
      >
    ) => logSuccessfulActivity({ ...input, label, ipAddress }),
    logFailure: (
      input: Omit<
        Parameters<typeof logFailedActivity>[0],
        "label" | "ipAddress"
      >
    ) => logFailedActivity({ ...input, label, ipAddress }),
  };
}
