import { keys, values } from "./Dict";
import { Result } from "./OptionResult";
import { LooseRecord } from "./types";
import { zip } from "./ZipUnzip";

function FutureInit<A>(
  this: Future<A>,
  init: (resolver: (value: A) => void) => (() => void) | void,
) {
  const resolver = (value: A) => {
    if (this._state.tag === "Pending") {
      this._state.resolveCallbacks?.forEach((func) => func(value));
      this._state = { tag: "Resolved", value };
    }
  };

  this._state = { tag: "Pending" };
  this._state.cancel = init(resolver);
}

export class Future<A> {
  /**
   * Creates a new future from its initializer function (like `new Promise(...)`)
   */
  static make = <A>(
    init: (resolver: (value: A) => void) => (() => void) | void,
  ): Future<A> => {
    const future = Object.create(futureProto);
    FutureInit.call(future, init);
    return future as Future<A>;
  };

  /**
   * Creates a future resolved to the passed value
   */
  static value = <A>(value: A): Future<A> => {
    const future = Object.create(futureProto);
    future._state = { tag: "Resolved", value };
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
  ) => {
    const length = futures.length;
    let acc = Future.value<Array<unknown>>([]);
    let index = 0;

    while (true) {
      if (index >= length) {
        return acc as unknown as Future<{
          [K in keyof Futures]: Futures[K] extends Future<infer T> ? T : never;
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
  static allFromDict = <Dict extends LooseRecord<Future<any>>>(
    dict: Dict,
  ): Future<{
    [K in keyof Dict]: Dict[K] extends Future<infer T> ? T : never;
  }> => {
    const dictKeys = keys(dict);

    return Future.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    );
  };

  // Not accessible from the outside
  protected _state:
    | {
        tag: "Pending";
        resolveCallbacks?: Array<(value: A) => void>;
        cancel?: void | (() => void);
        cancelCallbacks?: Array<() => void>;
      }
    | { tag: "Cancelled" }
    | { tag: "Resolved"; value: A };

  protected constructor(
    _init: (resolver: (value: A) => void) => (() => void) | void,
  ) {
    this._state = { tag: "Pending" };
  }

  /**
   * Runs the callback with the future value when resolved
   */
  onResolve(func: (value: A) => void) {
    if (this._state.tag === "Pending") {
      this._state.resolveCallbacks = this._state.resolveCallbacks ?? [];
      this._state.resolveCallbacks.push(func);
    } else if (this._state.tag === "Resolved") {
      func(this._state.value);
    }
  }

  /**
   * Runs the callback if and when the future is cancelled
   */
  onCancel(func: () => void) {
    if (this._state.tag === "Pending") {
      this._state.cancelCallbacks = this._state.cancelCallbacks ?? [];
      this._state.cancelCallbacks.push(func);
    } else if (this._state.tag === "Cancelled") {
      func();
    }
  }

  /**
   * Cancels the future
   */
  cancel() {
    if (this._state.tag === "Pending") {
      const { cancel, cancelCallbacks } = this._state;
      // We have to set the future as cancelled first to avoid an infinite loop
      this._state = { tag: "Cancelled" };
      cancel?.();
      cancelCallbacks?.forEach((func) => func());
    }
  }

  /**
   * Returns the Future containing the value from the callback
   *
   * (Future\<A>, A => B) => Future\<B>
   */
  map<B>(func: (value: A) => B, propagateCancel = false): Future<B> {
    const future = Future.make<B>((resolve) => {
      this.onResolve((value) => {
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
    this.onResolve(func);
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
      this.onResolve((value) => {
        const returnedFuture = func(value);
        returnedFuture.onResolve(resolve);
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
  tap(this: Future<A>, func: (value: A) => unknown): Future<A> {
    this.onResolve(func);
    return this;
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
    this.onResolve((value) => {
      value.match({
        Ok: (value) => func(value),
        Error: () => {},
      });
    });

    return this;
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
    this.onResolve((value) => {
      value.match({
        Ok: () => {},
        Error: (error) => func(error),
      });
    });

    return this;
  }

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new result and returns a future resolving to this new result
   */
  mapResult<A, E, B, F>(
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
  flatMapOk<A, E, B, F>(
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
      this.onResolve(resolve);
    });
  }

  /**
   * For Future<Result<*>>:
   *
   * Converts the future into a promise (rejecting if in Error)
   */
  resultToPromise<A, E>(this: Future<Result<A, E>>): Promise<A> {
    return new Promise((resolve, reject) => {
      this.onResolve((value) => {
        value.match({
          Ok: resolve,
          Error: reject,
        });
      });
    });
  }
}

const futureProto = Object.create(
  null,
  Object.getOwnPropertyDescriptors(Future.prototype),
);
