import type {
  ColumnBuilderBaseConfig,
  ColumnBaseConfig,
  ColumnDataType,
} from "drizzle-orm";
import {
  pgTable,
  type ExtraConfigColumn,
  type PgColumnBuilderBase,
  type PgTableExtraConfigValue,
} from "drizzle-orm/pg-core";

import {
  id,
  createdAt,
  updatedAt,
  timestamp,
  archiveId,
  archivedAt,
} from "@/modules/core/helpers/cols";

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
    id: id.primaryKey().defaultRandom(),
    createdAt: createdAt.defaultNow(),
    updatedAt: updatedAt.defaultNow(),
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
    id,
    createdAt,
    updatedAt,
    archiveId,
    archivedAt,
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
    id: id.primaryKey().defaultRandom(),
    timestamp: timestamp.defaultNow(),
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
    id,
    timestamp,
    archiveId,
    archivedAt,
  };
  const cols = {
    ...defaultCols,
    ...(columns || {}),
  } as T extends undefined ? typeof defaultCols : typeof defaultCols & T;

  return pgTable(name, cols, extraConfig);
}
