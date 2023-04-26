import { expect, test } from "vitest";
import { entries, keys, values } from "../src/Dict";

test("Dict.entries", () => {
  expect(entries({ foo: 1, bar: 2 })).toEqual([
    ["foo", 1],
    ["bar", 2],
  ]);
});

test("Dict.keys", () => {
  expect(keys({ foo: 1, bar: 2 })).toEqual(["foo", "bar"]);
});

test("Dict.values", () => {
  expect(values({ foo: 1, bar: 2 })).toEqual([1, 2]);
});
