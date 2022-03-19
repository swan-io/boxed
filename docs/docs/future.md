---
title: Future<Value>
sidebar_label: Future
---

The `Future` is a replacement for `Promise`.

## Main differences with Promises

- Futures don't handle rejection state, instead leaving it to a contained `Result`
- Futures handle cancellation
- Futures don't "swallow" futures that are returned from `map` and `flatMap`
- Future callbacks run synchronously

:::info
Even though we're diverging from `Promise`, you can `await` a `Future`.
:::

## Create a Future

```ts
// Value
const future = Future.value(1);

// Simple future
const otherFuture = Future.make((resolve) => {
  resolve(1);
});

// Future with cancellation effect
const otherFuture = Future.make((resolve) => {
  const timeoutId = setTimeout(() => {
    resolve(1);
  }, 1000);
  return () => clearTimeout(timeoutId);
});
```

## .get(f)

Runs `f` with the future value as argument when available.

```ts
future.get(console.log);
```

## .onCancel(f)

Runs `f` with the future is cancelled.

```ts
future.onCancel(() => {
  // do something
});
```

## .map(f)

Takes a `Result<A>` and returns a new `Result<f<A>>`

```ts
future.map((x) => x * 2);
```

## .flatMap(f)

Takes a `Future<A>`, and returns a new future taking the value of the future returned by `f(A)`

```ts
future.flatMap((x) => Future.value(x * 2));
```

## .tap(f)

Runs `f` with the future value, and returns the original future. Useful for debugging.

```ts
future.tap(console.log);
```

## .isPending()

Type guard. Returns wether the future is pending or not.

```ts
future.isPending();
```

## .isCancelled()

Type guard. Returns wether the future is cancelled or not.

```ts
future.isCancelled();
```

## .isResolved()

Type guard. Returns wether the future is resolved or not.

```ts
future.isResolved();
```

## Future<Result<Ok, Error>>

We provide a few utility functions for `Future` containing a `Result` value.

### .mapResult(f)

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Ok` and returning `Result<ReturnValue, Error>` and returns a new `Future<Result<ReturnValue, Error>>`

```ts
future.mapResult((ok) => {
  return Result.Ok(ok * 2);
});
```

### .mapOk(f)

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Ok` and returning `ReturnValue` and returns a new `Future<Result<ReturnValue, Error>>`

```ts
future.mapOk((ok) => {
  return ok * 2;
});
```

### .mapError(f)

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Error` and returning `ReturnValue` and returns a new `Future<Result<Ok, ReturnValue>>`

```ts
future.mapError((error) => {
  return ok * 2;
});
```

### .flatMapOk(f)

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Ok` returning a `Future<Result<ReturnValue, Error>>`

```ts
future.flatMapOk((ok) => Future.value(Result.Ok(1)));
```

### .flatMapError(f)

Takes a `Future<Result<Ok, Error>>` and a `f` function taking `Error` returning a `Future<Result<Ok, ReturnValue>>`

```ts
future.flatMapError((error) => Future.value(Result.Ok(1)));
```

### .tapOk(f)

Runs `f` if value is `Ok` with the future value, and returns the original future. Useful for debugging.

```ts
future.tapOk(console.log);
```

### .tapError(f)

Runs `f` if value is `Error` with the future value, and returns the original future. Useful for debugging.

```ts
future.tapError(console.log);
```

## Future.all(futures)

Turns an "array of futures of values" into a "future of array of value".

```ts
Future.all([Future.value(1), Future.value(2), Future.value(3)]);
// Future<[1, 2, 3]>
```

## Interop

### Future.fromPromise(promise)

Takes a `Promise<T>` and returns a `Future<Result<T, Error>>`

```ts
Future.fromPromise(Promise.resolve(1)); // Future(Ok(1))
Future.fromPromise(Promise.reject(1)); // Future<Error<1>>
```

### .toPromise()

Takes a `Future<T>` and returns a `Promise<T>`

```ts
Future.value(1).toPromise(); // Promise<1>
```

### .resultToPromise()

Takes a `Future<Result<Ok, Error>>` and returns a `Promise<Ok>`, rejecting the promise with `Error` in this state.

```ts
Future.value(Result.Ok(1)).resultToPromise(); // Promise<1>
Future.value(Result.Reject(1)).resultToPromise(); // RejectedPromise<1>
```

## Cancellation

### Basics

In JavaScript, `Promises` are not cancellable.

That can be limiting at times, especially when using `React`'s `useEffect`, that let's you return a cancellation effect in order to prevent unwanted side-effects.

You can return a cleanup effect from the future `init` function:

```ts
const future = Future.make((resolve) => {
  const timeoutId = setTimeout(() => {
    resolve(1);
  }, 1000);
  // will run on cancellation
  return () => clearTimeout(timeoutId);
});
```

To cancel a `future`, call `future.cancel()`.

```ts
future.cancel();
```

:::note
You can only `cancel` a pending future.

Calling cancel on a resolved future is a no-op, meaning the future will keep its resolved state.
:::

A cancelled future will automatically cancel any future created from it (e.g. from `.map` or `.flatMap`):

```ts
const future = Future.make((resolve) => {
  const timeoutId = setTimeout(() => {
    resolve(1);
  }, 1000);
  // will run on cancellation
  return () => clearTimeout(timeoutId);
});

const future2 = future.map((x) => x * 2);

future.cancel(); // Both `future` and `future2` are cancelled
```

### Bubbling cancellation

All `.map*` and `.flatMap*` methods take an extra parameter called `propagateCancel`, it enables the returned future `cancel` to bubble up cancellation to its depedencies:

```ts
// disabled by default: cancelling `future2` will not cancel `future`
const future2 = future.map((x) => x * 2);

// optin: cancelling `future2` will cancel `future`
const future2 = future.map((x) => x * 2, true);
```

This can be useful at call site:

```ts
const request = apiCall().map(parse, true);

request.cancel(); // will run the cleanup effect in `apiCall`
```
