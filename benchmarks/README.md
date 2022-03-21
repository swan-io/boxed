# Benchmarks

Tested on a M1 Pro MacBook Pro.

## Option

```
fp-ts Option none x 125,234,802 ops/sec ±0.15% (97 runs sampled)
fp-ts Option some x 88,826,799 ops/sec ±0.27% (99 runs sampled)
fp-ts Option some chain x 107,844,862 ops/sec ±0.17% (98 runs sampled)
Boxed Option none x 156,271,780 ops/sec ±0.17% (99 runs sampled)
Boxed Option some x 126,240,283 ops/sec ±0.18% (99 runs sampled)
Boxed Option some flatMap x 126,245,356 ops/sec ±0.20% (98 runs sampled)
```

## Result

```
fp-ts Result x 105,029,825 ops/sec ±0.55% (94 runs sampled)
Boxed Result x 123,167,389 ops/sec ±0.74% (95 runs sampled)
```

## Future

Careful on the interpretation of the following, as Future doesn't use microtasks and calls its listeners synchronously.

```
Future x 15,323,287 ops/sec ±0.61% (94 runs sampled)
Promise x 12,307,467 ops/sec ±1.06% (90 runs sampled)
```
