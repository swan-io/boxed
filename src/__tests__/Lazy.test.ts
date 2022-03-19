import { test, expect } from "vitest";
import { Lazy } from "../Lazy";

test("Lazy doesn't compute until access", () => {
  const lazy = Lazy(() => {
    expect(true).toBe(false);
  });
  expect(lazy).toBeDefined();
});

test("Lazy computes on access", () => {
  const lazy = Lazy(() => {
    return 1;
  });
  expect(lazy.value).toBe(1);
});

test("Lazy computes only once", () => {
  let count = 0;
  const lazy = Lazy(() => {
    return ++count;
  });
  expect(lazy.value).toBe(1);
  expect(lazy.value).toBe(1);
  expect(lazy.value).toBe(1);
});
