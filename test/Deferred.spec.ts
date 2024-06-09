import { expect } from "@std/expect";

import { Deferred } from "../src/Deferred.ts";

Deno.test("Deferred", async () => {
  const [future, resolve] = Deferred.make();

  future.onResolve((n) => {
    expect(n).toEqual(1);
  });

  resolve(1);

  await future;
});
