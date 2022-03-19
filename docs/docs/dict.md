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

```ts
const index = Dict.entries({ foo: 1 }); // [["foo", 1]];
```

## Dict.keys(dict)

Returns the keys in the dict.

Contrary to the TS bindings for `Object.keys`, the types are refined.

```ts
const index = Dict.keys({ foo: 1 }); // ["foo"];
```

## Dict.values(dict)

Returns the values in the dict.

Contrary to the TS bindings for `Object.values`, the types are refined.

```ts
const index = Dict.values({ foo: 1 }); // [1];
```
