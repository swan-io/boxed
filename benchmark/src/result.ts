import Benchmark from "benchmark";
import fp from "fp-ts";
import { Result } from "../../src/Result.js";

const suite = new Benchmark.Suite();

suite.add("fp-ts Result", () => {
  return fp.function.pipe(
    fp.either.right(1),
    fp.either.map((x) => x * 2),
    fp.either.getOrElse(() => 10)
  );
});

suite.add("Boxed Result", () => {
  return Result.Ok(1)
    .map((x) => x * 2)
    .getWithDefault(10);
});

suite.on("cycle", function (event: { target: string }) {
  console.log(String(event.target));
});

suite.run({ async: true });
