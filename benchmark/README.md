# Benchmark

Tested on a M1 Pro MacBook Pro.

## Option

```
fp-ts Option none x 136,289,948 ops/sec ±0.35% (99 runs sampled)
fp-ts Option some x 92,748,146 ops/sec ±0.36% (95 runs sampled)
fp-ts Option some chain x 2,831,502 ops/sec ±0.21% (98 runs sampled)
effect Option none x 28,316,950 ops/sec ±0.68% (90 runs sampled)
effect Option some x 24,920,467 ops/sec ±0.78% (92 runs sampled)
effect Option some chain x 24,060,988 ops/sec ±0.31% (99 runs sampled)
Boxed Option none x 613,986,228 ops/sec ±0.20% (99 runs sampled)
Boxed Option some x 445,172,964 ops/sec ±0.50% (100 runs sampled)
Boxed Option some flatMap x 447,362,963 ops/sec ±0.53% (98 runs sampled)
```

## Result

```
fp-ts Result x 116,379,320 ops/sec ±0.48% (95 runs sampled)
effect Result x 26,538,884 ops/sec ±0.43% (96 runs sampled)
Boxed Result x 422,758,104 ops/sec ±0.98% (94 runs sampled)
```

## Future

Careful on the interpretation of the following, as Future doesn't use microtasks and calls its listeners synchronously.

```
Promise x 13,399,997 ops/sec ±0.57% (81 runs sampled)
Future x 210,785 ops/sec ±7.41% (32 runs sampled)
```

## Future with Result

```
fp-ts TaskEither x 538,403 ops/sec ±0.29% (86 runs sampled)
effect Effect x 189,220 ops/sec ±0.94% (87 runs sampled)
Future x 575,626 ops/sec ±0.30% (90 runs sampled)
```
