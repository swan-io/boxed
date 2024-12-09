import { AsyncData, Done, Loading, NotAsked } from "./AsyncData";
import { Error, None, Ok, Option, Result, Some } from "./OptionResult";
import {
  AnyPattern,
  ArrayPattern,
  BigIntPattern,
  BooleanPattern,
  DictPattern,
  DonePattern,
  ErrorPattern,
  LeafPattern,
  LiteralPattern,
  LoadingPattern,
  NonePattern,
  NotAskedPattern,
  NumberPattern,
  OkPattern,
  Pattern,
  SelectPattern,
  SomePattern,
  StringPattern,
  UnionPattern,
} from "./matchTypes";

type GetCompatibleLiteral<Input> =
  | ([Input] extends [string] ? StringPattern | Input : never)
  | ([Input] extends [number] ? NumberPattern | Input : never)
  | ([Input] extends [boolean] ? BooleanPattern | Input : never)
  | ([Input] extends [bigint] ? BigIntPattern | Input : never)
  | ([Input] extends [null] ? null : never)
  | ([Input] extends [undefined] ? undefined : never);

type FlattenRecord<Input> = {
  [K in keyof Input]: [Input] extends [Record<K, infer U>]
    ? Record<K, U>
    : never;
}[keyof Input];

type GetCompatiblePattern<Input> = [Input] extends [LiteralPattern]
  ?
      | GetCompatibleLiteral<Input>
      | SelectPattern<GetCompatibleLiteral<Input>>
      | SelectPattern<UnionPattern<GetCompatibleLiteral<Input>>>
      | UnionPattern<GetCompatibleLiteral<Input>>
  : [Input] extends [Option<infer X>]
    ?
        | ([Input & { tag: "Some" }] extends [Some<any>]
            ? SomePattern<GetPatternForInput<X>>
            : never)
        | ([Input & { tag: "None" }] extends [None<any>] ? NonePattern : never)
    : [Input] extends [Result<infer A, infer E>]
      ?
          | ([Input & { tag: "Ok" }] extends [Ok<any, any>]
              ? OkPattern<GetPatternForInput<A>>
              : never)
          | ([Input & { tag: "Error" }] extends [Error<any, any>]
              ? ErrorPattern<GetPatternForInput<E>>
              : never)
      : [Input] extends [AsyncData<infer X>]
        ?
            | ([Input & { tag: "Done" }] extends [Done<any>]
                ? DonePattern<GetPatternForInput<X>>
                : never)
            | ([Input & { tag: "Loading" }] extends [Loading<any>]
                ? LoadingPattern
                : never)
            | ([Input & { tag: "NotAsked" }] extends [NotAsked<any>]
                ? NotAskedPattern
                : never)
        : [Input] extends [Array<infer X>]
          ? ArrayPattern<GetPatternForInput<X>>
          : [Input] extends [Record<PropertyKey, any>]
            ? DictPattern<{
                readonly [K in keyof FlattenRecord<Input>]: GetCompatiblePattern<
                  Input[K]
                >;
              }>
            : Pattern;

export type GetPatternForInput<Input> =
  | GetCompatiblePattern<Input>
  | SelectPattern<GetCompatiblePattern<Input>>
  | UnionPattern<GetCompatiblePattern<Input>>;

export type AreContainerPatternsCompatible<
  Provided extends Pattern,
  Expected extends Pattern,
> = [Provided] extends [SomePattern<infer X>]
  ? [Expected & SomePattern<X>] extends [SomePattern<any>]
    ? ArePatternsCompatible<X, (Expected & SomePattern<X>)["value"]>
    : false
  : [Provided] extends [OkPattern<infer X>]
    ? [Expected & OkPattern<X>] extends [OkPattern<any>]
      ? ArePatternsCompatible<X, (Expected & OkPattern<X>)["value"]>
      : false
    : [Provided] extends [ErrorPattern<infer X>]
      ? [Expected & ErrorPattern<X>] extends [ErrorPattern<any>]
        ? ArePatternsCompatible<X, (Expected & ErrorPattern<X>)["value"]>
        : [Provided] extends [DonePattern<infer X>]
          ? [Expected & DonePattern<X>] extends [DonePattern<any>]
            ? ArePatternsCompatible<X, (Expected & DonePattern<X>)["value"]>
            : false
          : [Provided] extends [ArrayPattern<infer X>]
            ? [Expected & ArrayPattern<X>] extends [ArrayPattern<any>]
              ? ArePatternsCompatible<X, (Expected & ArrayPattern<X>)["value"]>
              : false
            : [Provided] extends [DictPattern<infer X>]
              ? [Expected & DictPattern<X>] extends [DictPattern<any>]
                ? {
                    [K in keyof X]: ArePatternsCompatible<
                      X[K],
                      (Expected & DictPattern<X>)["value"][K]
                    >;
                  }[keyof X]
                : false
              : false
      : [Provided] extends [SelectPattern<infer X, infer K>]
        ? [Expected & SelectPattern<X, any>] extends [SelectPattern<any>]
          ? ArePatternsCompatible<X, (Expected & SelectPattern<X>)["value"]>
          : false
        : [Provided] extends [UnionPattern<infer X>]
          ? [Expected & UnionPattern<X>] extends [UnionPattern<any>]
            ? ArePatternsCompatible<
                X,
                (Expected & UnionPattern<X>)["value"][number]
              >
            : false
          : false;

export type ArePatternsCompatible<
  Provided extends Pattern,
  Expected extends Pattern,
> =
  // `any` is always fine
  [Provided] extends [AnyPattern]
    ? true
    : [Provided] extends [LeafPattern]
      ? [Provided] extends [Expected]
        ? true
        : false
      : AreContainerPatternsCompatible<Provided, Expected>;
