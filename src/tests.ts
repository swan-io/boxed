import { AsyncData } from "./AsyncData";
import { Result } from "./OptionResult";
import { UnionToIntersection } from "./match";
import { match } from "./matchApi";
import { GetPatternForInput } from "./matchCompatibility";
import { DeepExclude } from "./matchExclude";
import { RefineWithPattern } from "./matchRefine";
import { DictPattern, UnionPattern } from "./matchTypes";
import {
  dict,
  done,
  loading,
  notAsked,
  number,
  ok,
  select,
  union,
} from "./patterns";

const f = (x: AsyncData<Result<number, string>>) =>
  match(x)
    .when(done(ok(select("x", number))), ({ x }) => x)
    .when(notAsked, () => -1)
    .when(loading, () => -1)
    .otherwise((x) => Number(x.get().getError()));

console.log(f(AsyncData.Done(Result.Ok(1))));

const g = (x: { foo: string; test: { tag: 1 } | { tag: 2; value: string } }) =>
  match(x)
    .when(dict({ test: dict({ tag: 2 }) }), (data) => {
      console.log(data.test.value);
      return null;
    })
    .otherwise((x) => null);

const h = (x: unknown) =>
  match(x)
    .when(dict({ test: dict({ tag: 2 }) }), (data) => {
      console.log(data);
      return null;
    })
    .otherwise((x) => null);

type StatusInfo =
  | { type: "Foo" }
  | { type: "Bar"; value: string }
  | { type: "Baz" };

type AZEAZE<Input> = [Input] extends [Record<PropertyKey, any>]
  ? {
      [K in keyof Input]?: [Input] extends [Record<K, infer U>]
        ? Record<K, U>
        : never;
    }[keyof Input]
  : never;
type GGGG = AZEAZE<StatusInfo>;

type UnionToOptionalObject<T> = {
  type?: T extends { type: infer U } ? U : never;
};

type TransformedType = UnionToOptionalObject<StatusInfo>;

export type UnionToTuple<union, output extends any[] = []> = [
  UnionToIntersection<[union] extends [any] ? (t: union) => union : never>,
] extends [(_: any) => infer elem]
  ? UnionToTuple<Exclude<union, elem>, [elem, ...output]>
  : output;

type P = GetPatternForInput<{ statusInfo: StatusInfo }>;

const xx = dict({ type: union("Foo", "Bar") });

const i = (x: { statusInfo: StatusInfo }) =>
  match(x)
    .when(
      dict({
        statusInfo: dict({
          type: select("tag", union("Foo", "Bar", "Baz")),
        }),
      }),
      ({ tag }) => {
        console.log(tag);
        return null;
      },
    )
    .otherwise((x) => {
      x.statusInfo.type;
      return null;
    });

const pat = dict({ statusInfo: dict({ type: "" }) });
type FFF123123 = { statusInfo: StatusInfo };

type AZEAZAZEAZEE = GetPatternForInput<FFF123123>;
type XXX = [typeof pat & GetPatternForInput<FFF123123>] extends [never]
  ? never
  : typeof pat & GetPatternForInput<FFF123123>;

const iazeaze = (x: { statusInfo: StatusInfo }) =>
  match(x)
    .when(dict({ statusInfo: dict({ type: "Foo" }) }), (x) => {
      console.log(x);
      return null;
    })
    .otherwise((x) => {
      x.statusInfo.type;
      return null;
    });

type XAZE = { statusInfo: StatusInfo };
type AZEZAE = RefineWithPattern<
  XAZE,
  DictPattern<{
    statusInfo: DictPattern<{ type: UnionPattern<"Foo" | "Bar"> }>;
  }>,
  false
>;
type ZZZ = DeepExclude<XAZE, AZEZAE>;

type GEDSF = ZZZ["statusInfo"]["type"];

const azeazei = (x: "Foo" | "Bar" | "Baz") =>
  match(x)
    .when(union("Foo", "Bar"), (data) => {
      console.log(data);
      return null;
    })
    .otherwise((x) => {
      return null;
    });
const azeazaeazezei = (x: { t: "Foo" | "Bar" | "Baz" }) =>
  match(x)
    .when(dict({ t: union("Foo", "Bar") }), (data) => {
      console.log(data);
      return null;
    })
    .otherwise((x) => {
      return null;
    });
