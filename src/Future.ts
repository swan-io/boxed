import { keys, values } from "./Dict";
import { Result } from "./OptionResult";
import { LooseRecord, Remap } from "./types";
import { zip } from "./ZipUnzip";

interface IFuture<A> {
  /**
   * Runs the callback with the future value when resolved
   */
  get(this: Future<A>, func: (value: A) => void): void;

  /**
   * Runs the callback if and when the future is cancelled
   */
  onCancel(this: Future<A>, func: () => void): void;

  /**
   * Cancels the future
   */
  cancel(this: Future<A>): void;

  /**
   * Returns the Future containing the value from the callback
   *
   * (Future\<A>, A => B) => Future\<B>
   */
  map<B>(
    this: Future<A>,
    func: (value: A) => B,
    propagateCancel?: boolean,
  ): Future<B>;

  /**
   * Returns the Future containing the value from the callback
   *
   * (Future\<A>, A => Future\<B>) => Future\<B>
   */
  flatMap<B>(
    this: Future<A>,
    func: (value: A) => Future<B>,
    propagateCancel?: boolean,
  ): Future<B>;

  /**
   * Runs the callback and returns `this`
   */
  tap(this: Future<A>, func: (value: A) => unknown): Future<A>;

  /**
   * For Future<Result<*>>:
   *
   * Runs the callback with the value if ok and returns `this`
   */
  tapOk<A, E>(
    this: Future<Result<A, E>>,
    func: (value: A) => unknown,
  ): Future<Result<A, E>>;

  /**
   * For Future<Result<*>>:
   *
   * Runs the callback with the error if in error and returns `this`
   */
  tapError<A, E>(
    this: Future<Result<A, E>>,
    func: (value: E) => unknown,
  ): Future<Result<A, E>>;

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new result and returns a future resolving to this new result
   */
  mapResult<A, E, B, F = E>(
    this: Future<Result<A, E>>,
    func: (value: A) => Result<B, F>,
    propagateCancel?: boolean,
  ): Future<Result<B, F | E>>;

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new ok value and returns a future resolving to this new result
   */
  mapOk<A, E, B>(
    this: Future<Result<A, E>>,
    func: (value: A) => B,
    propagateCancel?: boolean,
  ): Future<Result<B, E>>;

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Error value and returning a new error value and returns a future resolving to this new result
   */
  mapError<A, E, B>(
    this: Future<Result<A, E>>,
    func: (value: E) => B,
    propagateCancel?: boolean,
  ): Future<Result<A, B>>;

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a future
   */
  flatMapOk<A, E, B, F = E>(
    this: Future<Result<A, E>>,
    func: (value: A) => Future<Result<B, F>>,
    propagateCancel?: boolean,
  ): Future<Result<B, F | E>>;

  /**
   * For Future<Result<*>>:
   *
   * Takes a callback taking the Error value and returning a future
   */
  flatMapError<A, E, B, F>(
    this: Future<Result<A, E>>,
    func: (value: E) => Future<Result<B, F>>,
    propagateCancel?: boolean,
  ): Future<Result<A | B, F>>;

  /**
   * Converts the future into a promise
   */
  toPromise(this: Future<A>): Promise<A>;

  /**
   * For Future<Result<*>>:
   *
   * Converts the future into a promise (rejecting if in Error)
   */
  resultToPromise<A, E>(this: Future<Result<A, E>>): Promise<A>;
}

export type Future<A> = Remap<IFuture<A>> & {
  step:
    | {
        tag: "Pending";
        resolveCallbacks?: ((value: A) => void)[];
        cancel?: void | (() => void);
        cancelCallbacks?: (() => void)[];
      }
    | { tag: "Cancelled" }
    | { tag: "Resolved"; value: A };
};

const futureProto = (<A>(): IFuture<A> => ({
  get(this: Future<A>, func: (value: A) => void) {
    if (this.step.tag === "Pending") {
      this.step.resolveCallbacks = this.step.resolveCallbacks ?? [];
      this.step.resolveCallbacks.push(func);
    } else if (this.step.tag === "Resolved") {
      func(this.step.value);
    }
  },

  onCancel(this: Future<A>, func: () => void) {
    if (this.step.tag === "Pending") {
      this.step.cancelCallbacks = this.step.cancelCallbacks ?? [];
      this.step.cancelCallbacks.push(func);
    } else if (this.step.tag === "Cancelled") {
      func();
    }
  },

  cancel(this: Future<A>) {
    if (this.step.tag === "Pending") {
      this.step.cancel?.();
      this.step.cancelCallbacks?.forEach((func) => func());
      this.step = { tag: "Cancelled" };
    }
  },

  map<B>(this: Future<A>, func: (value: A) => B, propagateCancel = false) {
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
  },

  flatMap<B>(
    this: Future<A>,
    func: (value: A) => Future<B>,
    propagateCancel = false,
  ) {
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
  },

  tap(this: Future<A>, func: (value: A) => unknown) {
    this.get(func);
    return this;
  },

  tapOk<A, E>(this: Future<Result<A, E>>, func: (value: A) => unknown) {
    this.get((value) => {
      value.match({
        Ok: (value) => func(value),
        Error: () => {},
      });
    });

    return this;
  },

  tapError<A, E>(this: Future<Result<A, E>>, func: (value: E) => unknown) {
    this.get((value) => {
      value.match({
        Ok: () => {},
        Error: (error) => func(error),
      });
    });

    return this;
  },

  mapResult<A, E, B, F = E>(
    this: Future<Result<A, E>>,
    func: (value: A) => Result<B, F>,
    propagateCancel = false,
  ) {
    return this.map((value) => {
      return value.match({
        Ok: (value) => func(value),
        Error: () => value as unknown as Result<B, E | F>,
      });
    }, propagateCancel);
  },

  mapOk<A, E, B>(
    this: Future<Result<A, E>>,
    func: (value: A) => B,
    propagateCancel = false,
  ) {
    return this.map((value) => {
      return value.match({
        Ok: (value) => Result.Ok(func(value)),
        Error: () => value as unknown as Result<B, E>,
      });
    }, propagateCancel);
  },

  mapError<A, E, B>(
    this: Future<Result<A, E>>,
    func: (value: E) => B,
    propagateCancel = false,
  ) {
    return this.map((value) => {
      return value.match({
        Ok: () => value as unknown as Result<A, B>,
        Error: (error) => Result.Error(func(error)),
      });
    }, propagateCancel);
  },

  flatMapOk<A, E, B, F = E>(
    this: Future<Result<A, E>>,
    func: (value: A) => Future<Result<B, F>>,
    propagateCancel = false,
  ) {
    return this.flatMap((value) => {
      return value.match({
        Ok: (value) => func(value) as Future<Result<B, F | E>>,
        Error: () => Future.value(value as unknown as Result<B, F | E>),
      });
    }, propagateCancel);
  },

  flatMapError<A, E, B, F>(
    this: Future<Result<A, E>>,
    func: (value: E) => Future<Result<B, F>>,
    propagateCancel = false,
  ) {
    return this.flatMap((value) => {
      return value.match({
        Ok: () => Future.value(value as unknown as Result<A | B, F>),
        Error: (error) => func(error) as Future<Result<A | B, F>>,
      });
    }, propagateCancel);
  },

  toPromise(this: Future<A>) {
    return new Promise((resolve: (value: A) => void) => {
      this.get(resolve);
    });
  },

  resultToPromise<A, E>(this: Future<Result<A, E>>) {
    return new Promise((resolve: (value: A) => void, reject) => {
      this.get((value) => {
        value.match({
          Ok: resolve,
          Error: reject,
        });
      });
    });
  },
}))();

const make = <A>(
  init: (resolver: (value: A) => void) => (() => void) | void,
): Future<A> => {
  const future = Object.create(futureProto) as Future<A>;
  future.step = { tag: "Pending" };

  future.step.cancel = init((value: A) => {
    if (future.step.tag === "Pending") {
      future.step.resolveCallbacks?.forEach((func) => func(value));
      future.step = { tag: "Resolved", value };
    }
  });

  return future;
};

const value = <A>(value: A): Future<A> => {
  const future = Object.create(futureProto) as Future<A>;
  future.step = { tag: "Resolved", value };
  return future;
};

export const Future = {
  /**
   * Creates a new future from its initializer function (like `new Promise(...)`)
   */
  make,

  /**
   * Creates a future resolved to the passed value
   */
  value,

  /**
   * Converts a Promise to a Future\<Result\<Value, unknown>>
   */
  fromPromise<A>(promise: Promise<A>): Future<Result<A, unknown>> {
    return make((resolve) => {
      promise.then(
        (ok) => resolve(Result.Ok(ok)),
        (reason) => resolve(Result.Error(reason)),
      );
    });
  },

  /**
   * Turns an array of futures into a future of array
   */
  all<Futures extends Future<any>[] | []>(
    futures: Futures,
    propagateCancel = false,
  ) {
    const length = futures.length;
    let acc = Future.value<Array<unknown>>([]);
    let index = 0;

    while (true) {
      if (index >= length) {
        return acc as Future<{
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
  },

  /**
   * Turns an dict of futures into a future of dict
   */
  allFromDict<Dict extends LooseRecord<Future<any>>>(
    dict: Dict,
  ): Future<{
    [K in keyof Dict]: Dict[K] extends Future<infer T> ? T : never;
  }> {
    const dictKeys = keys(dict);

    return Future.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    );
  },
};
