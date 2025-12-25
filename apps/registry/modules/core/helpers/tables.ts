import type {
  ColumnBuilderBaseConfig,
  ColumnBaseConfig,
  ColumnDataType,
} from "drizzle-orm";
import {
  bigint,
  pgTable,
  timestamp,
  uuid,
  type ExtraConfigColumn,
  type PgColumnBuilderBase,
  type PgTableExtraConfigValue,
} from "drizzle-orm/pg-core";

import { TIMESTAMPTZ_CONFIG } from "./consts";

type Columns = Record<
  string,
  PgColumnBuilderBase<ColumnBuilderBaseConfig<ColumnDataType, string>, object>
>;

type ExtraConfig = (self: {
  [x: string]: ExtraConfigColumn<ColumnBaseConfig<ColumnDataType, string>>;
}) => PgTableExtraConfigValue[];

export function activeTable<T extends Columns>(
  name: string,
  columns?: T,
  extraConfig?: ExtraConfig
) {
  const defaultCols = {
    id: uuid().primaryKey().defaultRandom(),
    createdAt: timestamp(TIMESTAMPTZ_CONFIG).defaultNow(),
    updatedAt: timestamp(TIMESTAMPTZ_CONFIG).defaultNow(),
  };
  const cols = {
    ...defaultCols,
    ...(columns || {}),
  } as T extends undefined ? typeof defaultCols : typeof defaultCols & T;

  return pgTable(name, cols, extraConfig);
}

export function archiveTable<T extends Columns>(
  name: string,
  columns?: T,
  extraConfig?: ExtraConfig
) {
  const defaultCols = {
    id: uuid().notNull(),
    createdAt: timestamp(TIMESTAMPTZ_CONFIG).notNull(),
    updatedAt: timestamp(TIMESTAMPTZ_CONFIG).notNull(),
    archiveId: bigint("archive_id", { mode: "bigint" })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    archivedAt: timestamp(TIMESTAMPTZ_CONFIG).defaultNow(),
  };
  const cols = {
    ...defaultCols,
    ...(columns || {}),
  } as T extends undefined ? typeof defaultCols : typeof defaultCols & T;

  return pgTable(name, cols, extraConfig);
}

export function activeLogTable<T extends Columns>(
  name: string,
  columns?: T,
  extraConfig?: ExtraConfig
) {
  const defaultCols = {
    id: uuid().primaryKey().defaultRandom(),
    timestamp: timestamp(TIMESTAMPTZ_CONFIG).defaultNow(),
  };
  const cols = {
    ...defaultCols,
    ...(columns || {}),
  } as T extends undefined ? typeof defaultCols : typeof defaultCols & T;

  return pgTable(name, cols, extraConfig);
}

export function archiveLogTable<T extends Columns>(
  name: string,
  columns?: T,
  extraConfig?: ExtraConfig
) {
  const defaultCols = {
    id: uuid().notNull(),
    timestamp: timestamp(TIMESTAMPTZ_CONFIG).notNull(),
    archiveId: bigint("archive_id", { mode: "bigint" })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    archivedAt: timestamp(TIMESTAMPTZ_CONFIG).defaultNow(),
  };
  const cols = {
    ...defaultCols,
    ...(columns || {}),
  } as T extends undefined ? typeof defaultCols : typeof defaultCols & T;

  return pgTable(name, cols, extraConfig);
}
