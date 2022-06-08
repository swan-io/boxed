type GenericRecord = Record<string | number | symbol, unknown>;

export const entries = <T extends GenericRecord>(value: T) =>
  Object.entries(value) as {
    [K in keyof T]: [K, T[K]];
  }[keyof T][];

export const keys = <T extends GenericRecord>(value: T) =>
  Object.keys(value) as (keyof T)[];

export const values = <T extends GenericRecord>(value: T) =>
  Object.values(value) as T[keyof T][];
