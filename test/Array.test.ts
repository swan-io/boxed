import { expect, test } from "vitest";
import {
  binarySearchBy,
  from,
  getBy,
  getIndexBy,
  isArray,
  keepMap,
  of,
  unzip,
  zip,
} from "../src/Array";
import { Option } from "../src/OptionResult";

test("Array.keepMap", () => {
  expect(
    keepMap([1, 2, 3, 4], (a: number) => (a % 2 === 0 ? a * 2 : null)),
  ).toEqual([4, 8]);

  expect(
    keepMap([1, 2, 3, 4], (a: number) => (a % 2 === 0 ? a * 2 : undefined)),
  ).toEqual([4, 8]);

  expect(
    keepMap([1, 2, 3, 4, undefined, null], (a) => (a != null ? a : null)),
  ).toEqual([1, 2, 3, 4]);
});

test("Array.getBy", () => {
  expect(getBy([1, undefined, 2], (a) => a === undefined)).toEqual(
    Option.Some(undefined),
  );

  expect(getBy([1, 2, 3], (a) => a > 4)).toEqual(Option.None());

  expect(getBy([1, undefined, 2], (a) => a === 1)).toEqual(Option.Some(1));

  expect(
    getBy([Option.Some(1), Option.None(), Option.Some(2)], (x) => x.isNone()),
  ).toEqual(Option.Some(Option.None()));
});

test("Array.getIndexBy", () => {
  expect(getIndexBy([1, undefined, 2], (a) => a === undefined)).toEqual(
    Option.Some(1),
  );

  expect(getIndexBy([1, undefined, 2], (a) => a === 1)).toEqual(Option.Some(0));

  expect(
    getIndexBy([Option.Some(1), Option.None(), Option.Some(2)], (x) =>
      x.isNone(),
    ),
  ).toEqual(Option.Some(1));
});

test("Array.binarySearchBy", () => {
  expect(binarySearchBy([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)).toEqual(4);
  expect(binarySearchBy([1, 2, 3, 4, 6, 7, 8, 9, 10], 5)).toEqual(4);
  expect(binarySearchBy([], 2)).toEqual(-1);
});

test("Array.of", () => {
  expect(of(1, 2, 3)).toEqual([1, 2, 3]);

  expect(from({ length: 3 }, (_, index) => index)).toEqual([0, 1, 2]);

  expect(isArray([])).toEqual(true);
  expect(isArray({ length: 0 })).toEqual(false);
});

test("Array.zip", () => {
  expect(zip([1, 2, 3], ["one", "two", "three"])).toEqual([
    [1, "one"],
    [2, "two"],
    [3, "three"],
  ]);
  expect(zip([1, 2], ["one", "two", "three"])).toEqual([
    [1, "one"],
    [2, "two"],
  ]);
  expect(zip([1, 2, 3], ["one", "two"])).toEqual([
    [1, "one"],
    [2, "two"],
  ]);
});

test("Array.unzip", () => {
  expect(
    unzip([
      [1, "one"],
      [2, "two"],
      [3, "three"],
    ]),
  ).toEqual([
    [1, 2, 3],
    ["one", "two", "three"],
  ]);
});
