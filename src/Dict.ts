import { Concrete, LooseRecord } from "./types";

export const entries = <T extends LooseRecord<unknown>>(value: T) => {
  type Keys = keyof Concrete<T>;

  return Object.entries(value) as {
    [K in Keys]: [K, T[K]];
  }[keyof T][];
};

export const keys = <T extends LooseRecord<unknown>>(value: T) =>
  Object.keys(value) as (keyof T)[];

export const values = <T extends LooseRecord<unknown>>(value: T) =>
  Object.values(value) as T[keyof T][];
