import { and, getTableColumns, gte, isNotNull, or, sql } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";

import { type BanScope } from "@/modules/auth/core/models/activities---bans/validations";

import {
  EXCESSIVE_ACTIVITIES_THRESHOLD,
  EXCESSIVE_ACTIVITIES_WINDOW_INTERVAL,
} from "./consts";
import { activeTable } from "./schemas";

const {
  failedCredential,
  guestId,
  guestsArchiveId,
  ipAddress,
  timestamp,
  userId,
  usersArchiveId,
  weight,
} = getTableColumns(activeTable);

export const excessiveActivities = pgView("excessive_activities").as((qb) =>
  qb
    .select({
      ipAddress,
      userId,
      guestId,
      failedCredential,
      usersArchiveId,
      guestsArchiveId,
      activityIds: sql<string[]>`array_agg(id)`.as("activity_ids"),
      totalWeight: sql<bigint>`sum(${weight})`.as("total_weight"), // postgres sum function automatically casts smallint to bigint, preventing out of range errors that could potentially occur in DDOS attacks
      scope: sql<BanScope>`
        CASE 
          WHEN GROUPING(ip_address) = 0 THEN 'IP_ADDRESS'::ban_scopes
          WHEN GROUPING(user_id) = 0 THEN 'USER'::ban_scopes
          WHEN GROUPING(guest_id) = 0 THEN 'GUEST'::ban_scopes
          WHEN GROUPING(failed_credential) = 0 THEN 'FAILED_CREDENTIAL'::ban_scopes
          WHEN GROUPING(users_archive_id) = 0 THEN 'ARCHIVED_USER'::ban_scopes
          WHEN GROUPING(guests_archive_id) = 0 THEN 'ARCHIVED_GUEST'::ban_scopes
        END
        `.as("scope"),
    })
    .from(activeTable)
    .where(
      gte(
        timestamp,
        sql`now() - interval ${EXCESSIVE_ACTIVITIES_WINDOW_INTERVAL}`
      )
    )
    .groupBy(
      sql`GROUPING SETS (ip_address, user_id, guest_id, failed_credential, users_archive_id, guests_archive_id)`
    )
    .having(({ totalWeight }) =>
      and(
        // drizzle has issues generating this with BigInt() but works fine with a raw number. The ts parser will complain without the assertion though
        gte(totalWeight, EXCESSIVE_ACTIVITIES_THRESHOLD as unknown as bigint),
        // require groupings to have at least one column defined to prevent sets with null as the "key"
        or(
          isNotNull(ipAddress),
          isNotNull(userId),
          isNotNull(guestId),
          isNotNull(failedCredential),
          isNotNull(usersArchiveId),
          isNotNull(guestsArchiveId)
        )
      )
    )
);
