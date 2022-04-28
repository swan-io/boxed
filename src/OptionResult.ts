export class Option<A> {
  /**
   * Create an AsyncData.Some value
   */
  static Some = <A>(value: A): Option<A> => {
    const option = Object.create(protoOption) as Option<A>;
    option.value = { tag: "Some", value };
    return option;
  };

  /**
   * Create an Option.None value
   */
  static None = <A>(): Option<A> => {
    return NONE as Option<A>;
  };

  /**
   * Create an Option from a nullable value
   */
  static fromNullable = <A>(nullable: A) => {
    if (nullable == null) {
      return Option.None<NonNullable<A>>();
    } else {
      return Option.Some<NonNullable<A>>(nullable as NonNullable<A>);
    }
  };

  /**
   * Create an Option from a null | value
   */
  static fromNull = <A>(nullable: A) => {
    if (nullable === null) {
      return Option.None<Exclude<A, null>>();
    } else {
      return Option.Some<Exclude<A, null>>(nullable as Exclude<A, null>);
    }
  };

  /**
   * Create an Option from a undefined | value
   */
  static fromUndefined = <A>(nullable: A) => {
    if (nullable === undefined) {
      return Option.None<Exclude<A, undefined>>();
    } else {
      return Option.Some<Exclude<A, undefined>>(
        nullable as Exclude<A, undefined>,
      );
    }
  };

  /**
   * Turns an array of options into an option of array
   */
  static all = <Options extends readonly Option<any>[] | []>(
    options: Options,
  ): Option<{
    -readonly [P in keyof Options]: Options[P] extends Option<infer V>
      ? V
      : never;
  }> => {
    const length = options.length;
    let acc = Option.Some<Array<unknown>>([]);
    let index = 0;
    while (true) {
      if (index >= length) {
        return acc as unknown as Option<{
          -readonly [P in keyof Options]: Options[P] extends Option<infer V>
            ? V
            : never;
        }>;
      }
      const item = options[index] as Option<unknown>;
      acc = acc.flatMap((array) => {
        return item.map((value) => {
          array.push(value);
          return array;
        });
      });
      index++;
    }
  };

  static equals = <A>(
    a: Option<A>,
    b: Option<A>,
    equals: (a: A, b: A) => boolean,
  ) => {
    if (a.isSome() && b.isSome()) {
      return equals(a.value.value, b.value.value);
    }
    return a.value.tag === b.value.tag;
  };

  static pattern = {
    Some: <T>(x: T) => ({ value: { tag: "Some", value: x } } as const),
    None: { value: { tag: "None" } } as const,
  };

  value: { tag: "Some"; value: A } | { tag: "None" };

  constructor() {
    this.value = { tag: "None" };
  }
  /**
   * Returns the Option containing the value from the callback
   *
   * (Option\<A>, A => B) => Option\<B>
   */
  map<B>(f: (value: A) => B): Option<B> {
    if (this.value.tag === "Some") {
      return Option.Some(f(this.value.value));
    } else {
      return this as unknown as Option<B>;
    }
  }
  /**
   * Returns the Option containing the value from the callback
   *
   * (Option\<A>, A => Option\<B>) => Option\<B>
   */
  flatMap<B>(f: (value: A) => Option<B>): Option<B> {
    if (this.value.tag === "Some") {
      return f(this.value.value);
    } else {
      return this as unknown as Option<B>;
    }
  }
  /**
   * Return the value if present, and the fallback otherwise
   *
   * (Option\<A>, A) => A
   */
  getWithDefault(defaultValue: A): A {
    if (this.value.tag === "Some") {
      return this.value.value;
    } else {
      return defaultValue;
    }
  }
  /**
   * Explodes the Option given its case
   */
  match<B>(config: { Some: (value: A) => B; None: () => B }): B {
    if (this.value.tag === "Some") {
      return config.Some(this.value.value);
    } else {
      return config.None();
    }
  }
  /**
   * Runs the callback and returns `this`
   */
  tap(func: (option: Option<A>) => unknown): Option<A> {
    func(this);
    return this;
  }
  /**
   * Converts the Option\<A> to a `A | undefined`
   */
  toUndefined() {
    if (this.value.tag === "None") {
      return undefined;
    } else {
      return this.value.value;
    }
  }
  /**
   * Converts the Option\<A> to a `A | null`
   */
  toNull() {
    if (this.value.tag === "None") {
      return null;
    } else {
      return this.value.value;
    }
  }
  /**
   * Takes the option and turns it into Ok(value) is Some, or Error(valueWhenNone)
   */
  toResult<Error>(valueWhenNone: Error): Result<A, Error> {
    return this.match({
      Some: (ok) => Result.Ok(ok),
      None: () => Result.Error(valueWhenNone),
    });
  }

  /**
   * Typeguard
   */
  isSome(): this is Option<A> & { value: { tag: "Some"; value: A } } {
    return this.value.tag === "Some";
  }
  /**
   * Typeguard
   */
  isNone(): this is Option<A> & { value: { tag: "None" } } {
    return this.value.tag === "None";
  }

  /**
   * Returns the value. Use within `if (option.isSome()) { ... }`
   */
  get(this: Option<A> & { value: { tag: "Some"; value: A } }): A {
    return this.value.value;
  }
}

// @ts-expect-error
Option.prototype.__boxed_type__ = "Option";

const protoOption = Object.create(
  null,
  Object.getOwnPropertyDescriptors(Option.prototype),
);

const NONE = (() => {
  const none = Object.create(protoOption);
  none.value = { tag: "None" };
  return none;
})();

export class Result<Ok, Error> {
  /**
   * Create an Result.Ok value
   */
  static Ok = <Ok, Error>(ok: Ok): Result<Ok, Error> => {
    const result = Object.create(protoResult) as Result<Ok, Error>;
    result.value = { tag: "Ok", value: ok };
    return result;
  };

  /**
   * Create an Result.Error value
   */
  static Error = <Ok, Error>(error: Error): Result<Ok, Error> => {
    const result = Object.create(protoResult) as Result<Ok, Error>;
    result.value = { tag: "Error", value: error };
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
   * Takes the option and turns it into Ok(value) is Some, or Error(valueWhenNone)
   */
  static fromOption<A, Error>(
    option: Option<A>,
    valueWhenNone: Error,
  ): Result<A, Error> {
    return option.toResult(valueWhenNone);
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
    if (a.value.tag !== b.value.tag) {
      return false;
    }
    if (a.isError() && b.isError()) {
      return true;
    }
    return equals(
      a.value.value as unknown as Value,
      b.value.value as unknown as Value,
    );
  };

  static pattern = {
    Ok: <T>(x: T) => ({ value: { tag: "Ok", value: x } } as const),
    Error: <T>(x: T) => ({ value: { tag: "Error", value: x } } as const),
  };

  value: { tag: "Ok"; value: Ok } | { tag: "Error"; value: Error };

  constructor() {
    this.value = { tag: "Error", value: undefined as unknown as Error };
  }
  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, A => B) => Result\<B>
   */
  map<ReturnValue>(f: (value: Ok) => ReturnValue): Result<ReturnValue, Error> {
    if (this.value.tag === "Ok") {
      return Result.Ok(f(this.value.value));
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
    if (this.value.tag === "Ok") {
      return this as unknown as Result<Ok, ReturnError>;
    } else {
      return Result.Error(f(this.value.value));
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
    if (this.value.tag === "Ok") {
      return f(this.value.value);
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
    if (this.value.tag === "Ok") {
      return this as unknown as Result<Ok | ReturnValue, ResultError>;
    } else {
      return f(this.value.value);
    }
  }
  /**
   * Return the value if present, and the fallback otherwise
   *
   * (Result\<A, E>, A) => A
   */
  getWithDefault(defaultValue: Ok): Ok {
    if (this.value.tag === "Ok") {
      return this.value.value;
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
    if (this.value.tag === "Ok") {
      return config.Ok(this.value.value);
    } else {
      return config.Error(this.value.value);
    }
  }
  /**
   * Runs the callback and returns `this`
   */
  tap(func: (result: Result<Ok, Error>) => unknown): Result<Ok, Error> {
    func(this);
    return this;
  }
  /**
   * Runs the callback if ok and returns `this`
   */
  tapOk(func: (value: Ok) => unknown): Result<Ok, Error> {
    if (this.isOk()) {
      func(this.value.value);
    }
    return this;
  }
  /**
   * Runs the callback if error and returns `this`
   */
  tapError(func: (error: Error) => unknown): Result<Ok, Error> {
    if (this.isError()) {
      func(this.value.value);
    }
    return this;
  }
  /**
   * Typeguard
   */
  isOk(): this is Result<Ok, Error> & { value: { tag: "Ok"; value: Ok } } {
    return this.value.tag === "Ok";
  }
  /**
   * Typeguard
   */
  isError(): this is Result<Ok, Error> & {
    value: { tag: "Error"; value: Error };
  } {
    return this.value.tag === "Error";
  }
  /**
   * Return an option of the value
   *
   * (Result\<A, E>) => Option\<A>
   */
  toOption(): Option<Ok> {
    if (this.value.tag === "Ok") {
      return Option.Some(this.value.value) as Option<Ok>;
    } else {
      return Option.None() as Option<Ok>;
    }
  }
  /**
   * Returns the ok value. Use within `if (result.isOk()) { ... }`
   */
  get(this: Result<Ok, Error> & { value: { tag: "Ok"; value: Ok } }): Ok {
    return this.value.value;
  }
  /**
   * Returns the error value. Use within `if (result.isError()) { ... }`
   */
  getError(
    this: Result<Ok, Error> & { value: { tag: "Error"; value: Error } },
  ): Error {
    return this.value.value;
  }
}

// @ts-expect-error
Result.prototype.__boxed_type__ = "Result";

const protoResult = Object.create(
  null,
  Object.getOwnPropertyDescriptors(Result.prototype),
);
