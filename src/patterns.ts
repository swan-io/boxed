import {
  ANY_PATTERN,
  ARRAY_PATTERN,
  AnyPattern,
  ArrayPattern,
  BIGINT_PATTERN,
  BOOLEAN_PATTERN,
  BigIntPattern,
  BooleanPattern,
  DICT_PATTERN,
  DONE_PATTERN,
  DictPattern,
  DonePattern,
  ERROR_PATTERN,
  ErrorPattern,
  LOADING_PATTERN,
  LoadingPattern,
  NONE_PATTERN,
  NOT_ASKED_PATTERN,
  NUMBER_PATTERN,
  NonePattern,
  NotAskedPattern,
  NumberPattern,
  OK_PATTERN,
  OkPattern,
  Pattern,
  SELECT_PATTERN,
  SOME_PATTERN,
  STRING_PATTERN,
  SelectPattern,
  SomePattern,
  StringPattern,
  UNION_PATTERN,
  UnionPattern,
} from "./matchTypes";

export const getId = (pattern: Pattern): any =>
  pattern !== null && typeof pattern === "object" && "id" in pattern
    ? pattern.id
    : pattern;

export const any: AnyPattern = ANY_PATTERN;
export const string: StringPattern = STRING_PATTERN;
export const number: NumberPattern = NUMBER_PATTERN;
export const boolean: BooleanPattern = BOOLEAN_PATTERN;
export const bigint: BigIntPattern = BIGINT_PATTERN;
export const none: NonePattern = NONE_PATTERN;
export const notAsked: NotAskedPattern = NOT_ASKED_PATTERN;
export const loading: LoadingPattern = LOADING_PATTERN;

const ARRAY_CACHE = new Map<Pattern, ArrayPattern>();

export const array = <const T extends Pattern>(value: T): ArrayPattern<T> => {
  if (ARRAY_CACHE.has(value)) {
    return ARRAY_CACHE.get(value) as ArrayPattern<T>;
  }
  const pattern: ArrayPattern<T> = {
    id: getId(value),
    type: ARRAY_PATTERN,
    value: value,
  };
  ARRAY_CACHE.set(value, pattern);
  return pattern;
};

const SOME_CACHE = new Map<Pattern, SomePattern>();

export const some = <const T extends Pattern>(value: T): SomePattern<T> => {
  if (SOME_CACHE.has(value)) {
    return SOME_CACHE.get(value) as SomePattern<T>;
  }
  const pattern: SomePattern<T> = {
    id: getId(value),
    type: SOME_PATTERN,
    value,
  };
  SOME_CACHE.set(value, pattern);
  return pattern;
};

const OK_CACHE = new Map<Pattern, OkPattern>();

export const ok = <const T extends Pattern>(value: T): OkPattern<T> => {
  if (OK_CACHE.has(value)) {
    return OK_CACHE.get(value) as OkPattern<T>;
  }
  const pattern: OkPattern<T> = {
    id: getId(value),
    type: OK_PATTERN,
    value,
  };
  OK_CACHE.set(value, pattern);
  return pattern;
};

const ERROR_CACHE = new Map<Pattern, ErrorPattern>();

export const error = <const T extends Pattern>(value: T): ErrorPattern<T> => {
  if (ERROR_CACHE.has(value)) {
    return ERROR_CACHE.get(value) as ErrorPattern<T>;
  }
  const pattern: ErrorPattern<T> = {
    id: getId(value),
    type: ERROR_PATTERN,
    value,
  };
  ERROR_CACHE.set(value, pattern);
  return pattern;
};

const DONE_CACHE = new Map<Pattern, DonePattern>();

export const done = <const T extends Pattern>(value: T): DonePattern<T> => {
  if (DONE_CACHE.has(value)) {
    return DONE_CACHE.get(value) as DonePattern<T>;
  }
  const pattern: DonePattern<T> = {
    id: getId(value),
    type: DONE_PATTERN,
    value,
  };
  DONE_CACHE.set(value, pattern);
  return pattern;
};

const SELECT_CACHE = new Map<symbol, Map<string, SelectPattern>>();

export const select = <K extends string, T extends Pattern>(
  key: K,
  value: T,
): SelectPattern<T, K> => {
  const id = getId(value);
  if (SELECT_CACHE.has(id)) {
    const valueCache = SELECT_CACHE.get(id) as Map<string, SelectPattern>;
    if (valueCache.has(key)) {
      return valueCache.get(key) as SelectPattern<T, K>;
    }
  }
  const pattern: SelectPattern<T, K> = {
    id: Symbol.for(crypto.randomUUID()),
    key,
    type: SELECT_PATTERN,
    value,
  };
  const valueCache = SELECT_CACHE.get(id) ?? new Map();
  valueCache.set(key, pattern);
  SELECT_CACHE.set(id, valueCache);
  return pattern;
};

const UNION_CACHE = new Map<string, UnionPattern>();

export const union = <const T extends Pattern>(
  ...value: Array<T>
): UnionPattern<T> => {
  const cacheKey = value
    .map(getId)
    .map((item) => item.description)
    .join(" | ");

  if (UNION_CACHE.has(cacheKey)) {
    return UNION_CACHE.get(cacheKey) as UnionPattern<T>;
  }
  const pattern: UnionPattern<T> = {
    id: Symbol.for(crypto.randomUUID()),
    type: UNION_PATTERN,
    value: value,
  };
  UNION_CACHE.set(cacheKey, pattern);
  return pattern;
};

const DICT_CACHE = new Map<string, DictPattern>();

export const dict = <const T extends Record<PropertyKey, Pattern>>(
  value: T,
): DictPattern<T> => {
  const cacheKey = Object.entries(value)
    .map(([key, value]) => `${key}: ${getId(value).description}`)
    .join(" & ");

  if (DICT_CACHE.has(cacheKey)) {
    return DICT_CACHE.get(cacheKey) as DictPattern<T>;
  }
  const pattern: DictPattern<T> = {
    id: Symbol.for(crypto.randomUUID()),
    type: DICT_PATTERN,
    value,
  };
  DICT_CACHE.set(cacheKey, pattern);
  return pattern;
};
