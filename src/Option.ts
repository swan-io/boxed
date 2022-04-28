export class Option<A> {
  /**
   * Create an AsyncData.Some value
   */
  static Some = <A>(value: A): Option<A> => {
    const option = Object.create(proto) as Option<A>;
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

const proto = Object.create(
  null,
  Object.getOwnPropertyDescriptors(Option.prototype),
);

const NONE = (() => {
  const none = Object.create(proto);
  none.value = { tag: "None" };
  return none;
})();
