---
title: Future<Result<Ok, Error>>
sidebar_label: Future<Result> helpers
---

A [Future](./future) can contain a `Result` (e.g. to represent an asynchronous value that can fail). We provide some utility functions to deal with that case without having to unwrap the Future result.

## .mapResult(f)

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

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Ok` returning a `Future<Result<ReturnValue, Error>>`

```ts
future.flatMapOk((ok) => Future.value(Result.Ok(1)));
```

## .flatMapError(f)

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Error` returning a `Future<Result<Ok, ReturnValue>>`

```ts
future.flatMapError((error) => Future.value(Result.Ok(1)));
```

## .tapOk(f)

Runs `f` if value is `Ok` with the future value, and returns the original future. Useful for debugging.

```ts
future.tapOk(console.log);
```

## .tapError(f)

Runs `f` if value is `Error` with the future value, and returns the original future. Useful for debugging.

```ts
future.tapError(console.log);
```
