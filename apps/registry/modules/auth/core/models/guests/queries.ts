import { eq, getTableColumns, sql } from "drizzle-orm";

import { createStmtFn, createQueryFn } from "@/modules/core/helpers/funcs";

import { activeTable } from "./schemas";
import * as V from "./validations";

//// PRIMITIVES ////

const { id, ipAddresses, createdAt, updatedAt } = getTableColumns(activeTable);

//// SELECT ////

const selectStmt = createStmtFn((qx, label) => {
  return qx
    .select({ ipAddresses, createdAt, updatedAt })
    .from(activeTable)
    .where(eq(id, sql.placeholder("id")))
    .limit(1)
    .prepare(`guests_select_${label}`);
});

export const select = createQueryFn({ vSchema: V.Select, stmtFn: selectStmt });
