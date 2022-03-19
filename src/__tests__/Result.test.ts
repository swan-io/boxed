import { test, expect } from "vitest";
import { Option } from "../Option";
import { Result } from "../Result";

test("Result.is{Ok|Error}", () => {
  expect(Result.Ok(1).isOk()).toBeTruthy();
  expect(Result.Ok(1).isError()).toBeFalsy();

  expect(Result.Error(1).isOk()).toBeFalsy();
  expect(Result.Error(1).isError()).toBeTruthy();
});

test("Result.map", () => {
  expect(Result.Ok(1).map((x) => x * 2)).toEqual(Result.Ok(2));
  expect(Result.Error<number, number>(1).map((x) => x * 2)).toEqual(
    Result.Error(1)
  );
});

test("Result.flatMap", () => {
  expect(Result.Ok(1).flatMap((x) => Result.Ok(x * 2))).toEqual(Result.Ok(2));
  expect(
    Result.Error<number, number>(1).flatMap((x) => Result.Ok(x * 2))
  ).toEqual(Result.Error(1));
  expect(Result.Ok(1).flatMap((x) => Result.Error(1))).toEqual(Result.Error(1));
});

test("Result.getWithDefault", () => {
  expect(Result.Ok(1).getWithDefault(0)).toEqual(1);
  expect(Result.Error<number, number>(1).getWithDefault(0)).toEqual(0);
});

test("Result.match", () => {
  Result.Error<number, number>(1).match({
    Error: (value) => expect(value).toBe(1),
    Ok: () => expect(true).toBe(false),
  });
  Result.Ok(1).match({
    Error: () => expect(true).toBe(false),
    Ok: (value) => expect(value).toBe(1),
  });
});

test("Result.toOption", () => {
  expect(Result.Ok(1).toOption()).toEqual(Option.Some(1));
  expect(Result.Error(1).toOption()).toEqual(Option.None());
});

test("Result.fromExecution", () => {
  expect(Result.fromExecution(() => 1)).toEqual(Result.Ok(1));
  expect(
    Result.fromExecution(() => {
      throw "foo";
    })
  ).toEqual(Result.Error("foo"));
  expect(
    Result.fromExecution(() => {
      throw 1;
    })
  ).toEqual(Result.Error(1));
});

test("Result.fromPromise", async () => {
  await expect(await Result.fromPromise(Promise.resolve(1))).toEqual(
    Result.Ok(1)
  );
  await expect(await Result.fromPromise(Promise.reject(1))).toEqual(
    Result.Error(1)
  );
  await expect(
    await Result.fromPromise(
      Promise.all([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
    )
  ).toEqual(Result.Ok([1, 2, 3]));
  await expect(
    await Result.fromPromise(
      Promise.all([Promise.resolve(1), Promise.reject(2), Promise.resolve(3)])
    )
  ).toEqual(Result.Error(2));
});

test("Result.equals", () => {
  expect(
    Result.equals(Result.Error(1), Result.Error(2), (a, b) => a === b)
  ).toBe(true);
  expect(Result.equals(Result.Error(1), Result.Ok(1), (a, b) => a === b)).toBe(
    false
  );
  expect(Result.equals(Result.Ok(1), Result.Ok(1), (a, b) => a === b)).toBe(
    true
  );
  expect(Result.equals(Result.Ok(1), Result.Ok(2), (a, b) => a === b)).toBe(
    false
  );
  expect(
    Result.equals(Result.Ok(1), Result.Ok(2), (a, b) => Math.abs(a - b) < 2)
  ).toBe(true);
  expect(
    Result.equals(Result.Ok(1), Result.Ok(6), (a, b) => Math.abs(a - b) < 2)
  ).toBe(false);
});
