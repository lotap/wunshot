import { eq, getTableColumns, sql } from "drizzle-orm";

import { createQueryFn, createStmtFn } from "@/modules/core/helpers/funcs";

import { users } from "@/modules/core/models/users/schemas";
import * as V from "@/modules/core/models/users/validations";

//// PRIMITIVES ////

const { id } = getTableColumns(users);

//// INSERT ////

const insertStmt = createStmtFn((qx, label) =>
  qx.insert(users).values({}).returning().prepare(`user_insert_${label}`)
);

export const insert = createQueryFn({ vSchema: V.Insert, stmtFn: insertStmt });

//// SELECT ////

const selectStmt = createStmtFn((qx, label) =>
  qx
    .select()
    .from(users)
    .where(eq(id, sql.placeholder("id")))
    .limit(1)
    .prepare(`user_select_${label}`)
);

export const select = createQueryFn({ vSchema: V.Select, stmtFn: selectStmt });
