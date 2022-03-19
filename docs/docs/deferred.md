---
title: Deferred<Value>
sidebar_label: Deferred
---

## Deferred.make()

Returns a future and its resolver:

```ts
const [future, resolve] = Deferred.make<string>();

// subscribe to the promise
future.get(console.log);

// resolve from elsewhere
resolve("Hello!");
```
