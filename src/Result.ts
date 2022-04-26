import { Option } from "./Option";

export class Result<Ok, Error> {
  /**
   * Create an Result.Ok value
   */
  static Ok = <Ok, Error>(ok: Ok): Result<Ok, Error> => {
    const result = Object.create(proto) as Result<Ok, Error>;
    result.tag = "Ok";
    result.value = ok;
    return result;
  };

  /**
   * Create an Result.Error value
   */
  static Error = <Ok, Error>(error: Error): Result<Ok, Error> => {
    const result = Object.create(proto) as Result<Ok, Error>;
    result.tag = "Error";
    result.error = error;
    return result;
  };

  /**
   * Runs the function and resolves a result of its return value, or to an error if thrown
   */
  static fromExecution = <ReturnValue, Error = unknown>(
    func: () => ReturnValue,
  ): Result<ReturnValue, Error> => {
    try {
      return Result.Ok(func());
    } catch (err) {
      return Result.Error(err) as Result<ReturnValue, Error>;
    }
  };

  /**
   * Takes the promise and resolves a result of its value, or to an error if rejected
   */
  static async fromPromise<ReturnValue, Error = unknown>(
    promise: Promise<ReturnValue>,
  ): Promise<Result<ReturnValue, Error>> {
    try {
      const value = await promise;
      return Result.Ok<ReturnValue, Error>(value);
    } catch (err) {
      return Result.Error<ReturnValue, Error>(err as Error);
    }
  }

  /**
   * Turns an array of results into an result of array
   */
  static all = <Results extends readonly Result<any, any>[] | []>(
    results: Results,
  ): Result<
    {
      -readonly [P in keyof Results]: Results[P] extends Result<infer V, any>
        ? V
        : never;
    },
    {
      -readonly [P in keyof Results]: Results[P] extends Result<any, infer E>
        ? E
        : never;
    }[number]
  > => {
    const length = results.length;
    let acc = Result.Ok<Array<unknown>, unknown>([]);
    let index = 0;
    while (true) {
      if (index >= length) {
        return acc as unknown as Result<
          {
            -readonly [P in keyof Results]: Results[P] extends Result<
              infer V,
              any
            >
              ? V
              : never;
          },
          {
            -readonly [P in keyof Results]: Results[P] extends Result<
              any,
              infer E
            >
              ? E
              : never;
          }[number]
        >;
      }
      const item = results[index] as Result<unknown, unknown>;
      acc = acc.flatMap((array) => {
        return item.map((value) => {
          array.push(value);
          return array;
        });
      });
      index++;
    }
  };

  static equals = <Value, Error>(
    a: Result<Value, Error>,
    b: Result<Value, Error>,
    equals: (a: Value, b: Value) => boolean,
  ) => {
    if (a.tag !== b.tag) {
      return false;
    }
    if (a.tag === "Error" && b.tag === "Error") {
      return true;
    }
    return equals(a.value as unknown as Value, b.value as unknown as Value);
  };

  static pattern = {
    Ok: <T>(x: T) => ({ tag: "Ok", value: x } as const),
    Error: <T>(x: T) => ({ tag: "Error", error: x } as const),
  };

  tag: "Ok" | "Error";
  value: Ok | undefined;
  error: Error | undefined;
  constructor() {
    this.tag = undefined as unknown as "Ok" | "Error";
    this.value = undefined as unknown as Ok;
    this.error = undefined as unknown as Error;
  }
  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, A => B) => Result\<B>
   */
  map<ReturnValue>(f: (value: Ok) => ReturnValue): Result<ReturnValue, Error> {
    if (this.tag === "Ok") {
      return Result.Ok(f(this.value as Ok));
    } else {
      return this as unknown as Result<ReturnValue, Error>;
    }
  }
  /**
   * Returns the Result containing the error returned from the callback
   *
   * (Result\<A, E>, E => F) => Result\<F>
   */
  mapError<ReturnError>(
    f: (value: Error) => ReturnError,
  ): Result<Ok, ReturnError> {
    if (this.tag === "Ok") {
      return this as unknown as Result<Ok, ReturnError>;
    } else {
      return Result.Error(f(this.error as Error));
    }
  }
  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, A => Result\<B, F>) => Result\<B, E | F>
   */
  flatMap<ReturnValue, ResultError = Error>(
    f: (value: Ok) => Result<ReturnValue, ResultError | Error>,
  ): Result<ReturnValue, ResultError | Error> {
    if (this.tag === "Ok") {
      return f(this.value as Ok);
    } else {
      return this as unknown as Result<ReturnValue, ResultError | Error>;
    }
  }
  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, E => Result\<A, F>) => Result\<A | B, F>
   */
  flatMapError<ReturnValue, ResultError>(
    f: (value: Error) => Result<ReturnValue, ResultError>,
  ): Result<Ok | ReturnValue, ResultError> {
    if (this.tag === "Ok") {
      return this as unknown as Result<Ok | ReturnValue, ResultError>;
    } else {
      return f(this.error as Error);
    }
  }
  /**
   * Return the value if present, and the fallback otherwise
   *
   * (Result\<A, E>, A) => A
   */
  getWithDefault(defaultValue: Ok): Ok {
    if (this.tag === "Ok") {
      return this.value as Ok;
    } else {
      return defaultValue;
    }
  }
  /**
   * Explodes the Result given its case
   */
  match<ReturnValue>(config: {
    Ok: (value: Ok) => ReturnValue;
    Error: (error: Error) => ReturnValue;
  }): ReturnValue {
    if (this.tag === "Ok") {
      return config.Ok(this.value as Ok);
    } else {
      return config.Error(this.error as Error);
    }
  }
  /**
   * Runs the callback and returns `this`
   */
  tap(
    this: Result<Ok, Error>,
    func: (result: Result<Ok, Error>) => unknown,
  ): Result<Ok, Error> {
    func(this);
    return this;
  }
  /**
   * Runs the callback if ok and returns `this`
   */
  tapOk(
    this: Result<Ok, Error>,
    func: (value: Ok) => unknown,
  ): Result<Ok, Error> {
    if (this.isOk()) {
      func(this.value);
    }
    return this;
  }
  /**
   * Runs the callback if error and returns `this`
   */
  tapError(
    this: Result<Ok, Error>,
    func: (error: Error) => unknown,
  ): Result<Ok, Error> {
    if (this.isError()) {
      func(this.error);
    }
    return this;
  }
  /**
   * Typeguard
   */
  isOk(): this is Result<Ok, Error> & { tag: "Ok"; value: Ok } {
    return this.tag === "Ok";
  }
  /**
   * Typeguard
   */
  isError(): this is Result<Ok, Error> & { tag: "Error"; error: Error } {
    return this.tag === "Error";
  }
  /**
   * Return an option of the value
   *
   * (Result\<A, E>) => Option\<A>
   */
  toOption(): Option<Ok> {
    if (this.tag === "Ok") {
      return Option.Some(this.value) as Option<Ok>;
    } else {
      return Option.None() as Option<Ok>;
    }
  }
}

// @ts-expect-error
Result.prototype.__boxed_type__ = "Result";

const proto = Object.create(
  null,
  Object.getOwnPropertyDescriptors(Result.prototype),
);
