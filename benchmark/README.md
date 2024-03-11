# Benchmark

Tested on a M1 Pro MacBook Pro.

## Option

```
fp-ts Option none x 130,955,745 ops/sec ±1.11% (98 runs sampled)
fp-ts Option some x 97,400,638 ops/sec ±0.26% (100 runs sampled)
fp-ts Option some chain x 2,776,666 ops/sec ±0.16% (97 runs sampled)
Boxed Option none x 1,030,036,990 ops/sec ±0.13% (100 runs sampled)
Boxed Option some x 461,820,063 ops/sec ±0.20% (101 runs sampled)
Boxed Option some flatMap x 461,736,015 ops/sec ±0.32% (97 runs sampled)
```

## Result

```
fp-ts Result x 117,922,535 ops/sec ±0.39% (98 runs sampled)
Boxed Result x 465,661,918 ops/sec ±0.21% (101 runs sampled)
```

## Future

Careful on the interpretation of the following, as Future doesn't use microtasks and calls its listeners synchronously.

```
Future x 38,364,199 ops/sec ±0.68% (92 runs sampled)
Promise x 13,482,385 ops/sec ±0.25% (90 runs sampled)
```
