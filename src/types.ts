export type LooseRecord<T> = Record<PropertyKey, T>;

export type Remap<T> = {
  [K in keyof T]: T[K];
};
