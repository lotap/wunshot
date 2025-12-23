import type { db } from "@/modules/core/index";

/** Drizzle Postgres Transaction objecct type alias for convenience */
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Reference for running a query with the normal db object or a transaction object */
export type QueryExecutor = typeof db | Tx;
