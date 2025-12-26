import { and, eq, getTableColumns, lte, sql } from "drizzle-orm";

import { createQueryFn, createStmtFn } from "@/modules/core/helpers/funcs";

import { activeTable } from "./schemas";
import * as V from "./validations";

//// PRIMITIVES ////

const { id, userId, ipAddresses, nonceHash, expiresAt, createdAt, updatedAt } =
  getTableColumns(activeTable);

//// INSERT ////

const insertStmt = createStmtFn((qx, label) =>
  qx
    .insert(activeTable)
    .values({
      userId: sql.placeholder("userId"),
      ipAddresses: sql`ARRAY[${sql.placeholder("ipAddress")}::cidr]`,
      nonceHash: sql.placeholder("nonceHash"),
    })
    .returning({ id, expiresAt })
    .prepare(`sessions_insert_${label}`)
);

export const insert = createQueryFn({ vSchema: V.Insert, stmtFn: insertStmt });

//// SELECT ////

const selectStmt = createStmtFn((qx, label) =>
  qx
    .select({ userId, ipAddresses, nonceHash, expiresAt, createdAt, updatedAt })
    .from(activeTable)
    .where(and(eq(id, sql.placeholder("id")), lte(sql`now()`, expiresAt)))
    .limit(1)
    .prepare(`sessions_select_${label}`)
);

export const select = createQueryFn({ vSchema: V.Select, stmtFn: selectStmt });

const selectManyByUserStmt = createStmtFn((qx, label) =>
  qx
    .select({ id, ipAddresses, createdAt, updatedAt })
    .from(activeTable)
    .where(eq(userId, sql.placeholder("userId")))
    .prepare(`sessions_select_by_user_${label}`)
);

export const selectManyByUser = createQueryFn({
  vSchema: V.ByUser,
  stmtFn: selectManyByUserStmt,
});

//// UPDATE ////

const updateNonceHashStmt = createStmtFn((qx, label) =>
  qx
    .update(activeTable)
    .set({
      ipAddresses: sql`ARRAY(SELECT DISTINCT unnest(array_cat(${
        ipAddresses
      }, ARRAY[${sql.placeholder("ipAddress")}::cidr])))`,
      nonceHash: sql`${sql.placeholder("nonceHash")}`,
      updatedAt: sql`now()`,
      expiresAt: sql`now() + interval '14 days'` /** @todo use a constant for the expiration date  */,
    })
    .where(eq(id, sql.placeholder("id")))
    .returning({ userId, expiresAt })
    .prepare(`sessions_update_nonce_hash_${label}`)
);

export const updateNonceHash = createQueryFn({
  vSchema: V.UpdateNonceHash,
  stmtFn: updateNonceHashStmt,
});
