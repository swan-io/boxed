import { keys, values } from "./Dict";
import { zip } from "./ZipUnzip";

export class Option<A> {
  /**
   * Create an AsyncData.Some value
   */
  static Some = <A = never>(value: A): Option<A> => {
    const option = Object.create(protoOption) as Option<A>;
    option.value = { tag: "Some", value };
    return option;
  };

  /**
   * Create an Option.None value
   */
  static None = <A = never>(): Option<A> => {
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

  /**
   * Turns an dict of options into a options of dict
   */
  static allFromDict = <Dict extends Record<string, Option<any>>>(
    dict: Dict,
  ): Option<{
    -readonly [P in keyof Dict]: Dict[P] extends Option<infer T> ? T : never;
  }> => {
    const dictKeys = keys(dict);
    return Option.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    );
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
  toResult<E>(valueWhenNone: E): Result<A, E> {
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

export class Result<A, E> {
  /**
   * Create an Result.Ok value
   */
  static Ok = <A = never, E = never>(ok: A): Result<A, E> => {
    const result = Object.create(protoResult) as Result<A, E>;
    result.value = { tag: "Ok", value: ok };
    return result;
  };

  /**
   * Create an Result.Error value
   */
  static Error = <A = never, E = never>(error: E): Result<A, E> => {
    const result = Object.create(protoResult) as Result<A, E>;
    result.value = { tag: "Error", value: error };
    return result;
  };

  /**
   * Runs the function and resolves a result of its return value, or to an error if thrown
   */
  static fromExecution = <A, E = unknown>(func: () => A): Result<A, E> => {
    try {
      return Result.Ok(func());
    } catch (err) {
      return Result.Error(err) as Result<A, E>;
    }
  };

  /**
   * Takes the promise and resolves a result of its value, or to an error if rejected
   */
  static async fromPromise<A, E = unknown>(
    promise: Promise<A>,
  ): Promise<Result<A, E>> {
    try {
      const value = await promise;
      return Result.Ok<A, E>(value);
    } catch (err) {
      return Result.Error<A, E>(err as E);
    }
  }

  /**
   * Takes the option and turns it into Ok(value) is Some, or Error(valueWhenNone)
   */
  static fromOption<A, E>(option: Option<A>, valueWhenNone: E): Result<A, E> {
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

  /**
   * Turns an dict of results into a results of dict
   */
  static allFromDict = <Dict extends Record<string, Result<any, any>>>(
    dict: Dict,
  ): Result<
    {
      -readonly [P in keyof Dict]: Dict[P] extends Result<infer T, any>
        ? T
        : never;
    },
    {
      -readonly [P in keyof Dict]: Dict[P] extends Result<any, infer E>
        ? E
        : never;
    }[keyof Dict]
  > => {
    const dictKeys = keys(dict);
    return Result.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    );
  };

  static equals = <A, E>(
    a: Result<A, E>,
    b: Result<A, E>,
    equals: (a: A, b: A) => boolean,
  ) => {
    if (a.value.tag !== b.value.tag) {
      return false;
    }
    if (a.isError() && b.isError()) {
      return true;
    }
    return equals(a.value.value as unknown as A, b.value.value as unknown as A);
  };

  static pattern = {
    Ok: <T>(x: T) => ({ value: { tag: "Ok", value: x } } as const),
    Error: <T>(x: T) => ({ value: { tag: "Error", value: x } } as const),
  };

  value: { tag: "Ok"; value: A } | { tag: "Error"; value: E };

  constructor() {
    this.value = { tag: "Error", value: undefined as unknown as E };
  }
  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, A => B) => Result\<B>
   */
  map<B>(f: (value: A) => B): Result<B, E> {
    if (this.value.tag === "Ok") {
      return Result.Ok(f(this.value.value));
    } else {
      return this as unknown as Result<B, E>;
    }
  }
  /**
   * Returns the Result containing the error returned from the callback
   *
   * (Result\<A, E>, E => F) => Result\<F>
   */
  mapError<F>(f: (value: E) => F): Result<A, F> {
    if (this.value.tag === "Ok") {
      return this as unknown as Result<A, F>;
    } else {
      return Result.Error(f(this.value.value));
    }
  }
  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, A => Result\<B, F>) => Result\<B, E | F>
   */
  flatMap<B, F = E>(f: (value: A) => Result<B, F>): Result<B, F | E> {
    if (this.value.tag === "Ok") {
      return f(this.value.value);
    } else {
      return this as unknown as Result<B, F | E>;
    }
  }
  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, E => Result\<A, F>) => Result\<A | B, F>
   */
  flatMapError<B, F>(f: (value: E) => Result<B, F>): Result<A | B, F> {
    if (this.value.tag === "Ok") {
      return this as unknown as Result<A | B, F>;
    } else {
      return f(this.value.value);
    }
  }
  /**
   * Return the value if present, and the fallback otherwise
   *
   * (Result\<A, E>, A) => A
   */
  getWithDefault(defaultValue: A): A {
    if (this.value.tag === "Ok") {
      return this.value.value;
    } else {
      return defaultValue;
    }
  }
  /**
   * Explodes the Result given its case
   */
  match<B>(config: { Ok: (value: A) => B; Error: (error: E) => B }): B {
    if (this.value.tag === "Ok") {
      return config.Ok(this.value.value);
    } else {
      return config.Error(this.value.value);
    }
  }
  /**
   * Runs the callback and returns `this`
   */
  tap(func: (result: Result<A, E>) => unknown): Result<A, E> {
    func(this);
    return this;
  }
  /**
   * Runs the callback if ok and returns `this`
   */
  tapOk(func: (value: A) => unknown): Result<A, E> {
    if (this.isOk()) {
      func(this.value.value);
    }
    return this;
  }
  /**
   * Runs the callback if error and returns `this`
   */
  tapError(func: (error: E) => unknown): Result<A, E> {
    if (this.isError()) {
      func(this.value.value);
    }
    return this;
  }
  /**
   * Typeguard
   */
  isOk(): this is Result<A, E> & { value: { tag: "Ok"; value: A } } {
    return this.value.tag === "Ok";
  }
  /**
   * Typeguard
   */
  isError(): this is Result<A, E> & {
    value: { tag: "Error"; value: E };
  } {
    return this.value.tag === "Error";
  }
  /**
   * Return an option of the value
   *
   * (Result\<A, E>) => Option\<A>
   */
  toOption(): Option<A> {
    if (this.value.tag === "Ok") {
      return Option.Some(this.value.value) as Option<A>;
    } else {
      return Option.None() as Option<A>;
    }
  }
  /**
   * Returns the ok value. Use within `if (result.isOk()) { ... }`
   */
  get(this: Result<A, E> & { value: { tag: "Ok"; value: A } }): A {
    return this.value.value;
  }
  /**
   * Returns the error value. Use within `if (result.isError()) { ... }`
   */
  getError(this: Result<A, E> & { value: { tag: "Error"; value: E } }): E {
    return this.value.value;
  }
}

// @ts-expect-error
Result.prototype.__boxed_type__ = "Result";

const protoResult = Object.create(
  null,
  Object.getOwnPropertyDescriptors(Result.prototype),
);
