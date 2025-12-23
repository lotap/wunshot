import { eq, getTableColumns, sql } from "drizzle-orm";

import { createQueryFn, createStmtFn } from "@/modules/core/helpers/funcs";

import { activities } from "@/modules/core/models/activities/schemas";
import * as V from "@/modules/core/models/activities/validations";

//// PRIMITIVES ////

const {
  id,
  failureCause,
  label: labelCol,
  meta,
  success,
  userId,
  usersArchiveId,
  timestamp,
} = getTableColumns(activities);

//// INSERT ////

const insertStmt = createStmtFn((qx, label = "") =>
  qx
    .insert(activities)
    .values({
      userId: sql.placeholder("userId"),
      success: sql.placeholder("success"),
      label: sql.placeholder("label"),
      failureCause: sql.placeholder("failureCause"),
      meta: sql.placeholder("meta"),
    })
    .returning({ id })
    .prepare(`activity_insert_${label}`)
);

export const insert = createQueryFn({ vSchema: V.Insert, stmtFn: insertStmt });

//// SELECT ////

const selectStmt = createStmtFn((qx, label) =>
  qx
    .select({
      failureCause,
      label: labelCol,
      meta,
      success,
      userId,
      usersArchiveId,
      timestamp,
    })
    .from(activities)
    .where(eq(id, sql.placeholder("id")))
    .limit(1)
    .prepare(`activity_select_${label}`)
);

export const select = createQueryFn({ vSchema: V.Select, stmtFn: selectStmt });
