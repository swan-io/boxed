const Benchmark = require("benchmark");
const { Future } = require("../../dist/Boxed");

const suite = new Benchmark.Suite();

suite.add("Future", () => {
  Future.value(1)
    .map((x) => x + 1)
    .get((v) => {});
});

suite.add("Promise", {
  defer: true,
  fn: (deferred) => {
    Promise.resolve(1)
      .then((x) => x + 1)
      .then((v) => {
        deferred.resolve();
      });
  },
});

suite.on("cycle", function (event) {
  console.log(String(event.target));
});

suite.run({ async: true });
