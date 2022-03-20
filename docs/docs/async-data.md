---
title: AsyncData<Value>
sidebar_label: AsyncData
---

The `AsyncData` type enables representing asynchronous flows (e.g. requests). The type represents the state as a discriminating union, avoiding manual management for loading flows.

`AsyncData` can have three possible states:

- `NotAsked`
- `Loading`
- `Done(value)`

## Create an AsyncData value

To create an async data, use the `NotAsked`, `Loading` and `Done` constructors:

```ts
import { AsyncData } from "@swan-io/boxed";

const notAsked = AsyncData.NotAsked();
const loading = AsyncData.Loading();
const done = AsyncData.Done(1);
```

The async data type provides a few manipulation functions:

## .map(f)

If the asyncData is `Done(value)` returns `Done(f(value))`, otherwise returns the async data.

```ts
AsyncData.Done(2).map((x) => x * 2); // AsyncData.Done(4)
```

## .flatMap(f)

If the asyncData is `Done(value)` returns `f(value)`, otherwise returns the async data.

```ts
AsyncData.Done(2).flatMap((x) => {
  if (x > 1) {
    return AsyncData.NotAsked("some error");
  } else {
    return AsyncData.Done(2);
  }
});
```

## .getWithDefault(defaultValue)

If the async data is `Done(value)` returns `value`, otherwise returns `defaultValue`.

```ts
AsyncData.Done(2).getWithDefault(1); // 2
AsyncData.Loading().getWithDefault(1); // 1
AsyncData.NotAsked().getWithDefault(1); // 1
```

## .isDone()

Type guard. Checks if the option is `Done(value)`

```ts
AsyncData.Done(2).isDone(); // true
AsyncData.Loading().isDone(); // false
AsyncData.NotAsked().isDone(); // false
```

## .isLoading()

Type guard. Checks if the option is `Loading`

```ts
AsyncData.Done(2).isLoading(); // false
AsyncData.Loading().isLoading(); // true
AsyncData.NotAsked().isLoading(); // false
```

## .isNotAsked()

Type guard. Checks if the option is `Loading`

```ts
AsyncData.Done(2).isNotAsked(); // false
AsyncData.Loading().isNotAsked(); // false
AsyncData.NotAsked().isNotAsked(); // true
```

## .toOption()

If the result is `Done(value)` returns `Some(value)`, otherwise returns `None`.

```ts
Result.Done(2).toOption(); // Some(2)
Result.Loading().toOption(); // None
Result.NotAsked().toOption(); // None
```

## .match()

Match the async data state

```ts
const valueToDisplay = result.match({
  Done: (value) => value,
  Loading: () => "Loading ...",
  NotAsked: () => "",
});
```

## TS Pattern interop

```ts
import { match, select } from "ts-pattern";
import { AsyncData } from "@swan-io/boxed";

match(asyncData)
  .with(AsyncData.pattern.Done(select()), (value) => console.log(value))
  .with(AsyncData.pattern.Loading), () => "Loading ...")
  .with(AsyncData.pattern.NotAsked), () => "")
  .exhaustive();
```
