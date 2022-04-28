import { Result } from "./OptionResult";

type PendingPayload<A> = {
  resolveCallbacks?: Array<(value: A) => void>;
  cancelCallbacks?: Array<() => void>;
  cancel?: void | (() => void);
};

function FutureInit<A>(
  this: Future<A>,
  init: (resolver: (value: A) => void) => (() => void) | void,
) {
  const resolver = (value: A) => {
    if (this.tag === "Pending") {
      const pending = this.pending as PendingPayload<A>;
      const resolveCallbacks = pending.resolveCallbacks;
      resolveCallbacks?.forEach((func) => func(value));
      this.tag = "Resolved";
      this.value = value;
      this.pending = undefined;
    }
  };
  const pendingPayload: PendingPayload<A> = {};
  this.tag = "Pending";
  this.pending = pendingPayload;
  pendingPayload.cancel = init(resolver);
}

export class Future<A> {
  /**
   * Creates a new future from its initializer function (like `new Promise(...)`)
   */
  static make = <A>(
    init: (resolver: (value: A) => void) => (() => void) | void,
  ): Future<A> => {
    const future = Object.create(proto);
    FutureInit.call(future, init);
    return future as Future<A>;
  };

  /**
   * Creates a future resolved to the passed value
   */
  static value = <A>(value: A): Future<A> => {
    const future = Object.create(proto);
    FutureInit.call(future, (resolve) => resolve(value));
    return future as Future<A>;
  };

  /**
   * Converts a Promise to a Future\<Result\<Value, unknown>>
   */
  static fromPromise<A>(promise: Promise<A>): Future<Result<A, unknown>> {
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
  value?: A;
  pending?: PendingPayload<A>;
  constructor(_init: (resolver: (value: A) => void) => (() => void) | void) {
    const pendingPayload: PendingPayload<A> = {};
    this.tag = "Pending";
    this.pending = pendingPayload;
  }
  isPending(): this is Future<A> & {
    tag: "Pending";
    value: PendingPayload<A>;
  } {
    return this.tag === "Pending";
  }
  isCancelled(): this is Future<A> & {
    tag: "Cancelled";
    value: undefined;
  } {
    return this.tag === "Cancelled";
  }
  isResolved(): this is Future<A> & {
    tag: "Resolved";
    value: A;
  } {
    return this.tag === "Resolved";
  }
  /**
   * Runs the callback with the future value when resolved
   */
  get(func: (value: A) => void) {
    if (this.isPending()) {
      const pending = this.pending as PendingPayload<A>;
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
  onCancel(func: () => void) {
    if (this.isPending()) {
      const pending = this.pending as PendingPayload<A>;
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
      const pending = this.pending as PendingPayload<A>;
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
  map<B>(func: (value: A) => B, propagateCancel = false): Future<B> {
    const future = Future.make<B>((resolve) => {
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
    return future as Future<B>;
  }
  then(func: (value: A) => void) {
    this.get(func);
    return this;
  }
  /**
   * Returns the Future containing the value from the callback
   *
   * (Future\<A>, A => Future\<B>) => Future\<B>
   */
  flatMap<B>(
    func: (value: A) => Future<B>,
    propagateCancel = false,
  ): Future<B> {
    const future = Future.make<B>((resolve) => {
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
    return future as Future<B>;
  }
  /**
   * Runs the callback and returns `this`
   */
  tap(func: (value: A) => unknown): Future<A> {
    this.get(func);
    return this as Future<A>;
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
  toPromise(): Promise<A> {
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
