import { Done, Loading, NotAsked } from "./AsyncData";
import { Error, None, Ok, Option, Some } from "./OptionResult";

const INPUT = Symbol("PatternInput");
const REFINEMENT = Symbol("PatternRefinement");

type LiteralPattern = {
  id: string;

  type: "Literal";
  value: null | undefined | number | string | boolean | bigint;
};

type AnyPattern = { id: string; type: "Any" };
type StringPattern = { id: string; type: "String" };
type NumberPattern = { id: string; type: "Number" };
type BooleanPattern = { id: string; type: "Boolean" };
type BigIntPattern = { id: string; type: "BigInt" };
type ArrayPattern = { id: string; type: "Array"; child: TypePattern };
type RecordPattern = {
  id: string;

  type: "Record";
  children: Record<PropertyKey, TypePattern>;
};
type UnionPattern = {
  id: string;

  type: "Union";
  children: TypePattern[];
};

type SelectionPattern = {
  id: string;
  type: "Selection";
  key: string;
  child: TypePattern;
};

type SomePattern = { id: string; type: "Some"; child: TypePattern };
type NonePattern = { id: string; type: "None" };
type OkPattern = { id: string; type: "Ok"; child: TypePattern };
type ErrorPattern = { id: string; type: "Error"; child: TypePattern };
type NotAskedPattern = { id: string; type: "NotAsked" };
type LoadingPattern = { id: string; type: "Loading" };
type DonePattern = { id: string; type: "Done"; child: TypePattern };

type LeafTypePattern =
  | AnyPattern
  | LiteralPattern
  | StringPattern
  | NumberPattern
  | BooleanPattern
  | BigIntPattern
  | NonePattern
  | NotAskedPattern
  | LoadingPattern;

type BoxedDataTypePattern =
  | SomePattern
  | OkPattern
  | ErrorPattern
  | DonePattern;

type TypePattern =
  | LeafTypePattern
  | BoxedDataTypePattern
  | ArrayPattern
  | RecordPattern
  | SelectionPattern
  | UnionPattern;

const createMatcher = (
  typePattern: TypePattern,
  varName: string = "$",
  ref: { counter: number } = { counter: -1 },
  isChild: boolean = false,
): string => {
  let value: string = "";

  switch (typePattern.type) {
    case "Any":
      value = `true`;
      break;
    case "Literal":
      if (typeof typePattern.value === "bigint") {
        value = `${varName} === ${typePattern.value}n`;
      } else {
        value = `${varName} === ${typePattern.value}`;
      }
      break;
    case "String":
      value = `typeof ${varName} === "string"`;
      break;
    case "Number":
      value = `typeof ${varName} === "number"`;
      break;
    case "Boolean":
      value = `typeof ${varName} === "boolean"`;
      break;
    case "BigInt":
      value = `typeof ${varName} === "bigint"`;
      break;
    case "None":
      value = `${varName} != null && ${varName}.__boxed_type__ === "Option" && ${varName}.tag === "None"`;
      break;
    case "Some":
      value = `${varName} != null && ${varName}.__boxed_type__ === "Option" && ${varName}.tag === "Some" && (${`$${++ref.counter}=${varName}.value`},${createMatcher(
        typePattern.child,
        `$${ref.counter}`,
        ref,
        true,
      )})`;
      break;
    case "NotAsked":
      value = `${varName} != null && ${varName}.__boxed_type__ === "AsyncData" && ${varName}.tag === "NotAsked"`;
      break;
    case "Loading":
      value = `${varName} != null && ${varName}.__boxed_type__ === "AsyncData" && ${varName}.tag === "Loading"`;
      break;
    case "Done":
      value = `${varName} != null && ${varName}.__boxed_type__ === "Asyncdata" && ${varName}.tag === "Done" && (${`$${++ref.counter}=${varName}.value`},${createMatcher(
        typePattern.child,
        `$${ref.counter}`,
        ref,
        true,
      )})`;
      break;
    case "Ok":
      value = `${varName} != null && ${varName}.__boxed_type__ === "Result" && ${varName}.tag === "Ok" && (${`$${++ref.counter}=${varName}.value`},${createMatcher(
        typePattern.child,
        `$${ref.counter}`,
        ref,
        true,
      )})`;
      break;
    case "Error":
      value = `${varName} != null && ${varName}.__boxed_type__ === "Result" && ${varName}.tag === "Error" && (${`$${++ref.counter}=${varName}.error`},${createMatcher(
        typePattern.child,
        `$${ref.counter}`,
        ref,
        true,
      )})`;
      break;
    case "Array":
      value = `Array.isArray(${varName}) && ${varName}.every(${`$=>${createMatcher(
        typePattern.child,
        "$",
        ref,
        true,
      )}`})`;
      break;
    case "Record":
      value =
        `${varName}!=null && typeof ${varName}==="object" &&` +
        Object.entries(typePattern.children)
          .map(
            ([key, value]) =>
              `($${++ref.counter}=${varName}[${JSON.stringify(
                key,
              )}],${createMatcher(value, `$${ref.counter}`, ref, true)})`,
          )
          .join(" && ");
      break;
    case "Selection":
      value = `($_=typeof $_==="undefined"?{}:$_,$_[${JSON.stringify(
        typePattern.key,
      )}]=${varName},${createMatcher(typePattern.child, varName, ref, true)})`;
      break;
    case "Union":
      value = `(${typePattern.children
        .map((item) => createMatcher(item, varName, ref))
        .join("||")})`;
  }
  return (
    (isChild === false ? `let $_;` : ``) +
    (ref.counter > -1 && isChild === false
      ? `let ${Array.from(
          { length: ref.counter + 1 },
          (_, index) => `$${index}`,
        ).join(",")}; `
      : ``) +
    (isChild === false ? `return ` : ``) +
    `${value} ${
      isChild === false
        ? `? ({matches: true, selection: typeof $_==="undefined"?$:$_}) : ({matches:false})`
        : ``
    }`
  );
};

const any: AnyPattern = { id: "Any", type: "Any" };

const LITERAL_CACHE = new Map<unknown, LiteralPattern>();

const literal = <
  T extends string | number | bigint | boolean | null | undefined,
>(
  value: T,
): LiteralPattern & { value: T } => {
  if (LITERAL_CACHE.has(value)) {
    return LITERAL_CACHE.get(value) as LiteralPattern & { value: T };
  }
  const pattern: LiteralPattern & { value: T } = {
    id: crypto.randomUUID(),
    type: "Literal",
    value,
  };
  LITERAL_CACHE.set(value, pattern);
  return pattern;
};

const string: StringPattern = { id: "String", type: "String" };
const number: NumberPattern = { id: "Number", type: "Number" };
const boolean: BooleanPattern = { id: "Boolean", type: "Boolean" };
const bigint: BigIntPattern = { id: "BigInt", type: "BigInt" };

const ARRAY_CACHE = new Map<unknown, ArrayPattern>();
const array = <const T extends TypePattern>(
  child: T,
): ArrayPattern & { child: T } => {
  if (ARRAY_CACHE.has(child)) {
    return ARRAY_CACHE.get(child) as ArrayPattern & { child: T };
  }
  const pattern: ArrayPattern & { child: T } = {
    id: child.id,
    type: "Array",
    child,
  };
  ARRAY_CACHE.set(child, pattern);
  return pattern;
};

const SOME_CACHE = new Map<TypePattern, SomePattern>();
const some = <const T extends TypePattern>(
  child: T,
): SomePattern & { child: T } => {
  if (SOME_CACHE.has(child)) {
    return SOME_CACHE.get(child) as SomePattern & { child: T };
  }
  const pattern: SomePattern & { child: T } = {
    id: child.id,
    type: "Some",
    child,
  };
  SOME_CACHE.set(child, pattern);
  return pattern;
};

const none: NonePattern = { id: "None", type: "None" };

const OK_CACHE = new Map<TypePattern, OkPattern>();
const ok = <const T extends TypePattern>(
  child: T,
): OkPattern & { child: T } => {
  if (OK_CACHE.has(child)) {
    return OK_CACHE.get(child) as OkPattern & { child: T };
  }
  const pattern: OkPattern & { child: T } = { id: child.id, type: "Ok", child };
  OK_CACHE.set(child, pattern);
  return pattern;
};

const ERROR_CACHE = new Map<TypePattern, ErrorPattern>();
const error = <const T extends TypePattern>(
  child: T,
): ErrorPattern & { child: T } => {
  if (ERROR_CACHE.has(child)) {
    return ERROR_CACHE.get(child) as ErrorPattern & { child: T };
  }
  const pattern: ErrorPattern & { child: T } = {
    id: child.id,
    type: "Error",
    child,
  };
  ERROR_CACHE.set(child, pattern);
  return pattern;
};

const notAsked: NotAskedPattern = { id: "NotAsked", type: "NotAsked" };
const loading: LoadingPattern = { id: "Loading", type: "Loading" };

const DONE_CACHE = new Map<TypePattern, DonePattern>();
const done = <const T extends TypePattern>(
  child: T,
): DonePattern & { child: T } => {
  if (DONE_CACHE.has(child)) {
    return DONE_CACHE.get(child) as DonePattern & { child: T };
  }
  const pattern: DonePattern & { child: T } = {
    id: child.id,
    type: "Done",
    child,
  };
  DONE_CACHE.set(child, pattern);
  return pattern;
};

const SELECTION_CACHE = new Map<string, SelectionPattern>();
const select = <K extends string, T extends TypePattern>(
  key: K,
  child: T,
): SelectionPattern & { child: T } => {
  const cacheKey = `${key}:::${child.id}`;
  if (SELECTION_CACHE.has(cacheKey)) {
    return SELECTION_CACHE.get(cacheKey) as SelectionPattern & {
      child: T;
    };
  }
  const pattern: SelectionPattern & { child: T } = {
    id: cacheKey,
    key,
    type: "Selection",
    child,
  };
  SELECTION_CACHE.set(cacheKey, pattern);
  return pattern;
};

const UNION_CACHE = new Map<string, UnionPattern>();
const union = <const T extends TypePattern[]>(
  ...children: T
): UnionPattern & { children: T } => {
  const cacheKey = children.map((child) => child.id).join(":::");
  if (UNION_CACHE.has(cacheKey)) {
    return UNION_CACHE.get(cacheKey) as UnionPattern & {
      children: T;
    };
  }
  const pattern: UnionPattern & { children: T } = {
    id: crypto.randomUUID(),
    type: "Union",
    children,
  };
  UNION_CACHE.set(cacheKey, pattern);
  return pattern;
};

export type LooseRecord<T> = Record<PropertyKey, T>;

const RECORD_CACHE = new Map<
  string,
  { id: string; type: "Record"; children: unknown }
>();
const record = <const T extends LooseRecord<TypePattern>>(
  children: T,
): {
  id: string;
  type: "Record";
  children: { -readonly [K in keyof T]: T[K] };
} => {
  const cacheKey = Object.entries(children)
    .map(([key, value]) => `${key}::${value.id}`)
    .join(":::");
  if (RECORD_CACHE.has(cacheKey)) {
    return RECORD_CACHE.get(cacheKey) as {
      id: string;
      type: "Record";
      children: { -readonly [K in keyof T]: T[K] };
    };
  }
  const pattern: {
    id: string;
    type: "Record";
    children: { -readonly [K in keyof T]: T[K] };
  } = {
    id: crypto.randomUUID(),
    type: "Record",
    children,
  };
  RECORD_CACHE.set(cacheKey, pattern);
  return pattern;
};

const MATCHER_CACHE = new Map<string, (value: unknown) => boolean>();

const createFunction = (value: TypePattern): ((value: unknown) => boolean) => {
  if (MATCHER_CACHE.has(value.id)) {
    return MATCHER_CACHE.get(value.id) as (value: unknown) => boolean;
  }
  const func = Function("$", createMatcher(value)) as (
    value: unknown,
  ) => boolean;
  MATCHER_CACHE.set(value.id, func);
  return func;
};

type LeafTypeMap<Input, Pattern extends LeafTypePattern> = Pattern extends {
  type: "Any";
}
  ? Input & any
  : [Pattern] extends [{ type: "String" }]
    ? Input & string
    : [Pattern] extends [{ type: "Number" }]
      ? Input & number
      : [Pattern] extends [{ type: "Boolean" }]
        ? Input & boolean
        : [Pattern] extends [{ type: "BigInt" }]
          ? Input & bigint
          : [Pattern] extends [{ type: "None" }]
            ? Input & None<any>
            : [Pattern] extends [{ type: "NotAsked" }]
              ? Input & NotAsked<any>
              : [Pattern] extends [{ type: "Loading" }]
                ? Input & Loading<any>
                : never;

type BoxedDataTypeMap<Input, Pattern extends BoxedDataTypePattern> = [
  Pattern,
] extends [
  {
    type: "Some";
    child: infer Child;
  },
]
  ? [Child] extends [TypePattern]
    ? Some<TypeMap<[Input] extends [Some<infer X>] ? X : unknown, Child>>
    : never
  : [Pattern] extends [{ type: "Ok"; child: infer Child }]
    ? [Child] extends [TypePattern]
      ? Ok<
          TypeMap<[Input] extends [Ok<infer X, infer _>] ? X : unknown, Child>,
          undefined
        >
      : never
    : [Pattern] extends [{ type: "Error"; child: infer Child }]
      ? [Child] extends [TypePattern]
        ? Error<
            unknown,
            TypeMap<
              [Input] extends [Error<infer _, infer X>] ? X : unknown,
              Child
            >
          >
        : never
      : [Pattern] extends [{ type: "Done"; child: infer Child }]
        ? [Child] extends [TypePattern]
          ? Done<TypeMap<[Input] extends [Done<infer X>] ? X : unknown, Child>>
          : never
        : never;

type TypeMap<Input, Pattern extends TypePattern> = [Pattern] extends [
  LeafTypePattern,
]
  ? LeafTypeMap<Input, Pattern>
  : [Pattern] extends [BoxedDataTypePattern]
    ? BoxedDataTypeMap<Input, Pattern>
    : [Pattern] extends [{ type: "Literal"; value: infer Value }]
      ? Value
      : [Pattern] extends [{ type: "Array"; child: infer Child }]
        ? [Child] extends [TypePattern]
          ? Array<TypeMap<Input extends Array<infer X> ? X : unknown, Child>>
          : never
        : [Pattern] extends [{ type: "Union"; child: infer Children }]
          ? Input &
              {
                [K in keyof Children]: Children[K] extends TypePattern
                  ? TypeMap<Input, Children[K]>
                  : never;
              }[keyof Children]
          : [Pattern] extends [{ type: "Record"; children: infer Children }]
            ? [Children] extends [Record<PropertyKey, TypePattern>]
              ? Input & {
                  [K in keyof Children]: TypeMap<Input, Children[K]>;
                }
              : never
            : [Pattern] extends [{ type: "Selection"; child: infer Child }]
              ? [Child] extends [TypePattern]
                ? TypeMap<Input, Child>
                : never
              : never;

type PatternToRefinedType<Input, Pattern extends TypePattern> = Input &
  TypeMap<Input, Pattern>;

/**
 * const pattern = record({
  foo: array(record({ id: string })),
  bar: some(record({ id: select("id", string) })),
});

 */

const pattern = record({
  foo: array(record({ id: string })),
  bar: some(record({ id: select("id", string) })),
});

const matcher = createFunction(pattern);

console.log({ pattern, compiledPattern: matcher.toString() });
console.log({
  in: null,
  out: matcher(null),
});
console.log({
  in: { foo: [], bar: Option.None() },
  out: matcher({ foo: [], bar: Option.None() }),
});
console.log({
  in: { foo: [], bar: Option.Some({ id: "1" }) },
  out: matcher({ foo: [], bar: Option.Some({ id: "1" }) }),
});
console.log({
  in: { foo: [], bar: Option.Some({ id: "1" }) },
  out: matcher({ foo: [], bar: Option.Some({ id: "1" }) }),
});

const z = some(literal(1));
type ZZ2 = PatternToRefinedType<unknown, typeof z>;
type Z = keyof (typeof z)["child"];

type X = PatternToRefinedType<unknown, typeof pattern>;

const y: X = {
  foo: [],
  bar: Option.Some({ id: "1" }),
};
