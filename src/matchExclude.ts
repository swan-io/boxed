import { AsyncData, Done, Loading, NotAsked } from "./AsyncData";
import { Error, None, Ok, Option, Result, Some } from "./OptionResult";

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

type DeepExcludeDict<
  Input extends Record<PropertyKey, any>,
  Matched extends Record<PropertyKey, any>,
> = [
  {
    [K in keyof Input]: DeepExclude<Input[K], Matched[K]>;
  },
] extends [Record<PropertyKey, never>]
  ? never
  : {
      [K in keyof Input]: DeepExclude<Input[K], Matched[K]>;
    };

export type DeepExclude<T, U> = [T] extends [object]
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
          : [U] extends [Record<PropertyKey, any>]
            ? [T] extends [Record<PropertyKey, any>]
              ? DeepExcludeDict<T, U>
              : unknown
            : never
  : Exclude<T, U>;
