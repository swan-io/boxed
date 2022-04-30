---
title: Dict
sidebar_label: Dict
---

```ts
import { Dict } from "@swan-io/boxed";
```

## Dict.entries(dict)

Returns the entries in the dict.

Contrary to the TS bindings for `Object.entries`, the types are refined.

```ts title="Examples"
const index = Dict.entries({ foo: 1, bar: 2, baz: 3 });
// [["foo", 1], ["bar", 2], ["baz", 3]];
```

## Dict.keys(dict)

Returns the keys in the dict.

Contrary to the TS bindings for `Object.keys`, the types are refined.

```ts title="Examples"
const index = Dict.keys({ foo: 1, bar: 2, baz: 3 });
// ["foo", "bar", "baz"];
```

## Dict.values(dict)

Returns the values in the dict.

Contrary to the TS bindings for `Object.values`, the types are refined.

```ts title="Examples"
const index = Dict.values({ foo: 1, bar: 2, baz: 3 });
// [1, 2, 3];
```
