import { eq, getTableColumns, sql } from "drizzle-orm";

import { createQueryFn, createStmtFn } from "@/modules/core/helpers/funcs";

import { activeTable } from "./schemas";
import * as V from "./validations";

//// PRIMITIVES ////

const { id } = getTableColumns(activeTable);

//// INSERT ////

const insertStmt = createStmtFn((qx, label) =>
  qx.insert(activeTable).values({}).returning().prepare(`users_insert_${label}`)
);

export const insert = createQueryFn({ vSchema: V.Insert, stmtFn: insertStmt });

//// SELECT ////

const selectStmt = createStmtFn((qx, label) =>
  qx
    .select()
    .from(activeTable)
    .where(eq(id, sql.placeholder("id")))
    .limit(1)
    .prepare(`users_select_${label}`)
);

export const select = createQueryFn({ vSchema: V.Select, stmtFn: selectStmt });
