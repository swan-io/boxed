---
title: Array
sidebar_label: Array
---

```ts
import { Array } from "@swan-io/boxed";
```

## Array.keepMap(array, func)

Returns an array containing the non nullish values return by `func` for each array item.

This function can be useful to refine the types of an array.

```ts
Array.keepMap(array, (x) => {
  return x % 2 === 0 ? x : null;
});
```

## Array.getBy(array, predicate)

Return the first item in the array for which `predicate` returns true.

The function returns an `Option` so that we can distinguish between a found nullish value and a not found value.

```ts
Array.getBy(array, (x) => x === undefined);
// Some(undefined) if found
// None if not found
```

## Array.getIndexBy(array, predicate)

Return the first index in the array for which `predicate` returns true.

The function returns an `Option`.

```ts
Array.getIndexBy(array, (x) => x === undefined);
// Some(index) if found
// None if not found
```

## Array.binarySearchBy(sortedArray, item, compare)

Performs a binary search on the array.

Returns the index of the item if there's an exact match, return the index of the first superior value if not. Return `-1` if the array is empty.

```ts
const index = Array.binarySearchBy(array, "my value");
```
