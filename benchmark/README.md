# Benchmark

Tested on a M1 Pro MacBook Pro.

## Option

```
fp-ts Option none x 133,343,219 ops/sec ±0.64% (98 runs sampled)
fp-ts Option some x 91,830,512 ops/sec ±0.47% (99 runs sampled)
fp-ts Option some chain x 113,030,869 ops/sec ±1.13% (96 runs sampled)
Boxed Option none x 156,096,075 ops/sec ±0.27% (95 runs sampled)
Boxed Option some x 201,423,061 ops/sec ±0.46% (94 runs sampled)
Boxed Option some flatMap x 204,173,846 ops/sec ±0.19% (94 runs sampled)
```

## Result

```
fp-ts Result x 113,303,725 ops/sec ±0.17% (100 runs sampled)
Boxed Result x 88,732,735 ops/sec ±4.94% (78 runs sampled)
```

## Future

Careful on the interpretation of the following, as Future doesn't use microtasks and calls its listeners synchronously.

```
Future x 35,710,735 ops/sec ±0.84% (93 runs sampled)
Promise x 12,087,147 ops/sec ±1.58% (88 runs sampled)
```
