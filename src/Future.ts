import { Result } from "./Result.js";

type PendingPayload<Value> = {
  resolveCallbacks?: Array<(value: Value) => void>;
  cancelCallbacks?: Array<() => void>;
  cancel?: void | (() => void);
};

export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };

export type Future<Value> =
  | (FutureClass<Value> & { tag: "Pending"; pending: PendingPayload<Value> })
  | (FutureClass<Value> & { tag: "Cancelled" })
  | (FutureClass<Value> & { tag: "Resolved"; value: Value });

class FutureClass<Value> {
  tag: "Pending" | "Cancelled" | "Resolved";
  value?: Value;
  pending?: PendingPayload<Value>;
  constructor(init: (resolver: (value: Value) => void) => (() => void) | void) {
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
  isPending(): this is FutureClass<Value> & {
    tag: "Pending";
    value: PendingPayload<Value>;
  } {
    return this.tag === "Pending";
  }
  isCancelled(): this is FutureClass<Value> & {
    tag: "Cancelled";
    value: undefined;
  } {
    return this.tag === "Cancelled";
  }
  isResolved(): this is FutureClass<Value> & {
    tag: "Resolved";
    value: Value;
  } {
    return this.tag === "Resolved";
  }
  get(func: (value: Value) => void) {
    if (this.isPending()) {
      const pending = this.pending as PendingPayload<Value>;
      pending.resolveCallbacks = pending.resolveCallbacks ?? [];
      pending.resolveCallbacks.push(func);
    }
    if (this.isResolved()) {
      func(this.value);
    }
  }
  onCancel(func: () => void) {
    if (this.isPending()) {
      const pending = this.pending as PendingPayload<Value>;
      pending.cancelCallbacks = pending.cancelCallbacks ?? [];
      pending.cancelCallbacks.push(func);
    }
    if (this.isCancelled()) {
      func();
    }
  }
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
  map<ReturnValue>(
    func: (value: Value) => ReturnValue,
    propagateCancel = false
  ): Future<ReturnValue> {
    const future = new FutureClass<ReturnValue>((resolve) => {
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
  then(func: (value: Value) => void) {
    this.get(func);
    return this;
  }
  flatMap<ReturnValue>(
    func: (value: Value) => Future<ReturnValue>,
    propagateCancel = false
  ): Future<ReturnValue> {
    const future = new FutureClass<ReturnValue>((resolve) => {
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
  tap(func: (value: Value) => unknown): Future<Value> {
    this.get(func);
    return this as Future<Value>;
  }
  tapOk<Ok, Error>(
    this: FutureClass<Result<Ok, Error>>,
    func: (value: Ok) => unknown
  ): Future<Result<Ok, Error>> {
    this.get((value) => {
      value.match({
        Ok: (value) => func(value),
        Error: () => {},
      });
    });
    return this as Future<Result<Ok, Error>>;
  }
  tapError<Ok, Error>(
    this: FutureClass<Result<Ok, Error>>,
    func: (value: Error) => unknown
  ): Future<Result<Ok, Error>> {
    this.get((value) => {
      value.match({
        Ok: () => {},
        Error: (error) => func(error),
      });
    });
    return this as Future<Result<Ok, Error>>;
  }
  mapResult<Ok, Error, ReturnValue>(
    this: FutureClass<Result<Ok, Error>>,
    func: (value: Ok) => Result<ReturnValue, Error>,
    propagateCancel = false
  ): Future<Result<ReturnValue, Error>> {
    return this.map((value) => {
      return value.match({
        Ok: (value) => func(value),
        Error: () => value as unknown as Result<ReturnValue, Error>,
      });
    }, propagateCancel);
  }
  mapOk<Ok, Error, ReturnValue>(
    this: FutureClass<Result<Ok, Error>>,
    func: (value: Ok) => ReturnValue,
    propagateCancel = false
  ): Future<Result<ReturnValue, Error>> {
    return this.map((value) => {
      return value.match({
        Ok: (value) => Result.Ok(func(value)),
        Error: () => value as unknown as Result<ReturnValue, Error>,
      });
    }, propagateCancel);
  }
  mapError<Ok, Error, ReturnValue>(
    this: FutureClass<Result<Ok, Error>>,
    func: (value: Error) => ReturnValue,
    propagateCancel = false
  ): Future<Result<Ok, ReturnValue>> {
    return this.map((value) => {
      return value.match({
        Ok: () => value as unknown as Result<Ok, ReturnValue>,
        Error: (error) => Result.Error(func(error)),
      });
    }, propagateCancel);
  }
  flatMapOk<Ok, Error, ReturnValue>(
    this: FutureClass<Result<Ok, Error>>,
    func: (value: Ok) => Future<Result<ReturnValue, Error>>,
    propagateCancel = false
  ): Future<Result<ReturnValue, Error>> {
    return this.flatMap((value) => {
      return value.match({
        Ok: (value) => func(value),
        Error: () =>
          Future.value(value as unknown as Result<ReturnValue, Error>),
      });
    }, propagateCancel);
  }
  flatMapError<Ok, Error, ReturnValue>(
    this: FutureClass<Result<Ok, Error>>,
    func: (value: Error) => Future<Result<Ok, ReturnValue>>,
    propagateCancel = false
  ): Future<Result<Ok, ReturnValue>> {
    return this.flatMap((value) => {
      return value.match({
        Ok: () => Future.value(value as unknown as Result<Ok, ReturnValue>),
        Error: (error) => func(error),
      });
    }, propagateCancel);
  }
  toPromise(): Promise<Value> {
    return new Promise((resolve) => {
      this.get(resolve);
    });
  }
  resultToPromise<Ok, Error>(
    this: FutureClass<Result<Ok, Error>>
  ): Promise<Ok> {
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

type Unwrap<Value extends Future<any>> = Value extends Future<infer T>
  ? T
  : unknown;

function all<Futures extends readonly Future<any>[] | []>(
  futures: Futures,
  propagateCancel = false
): Future<{
  -readonly [P in keyof Futures]: Futures[P] extends Future<any>
    ? Unwrap<Futures[P]>
    : never;
}> {
  const length = futures.length;
  let acc = Future.value<Array<unknown>>([]);
  let index = 0;
  while (true) {
    if (index >= length) {
      return acc as unknown as Future<{
        -readonly [P in keyof Futures]: Futures[P] extends Future<any>
          ? Unwrap<Futures[P]>
          : never;
      }>;
    }
    const item = futures[index] as Future<unknown>;
    let accCache = acc;
    acc = item.flatMap((value) => {
      return accCache.map((array) => {
        array.push(value);
        return array;
      }, propagateCancel);
    }, propagateCancel);
    index++;
  }
}

export const Future = {
  make: <Value>(
    init: (resolver: (value: Value) => void) => (() => void) | void
  ): Future<Value> => {
    return new FutureClass(init) as Future<Value>;
  },
  value: <Value>(value: Value): Future<Value> => {
    return new FutureClass((resolve) => resolve(value)) as Future<Value>;
  },
  fromPromise<Value>(promise: Promise<Value>): Future<Result<Value, unknown>> {
    return Future.make((resolve) => {
      promise.then(
        (ok) => resolve(Result.Ok(ok)),
        (reason) => resolve(Result.Error(reason))
      );
    });
  },
  all,
};
