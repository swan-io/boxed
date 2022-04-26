export class Option<Value> {
  /**
   * Create an AsyncData.Some value
   */
  static Some = <Value>(value: Value): Option<Value> => {
    const option = Object.create(proto) as Option<Value>;
    option.value = { tag: "Some", value };
    return option;
  };

  /**
   * Create an Option.None value
   */
  static None = <Value>(): Option<Value> => {
    return NONE as Option<Value>;
  };

  /**
   * Create an Option from a nullable value
   */
  static fromNullable = <NullableValue>(nullable: NullableValue) => {
    if (nullable == null) {
      return Option.None<NonNullable<NullableValue>>();
    } else {
      return Option.Some<NonNullable<NullableValue>>(
        nullable as NonNullable<NullableValue>,
      );
    }
  };

  /**
   * Create an Option from a null | value
   */
  static fromNull = <NullableValue>(nullable: NullableValue) => {
    if (nullable === null) {
      return Option.None<Exclude<NullableValue, null>>();
    } else {
      return Option.Some<Exclude<NullableValue, null>>(
        nullable as Exclude<NullableValue, null>,
      );
    }
  };

  /**
   * Create an Option from a undefined | value
   */
  static fromUndefined = <NullableValue>(nullable: NullableValue) => {
    if (nullable === undefined) {
      return Option.None<Exclude<NullableValue, undefined>>();
    } else {
      return Option.Some<Exclude<NullableValue, undefined>>(
        nullable as Exclude<NullableValue, undefined>,
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

  static equals = <Value>(
    a: Option<Value>,
    b: Option<Value>,
    equals: (a: Value, b: Value) => boolean,
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

  value: { tag: "Some"; value: Value } | { tag: "None" };

  constructor() {
    this.value = { tag: "None" };
  }
  /**
   * Returns the Option containing the value from the callback
   *
   * (Option\<A>, A => B) => Option\<B>
   */
  map<ReturnValue>(f: (value: Value) => ReturnValue): Option<ReturnValue> {
    if (this.value.tag === "Some") {
      return Option.Some(f(this.value.value as Value));
    } else {
      return this as unknown as Option<ReturnValue>;
    }
  }
  /**
   * Returns the Option containing the value from the callback
   *
   * (Option\<A>, A => Option\<B>) => Option\<B>
   */
  flatMap<ReturnValue>(
    f: (value: Value) => Option<ReturnValue>,
  ): Option<ReturnValue> {
    if (this.value.tag === "Some") {
      return f(this.value.value as Value);
    } else {
      return this as unknown as Option<ReturnValue>;
    }
  }
  /**
   * Return the value if present, and the fallback otherwise
   *
   * (Option\<A>, A) => A
   */
  getWithDefault(defaultValue: Value): Value {
    if (this.value.tag === "Some") {
      return this.value.value as Value;
    } else {
      return defaultValue;
    }
  }
  /**
   * Explodes the Option given its case
   */
  match<ReturnValue>(config: {
    Some: (value: Value) => ReturnValue;
    None: () => ReturnValue;
  }): ReturnValue {
    if (this.value.tag === "Some") {
      return config.Some(this.value.value as Value);
    } else {
      return config.None();
    }
  }
  /**
   * Runs the callback and returns `this`
   */
  tap(
    this: Option<Value>,
    func: (option: Option<Value>) => unknown,
  ): Option<Value> {
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
      return this.value.value as Value;
    }
  }
  /**
   * Converts the Option\<A> to a `A | null`
   */
  toNull() {
    if (this.value.tag === "None") {
      return null;
    } else {
      return this.value.value as Value;
    }
  }
  /**
   * Typeguard
   */
  isSome(): this is Option<Value> & { value: { tag: "Some"; value: Value } } {
    return this.value.tag === "Some";
  }
  /**
   * Typeguard
   */
  isNone(): this is Option<Value> & { value: { tag: "None" } } {
    return this.value.tag === "None";
  }

  /**
   * Returns the value. Use within `if (option.isSome()) { ... }`
   */
  get(this: Option<Value> & { value: { tag: "Some"; value: Value } }): Value {
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
