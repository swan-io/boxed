---
title: Lazy
sidebar_label: Lazy
---

## Lazy(f)

Creates a lazy value. The computation won't happen until the first access.

A `lazy` type contains a `value` property that'll contain the result from the computation.

```ts
const lazy = Lazy(() => {
  return myComputation();
});
```

## lazy.value

Computes the value **once** and returns it.

```ts
lazy.value; // value is computed and return here
```
