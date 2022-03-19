import { test, expect } from "vitest";
import { Option } from "../Option";

test("Option.is{Some|None}", () => {
  expect(Option.Some(1).isSome()).toBeTruthy();
  expect(Option.Some(1).isNone()).toBeFalsy();

  expect(Option.None().isSome()).toBeFalsy();
  expect(Option.None().isNone()).toBeTruthy();
});

test("Option.map", () => {
  expect(Option.Some(1).map((x) => x * 2)).toEqual(Option.Some(2));
  expect(Option.None<number>().map((x) => x * 2)).toEqual(Option.None());
});

test("Option.flatMap", () => {
  expect(Option.Some(1).flatMap((x) => Option.Some(x * 2))).toEqual(
    Option.Some(2)
  );
  expect(Option.None<number>().map((x) => Option.Some(x * 2))).toEqual(
    Option.None()
  );
  expect(Option.Some(1).flatMap((x) => Option.None())).toEqual(Option.None());
});

test("Option.getWithDefault", () => {
  expect(Option.Some(1).getWithDefault(0)).toEqual(1);
  expect(Option.None<number>().getWithDefault(0)).toEqual(0);
});

test("Option.match", () => {
  Option.None<number>().match({
    None: () => expect(true).toBe(true),
    Some: () => expect(true).toBe(false),
  });
  Option.Some(1).match({
    None: () => expect(true).toBe(true),
    Some: (value) => expect(value).toBe(1),
  });
});

test("Option.toNull", () => {
  expect(Option.None<number>().toNull()).toBe(null);
  expect(Option.Some(1).toNull()).toBe(1);
});

test("Option.toUndefined", () => {
  expect(Option.None<number>().toUndefined()).toBe(undefined);
  expect(Option.Some(1).toUndefined()).toBe(1);
});

test("Option.fromNullable", () => {
  expect(Option.fromNullable(1)).toEqual(Option.Some(1));
  expect(Option.fromNullable(null)).toEqual(Option.None());
  expect(Option.fromNullable(undefined)).toEqual(Option.None());
});

test("Option.fromNull", () => {
  expect(Option.fromNull(1)).toEqual(Option.Some(1));
  expect(Option.fromNull(null)).toEqual(Option.None());
  expect(Option.fromNull(undefined)).toEqual(Option.Some(undefined));
});

test("Option.fromUndefined", () => {
  expect(Option.fromUndefined(1)).toEqual(Option.Some(1));
  expect(Option.fromUndefined(null)).toEqual(Option.Some(null));
  expect(Option.fromUndefined(undefined)).toEqual(Option.None());
});

test("Option.equals", () => {
  expect(Option.equals(Option.None(), Option.None(), (a, b) => a === b)).toBe(
    true
  );
  expect(Option.equals(Option.None(), Option.Some(1), (a, b) => a === b)).toBe(
    false
  );
  expect(Option.equals(Option.Some(1), Option.Some(1), (a, b) => a === b)).toBe(
    true
  );
  expect(Option.equals(Option.Some(1), Option.Some(2), (a, b) => a === b)).toBe(
    false
  );
  expect(
    Option.equals(Option.Some(1), Option.Some(2), (a, b) => Math.abs(a - b) < 2)
  ).toBe(true);
  expect(
    Option.equals(Option.Some(1), Option.Some(6), (a, b) => Math.abs(a - b) < 2)
  ).toBe(false);
});
