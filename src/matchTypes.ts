// literal types
export const ANY_PATTERN = Symbol.for("any");
export type AnyPattern = typeof ANY_PATTERN;

export const STRING_PATTERN = Symbol.for("string");
export type StringPattern = typeof STRING_PATTERN;

export const NUMBER_PATTERN = Symbol.for("number");
export type NumberPattern = typeof NUMBER_PATTERN;

export const BOOLEAN_PATTERN = Symbol.for("boolean");
export type BooleanPattern = typeof BOOLEAN_PATTERN;

export const BIGINT_PATTERN = Symbol.for("bigint");
export type BigIntPattern = typeof BIGINT_PATTERN;

// literal values
export type LiteralPattern =
  | null
  | undefined
  | number
  | string
  | boolean
  | bigint;

// array
export const ARRAY_PATTERN = Symbol.for("array");
export type ArrayPattern<T extends Pattern = Pattern> = {
  id: symbol;
  type: typeof ARRAY_PATTERN;
  value: T;
};

// option
export const NONE_PATTERN = Symbol.for("None");
export type NonePattern = typeof NONE_PATTERN;

export const SOME_PATTERN = Symbol.for("Some");
export type SomePattern<T extends Pattern = Pattern> = {
  id: symbol;
  type: typeof SOME_PATTERN;
  value: T;
};

// result
export const OK_PATTERN = Symbol.for("Ok");
export type OkPattern<T extends Pattern = Pattern> = {
  id: symbol;
  type: typeof OK_PATTERN;
  value: T;
};

export const ERROR_PATTERN = Symbol.for("Error");
export type ErrorPattern<T extends Pattern = Pattern> = {
  id: symbol;
  type: typeof ERROR_PATTERN;
  value: T;
};

// async data
export const NOT_ASKED_PATTERN = Symbol.for("NotAsked");
export type NotAskedPattern = typeof NOT_ASKED_PATTERN;

export const LOADING_PATTERN = Symbol.for("Loading");
export type LoadingPattern = typeof LOADING_PATTERN;

export const DONE_PATTERN = Symbol.for("Done");
export type DonePattern<T extends Pattern = Pattern> = {
  id: symbol;
  type: typeof DONE_PATTERN;
  value: T;
};

// union
export const UNION_PATTERN = Symbol.for("union");
export type UnionPattern<T extends Pattern = Pattern> = {
  id: symbol;
  type: typeof UNION_PATTERN;
  value: Array<T>;
};

// dict
export const DICT_PATTERN = Symbol.for("dict");
export type DictPattern<
  T extends { readonly [K in PropertyKey]: Pattern } = {
    readonly [K in PropertyKey]: Pattern;
  },
> = {
  id: symbol;
  type: typeof DICT_PATTERN;
  value: T;
};

// selection
export const SELECT_PATTERN = Symbol.for("select");
export type SelectPattern<
  T extends Pattern = Pattern,
  K extends string = string,
> = {
  id: symbol;
  type: typeof SELECT_PATTERN;
  key: K;
  value: T;
};

export const SELECTION = Symbol.for("selection");

export type Select<T, U, K extends PropertyKey> = {
  [SELECTION]: K;
  value: T;
  valueWithoutSelection: U;
};

export type LeafPattern =
  | LiteralPattern
  | AnyPattern
  | StringPattern
  | NumberPattern
  | BooleanPattern
  | BigIntPattern
  | NonePattern
  | NotAskedPattern
  | LoadingPattern;

export type Pattern =
  | LeafPattern
  | SomePattern<any>
  | OkPattern<any>
  | ErrorPattern<any>
  | DonePattern<any>
  | ArrayPattern<any>
  | DictPattern<any>
  | SelectPattern<any>
  | UnionPattern<any>;

export type Union<a, b> = [b] extends [a] ? a : [a] extends [b] ? b : a | b;
