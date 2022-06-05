import { LooseRecord } from "./types";

export const entries = <T extends LooseRecord<unknown>>(value: T) =>
  Object.entries(value) as {
    [K in keyof T]: [K, T[K]];
  }[keyof T][];

export const keys = <T extends LooseRecord<unknown>>(value: T) =>
  Object.keys(value) as (keyof T)[];

export const values = <T extends LooseRecord<unknown>>(value: T) =>
  Object.values(value) as T[keyof T][];
