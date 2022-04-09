export type Option<Value> = OptionClass<Value> &
  ({ tag: "Some"; value: Value } | { tag: "None"; value: undefined });

class OptionClass<Value> {
  tag: "Some" | "None";
  value: Value | undefined;
  constructor() {
    this.tag = "None";
    this.value = undefined;
  }
  map<ReturnValue>(f: (value: Value) => ReturnValue): Option<ReturnValue> {
    if (this.tag === "Some") {
      return Option.Some(f(this.value as Value));
    } else {
      return this as unknown as Option<ReturnValue>;
    }
  }
  flatMap<ReturnValue>(
    f: (value: Value) => Option<ReturnValue>,
  ): Option<ReturnValue> {
    if (this.tag === "Some") {
      return f(this.value as Value);
    } else {
      return this as unknown as Option<ReturnValue>;
    }
  }
  or(optionB: Option<Value>): Option<Value> {
    if(this.tag === "None"){
      return optionB;
    } else {
      return this as Option<Value>;
    }
  }
  orElse(f: () => Option<Value>): Option<Value> {
    if(this.tag === "None"){
      return f();
    } else {
      return this as Option<Value>;
    }
  }
  getWithDefault(defaultValue: Value): Value {
    if (this.tag === "Some") {
      return this.value as Value;
    } else {
      return defaultValue;
    }
  }
  match<ReturnValue>(config: {
    Some: (value: Value) => ReturnValue;
    None: () => ReturnValue;
  }): ReturnValue {
    if (this.tag === "Some") {
      return config.Some(this.value as Value);
    } else {
      return config.None();
    }
  }
  toUndefined() {
    if (this.tag === "None") {
      return undefined;
    } else {
      return this.value as Value;
    }
  }
  toNull() {
    if (this.tag === "None") {
      return null;
    } else {
      return this.value as Value;
    }
  }
  isSome(): this is OptionClass<Value> & { tag: "Some"; value: Value } {
    return this.tag === "Some";
  }
  isNone(): this is OptionClass<Value> & { tag: "None"; value: undefined } {
    return this.tag === "None";
  }
}

// @ts-expect-error
OptionClass.prototype.__boxed_type__ = "Option";

const proto = Object.create(
  null,
  Object.getOwnPropertyDescriptors(OptionClass.prototype),
);

const NONE = (() => {
  const none = Object.create(proto);
  none.tag = "None";
  none.value = undefined;
  return none;
})();

export const Option = {
  Some: <Value>(value: Value): Option<Value> => {
    const option = Object.create(proto) as Option<Value>;
    option.tag = "Some";
    option.value = value;
    return option;
  },
  None: <Value>(): Option<Value> => {
    return NONE as Option<Value>;
  },
  fromNullable: <NullableValue>(nullable: NullableValue) => {
    if (nullable == null) {
      return Option.None<NonNullable<NullableValue>>();
    } else {
      return Option.Some<NonNullable<NullableValue>>(
        nullable as NonNullable<NullableValue>,
      );
    }
  },
  fromNull: <NullableValue>(nullable: NullableValue) => {
    if (nullable === null) {
      return Option.None<Exclude<NullableValue, null>>();
    } else {
      return Option.Some<Exclude<NullableValue, null>>(
        nullable as Exclude<NullableValue, null>,
      );
    }
  },
  fromUndefined: <NullableValue>(nullable: NullableValue) => {
    if (nullable === undefined) {
      return Option.None<Exclude<NullableValue, undefined>>();
    } else {
      return Option.Some<Exclude<NullableValue, undefined>>(
        nullable as Exclude<NullableValue, undefined>,
      );
    }
  },
  equals: <Value>(
    a: Option<Value>,
    b: Option<Value>,
    equals: (a: Value, b: Value) => boolean,
  ) => {
    if (a.tag === "Some" && b.tag === "Some") {
      return equals(a.value, b.value);
    }
    return a.tag === b.tag;
  },
  pattern: {
    Some: <T>(x: T) => ({ tag: "Some", value: x } as const),
    None: { tag: "None" } as const,
  },
};
