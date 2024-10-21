# Benchmark

Tested on a M1 Pro MacBook Pro.

## Option

### v8

```
fp-ts Option none x 134,019,171 ops/sec ±1.58% (94 runs sampled)
fp-ts Option some x 90,043,117 ops/sec ±3.50% (97 runs sampled)
fp-ts Option some chain x 2,797,176 ops/sec ±1.35% (97 runs sampled)
effect Option none x 28,233,747 ops/sec ±0.52% (97 runs sampled)
effect Option some x 24,837,619 ops/sec ±1.55% (90 runs sampled)
effect Option some chain x 23,184,057 ops/sec ±3.08% (94 runs sampled)
Boxed Option none x 610,271,309 ops/sec ±1.22% (98 runs sampled)
Boxed Option some x 27,055,907 ops/sec ±0.09% (96 runs sampled)
Boxed Option some flatMap x 26,768,922 ops/sec ±2.66% (88 runs sampled)
```

### jscore

```
fp-ts Option none x 26,370,592 ops/sec ±3.01% (80 runs sampled)
fp-ts Option some x 22,306,443 ops/sec ±3.35% (80 runs sampled)
fp-ts Option some chain x 6,395,953 ops/sec ±0.72% (94 runs sampled)
effect Option none x 34,944,770 ops/sec ±3.60% (80 runs sampled)
effect Option some x 24,062,381 ops/sec ±3.20% (78 runs sampled)
effect Option some chain x 21,272,877 ops/sec ±3.03% (77 runs sampled)
Boxed Option none x 360,292,187 ops/sec ±52.07% (26 runs sampled)
Boxed Option some x 42,614,750 ops/sec ±2.65% (81 runs sampled)
Boxed Option some flatMap x 39,815,444 ops/sec ±2.15% (85 runs sampled)
```

## Result

### v8

```
fp-ts Result x 116,486,882 ops/sec ±1.58% (96 runs sampled)
effect Result x 26,664,690 ops/sec ±1.45% (101 runs sampled)
Boxed Result x 28,373,628 ops/sec ±2.47% (99 runs sampled)
```

### jscore

```
fp-ts Result x 24,241,558 ops/sec ±4.98% (75 runs sampled)
effect Result x 26,450,388 ops/sec ±2.68% (79 runs sampled)
Boxed Result x 39,799,836 ops/sec ±2.69% (81 runs sampled)
```

## Future

Careful on the interpretation of the following, as Future doesn't use microtasks and calls its listeners synchronously.

### v8

```
Promise x 13,345,062 ops/sec ±1.63% (86 runs sampled)
Future x 163,971 ops/sec ±50.30% (30 runs sampled)
```

### jscore

```
Promise x 6,744,022 ops/sec ±3.20% (83 runs sampled)
Future x 162,704 ops/sec ±28.63% (24 runs sampled)
```

## Future with Result

### v8

```
fp-ts TaskEither x 524,318 ops/sec ±1.67% (90 runs sampled)
effect Effect x 193,219 ops/sec ±0.69% (90 runs sampled)
Future x 315,497 ops/sec ±10.37% (71 runs sampled)
```

### jscore

```
fp-ts TaskEither x 724,358 ops/sec ±7.41% (83 runs sampled)
effect Effect x 470,137 ops/sec ±0.86% (83 runs sampled)
Future x 707,572 ops/sec ±2.97% (72 runs sampled)
```
