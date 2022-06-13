import { keys, values } from "./Dict";
import { LooseRecord, Remap } from "./types";
import { zip } from "./ZipUnzip";

interface IOption<A> {
  /**
   * Returns the Option containing the value from the callback
   *
   * (Option\<A>, A => B) => Option\<B>
   */
  map<B>(this: Option<A>, func: (value: A) => B): Option<B>;

  /**
   * Returns the Option containing the value from the callback
   *
   * (Option\<A>, A => Option\<B>) => Option\<B>
   */
  flatMap<B>(this: Option<A>, func: (value: A) => Option<B>): Option<B>;

  /**
   * Return the value if present, and the fallback otherwise
   *
   * (Option\<A>, A) => A
   */
  getWithDefault(this: Option<A>, defaultValue: A): A;

  /**
   * Explodes the Option given its case
   */
  match<B>(
    this: Option<A>,
    config: { Some: (value: A) => B; None: () => B },
  ): B;

  /**
   * Runs the callback and returns `this`
   */
  tap(this: Option<A>, func: (option: Option<A>) => unknown): Option<A>;

  /**
   * Converts the Option\<A> to a `A | undefined`
   */
  toUndefined(this: Option<A>): A | undefined;

  /**
   * Converts the Option\<A> to a `A | null`
   */
  toNull(this: Option<A>): A | null;

  /**
   * Takes the option and turns it into Ok(value) is Some, or Error(valueWhenNone)
   */
  toResult<E>(this: Option<A>, valueWhenNone: E): Result<A, E>;

  /**
   * Typeguard
   */
  isSome(this: Option<A>): this is Some<A>;

  /**
   * Typeguard
   */
  isNone(this: Option<A>): this is None<A>;
}

type Some<A> = Remap<IOption<A>> & {
  tag: "Some";
  value: A;

  /**
   * Returns the value. Use within `if (option.isSome()) { ... }`
   */
  get(this: Some<A>): A;
};

type None<A> = Remap<IOption<A>> & {
  tag: "None";
};

export type Option<A> = Some<A> | None<A>;

const optionProto = (<A>(): IOption<A> => ({
  map<B>(this: Option<A>, func: (value: A) => B) {
    return this.tag === "Some"
      ? Some(func(this.value))
      : (this as unknown as Option<B>);
  },

  flatMap<B>(this: Option<A>, func: (value: A) => Option<B>) {
    return this.tag === "Some"
      ? func(this.value)
      : (this as unknown as Option<B>);
  },

  getWithDefault(this: Option<A>, defaultValue: A) {
    return this.tag === "Some" ? this.value : defaultValue;
  },

  match<B>(this: Option<A>, config: { Some: (value: A) => B; None: () => B }) {
    return this.tag === "Some" ? config.Some(this.value) : config.None();
  },

  tap(this: Option<A>, func: (option: Option<A>) => unknown) {
    func(this);
    return this;
  },

  toUndefined(this: Option<A>) {
    return this.tag === "Some" ? this.value : undefined;
  },

  toNull(this: Option<A>) {
    return this.tag === "Some" ? this.value : null;
  },

  toResult<E>(this: Option<A>, valueWhenNone: E): Result<A, E> {
    return this.match({
      Some: (ok) => Result.Ok(ok),
      None: () => Result.Error(valueWhenNone),
    });
  },

  isSome(this: Option<A>): boolean {
    return this.tag === "Some";
  },

  isNone(this: Option<A>): boolean {
    return this.tag === "None";
  },
}))();

// @ts-expect-error
optionProto.__boxed_type__ = "Option";

const someProto = (<A>(): Omit<Some<A>, "tag" | "value"> => ({
  ...(optionProto as IOption<A>),

  get() {
    return this.value;
  },
}))();

const Some = <A = never>(value: A): Option<A> => {
  const option = Object.create(someProto) as Some<A>;
  option.tag = "Some";
  option.value = value;
  return option;
};

const NONE = (() => {
  const option = Object.create(optionProto) as None<unknown>;
  option.tag = "None";
  return option;
})();

const None = <A = never>(): Option<A> => NONE as None<A>;

export const Option = {
  /**
   * Create an Option.Some value
   */
  Some,

  /**
   * Create an Option.None value
   */
  None,

  /**
   * Create an Option from a nullable value
   */
  fromNullable<A>(nullable: A | null | undefined): Option<A> {
    return nullable == null ? None<A>() : Some<A>(nullable);
  },

  /**
   * Create an Option from a value | null
   */
  fromNull<A>(nullable: A | null): Option<A> {
    return nullable === null ? None<A>() : Some<A>(nullable);
  },

  /**
   * Create an Option from a undefined | value
   */
  fromUndefined<A>(nullable: A | undefined): Option<A> {
    return nullable === undefined ? None<A>() : Some<A>(nullable);
  },

  /**
   * Turns an array of options into an option of array
   */
  all<A, Options extends Option<A>[] | []>(options: Options) {
    const length = options.length;
    let acc = Option.Some<Array<unknown>>([]);
    let index = 0;

    while (true) {
      if (index >= length) {
        return acc as Option<{
          [K in keyof Options]: Options[K] extends Option<infer T> ? T : never;
        }>;
      }

      const item = options[index];

      if (item != null) {
        acc = acc.flatMap((array) =>
          item.map((value) => {
            array.push(value);
            return array;
          }),
        );
      }

      index++;
    }
  },

  /**
   * Turns an dict of options into a options of dict
   */
  allFromDict<A, Dict extends LooseRecord<Option<A>>>(
    dict: Dict,
  ): Option<{
    [K in keyof Dict]: Dict[K] extends Option<infer T> ? T : never;
  }> {
    const dictKeys = keys(dict);

    return this.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    );
  },

  equals<A>(
    a: Option<A>,
    b: Option<A>,
    equals: (a: A, b: A) => boolean,
  ): boolean {
    return a.isSome() && b.isSome()
      ? equals(a.value, b.value)
      : a.tag === b.tag;
  },

  pattern: {
    Some: <T>(x: T) => ({ tag: "Some", value: x } as const),
    None: { tag: "None" } as const,
  },
};

interface IResult<A, E> {
  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, A => B) => Result\<B>
   */
  map<B>(this: Result<A, E>, func: (value: A) => B): Result<B, E>;

  /**
   * Returns the Result containing the error returned from the callback
   *
   * (Result\<A, E>, E => F) => Result\<F>
   */
  mapError<F>(this: Result<A, E>, func: (value: E) => F): Result<A, F>;

  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, A => Result\<B, F>) => Result\<B, E | F>
   */
  flatMap<B, F = E>(
    this: Result<A, E>,
    func: (value: A) => Result<B, F>,
  ): Result<B, F | E>;

  /**
   * Returns the Result containing the value from the callback
   *
   * (Result\<A, E>, E => Result\<A, F>) => Result\<A | B, F>
   */
  flatMapError<B, F>(
    this: Result<A, E>,
    func: (value: E) => Result<B, F>,
  ): Result<A | B, F>;

  /**
   * Return the value if present, and the fallback otherwise
   *
   * (Result\<A, E>, A) => A
   */
  getWithDefault(this: Result<A, E>, defaultValue: A): A;

  /**
   * Explodes the Result given its case
   */
  match<B>(
    this: Result<A, E>,
    config: { Ok: (value: A) => B; Error: (error: E) => B },
  ): B;

  /**
   * Runs the callback and returns `this`
   */
  tap(
    this: Result<A, E>,
    func: (result: Result<A, E>) => unknown,
  ): Result<A, E>;

  /**
   * Runs the callback if ok and returns `this`
   */
  tapOk(this: Result<A, E>, func: (value: A) => unknown): Result<A, E>;

  /**
   * Runs the callback if error and returns `this`
   */
  tapError(this: Result<A, E>, func: (error: E) => unknown): Result<A, E>;

  /**
   * Return an option of the value
   *
   * (Result\<A, E>) => Option\<A>
   */
  toOption(this: Result<A, E>): Option<A>;

  /**
   * Typeguard
   */
  isOk(this: Result<A, E>): this is Ok<A, E>;

  /**
   * Typeguard
   */
  isError(this: Result<A, E>): this is Error<A, E>;
}

type Ok<A, E> = Remap<IResult<A, E>> & {
  tag: "Ok";
  value: A;

  /**
   * Returns the ok value. Use within `if (result.isOk()) { ... }`
   */
  get(this: Ok<A, E>): A;
};

type Error<A, E> = Remap<IResult<A, E>> & {
  tag: "Error";
  value: E;

  /**
   * Returns the error value. Use within `if (result.isError()) { ... }`
   */
  getError(this: Error<A, E>): E;
};

export type Result<A, E> = Ok<A, E> | Error<A, E>;

const resultProto = (<A, E>(): IResult<A, E> => ({
  map<B>(this: Result<A, E>, func: (value: A) => B) {
    return this.tag === "Ok"
      ? Ok(func(this.value))
      : (this as unknown as Result<B, E>);
  },

  mapError<F>(this: Result<A, E>, func: (value: E) => F) {
    return this.tag === "Ok"
      ? (this as unknown as Result<A, F>)
      : Error(func(this.value));
  },

  flatMap<B, F = E>(this: Result<A, E>, func: (value: A) => Result<B, F>) {
    return this.tag === "Ok"
      ? func(this.value)
      : (this as unknown as Result<B, F | E>);
  },

  flatMapError<B, F>(this: Result<A, E>, func: (value: E) => Result<B, F>) {
    return this.tag === "Ok"
      ? (this as unknown as Result<A | B, F>)
      : func(this.value);
  },

  getWithDefault(this: Result<A, E>, defaultValue: A) {
    return this.tag === "Ok" ? this.value : defaultValue;
  },

  match<B>(
    this: Result<A, E>,
    config: { Ok: (value: A) => B; Error: (error: E) => B },
  ) {
    return this.tag === "Ok" ? config.Ok(this.value) : config.Error(this.value);
  },

  tap(this: Result<A, E>, func: (result: Result<A, E>) => unknown) {
    func(this);
    return this;
  },

  tapOk(this: Result<A, E>, func: (value: A) => unknown) {
    if (this.tag === "Ok") {
      func(this.value);
    }
    return this;
  },

  tapError(this: Result<A, E>, func: (error: E) => unknown) {
    if (this.tag === "Error") {
      func(this.value);
    }
    return this;
  },

  toOption(this: Result<A, E>) {
    return this.tag === "Ok" ? Some(this.value) : None();
  },

  isOk(this: Result<A, E>): boolean {
    return this.tag === "Ok";
  },

  isError(this: Result<A, E>): boolean {
    return this.tag === "Error";
  },
}))();

// @ts-expect-error
resultProto.__boxed_type__ = "Result";

const okProto = (<A, E>(): Omit<Ok<A, E>, "tag" | "value"> => ({
  ...(resultProto as IResult<A, E>),

  get() {
    return this.value;
  },
}))();

const errorProto = (<A, E>(): Omit<Error<A, E>, "tag" | "value"> => ({
  ...(resultProto as IResult<A, E>),

  getError() {
    return this.value;
  },
}))();

const Ok = <A = never, E = never>(value: A): Result<A, E> => {
  const result = Object.create(okProto) as Ok<A, E>;
  result.tag = "Ok";
  result.value = value;
  return result;
};

const Error = <A = never, E = never>(value: E): Result<A, E> => {
  const result = Object.create(errorProto) as Error<A, E>;
  result.tag = "Error";
  result.value = value;
  return result;
};

export const Result = {
  /**
   * Create an Result.Ok value
   */
  Ok,

  /**
   * Create an Result.Error value
   */
  Error,

  /**
   * Runs the function and resolves a result of its return value, or to an error if thrown
   */
  fromExecution<A, E = unknown>(func: () => A): Result<A, E> {
    try {
      return Result.Ok(func());
    } catch (error) {
      return Result.Error(error) as Result<A, E>;
    }
  },

  /**
   * Takes the promise and resolves a result of its value, or to an error if rejected
   */
  async fromPromise<A, E = unknown>(
    promise: Promise<A>,
  ): Promise<Result<A, E>> {
    try {
      const value = await promise;
      return Result.Ok<A, E>(value);
    } catch (error) {
      return Result.Error<A, E>(error as E);
    }
  },

  /**
   * Takes the option and turns it into Ok(value) is Some, or Error(valueWhenNone)
   */
  fromOption<A, E>(option: Option<A>, valueWhenNone: E): Result<A, E> {
    return option.toResult(valueWhenNone);
  },

  /**
   * Turns an array of results into an result of array
   */
  all<A, E, Results extends Result<A, E>[] | []>(results: Results) {
    const length = results.length;
    let acc = Result.Ok<Array<unknown>, unknown>([]);
    let index = 0;

    while (true) {
      if (index >= length) {
        return acc as Result<
          {
            [K in keyof Results]: Results[K] extends Result<infer T, any>
              ? T
              : never;
          },
          {
            [K in keyof Results]: Results[K] extends Result<any, infer T>
              ? T
              : never;
          }[number]
        >;
      }

      const item = results[index];

      if (item != null) {
        acc = acc.flatMap((array) =>
          item.map((value) => {
            array.push(value);
            return array;
          }),
        );
      }

      index++;
    }
  },

  /**
   * Turns an dict of results into a results of dict
   */
  allFromDict<A, E, Dict extends LooseRecord<Result<A, E>>>(
    dict: Dict,
  ): Result<
    {
      [K in keyof Dict]: Dict[K] extends Result<infer T, any> ? T : never;
    },
    {
      [K in keyof Dict]: Dict[K] extends Result<any, infer T> ? T : never;
    }[keyof Dict]
  > {
    const dictKeys = keys(dict);

    return Result.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    );
  },

  equals<A, E>(
    a: Result<A, E>,
    b: Result<A, E>,
    equals: (a: A, b: A) => boolean,
  ) {
    if (a.tag !== b.tag) {
      return false;
    }
    if (a.isError() && b.isError()) {
      return true;
    }
    return equals(a.value as unknown as A, b.value as unknown as A);
  },

  pattern: {
    Ok: <T>(x: T) => ({ tag: "Ok", value: x } as const),
    Error: <T>(x: T) => ({ tag: "Error", value: x } as const),
  },
};
