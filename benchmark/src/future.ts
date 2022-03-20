import Benchmark from "benchmark";
import { Future } from "../../src/Future.js";

const suite = new Benchmark.Suite();

suite.add("Future", () => {
  Future.value(1)
    .map((x) => x + 1)
    .get((v) => {});
});

suite.add("Promise", {
  defer: true,
  fn: (deferred: { resolve: () => void }) => {
    Promise.resolve(1)
      .then((x) => x + 1)
      .then((v) => {
        deferred.resolve();
      });
  },
});

suite.on("cycle", function (event: { target: string }) {
  console.log(String(event.target));
});

suite.run({ async: true });
