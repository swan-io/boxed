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
Array.keepMap([1, 2, 3], (x) => (isEven(x) === 0 ? x : null)); // [2]
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

## Array.from(arrayLike)

[Array.from](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/from), reexported for convenience when Boxed `Array` shadows the `Array` constructor in scope.

```ts
Array.from({ length: 3 }, (_, key) => key); // [0, 1, 2]
```

## Array.of(...items)

[Array.of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of), reexported for convenience when Boxed `Array` shadows the `Array` constructor in scope.

```ts
Array.of(1, 2, 3); // [1, 2, 3]
```

## Array.isArray(value)

[Array.isArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray), reexported for convenience when Boxed `Array` shadows the `Array` constructor in scope.

```ts
Array.isArray(""); // false
Array.isArray([1, 2, 3]); // true
```
