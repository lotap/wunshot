import { and, eq, getTableColumns, isNotNull, or, sql } from "drizzle-orm";
import { parse, type InferInput } from "valibot";

import { db } from "@/modules/core";
import { createQueryFn, createStmtFn } from "@/modules/core/helpers/funcs";
import { Tx } from "@/modules/core/helpers/types";

import { activeTable } from "./schemas";
import * as V from "./validations";

//// PRIMITIVES ////

const { id } = getTableColumns(activeTable);

//// INSERT ////

const insertStmt = createStmtFn((qx, label) =>
  qx
    .insert(activeTable)
    .values({
      scope: sql.placeholder("scope"),
      ipAddress: sql.placeholder("ipAddress"),
      userId: sql.placeholder("userId"),
      guestId: sql.placeholder("guestId"),
      failedCredential: sql.placeholder("failedCredential"),
      usersArchiveId: sql.placeholder("usersArchiveId"),
      guestsArchiveId: sql.placeholder("guestsArchiveId"),
      activityIds: sql.placeholder("activityIds"),
      activitiesArchiveIds: sql.placeholder("activitiesArchiveIds"),
      expiresAt: sql`now() + ${sql.placeholder("penaltyInterval")}::interval`,
    })
    .returning({ id })
    .prepare(`bans_insert_${label}`)
);

export const insert = createQueryFn({ vSchema: V.Insert, stmtFn: insertStmt });

export const insertMany = (
  inputs: InferInput<typeof V.Insert>[],
  viaTx?: { tx: Tx }
) => {
  const qx = viaTx?.tx ?? db;

  qx.insert(activeTable)
    .values(
      inputs.map((input) => {
        const { penaltyInterval, ...rest } = parse(V.Insert, input);
        return {
          ...rest,
          expiresAt: sql`now() + ${penaltyInterval}::interval`,
        };
      })
    )
    .returning({ id });
};

//// UPDATE ////

const appendActivitiesStmt = createStmtFn((qx, label) =>
  qx
    .update(activeTable)
    .set({
      activityIds: sql`${activeTable.activityIds} || ${sql.placeholder("activityIds")}`,
      expiresAt: sql`${activeTable.expiresAt} + ${sql.placeholder(
        "penaltyInterval"
      )}::interval`,
      updatedAt: sql`now()`,
    })
    .where(eq(activeTable.id, sql`${sql.placeholder("id")}::uuid`))
    .prepare(`ban_append_activities_${label}`)
);

export const appendActivities = createQueryFn({
  vSchema: V.AppendActivities,
  stmtFn: appendActivitiesStmt,
});
