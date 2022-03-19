import { test, expect } from "vitest";
import { binarySearchBy, getBy, getIndexBy, keepMap } from "../Array";
import { Option } from "../Option";

test("Array.keepMap", () => {
  expect(
    keepMap([1, 2, 3, 4], (a: number) => (a % 2 === 0 ? a * 2 : null))
  ).toEqual([4, 8]);

  expect(
    keepMap([1, 2, 3, 4], (a: number) => (a % 2 === 0 ? a * 2 : undefined))
  ).toEqual([4, 8]);

  expect(
    keepMap([1, 2, 3, 4, undefined, null], (a) => (a != null ? a : null))
  ).toEqual([1, 2, 3, 4]);
});

test("Array.getBy", () => {
  expect(getBy([1, undefined, 2], (a) => a === undefined)).toEqual(
    Option.Some(undefined)
  );

  expect(getBy([1, 2, 3], (a) => a > 4)).toEqual(Option.None());

  expect(getBy([1, undefined, 2], (a) => a === 1)).toEqual(Option.Some(1));

  expect(
    getBy([Option.Some(1), Option.None(), Option.Some(2)], (x) => x.isNone())
  ).toEqual(Option.Some(Option.None()));
});

test("Array.getIndexBy", () => {
  expect(getIndexBy([1, undefined, 2], (a) => a === undefined)).toEqual(
    Option.Some(1)
  );

  expect(getIndexBy([1, undefined, 2], (a) => a === 1)).toEqual(Option.Some(0));

  expect(
    getIndexBy([Option.Some(1), Option.None(), Option.Some(2)], (x) =>
      x.isNone()
    )
  ).toEqual(Option.Some(1));
});

test("Array.binarySearchBy", () => {
  expect(binarySearchBy([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)).toEqual(4);
  expect(binarySearchBy([1, 2, 3, 4, 6, 7, 8, 9, 10], 5)).toEqual(4);
  expect(binarySearchBy([], 2)).toEqual(-1);
});
