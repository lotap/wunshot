import { and, eq, isNotNull, or, sql, type SQL } from "drizzle-orm";
import { parse, type InferInput } from "valibot";

import { db } from "@/modules/core";
import { activeTable as activities } from "@/modules/auth/core/models/activities/schemas";

import { excessiveActivities } from "@/modules/auth/core/models/activities/views";
import { currentBans } from "@/modules/auth/core/models/bans/views";

import { ByTargets } from "./validations";

type Source = "active_bans" | "excessive_activities";

const selectExcessiveActivitiesByTargetsCTE = db
  .$with("excessive_activities_select_by_targets_cte")
  .as(
    db
      .select()
      .from(excessiveActivities)
      .where(
        or(
          and(
            isNotNull(excessiveActivities.ipAddress),
            eq(excessiveActivities.ipAddress, sql.placeholder("ipAddress"))
          ),
          and(
            isNotNull(excessiveActivities.failedCredential),
            eq(
              excessiveActivities.failedCredential,
              sql.placeholder("failedCredential")
            )
          ),
          and(
            isNotNull(excessiveActivities.userId),
            eq(excessiveActivities.userId, sql.placeholder("userId"))
          ),
          and(
            isNotNull(excessiveActivities.guestId),
            eq(excessiveActivities.userId, sql.placeholder("guestId"))
          ),
          and(
            isNotNull(excessiveActivities.usersArchiveId),
            eq(
              excessiveActivities.usersArchiveId,
              sql.placeholder("usersArchiveId")
            )
          ),
          and(
            isNotNull(excessiveActivities.guestsArchiveId),
            eq(
              excessiveActivities.guestsArchiveId,
              sql.placeholder("guestsArchiveId")
            )
          )
        )
      )
  );

const selectCurrentBansByTargetsCTE = db
  .$with("current_bans_select_by_targets_cte")
  .as(
    db
      .select()
      .from(currentBans)
      .where(
        or(
          and(
            isNotNull(currentBans.ipAddress),
            eq(currentBans.ipAddress, sql.placeholder("ipAddress"))
          ),
          and(
            isNotNull(currentBans.failedCredential),
            eq(
              currentBans.failedCredential,
              sql.placeholder("failedCredential")
            )
          ),
          and(
            isNotNull(currentBans.userId),
            eq(currentBans.userId, sql.placeholder("userId"))
          ),
          and(
            isNotNull(currentBans.guestId),
            eq(currentBans.guestId, sql.placeholder("guestId"))
          ),
          and(
            isNotNull(currentBans.usersArchiveId),
            eq(currentBans.usersArchiveId, sql.placeholder("usersArchiveId"))
          ),
          and(
            isNotNull(currentBans.guestsArchiveId),
            eq(currentBans.guestsArchiveId, sql.placeholder("guestsArchiveId"))
          )
        )
      )
  );

/**
 * @todo benchmark & look into optimizations
 */
const selectCurrentAndExcessiveByTargetsStmt = db
  .with(selectCurrentBansByTargetsCTE)
  .select({
    id: selectCurrentBansByTargetsCTE.id as
      | typeof selectCurrentBansByTargetsCTE.id
      | SQL<null>,
    ipAddress: sql<string>`host(${selectCurrentBansByTargetsCTE.ipAddress})`,
    failedCredential: selectCurrentBansByTargetsCTE.failedCredential,
    userId: selectCurrentBansByTargetsCTE.userId,
    guestId: selectCurrentBansByTargetsCTE.guestId,
    usersArchiveId: selectCurrentBansByTargetsCTE.usersArchiveId,
    guestsArchiveId: selectCurrentBansByTargetsCTE.guestsArchiveId,
    activityIds: selectCurrentBansByTargetsCTE.activityIds,
    scope: selectCurrentBansByTargetsCTE.scope,
    totalWeight: sql<bigint | null>`sum(${activities.weight})`.as(
      "total_weight"
    ),
    source: sql<Source>`'active_bans'`,
  })
  .from(selectCurrentBansByTargetsCTE)
  .leftJoin(
    activities,
    eq(activities.id, sql`ANY(${selectCurrentBansByTargetsCTE.activityIds})`)
  )
  .groupBy(
    selectCurrentBansByTargetsCTE.id,
    selectCurrentBansByTargetsCTE.ipAddress,
    selectCurrentBansByTargetsCTE.failedCredential,
    selectCurrentBansByTargetsCTE.userId,
    selectCurrentBansByTargetsCTE.guestId,
    selectCurrentBansByTargetsCTE.usersArchiveId,
    selectCurrentBansByTargetsCTE.guestsArchiveId,
    selectCurrentBansByTargetsCTE.activityIds,
    selectCurrentBansByTargetsCTE.scope
  )
  .unionAll(
    db
      .with(selectExcessiveActivitiesByTargetsCTE)
      .select({
        id: sql<null>`null`,
        ipAddress: sql<string>`host(${selectExcessiveActivitiesByTargetsCTE.ipAddress})`,
        failedCredential:
          selectExcessiveActivitiesByTargetsCTE.failedCredential,
        userId: selectExcessiveActivitiesByTargetsCTE.userId,
        guestId: selectExcessiveActivitiesByTargetsCTE.guestId,
        usersArchiveId: selectExcessiveActivitiesByTargetsCTE.usersArchiveId,
        guestsArchiveId: selectExcessiveActivitiesByTargetsCTE.guestsArchiveId,
        activityIds: selectExcessiveActivitiesByTargetsCTE.activityIds,
        scope: selectExcessiveActivitiesByTargetsCTE.scope,
        totalWeight: selectExcessiveActivitiesByTargetsCTE.totalWeight,
        source: sql<Source>`'excessive_activities'`,
      })
      .from(selectExcessiveActivitiesByTargetsCTE)
  )
  .prepare("current_bans_and_excessive_activities_select_by_target");

export async function selectCurrentAndExcessiveByTargets(
  input: InferInput<typeof ByTargets>
) {
  return selectCurrentAndExcessiveByTargetsStmt.execute(
    parse(ByTargets, input)
  );
}
