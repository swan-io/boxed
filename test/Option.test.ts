import { match, P } from "ts-pattern";
import { expect, test } from "vitest";
import { Option, Result } from "../src/OptionResult";

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
    Option.Some(2),
  );
  expect(Option.None<number>().map((x) => Option.Some(x * 2))).toEqual(
    Option.None(),
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
    true,
  );
  expect(Option.equals(Option.None(), Option.Some(1), (a, b) => a === b)).toBe(
    false,
  );
  expect(Option.equals(Option.Some(1), Option.Some(1), (a, b) => a === b)).toBe(
    true,
  );
  expect(Option.equals(Option.Some(1), Option.Some(2), (a, b) => a === b)).toBe(
    false,
  );
  expect(
    Option.equals(
      Option.Some(1),
      Option.Some(2),
      (a, b) => Math.abs(a - b) < 2,
    ),
  ).toBe(true);
  expect(
    Option.equals(
      Option.Some(1),
      Option.Some(6),
      (a, b) => Math.abs(a - b) < 2,
    ),
  ).toBe(false);
});

test("Option serialize", () => {
  expect(JSON.parse(JSON.stringify(Option.None()))).toEqual({
    value: { tag: "None" },
  });
  expect(JSON.parse(JSON.stringify(Option.Some(1)))).toEqual({
    value: { tag: "Some", value: 1 },
  });
});

test("Option.tap", () => {
  expect(
    Option.Some(1).tap((value) => expect(value).toEqual(Option.Some(1))),
  ).toEqual(Option.Some(1));
  expect(
    Option.None().tap((value) => expect(value).toEqual(Option.None())),
  ).toEqual(Option.None());
});

test("Option.all", () => {
  expect(Option.all([])).toEqual(Option.Some([]));
  expect(Option.all([Option.Some(1), Option.Some(2), Option.Some(3)])).toEqual(
    Option.Some([1, 2, 3]),
  );
  expect(Option.all([Option.None(), Option.Some(2), Option.Some(3)])).toEqual(
    Option.None(),
  );
  expect(Option.all([Option.Some(1), Option.None(), Option.Some(3)])).toEqual(
    Option.None(),
  );
});

test("Option.allFromDict", () => {
  expect(Option.allFromDict({})).toEqual(Option.Some({}));
  expect(
    Option.allFromDict({
      a: Option.Some(1),
      b: Option.Some(2),
      c: Option.Some(3),
    }),
  ).toEqual(Option.Some({ a: 1, b: 2, c: 3 }));
  expect(
    Option.allFromDict({
      a: Option.None(),
      b: Option.Some(2),
      c: Option.Some(3),
    }),
  ).toEqual(Option.None());
  expect(
    Option.allFromDict({
      a: Option.Some(1),
      b: Option.None(),
      c: Option.Some(3),
    }),
  ).toEqual(Option.None());
});

test("ts-pattern", () => {
  expect(
    match(Option.Some(1))
      .with(Option.pattern.Some(P.select()), (value) => value)
      .with(Option.pattern.None, () => 2)
      .exhaustive(),
  ).toEqual(1);

  expect(
    match(Option.None())
      .with(Option.pattern.Some(P.any), (value) => value)
      .with(Option.pattern.None, () => 2)
      .exhaustive(),
  ).toEqual(2);
});

test("Option.get", () => {
  const option: Option<number> = Option.Some(1);
  if (option.isSome()) {
    expect(option.get()).toEqual(1);
  }
});

test("Option.toResult", () => {
  expect(Option.Some(1).toResult("NotFound")).toEqual(Result.Ok(1));
  expect(Option.None().toResult("NotFound")).toEqual(Result.Error("NotFound"));
});
