# Benchmark

Tested on a M1 Pro MacBook Pro.

## Option

```
fp-ts Option none x 134,775,969 ops/sec ±0.70% (99 runs sampled)
fp-ts Option some x 95,087,860 ops/sec ±0.26% (97 runs sampled)
fp-ts Option some chain x 121,914,020 ops/sec ±0.19% (98 runs sampled)
Boxed Option none x 157,293,978 ops/sec ±0.11% (98 runs sampled)
Boxed Option some x 204,144,235 ops/sec ±0.27% (94 runs sampled)
Boxed Option some flatMap x 204,023,130 ops/sec ±0.65% (97 runs sampled)
```

## Result

```
fp-ts Result x 114,543,587 ops/sec ±0.15% (99 runs sampled)
Boxed Result x 202,457,204 ops/sec ±0.27% (100 runs sampled)
```

## Future

Careful on the interpretation of the following, as Future doesn't use microtasks and calls its listeners synchronously.

```
Future x 36,365,914 ops/sec ±0.81% (92 runs sampled)
Promise x 12,402,743 ops/sec ±0.94% (90 runs sampled)
```
