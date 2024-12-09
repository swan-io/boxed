import { AsyncData, Done, Loading, NotAsked } from "./AsyncData";
import { Error, None, Ok, Option, Result, Some } from "./OptionResult";

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
  children: { [K in PropertyKey]?: TypePattern };
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

type TypePattern =
  | LeafTypePattern
  | SomePattern
  | OkPattern
  | ErrorPattern
  | DonePattern
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
      value = `${varName} != null && ${varName}.__boxed_type__ === "AsyncData" && ${varName}.tag === "Done" && (${`$${++ref.counter}=${varName}.value`},${createMatcher(
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
          .filter(([, value]) => value !== undefined)
          .map(
            ([key, value]) =>
              `($${++ref.counter}=${varName}[${JSON.stringify(
                key,
              )}],${createMatcher(
                value as TypePattern,
                `$${ref.counter}`,
                ref,
                true,
              )})`,
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
): { id: string; type: "Literal"; value: T } => {
  if (LITERAL_CACHE.has(value)) {
    return LITERAL_CACHE.get(value) as {
      id: string;
      type: "Literal";
      value: T;
    };
  }
  const pattern: { id: string; type: "Literal"; value: T } = {
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
): { id: string; type: "Array"; child: T } => {
  if (ARRAY_CACHE.has(child)) {
    return ARRAY_CACHE.get(child) as { id: string; type: "Array"; child: T };
  }
  const pattern: { id: string; type: "Array"; child: T } = {
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
): { id: string; type: "Some"; child: T } => {
  if (SOME_CACHE.has(child)) {
    return SOME_CACHE.get(child) as { id: string; type: "Some"; child: T };
  }
  const pattern: { id: string; type: "Some"; child: T } = {
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
): { id: string; type: "Ok"; child: T } => {
  if (OK_CACHE.has(child)) {
    return OK_CACHE.get(child) as { id: string; type: "Ok"; child: T };
  }
  const pattern: { id: string; type: "Ok"; child: T } = {
    id: child.id,
    type: "Ok",
    child,
  };
  OK_CACHE.set(child, pattern);
  return pattern;
};

const ERROR_CACHE = new Map<TypePattern, ErrorPattern>();
const error = <const T extends TypePattern>(
  child: T,
): { id: string; type: "Error"; child: T } => {
  if (ERROR_CACHE.has(child)) {
    return ERROR_CACHE.get(child) as { id: string; type: "Error"; child: T };
  }
  const pattern: { id: string; type: "Error"; child: T } = {
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
): { id: string; type: "Done"; child: T } => {
  if (DONE_CACHE.has(child)) {
    return DONE_CACHE.get(child) as { id: string; type: "Done"; child: T };
  }
  const pattern: { id: string; type: "Done"; child: T } = {
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
): { type: "Selection"; id: string; key: K; child: T } => {
  const cacheKey = `${key}:::${child.id}`;
  if (SELECTION_CACHE.has(cacheKey)) {
    return SELECTION_CACHE.get(cacheKey) as {
      type: "Selection";
      id: string;
      key: K;
      child: T;
    };
  }
  const pattern: { type: "Selection"; id: string; key: K; child: T } = {
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
): { id: string; type: "Union"; children: T } => {
  const cacheKey = children.map((child) => child.id).join(":::");
  if (UNION_CACHE.has(cacheKey)) {
    return UNION_CACHE.get(cacheKey) as {
      id: string;
      type: "Union";
      children: T;
    };
  }
  const pattern: { id: string; type: "Union"; children: T } = {
    id: crypto.randomUUID(),
    type: "Union",
    children,
  };
  UNION_CACHE.set(cacheKey, pattern);
  return pattern;
};

const RECORD_CACHE = new Map<
  string,
  { id: string; type: "Record"; children: unknown }
>();
const record = <const T extends Record<PropertyKey, TypePattern>>(
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

type MatchResult = {
  matches: boolean;
  selection: unknown;
};
const MATCHER_CACHE = new Map<string, (value: unknown) => MatchResult>();

const getOrCreateFunction = (
  value: TypePattern,
): ((value: unknown) => MatchResult) => {
  if (MATCHER_CACHE.has(value.id)) {
    return MATCHER_CACHE.get(value.id) as (value: unknown) => MatchResult;
  }
  const func = Function("$", createMatcher(value)) as (
    value: unknown,
  ) => MatchResult;
  MATCHER_CACHE.set(value.id, func);
  return func;
};

type LeafTypeMap<Input, Pattern extends LeafTypePattern> = [Pattern] extends [
  { type: "Literal"; value: infer Value },
]
  ? Value
  : [Pattern] extends [
        {
          type: "Any";
        },
      ]
    ? Input
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

type TypeMap<Input, Pattern extends TypePattern> = [Pattern] extends [
  LeafTypePattern,
]
  ? LeafTypeMap<Input, Pattern>
  : [Pattern] extends [
        {
          type: "Some";
          child: infer Child;
        },
      ]
    ? [Child] extends [TypePattern]
      ? Some<TypeMap<[Input] extends [Option<infer X>] ? X : unknown, Child>>
      : never
    : [Pattern] extends [{ type: "Ok"; child: infer Child }]
      ? [Child] extends [TypePattern]
        ? Ok<
            TypeMap<
              [Input] extends [Result<infer X, infer _>] ? X : unknown,
              Child
            >,
            [Input] extends [Result<infer _, infer X>] ? X : unknown
          >
        : never
      : [Pattern] extends [{ type: "Error"; child: infer Child }]
        ? [Child] extends [TypePattern]
          ? Error<
              [Input] extends [Result<infer X, infer _>] ? X : unknown,
              TypeMap<
                [Input] extends [Result<infer _, infer X>] ? X : unknown,
                Child
              >
            >
          : never
        : [Pattern] extends [{ type: "Done"; child: infer Child }]
          ? [Child] extends [TypePattern]
            ? Done<
                TypeMap<
                  [Input] extends [AsyncData<infer X>] ? X : unknown,
                  Child
                >
              >
            : never
          : [Pattern] extends [{ type: "Array"; child: infer Child }]
            ? [Child] extends [TypePattern]
              ? Array<
                  TypeMap<Input extends Array<infer X> ? X : unknown, Child>
                >
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
                      [K in keyof Children]: [Input] extends [
                        Record<PropertyKey, any>,
                      ]
                        ? TypeMap<Input[K], Children[K]>
                        : TypeMap<unknown, Children[K]>;
                    }
                  : never
                : [Pattern] extends [
                      { type: "Selection"; key: infer Key; child: infer Child },
                    ]
                  ? [Child] extends [TypePattern]
                    ? TypeMap<Input, Child> & { __selection: Key }
                    : never
                  : never;

type PatternToRefinedType<Input, Pattern extends TypePattern> = TypeMap<
  Input,
  Pattern
>;

type ExtractSelections<T> = [T] extends [any[]]
  ? ExtractSelections<T[number]>
  : [T] extends [object]
    ?
        | ([T] extends [{ __selection: infer S }]
            ? [S] extends [string]
              ? Record<S, Omit<T, "__selection">>
              : never
            : never)
        | { [K in keyof T]: ExtractSelections<T[K]> }[keyof T]
    : never;

export type UnionToIntersection<Union> = [
  [Union] extends [unknown] ? (distributedUnion: Union) => void : never,
] extends [(mergedIntersection: infer Intersection) => void]
  ? Intersection & Union
  : never;

type GetMatch<
  Refined,
  Selections = UnionToIntersection<ExtractSelections<Refined>>,
> = [Selections] extends [never] ? Refined : Selections;

type DeepExcludeOption<
  Input extends Option<any>,
  Matched extends Option<any>,
> = [Input, Matched] extends [Option<any>, Some<infer ToExclude>]
  ?
      | ([Input & { tag: "Some" }] extends [never]
          ? never
          : [Input & { tag: "Some" }] extends [Some<infer Refined>]
            ? [DeepExclude<Refined, ToExclude>] extends [never]
              ? never
              : Some<DeepExclude<Refined, ToExclude>>
            : never)
      | ([Input & { tag: "None" }] extends [never]
          ? never
          : [Input & { tag: "None" }] extends [None<infer Refined>]
            ? None<Refined>
            : never)
  : [Input, Matched] extends [Option<any>, None<any>]
    ? [Input & { tag: "Some" }] extends [never]
      ? never
      : [Input & { tag: "Some" }] extends [Some<infer Refined>]
        ? Some<Refined>
        : never
    : never;

type DeepExcludeAsyncData<
  Input extends AsyncData<any>,
  Matched extends AsyncData<any>,
> = [Input, Matched] extends [AsyncData<any>, Done<infer ToExclude>]
  ?
      | ([Input & { tag: "Done" }] extends [never]
          ? never
          : [Input & { tag: "Done" }] extends [Done<infer Refined>]
            ? [DeepExclude<Refined, ToExclude>] extends [never]
              ? never
              : Done<DeepExclude<Refined, ToExclude>>
            : never)
      | ([Input & { tag: "NotAsked" }] extends [never]
          ? never
          : [Input & { tag: "NotAsked" }] extends [NotAsked<infer Refined>]
            ? NotAsked<Refined>
            : never)
      | ([Input & { tag: "Loading" }] extends [never]
          ? never
          : [Input & { tag: "Loading" }] extends [Loading<infer Refined>]
            ? Loading<Refined>
            : never)
  : [Input, Matched] extends [AsyncData<any>, Loading<any>]
    ?
        | ([Input & { tag: "NotAsked" }] extends [never]
            ? never
            : [Input & { tag: "NotAsked" }] extends [NotAsked<infer Refined>]
              ? NotAsked<Refined>
              : never)
        | ([Input & { tag: "Done" }] extends [never]
            ? never
            : [Input & { tag: "Done" }] extends [Done<infer Refined>]
              ? Done<Refined>
              : never)
    : [Input, Matched] extends [AsyncData<any>, NotAsked<any>]
      ?
          | ([Input & { tag: "Loading" }] extends [never]
              ? never
              : [Input & { tag: "Loading" }] extends [Loading<infer Refined>]
                ? Loading<Refined>
                : never)
          | ([Input & { tag: "Done" }] extends [never]
              ? never
              : [Input & { tag: "Done" }] extends [Done<infer Refined>]
                ? Done<Refined>
                : never)
      : never;

type DeepExcludeResult<
  Input extends Result<any, any>,
  Matched extends Result<any, any>,
> = [Input, Matched] extends [Result<any, any>, Ok<infer ToExclude, infer _>]
  ?
      | ([Input & { tag: "Ok" }] extends [never]
          ? never
          : [Input & { tag: "Ok" }] extends [
                Ok<infer RefinedOk, infer RefinedError>,
              ]
            ? [DeepExclude<RefinedOk, ToExclude>] extends [never]
              ? never
              : Ok<DeepExclude<RefinedOk, ToExclude>, RefinedError>
            : never)
      | ([Input & { tag: "Error" }] extends [never]
          ? never
          : [Input & { tag: "Error" }] extends [
                Error<infer RefinedOk, infer RefinedError>,
              ]
            ? Error<RefinedOk, RefinedError>
            : never)
  : [Input, Matched] extends [Result<any, any>, Error<infer _, infer ToExclude>]
    ?
        | ([Input & { tag: "Ok" }] extends [never]
            ? never
            : [Input & { tag: "Ok" }] extends [
                  Ok<infer RefinedOk, infer RefinedError>,
                ]
              ? Ok<RefinedOk, RefinedError>
              : never)
        | ([Input & { tag: "Error" }] extends [never]
            ? never
            : [Input & { tag: "Error" }] extends [
                  Error<infer RefinedOk, infer RefinedError>,
                ]
              ? [DeepExclude<RefinedError, ToExclude>] extends [never]
                ? never
                : Error<RefinedOk, DeepExclude<RefinedError, ToExclude>>
              : never)
    : never;

type DeepExclude<T, U> = [U] extends [{ __selection: string }]
  ? DeepExclude<T, Omit<T, "__selection">>
  : [T] extends [object]
    ? [T] extends [Array<infer R>]
      ? Array<DeepExclude<R, U>>
      : [U] extends [Option<any>]
        ? [T] extends [Option<any>]
          ? DeepExcludeOption<T, U>
          : unknown
        : [U] extends [Result<any, any>]
          ? [T] extends [Result<any, any>]
            ? DeepExcludeResult<T, U>
            : unknown
          : [U] extends [AsyncData<any>]
            ? [T] extends [AsyncData<any>]
              ? DeepExcludeAsyncData<T, U>
              : unknown
            : {
                [K in keyof T]: DeepExclude<T[K], U>;
              }
    : Exclude<T, U>;

export type Union<a, b> = [b] extends [a] ? a : [a] extends [b] ? b : a | b;

type Match<Input, Output = never> = {
  when<
    Pattern extends TypePattern,
    ReturnValue,
    MatchedType = PatternToRefinedType<Input, Pattern>,
  >(
    pattern: Pattern,
    func: (data: GetMatch<MatchedType>) => ReturnValue,
  ): Match<DeepExclude<Input, MatchedType>, Union<Output, ReturnValue>>;

  otherwise<Func extends (data: Input) => Output>(func: Func): Output;

  exhaustive: [Input] extends [never] ? () => Output : ExhaustiveError<Input>;
};

const match = <Input, Output = never>(input: Input) => {
  let returnValue: Option<any> = Option.None();

  const matcher = {
    when(pattern: TypePattern, func: (value: unknown) => unknown) {
      if (returnValue.isSome()) {
        return this;
      }
      const matcher = getOrCreateFunction(pattern);
      const result = matcher(input);

      if (result.matches) {
        const value = func(result.selection);
        returnValue = Option.Some(value);
      }
      return this;
    },
    otherwise(func: (value: unknown) => unknown) {
      if (returnValue.isSome()) {
        return returnValue.get() as unknown as Output;
      }
      return func(input);
    },
    exhaustive() {
      if (returnValue.isSome()) {
        return returnValue.get() as unknown as Output;
      }
      throw new ExhaustiveError(input as unknown as string);
    },
  } as unknown as Match<Input, Output>;

  return matcher;
};

class ExhaustiveError<Input extends unknown> extends globalThis.Error {}

const f = (x: AsyncData<Result<number, never>>) =>
  match(x)
    .when(done(ok(select("x", number))), ({ x }) => x)
    .when(notAsked, () => -1)
    .when(loading, () => -1)
    .otherwise((x) => x.get().getError());

console.log(f(AsyncData.Done(Result.Ok(1))));

const g = (x: { foo: string; test: { tag: 1 } | { tag: 2; value: string } }) =>
  match(x)
    .when(record({ test: record({ tag: literal(2) }) }), (data) => {
      console.log(data.test.value);
      return null;
    })
    .otherwise(() => null);

const h = (x: unknown) =>
  match(x)
    .when(record({ test: record({ tag: literal(2) }) }), (data) => {
      console.log(data);
      return null;
    })
    .otherwise(() => null);

type StatusInfo = { type: "Foo" } | { type: "Bar"; value: string };

const i = (x: { statusInfo: StatusInfo }) =>
  match(x)
    .when(record({ test: record({ tag: literal(2) }) }), (data) => {
      console.log(data);
      return null;
    })
    .otherwise(() => null);
