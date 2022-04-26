# Benchmark

Tested on a M1 Pro MacBook Pro.

## Option

```
fp-ts Option none x 134,113,171 ops/sec ±0.14% (98 runs sampled)
fp-ts Option some x 94,271,428 ops/sec ±0.23% (101 runs sampled)
fp-ts Option some chain x 117,119,987 ops/sec ±1.33% (96 runs sampled)
Boxed Option none x 156,484,244 ops/sec ±0.18% (100 runs sampled)
Boxed Option some x 117,831,281 ops/sec ±0.26% (96 runs sampled)
Boxed Option some flatMap x 116,963,368 ops/sec ±0.37% (98 runs sampled)
```

## Result

```
fp-ts Result x 109,746,377 ops/sec ±0.83% (96 runs sampled)
Boxed Result x 112,607,103 ops/sec ±0.74% (95 runs sampled)
```

## Future

Careful on the interpretation of the following, as Future doesn't use microtasks and calls its listeners synchronously.

```
Future x 34,402,291 ops/sec ±0.89% (96 runs sampled)
Promise x 12,175,014 ops/sec ±2.13% (88 runs sampled)
```
