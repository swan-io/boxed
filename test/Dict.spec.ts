import { expect } from "@std/expect"

import { entries, fromOptional, keys, values } from "../src/Dict.ts";
import { Option } from "../src/OptionResult.ts";

Deno.test("Dict.entries", () => {
  expect(entries({ foo: 1, bar: 2 })).toEqual([
    ["foo", 1],
    ["bar", 2],
  ]);
});

Deno.test("Dict.keys", () => {
  expect(keys({ foo: 1, bar: 2 })).toEqual(["foo", "bar"]);
});

Deno.test("Dict.values", () => {
  expect(values({ foo: 1, bar: 2 })).toEqual([1, 2]);
});

Deno.test("Dict.fromOptional", () => {
  expect(fromOptional({})).toEqual({});
  expect(
    fromOptional({
      a: Option.Some(1),
      b: Option.Some(2),
      c: Option.Some(3),
    }),
  ).toEqual({ a: 1, b: 2, c: 3 });
  expect(
    fromOptional({
      a: Option.None(),
      b: Option.Some(2),
      c: Option.Some(3),
    }),
  ).toEqual({ b: 2, c: 3 });
  expect(
    fromOptional({
      a: Option.Some(1),
      b: Option.None(),
      c: Option.Some(3),
    }),
  ).toEqual({ a: 1, c: 3 });
  expect(
    fromOptional({
      a: Option.None(),
      b: Option.None(),
      c: Option.None(),
    }),
  ).toEqual({});
});
