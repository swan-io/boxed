---
title: Future<Result<Ok, Error>>
sidebar_label: Future<Result> helpers
---

A [Future](./future) can contain a `Result` (e.g. to represent an asynchronous value that can fail). We provide some utility functions to deal with that case without having to unwrap the Future result.

## .mapResult(f)

```ts
Future<Result<A, E>>.mapResult<B, F>(
  func: (value: A) => Result<B, F>,
  propagateCancel?: boolean
): Future<Result<B, E | F>>
```

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Ok` and returning `Result<ReturnValue, Error>` and returns a new `Future<Result<ReturnValue, Error>>`

```ts
Future.value(Result.Ok(3)).mapResult((ok) => {
  return Result.Ok(ok * 2);
}); // Future<Ok<6>>

Future.value(Result.Ok(3)).mapResult((ok) => {
  if (ok % 2 === 0) {
    return Result.Ok(ok);
  } else {
    return Result.Error("Odd number");
  }
}); // Future<Error<"Odd number">>
```

## .mapOk(f)

```ts
Future<Result<A, E>>.mapOk<B>(
  func: (value: A) => B,
  propagateCancel?: boolean
): Future<Result<B, E>>
```

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Ok` and returning `ReturnValue` and returns a new `Future<Result<ReturnValue, Error>>`

```ts
Future.value(Result.Ok(3)).mapOk((ok) => {
  return ok * 2;
}); // Future<Ok<6>>

Future.value(Result.Error("something")).mapOk((ok) => {
  return ok * 2;
}); // Future<Error<"something">>
```

## .mapError(f)

```ts
Future<Result<A, E>>.mapError<F>(
  func: (value: E) => F,
  propagateCancel?: boolean
): Future<Result<A, F>>
```

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Error` and returning `ReturnValue` and returns a new `Future<Result<Ok, ReturnValue>>`

```ts
Future.value(Result.Error(3)).mapError((error) => {
  return error * 2;
}); // Future<Error<6>>

Future.value(Result.Ok("something")).mapError((ok) => {
  return ok * 2;
}); // Future<Ok<"something">>
```

## .flatMapOk(f)

```ts
Future<Result<A, E>>.mapError<B, F>(
  func: (value: A) => Future<Result<B, F>>,
  propagateCancel?: boolean
): Future<Result<B, E | F>>
```

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Ok` returning a `Future<Result<ReturnValue, Error>>`

```ts
Future.value(Result.Ok(3)).flatMapOk((ok) => Future.value(Result.Ok(ok * 2))); // Future<Ok<6>>

Future.value(Result.Ok(3)).flatMapOk((ok) =>
  Future.value(Result.Error("Nope")),
); // Future<Error<"Nope">>

Future.value(Result.Error("Error")).flatMapOk((ok) =>
  Future.value(Result.Ok(ok * 2)),
); // Future<Error<"Error">>
```

## .flatMapError(f)

```ts
Future<Result<A, E>>.mapError<B, F>(
  func: (value: E) => Future<Result<B, F>>,
  propagateCancel?: boolean
): Future<Result<A | B, F>>
```

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Error` returning a `Future<Result<Ok, ReturnValue>>`

```ts
Future.value(Result.Ok(3)).flatMapError((error) =>
  Future.value(Result.Ok(ok * 2)),
); // Future<Ok<3>>

Future.value(Result.Error("Error")).flatMapError((error) =>
  Future.value(Result.Error("Nope")),
); // Future<Error<"Nope">>

Future.value(Result.Error("Error")).flatMapError((error) =>
  Future.value(Result.Ok(1)),
); // Future<Ok<1>>
```

## .tapOk(f)

```ts
Future<Result<A, E>>.tapOk(func: (value: A) => unknown): Future<Result<A, E>>
```

Runs `f` if value is `Ok` with the future value, and returns the original future. Useful for debugging.

```ts
future.tapOk(console.log);
```

## .tapError(f)

```ts
Future<Result<A, E>>.tapError(func: (value: E) => unknown): Future<Result<A, E>>
```

Runs `f` if value is `Error` with the future value, and returns the original future. Useful for debugging.

```ts
future.tapError(console.log);
```

### .resultToPromise()

```ts
Future<Result<A, E>>.resultToPromise(): Promise<A>
```

Takes a `Future<Result<Ok, Error>>` and returns a `Promise<Ok>`, rejecting the promise with `Error` in this state.

```ts
Future.value(Result.Ok(1)).resultToPromise(); // Promise<1>
Future.value(Result.Reject(1)).resultToPromise(); // RejectedPromise<1>
```
