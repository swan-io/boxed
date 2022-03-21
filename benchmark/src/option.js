const Benchmark = require("benchmark");
const fp = require("fp-ts");
const { Option } = require("../../dist/Boxed");

const suite = new Benchmark.Suite();

suite.add("fp-ts Option none", () => {
  return fp.function.pipe(
    fp.option.fromNullable(null),
    fp.option.map((x) => x * 2),
    fp.option.getOrElse(() => 10),
  );
});

suite.add("fp-ts Option some", () => {
  return fp.function.pipe(
    fp.option.fromNullable(10),
    fp.option.map((x) => x * 2),
    fp.option.getOrElse(() => 10),
  );
});

suite.add("fp-ts Option some chain", () => {
  return fp.function.pipe(
    fp.option.fromNullable(10),
    fp.option.chain((x) => fp.option.some(x * 2)),
    fp.option.getOrElse(() => 10),
  );
});

suite.add("Boxed Option none", () => {
  return Option.fromNullable(null)
    .map((x) => x * 2)
    .getWithDefault(10);
});

suite.add("Boxed Option some", () => {
  return Option.fromNullable(10)
    .map((x) => x * 2)
    .getWithDefault(10);
});

suite.add("Boxed Option some flatMap", () => {
  return Option.fromNullable(10)
    .flatMap((x) => Option.Some(x * 2))
    .getWithDefault(10);
});

suite.on("cycle", function (event) {
  console.log(String(event.target));
});

suite.run({ async: true });
