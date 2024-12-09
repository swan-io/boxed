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
  LiteralPattern,
  LoadingPattern,
  NonePattern,
  NotAskedPattern,
  NumberPattern,
  OkPattern,
  Pattern,
  Select,
  SelectPattern,
  SomePattern,
  StringPattern,
  UnionPattern,
} from "./matchTypes";

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type DistributeObject<T> = T extends object
  ? T extends infer O
    ? {
        [K in keyof O]: O[K] extends infer P
          ? P extends any
            ? { [Key in keyof O]: Key extends K ? P : O[Key] }
            : never
          : never;
      }[keyof O]
    : never
  : T;

export type FlattenWithStructure<T> = T extends object
  ? {
      [K in keyof T]: FlattenWithStructure<T[K]>;
    } extends infer O
    ? DistributeObject<Expand<O>>
    : never
  : T;

export type RefineWithPattern<
  Input,
  P extends Pattern,
  WithSelection extends boolean,
> = [P] extends [LiteralPattern]
  ? P
  : [P] extends [AnyPattern]
    ? Input
    : [P] extends [StringPattern]
      ? Input & string
      : [P] extends [NumberPattern]
        ? Input & number
        : [P] extends [BooleanPattern]
          ? Input & boolean
          : [P] extends [BigIntPattern]
            ? Input & bigint
            : [P] extends [NonePattern]
              ? Input & None<any>
              : [P] extends [NotAskedPattern]
                ? Input & NotAsked<any>
                : [P] extends [LoadingPattern]
                  ? Input & Loading<any>
                  : [P] extends [SomePattern<infer V>]
                    ? [V] extends [Pattern]
                      ? Some<
                          RefineWithPattern<
                            [Input] extends [Option<infer X>] ? X : unknown,
                            V,
                            WithSelection
                          >
                        >
                      : never
                    : [P] extends [OkPattern<infer V>]
                      ? [V] extends [Pattern]
                        ? Ok<
                            RefineWithPattern<
                              [Input] extends [Result<infer X, infer _>]
                                ? X
                                : unknown,
                              V,
                              WithSelection
                            >,
                            [Input] extends [Result<infer _, infer X>]
                              ? X
                              : unknown
                          >
                        : never
                      : [P] extends [ErrorPattern<infer V>]
                        ? [V] extends [Pattern]
                          ? Error<
                              [Input] extends [Result<infer X, infer _>]
                                ? X
                                : unknown,
                              RefineWithPattern<
                                [Input] extends [Result<infer _, infer X>]
                                  ? X
                                  : unknown,
                                V,
                                WithSelection
                              >
                            >
                          : never
                        : [P] extends [DonePattern<infer V>]
                          ? [V] extends [Pattern]
                            ? Done<
                                RefineWithPattern<
                                  [Input] extends [AsyncData<infer X>]
                                    ? X
                                    : unknown,
                                  V,
                                  WithSelection
                                >
                              >
                            : never
                          : [P] extends [ArrayPattern<infer V>]
                            ? [V] extends [Pattern]
                              ? Array<
                                  RefineWithPattern<
                                    Input extends Array<infer X> ? X : unknown,
                                    V,
                                    WithSelection
                                  >
                                >
                              : never
                            : [P] extends [UnionPattern<infer V>]
                              ? RefineWithPattern<Input, V, WithSelection>
                              : [P] extends [DictPattern<infer M>]
                                ? [Input] extends [Record<PropertyKey, any>]
                                  ? Input & {
                                      -readonly [K in keyof M]: RefineWithPattern<
                                        Input[K],
                                        M[K],
                                        WithSelection
                                      >;
                                    }
                                  : never
                                : [P] extends [SelectPattern<infer V, infer K>]
                                  ? [V] extends [Pattern]
                                    ? [WithSelection] extends [true]
                                      ? Select<
                                          RefineWithPattern<
                                            Input,
                                            V,
                                            WithSelection
                                          >,
                                          RefineWithPattern<Input, V, false>,
                                          K
                                        >
                                      : RefineWithPattern<
                                          Input,
                                          V,
                                          WithSelection
                                        >
                                    : never
                                  : never;

type UnionToIntersection<Union> = (
  Union extends any ? (k: Union) => void : never
) extends (k: infer Intersection) => void
  ? Intersection
  : never;

type GetSelections<T> = [T] extends [Select<infer V, infer U, infer K>]
  ? Record<K, U>
  : [T] extends [Record<any, any>]
    ? { [K in keyof T]: GetSelections<T[K]> }[keyof T]
    : never;

export type GetMatch<Input, P extends Pattern> = [
  GetSelections<RefineWithPattern<Input, P, true>>,
] extends [never]
  ? FlattenWithStructure<RefineWithPattern<Input, P, false>>
  : UnionToIntersection<GetSelections<RefineWithPattern<Input, P, true>>>;
