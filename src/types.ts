export type LooseRecord<T> = Record<string | number | symbol, T>;

export type Remap<T> = {
  [K in keyof T]: T[K];
};
