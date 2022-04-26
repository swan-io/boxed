import { Result } from "./Result";

type PendingPayload<Value> = {
  resolveCallbacks?: Array<(value: Value) => void>;
  cancelCallbacks?: Array<() => void>;
  cancel?: void | (() => void);
};

function FutureInit<Value>(
  this: Future<Value>,
  init: (resolver: (value: Value) => void) => (() => void) | void,
) {
  const resolver = (value: Value) => {
    if (this.tag === "Pending") {
      const pending = this.pending as PendingPayload<Value>;
      const resolveCallbacks = pending.resolveCallbacks;
      resolveCallbacks?.forEach((func) => func(value));
      this.tag = "Resolved";
      this.value = value;
      this.pending = undefined;
    }
  };
  const pendingPayload: PendingPayload<Value> = {};
  this.tag = "Pending";
  this.pending = pendingPayload;
  pendingPayload.cancel = init(resolver);
}

export class Future<Value> {
  /**
   * Creates a new future from its initializer function (like `new Promise(...)`)
   */
  static make = <Value>(
    init: (resolver: (value: Value) => void) => (() => void) | void,
  ): Future<Value> => {
    const future = Object.create(proto);
    FutureInit.call(future, init);
    return future as Future<Value>;
  };

  /**
   * Creates a future resolved to the passed value
   */
  static value = <Value>(value: Value): Future<Value> => {
    const future = Object.create(proto);
    FutureInit.call(future, (resolve) => resolve(value));
    return future as Future<Value>;
  };

  /**
   * Converts a Promise to a Future\<Result\<Value, unknown>>
   */
  static fromPromise<Value>(
    promise: Promise<Value>,
  ): Future<Result<Value, unknown>> {
    return Future.make((resolve) => {
      promise.then(
        (ok) => resolve(Result.Ok(ok)),
        (reason) => resolve(Result.Error(reason)),
      );
    });
  }

  /**
   * Turns an array of futures into a future of array
   */
  static all = <Futures extends readonly Future<any>[] | []>(
    futures: Futures,
    propagateCancel = false,
  ): Future<{
    -readonly [P in keyof Futures]: Futures[P] extends Future<infer T>
      ? T
      : never;
  }> => {
    const length = futures.length;
    let acc = Future.value<Array<unknown>>([]);
    let index = 0;
    while (true) {
      if (index >= length) {
        return acc as unknown as Future<{
          -readonly [P in keyof Futures]: Futures[P] extends Future<infer T>
            ? T
            : never;
        }>;
      }
      const item = futures[index] as Future<unknown>;
      acc = acc.flatMap((array) => {
        return item.map((value) => {
          array.push(value);
          return array;
        }, propagateCancel);
      }, propagateCancel);
      index++;
    }
  };

  tag: "Pending" | "Cancelled" | "Resolved";
  value?: Value;
  pending?: PendingPayload<Value>;
  constructor(
    _init: (resolver: (value: Value) => void) => (() => void) | void,
  ) {
    const pendingPayload: PendingPayload<Value> = {};
    this.tag = "Pending";
    this.pending = pendingPayload;
  }
  isPending(): this is Future<Value> & {
    tag: "Pending";
    value: PendingPayload<Value>;
  } {
    return this.tag === "Pending";
  }
  isCancelled(): this is Future<Value> & {
    tag: "Cancelled";
    value: undefined;
  } {
    return this.tag === "Cancelled";
  }
  isResolved(): this is Future<Value> & {
    tag: "Resolved";
    value: Value;
  } {
    return this.tag === "Resolved";
  }
  /**
   * Runs the callback with the future value when resolved
   */
  get(this: Future<Value>, func: (value: Value) => void) {
    if (this.isPending()) {
      const pending = this.pending as PendingPayload<Value>;
      pending.resolveCallbacks = pending.resolveCallbacks ?? [];
      pending.resolveCallbacks.push(func);
    }
    if (this.isResolved()) {
      func(this.value);
    }
  }
  /**
   * Runs the callback if and when the future is cancelled
   */
  onCancel(this: Future<Value>, func: () => void) {
    if (this.isPending()) {
      const pending = this.pending as PendingPayload<Value>;
      pending.cancelCallbacks = pending.cancelCallbacks ?? [];
      pending.cancelCallbacks.push(func);
    }
    if (this.isCancelled()) {
      func();
    }
  }
  /**
   * Cancels the future
   */
  cancel() {
    if (this.tag === "Pending") {
      this.tag = "Cancelled";
      this.value = undefined;
      const pending = this.pending as PendingPayload<Value>;
      const cancelCallbacks = pending.cancelCallbacks;
      pending.cancel?.();
      cancelCallbacks?.forEach((func) => func());
      this.pending = undefined;
    }
  }
  /**
   * Returns the Future containing the value from the callback
   *
   * (Future\<A>, A => B) => Future\<B>
   */
  map<ReturnValue>(
    this: Future<Value>,
    func: (value: Value) => ReturnValue,
    propagateCancel = false,
  ): Future<ReturnValue> {
    const future = Future.make<ReturnValue>((resolve) => {
      this.get((value) => {
        resolve(func(value));
      });
      if (propagateCancel) {
        return () => {
          this.cancel();
        };
      }
    });
    this.onCancel(() => {
      future.cancel();
    });
    return future as Future<ReturnValue>;
  }
  then(this: Future<Value>, func: (value: Value) => void) {
    this.get(func);
    return this;
  }
  /**
   * Returns the Future containing the value from the callback
   *
   * (Future\<A>, A => Future\<B>) => Future\<B>
   */
  flatMap<ReturnValue>(
    this: Future<Value>,
    func: (value: Value) => Future<ReturnValue>,
    propagateCancel = false,
  ): Future<ReturnValue> {
    const future = Future.make<ReturnValue>((resolve) => {
      this.get((value) => {
        const returnedFuture = func(value);
        returnedFuture.get(resolve);
        returnedFuture.onCancel(() => future.cancel());
      });
      if (propagateCancel) {
        return () => {
          this.cancel();
        };
      }
    });
    this.onCancel(() => {
      future.cancel();
    });
    return future as Future<ReturnValue>;
  }
  /**
   * Runs the callback and returns `this`
   */
  tap(this: Future<Value>, func: (value: Value) => unknown): Future<Value> {
    this.get(func);
    return this as Future<Value>;
  }
  /**
   * For Future<Result<*>>:
   *
   * Runs the callback with the value if ok and returns `this`
   */
  tapOk<Ok, Error>(
    this: Future<Result<Ok, Error>>,
    func: (value: Ok) => unknown,
  ): Future<Result<Ok, Error>> {
    this.get((value) => {
      value.match({
        Ok: (value) => func(value),
        Error: () => {},
      });
    });
    return this as Future<Result<Ok, Error>>;
  }
  /**
   * For Future<Result<*>>:
   *
   * Runs the callback with the error if in error and returns `this`
   */
  tapError<Ok, Error>(
    this: Future<Result<Ok, Error>>,
    func: (value: Error) => unknown,
  ): Future<Result<Ok, Error>> {
    this.get((value) => {
      value.match({
        Ok: () => {},
        Error: (error) => func(error),
      });
    });
    return this as Future<Result<Ok, Error>>;
  }
  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new result and returns a future resolving to this new result
   */
  mapResult<Ok, Error, ReturnValue, ReturnError = Error>(
    this: Future<Result<Ok, Error>>,
    func: (value: Ok) => Result<ReturnValue, ReturnError>,
    propagateCancel = false,
  ): Future<Result<ReturnValue, ReturnError | Error>> {
    return this.map((value) => {
      return value.match({
        Ok: (value) => func(value),
        Error: () =>
          value as unknown as Result<ReturnValue, Error | ReturnError>,
      });
    }, propagateCancel);
  }
  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new ok value and returns a future resolving to this new result
   */
  mapOk<Ok, Error, ReturnValue>(
    this: Future<Result<Ok, Error>>,
    func: (value: Ok) => ReturnValue,
    propagateCancel = false,
  ): Future<Result<ReturnValue, Error>> {
    return this.map((value) => {
      return value.match({
        Ok: (value) => Result.Ok(func(value)),
        Error: () => value as unknown as Result<ReturnValue, Error>,
      });
    }, propagateCancel);
  }
  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Error value and returning a new error value and returns a future resolving to this new result
   */
  mapError<Ok, Error, ReturnValue>(
    this: Future<Result<Ok, Error>>,
    func: (value: Error) => ReturnValue,
    propagateCancel = false,
  ): Future<Result<Ok, ReturnValue>> {
    return this.map((value) => {
      return value.match({
        Ok: () => value as unknown as Result<Ok, ReturnValue>,
        Error: (error) => Result.Error(func(error)),
      });
    }, propagateCancel);
  }
  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a future
   */
  flatMapOk<Ok, Error, ReturnValue, ReturnError = Error>(
    this: Future<Result<Ok, Error>>,
    func: (value: Ok) => Future<Result<ReturnValue, ReturnError>>,
    propagateCancel = false,
  ): Future<Result<ReturnValue, ReturnError | Error>> {
    return this.flatMap((value) => {
      return value.match({
        Ok: (value) =>
          func(value) as Future<Result<ReturnValue, ReturnError | Error>>,
        Error: () =>
          Future.value(
            value as unknown as Result<ReturnValue, ReturnError | Error>,
          ),
      });
    }, propagateCancel);
  }
  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Error value and returning a future
   */
  flatMapError<Ok, Error, ReturnValue, ReturnError>(
    this: Future<Result<Ok, Error>>,
    func: (value: Error) => Future<Result<ReturnValue, ReturnError>>,
    propagateCancel = false,
  ): Future<Result<Ok | ReturnValue, ReturnError>> {
    return this.flatMap((value) => {
      return value.match({
        Ok: () =>
          Future.value(
            value as unknown as Result<Ok | ReturnValue, ReturnError>,
          ),
        Error: (error) =>
          func(error) as Future<Result<Ok | ReturnValue, ReturnError>>,
      });
    }, propagateCancel);
  }
  /**
   * Converts the future into a promise
   */
  toPromise(this: Future<Value>): Promise<Value> {
    return new Promise((resolve) => {
      this.get(resolve);
    });
  }
  /**
   * For Future<Result<*>>:
   *
   * Converts the future into a promise (rejecting if in Error)
   */
  resultToPromise<Ok, Error>(this: Future<Result<Ok, Error>>): Promise<Ok> {
    return new Promise((resolve, reject) => {
      this.get((value) => {
        value.match({
          Ok: resolve,
          Error: reject,
        });
      });
    });
  }
}

const proto = Object.create(
  null,
  Object.getOwnPropertyDescriptors(Future.prototype),
);
