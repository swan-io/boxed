---
title: Result<Ok, Error>
sidebar_label: Result
---

The `Result` can replace exception flows.

Exceptions can be tricky to handle: there's nothing in the type system that tracks if an error has been handled, which is error prone, and adds to your mental overhead. `Result` helps as it **makes the value hold the success state**, making it dead-simple to track with a type-system.

Just like the `Option` type, the `Result` type is a box that can have two states:

- `Ok(value)`
- `Error(error)`

## Create a Result value

To create a result, use the `Ok` and `Error` constructors:

```ts
import { Result } from "@swan-io/boxed";

const ok = Result.Ok(1);
const notOk = Result.Error("something happened");
```

You get interop with exceptions and promises:

```ts
// Let's say you have some function that throws an error
const init = (id: string) => {
  if (id.length !== 24) {
    throw new Error();
  }
  return new Client({ id });
};

const result = Result.fromExecution(() => init(id));
// Here, result will either be:
// - Ok(client)
// - Error(error)

// It works with promises too:

const value = await Result.fromPromise(() => fetch("/api"));
// `value` will either be:
// - Ok(res)
// - Error(error)
```

The result type provides a few manipulation functions:

## .map(f)

If the result is `Ok(value)` returns `Ok(f(value))`, otherwise returns `Error(error)`.

```ts
Result.Ok(2).map((x) => x * 2); // Result.Ok(4)
```

## .mapError(f)

If the result is `Error(error)` returns `Error(f(error))`, otherwise returns `Ok(value)`.

```ts
Result.Error(2).mapError((x) => x * 2); // Result.Error(4)
```

## .flatMap(f)

If the result is `Ok(value)` returns `f(value)`, otherwise returns `Error(error)`.

```ts
Result.Ok(2).flatMap((x) => {
  if (x > 1) {
    return Result.Error("some error");
  } else {
    return Result.Ok(2);
  }
});
```

## .flatMapError(f)

If the result is `Error(error)` returns `f(error)`, otherwise returns `Ok(value)`.

```ts
Result.Error(2).flatMapError((x) => {
  if (x > 1) {
    return Result.Error("some error");
  } else {
    return Result.Ok(2);
  }
});
```

## .getWithDefault(defaultValue)

If the result is `Ok(value)` returns `value`, otherwise returns `defaultValue`.

```ts
Result.Ok(2).getWithDefault(1); // 2
Result.Error(2).getWithDefault(1); // 1
```

## .isOk()

Type guard. Checks if the option is `Ok(value)`

```ts
Result.Ok(2).isOk(); // true
Result.Error(2).isOk(); // false
```

## .isError()

Type guard. Checks if the option is `None`

```ts
Result.Ok(2).isError(); // false
Result.Error().isError(); // true
```

## .toOption()

If the result is `Ok(value)` returns `Some(value)`, otherwise returns `None`.

```ts
Result.Ok(2).toOption(); // Some(2)
Result.Error(2).toOption(); // None
```

## .match()

Match the result state

```ts
const valueToDisplay = result.match({
  Ok: (value) => value,
  Error: (error) => {
    console.error(error);
    return "fallback";
  },
});
```

## .tap(func)

Executes `func` with `result`, and returns `result`. Useful for logging and debugging.

```ts
result.tap(console.log).map((x) => x * 2);
```

## .tapOk(func)

Executes `func` with `ok`, and returns `result`. Useful for logging and debugging. No-op if `result` is an error.

```ts
result.tapOk(console.log).map((x) => x * 2);
```

## .tapError(func)

Executes `func` with `error`, and returns `result`. Useful for logging and debugging. No-op if `result` is ok.

```ts
result.tapError(console.log).map((x) => x * 2);
```

## TS Pattern interop

```ts
import { match, select } from "ts-pattern";
import { Result } from "@swan-io/boxed";

match(myResult)
  .with(Result.pattern.Ok(select()), (value) => console.log(value))
  .with(Result.pattern.Error(select()), (error) => {
    console.error(error);
    return "fallback";
  })
  .exhaustive();
```
