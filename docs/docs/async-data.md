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

```ts
AsyncData<A>.map<B>(f: (value: A) => B): AsyncData<B>
```

If the asyncData is `Done(value)` returns `Done(f(value))`, otherwise returns the async data.

```ts
AsyncData.Done(2).map((x) => x * 2); // AsyncData.Done(4)
```

## .flatMap(f)

```ts
AsyncData<A>.flatMap<B>(f: (value: A) => AsyncData<B>): AsyncData<B>
```

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

```ts
AsyncData<A>.getWithDefault(defaultValue: A): A
```

If the async data is `Done(value)` returns `value`, otherwise returns `defaultValue`.

```ts
AsyncData.Done(2).getWithDefault(1); // 2
AsyncData.Loading().getWithDefault(1); // 1
AsyncData.NotAsked().getWithDefault(1); // 1
```

## .isDone()

```ts
AsyncData<A>.isDone(): boolean
```

Type guard. Checks if the option is `Done(value)`

```ts
AsyncData.Done(2).isDone(); // true
AsyncData.Loading().isDone(); // false
AsyncData.NotAsked().isDone(); // false

if (asyncData.isDone()) {
  const value = asyncData.get();
}
```

## .isLoading()

```ts
AsyncData<A>.isLoading(): boolean
```

Type guard. Checks if the option is `Loading`

```ts
AsyncData.Done(2).isLoading(); // false
AsyncData.Loading().isLoading(); // true
AsyncData.NotAsked().isLoading(); // false
```

## .isNotAsked()

```ts
AsyncData<A>.isNotAsked(): boolean
```

Type guard. Checks if the option is `NotAsked`

```ts
AsyncData.Done(2).isNotAsked(); // false
AsyncData.Loading().isNotAsked(); // false
AsyncData.NotAsked().isNotAsked(); // true
```

## .toOption()

```ts
AsyncData<A>.toOption(): Option<A>
```

If the result is `Done(value)` returns `Some(value)`, otherwise returns `None`.

```ts
Result.Done(2).toOption(); // Some(2)
Result.Loading().toOption(); // None
Result.NotAsked().toOption(); // None
```

## .match()

```ts
AsyncData<A>.match<B>(config: {
  Done: (value: A) => B;
  Loading: () => B;
  NotAsked: () => B;
}): B;
```

Match the async data state

```ts
const valueToDisplay = result.match({
  Done: (value) => value,
  Loading: () => "Loading ...",
  NotAsked: () => "",
});
```

## .tap(func)

```ts
AsyncData<A>.tap(func: (asyncData: AsyncData<A>) => unknown): AsyncData<A>
```

Executes `func` with `asyncData`, and returns `asyncData`. Useful for logging and debugging.

```ts
asyncData.tap(console.log).map((x) => x * 2);
```

## AsyncData.all(asyncDatas)

```ts
all(asyncDatas: Array<AsyncData<A>>): AsyncData<Array<A>>
```

Turns an "array of asyncDatas of value" into a "asyncData of array of value".

```ts
AsyncData.all([AsyncData.Done(1), AsyncData.Done(2), AsyncData.Done(3)]);
// Done([1, 2, 3])
AsyncData.all([Result.NotAsked(), AsyncData.Done(2), AsyncData.Done(3)]);
// Result.NotAsked()
AsyncData.all([Result.Loading(), AsyncData.Done(2), AsyncData.Done(3)]);
// Result.Loading()
```

## AsyncData.allFromDict(asyncDatas)

```ts
allFromDict(asyncDatas: Dict<AsyncData<A>>): AsyncData<Dict<A>>
```

Turns a "dict of asyncDatas of value" into a "asyncData of dict of value".

```ts
AsyncData.allFromDict({
  a: AsyncData.Done(1),
  b: AsyncData.Done(2),
  c: AsyncData.Done(3),
});
// Done({a: 1, b: 2, c: 3})

AsyncData.allFromDict({
  a: Result.NotAsked(),
  b: AsyncData.Done(2),
  c: AsyncData.Done(3),
});
// Result.NotAsked()

AsyncData.allFromDict({
  a: Result.Loading(),
  b: AsyncData.Done(2),
  c: AsyncData.Done(3),
});
// Result.Loading()
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
