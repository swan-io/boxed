import { keys, values } from "./Dict";
import { Result } from "./OptionResult";
import { zip } from "./ZipUnzip";

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

      const item = futures[index];

      if (item != null) {
        acc = acc.flatMap((array) => {
          return item.map((value) => {
            array.push(value);
            return array;
          }, propagateCancel);
        }, propagateCancel);
      }

      index++;
    }
  };

  /**
   * Turns an dict of futures into a future of dict
   */
  static allFromDict = <Dict extends Record<string, Future<any>>>(
    dict: Dict,
  ): Future<{
    -readonly [P in keyof Dict]: Dict[P] extends Future<infer T> ? T : never;
  }> => {
    const dictKeys = keys(dict);

    return Future.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    );
  };

  tag: "Pending" | "Cancelled" | "Resolved";
  value?: A;
  pending?: PendingPayload<A>;

  constructor(_init: (resolver: (value: A) => void) => (() => void) | void) {
    const pendingPayload: PendingPayload<A> = {};
    this.tag = "Pending";
    this.pending = pendingPayload;
  }

  private isPending(): this is Future<A> & {
    tag: "Pending";
    pending: PendingPayload<A>;
  } {
    return this.tag === "Pending";
  }

  private isCancelled(): this is Future<A> & {
    tag: "Cancelled";
    value: undefined;
  } {
    return this.tag === "Cancelled";
  }

  private isResolved(): this is Future<A> & {
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

    return future;
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

    return future;
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
  tapOk<A, E>(
    this: Future<Result<A, E>>,
    func: (value: A) => unknown,
  ): Future<Result<A, E>> {
    this.get((value) => {
      value.match({
        Ok: (value) => func(value),
        Error: () => {},
      });
    });

    return this as Future<Result<A, E>>;
  }

  /**
   * For Future<Result<*>>:
   *
   * Runs the callback with the error if in error and returns `this`
   */
  tapError<A, E>(
    this: Future<Result<A, E>>,
    func: (value: E) => unknown,
  ): Future<Result<A, E>> {
    this.get((value) => {
      value.match({
        Ok: () => {},
        Error: (error) => func(error),
      });
    });

    return this as Future<Result<A, E>>;
  }

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new result and returns a future resolving to this new result
   */
  mapResult<A, E, B, F = E>(
    this: Future<Result<A, E>>,
    func: (value: A) => Result<B, F>,
    propagateCancel = false,
  ): Future<Result<B, F | E>> {
    return this.map((value) => {
      return value.match({
        Ok: (value) => func(value),
        Error: () => value as unknown as Result<B, E | F>,
      });
    }, propagateCancel);
  }

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new ok value and returns a future resolving to this new result
   */
  mapOk<A, E, B>(
    this: Future<Result<A, E>>,
    func: (value: A) => B,
    propagateCancel = false,
  ): Future<Result<B, E>> {
    return this.map((value) => {
      return value.match({
        Ok: (value) => Result.Ok(func(value)),
        Error: () => value as unknown as Result<B, E>,
      });
    }, propagateCancel);
  }

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Error value and returning a new error value and returns a future resolving to this new result
   */
  mapError<A, E, B>(
    this: Future<Result<A, E>>,
    func: (value: E) => B,
    propagateCancel = false,
  ): Future<Result<A, B>> {
    return this.map((value) => {
      return value.match({
        Ok: () => value as unknown as Result<A, B>,
        Error: (error) => Result.Error(func(error)),
      });
    }, propagateCancel);
  }
  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a future
   */
  flatMapOk<A, E, B, F = E>(
    this: Future<Result<A, E>>,
    func: (value: A) => Future<Result<B, F>>,
    propagateCancel = false,
  ): Future<Result<B, F | E>> {
    return this.flatMap((value) => {
      return value.match({
        Ok: (value) => func(value) as Future<Result<B, F | E>>,
        Error: () => Future.value(value as unknown as Result<B, F | E>),
      });
    }, propagateCancel);
  }

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Error value and returning a future
   */
  flatMapError<A, E, B, F>(
    this: Future<Result<A, E>>,
    func: (value: E) => Future<Result<B, F>>,
    propagateCancel = false,
  ): Future<Result<A | B, F>> {
    return this.flatMap((value) => {
      return value.match({
        Ok: () => Future.value(value as unknown as Result<A | B, F>),
        Error: (error) => func(error) as Future<Result<A | B, F>>,
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
  resultToPromise<A, E>(this: Future<Result<A, E>>): Promise<A> {
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
