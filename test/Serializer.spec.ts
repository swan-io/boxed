import { expect } from "@std/expect"
import { AsyncData } from "../src/AsyncData.ts";
import { Option, Result } from "../src/OptionResult.ts";
import { decode, encode } from "../src/Serializer.ts";

Deno.test("Serializer", () => {
  const start = {
    value: AsyncData.Done(
      Result.Ok(
        Result.Error({
          value: Option.Some(1),
          nothing: Option.None(),
          loading: AsyncData.Loading(),
          notAsked: AsyncData.NotAsked(),
        }),
      ),
    ),
  };
  expect(encode(start)).toEqual(encode(start));
  expect(encode(start)).toContain("__boxed_type__");
  expect(decode(encode(start))).toEqual(start);
  expect(decode(encode(start)).value.map(() => "Hello")).toEqual(
    AsyncData.Done("Hello"),
  );
});
