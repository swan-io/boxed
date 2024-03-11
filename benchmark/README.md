# Benchmark

Tested on a M1 Pro MacBook Pro.

## Option

```
fp-ts Option none x 133,199,621 ops/sec ±0.88% (95 runs sampled)
fp-ts Option some x 94,608,143 ops/sec ±1.02% (95 runs sampled)
fp-ts Option some chain x 2,704,227 ops/sec ±1.19% (96 runs sampled)
effect Option none x 27,023,109 ops/sec ±1.29% (88 runs sampled)
effect Option some x 24,754,366 ops/sec ±1.15% (93 runs sampled)
effect Option some chain x 23,508,577 ops/sec ±0.79% (92 runs sampled)
Boxed Option none x 1,021,669,460 ops/sec ±0.87% (100 runs sampled)
Boxed Option some x 455,095,023 ops/sec ±1.37% (97 runs sampled)
Boxed Option some flatMap x 461,052,470 ops/sec ±1.00% (96 runs sampled)
```

## Result

```
fp-ts Result x 116,286,025 ops/sec ±0.81% (95 runs sampled)
effect Result x 25,582,523 ops/sec ±0.80% (99 runs sampled)
Boxed Result x 439,563,425 ops/sec ±1.00% (99 runs sampled)
```

## Future

Careful on the interpretation of the following, as Future doesn't use microtasks and calls its listeners synchronously.

```
Future x 37,910,965 ops/sec ±1.02% (90 runs sampled)
Promise x 12,620,204 ops/sec ±1.74% (83 runs sampled)
```
