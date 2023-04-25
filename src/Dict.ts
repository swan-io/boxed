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

// Thanks https://dev.to/svehla/typescript-object-fromentries-389c
type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
type Cast<X, Y> = X extends Y ? X : Y;
type FromEntries<T> = T extends [infer Key, any][]
  ? { [K in Cast<Key, string>]: Extract<ArrayElement<T>, [K, any]>[1] }
  : { [key in string]: any };
type FromEntriesWithReadOnly<T> = FromEntries<DeepWriteable<T>>;

export const fromEntries = <T extends (readonly [unknown, any])[]>(
  entries: T,
): FromEntriesWithReadOnly<T> => {
  return Object.fromEntries(entries) as FromEntriesWithReadOnly<T>;
};
