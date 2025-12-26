import { eq, getTableColumns, sql } from "drizzle-orm";

import { createQueryFn, createStmtFn } from "@/modules/core/helpers/funcs";

import { activeTable } from "./schemas";
import * as V from "./validations";

//// PRIMITIVES ////

const {
  id,
  failureCause,
  label: labelCol,
  meta,
  success,
  userId,
  usersArchiveId,
  failedCredential,
  guestId,
  guestsArchiveId,
  ipAddress,
  weight,
  timestamp,
} = getTableColumns(activeTable);

//// INSERT ////

const insertStmt = createStmtFn((qx, label = "") =>
  qx
    .insert(activeTable)
    .values({
      userId: sql.placeholder("userId"),
      success: sql.placeholder("success"),
      label: sql.placeholder("label"),
      failureCause: sql.placeholder("failureCause"),
      meta: sql.placeholder("meta"),
      ipAddress: sql.placeholder("ipAddress"),
      failedCredential: sql.placeholder("failedCredential"),
      weight: sql.placeholder("weight"),
    })
    .returning({ id })
    .prepare(`activities_insert_${label}`)
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
      failedCredential,
      guestId,
      guestsArchiveId,
      ipAddress,
      weight,
      timestamp,
    })
    .from(activeTable)
    .where(eq(id, sql.placeholder("id")))
    .limit(1)
    .prepare(`activities_select_${label}`)
);

export const select = createQueryFn({ vSchema: V.Select, stmtFn: selectStmt });
