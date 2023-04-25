export type LooseRecord<T> = Record<PropertyKey, T>;

export type Concrete<T> = {
  [K in keyof T]-?: T[K];
};

export type Remap<T> = {
  [K in keyof T]: T[K];
};
