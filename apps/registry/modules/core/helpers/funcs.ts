import { eq } from "drizzle-orm";
import type {
  PreparedQueryConfig,
  PgPreparedQuery,
  PgTable,
  PgColumn,
} from "drizzle-orm/pg-core";
import * as v from "valibot";

import { db } from "@/modules/core/index";
import type { QueryExecutor, Tx } from "@/modules/core/helpers/types";

type StmtParams = [qx: QueryExecutor, label?: string];

/**
 * Convenience function to reduce boilerplate for writing prepared statements.
 *
 * THIS DOES NOT RETURN A STATEMENT DIRECTLY. It returns a function that returns a statement.
 *
 * This allows a single definition for the statement to be run on the database normally OR as part of a transaction.
 *
 * Useful for enforcing the shape of stmt functions used as params for {@link createQueryFn}
 */
export function createStmtFn<T extends PgPreparedQuery<PreparedQueryConfig>>(
  fn: (...[qx, label]: StmtParams) => T
) {
  return (...[qx, label = "default"]: StmtParams) => fn(qx, label);
}

type GenericValidationError = v.ErrorMessage<v.BaseIssue<unknown>> | undefined;

type GenericObjectValidationSchema = v.ObjectSchema<
  v.ObjectEntries,
  GenericValidationError
>;

/**
 * Convenience function to reduce boilerplate for writing functions that query the database.
 *
 * The function returned automatically handles typing for the input based on the validation schema and using a transaction if one is provided.
 */
export function createQueryFn<
  VSchema extends
    | GenericObjectValidationSchema
    | v.VariantSchema<
        string,
        GenericObjectValidationSchema[],
        GenericValidationError
      >,
  Stmt extends PgPreparedQuery<PreparedQueryConfig>,
>({
  vSchema,
  stmtFn,
  defaultStmt,
}: {
  vSchema: VSchema;
  stmtFn: ReturnType<typeof createStmtFn<Stmt>>;
  defaultStmt?: ReturnType<ReturnType<typeof createStmtFn<Stmt>>>;
}) {
  return async (
    input: v.InferInput<typeof vSchema>,
    viaTx?: { tx: Tx; label: string }
  ) => {
    const stmt = viaTx
      ? stmtFn(viaTx.tx, viaTx.label)
      : (defaultStmt ?? stmtFn(db));

    const data = await stmt.execute(v.parse(vSchema, input));

    return data as Awaited<ReturnType<Stmt["execute"]>>;
  };
}

/**
 * Convenience function to reduce boilerplate for writing functions that archives rows for a given table
 *
 * Creates a transaction that confirms the row(s) exists, appends the existing data to an archive table, processes given cascades, and finally removes the row(s)
 *
 * The function returned automatically handles typing for the input based on the select function provided and
 * can extend an external transaction to the query if necessary
 */
export function createArchiveFn<T extends Record<string, string | bigint>>({
  selectFn,
  activeTable,
  archiveTable,
  selectBy = "id",
  cascades,
}: {
  selectFn: (input: T, viaTx?: { tx: Tx; label: string }) => Promise<unknown>;
  activeTable: PgTable & Record<keyof T, PgColumn>;
  archiveTable: PgTable;
  selectBy?: keyof T;
  cascades?: (tx: Tx, selector: T[keyof T]) => Promise<unknown>[];
}) {
  return (input: Parameters<typeof selectFn>[0], externalTx?: Tx) => {
    const _archive = async (tx: Tx) => {
      // Find the existing row data
      const rowData = (await selectFn(input, {
        tx,
        label: "archive",
      })) as Record<string, unknown>[];

      // Throw an error if data isn't found
      if (!rowData.length)
        throw new Error(
          `ARCHIVE ERROR: CANNOT FIND ROW WHERE ${String(selectBy)} = ${input[selectBy]}`
        );

      const selector = input[selectBy];

      // Insert the data into the archive table
      await tx
        .insert(archiveTable)
        .values(rowData.map((row) => ({ ...row, [selectBy]: selector })));

      // Process cascades concurrently
      if (cascades) await Promise.all(cascades(tx, selector));

      // Delete the row data from the active table
      await tx.delete(activeTable).where(eq(activeTable[selectBy], selector));
    };

    // Process with an external transaction if it exists
    if (externalTx) return _archive(externalTx);

    // Process with a newly generated transaction
    return db.transaction((tx) => _archive(tx));
  };
}
