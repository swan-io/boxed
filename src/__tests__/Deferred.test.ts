import { test, expect } from "vitest";
import { Deferred } from "../Deferred";

test("Deferred", async () => {
  const [future, resolve] = Deferred.make();

  future.get((n) => {
    expect(n).toEqual(1);
  });

  resolve(1);

  await future;
});
