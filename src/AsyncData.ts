import { Option } from "./Option.js";

export type AsyncData<Value> =
  | (AsyncDataClass<Value> & { tag: "NotAsked"; value: undefined })
  | (AsyncDataClass<Value> & { tag: "Loading"; value: undefined })
  | (AsyncDataClass<Value> & { tag: "Done"; value: Value });

class AsyncDataClass<Value> {
  tag: "NotAsked" | "Loading" | "Done";
  value: Value | undefined;
  constructor() {
    this.tag = "NotAsked";
    this.value = undefined;
  }
  map<ReturnValue>(f: (value: Value) => ReturnValue): AsyncData<ReturnValue> {
    if (this.tag === "Done") {
      return AsyncData.Done(f(this.value as Value));
    } else {
      return this as unknown as AsyncData<ReturnValue>;
    }
  }
  flatMap<ReturnValue>(
    f: (value: Value) => AsyncData<ReturnValue>
  ): AsyncData<ReturnValue> {
    if (this.tag === "Done") {
      return f(this.value as Value);
    } else {
      return this as unknown as AsyncData<ReturnValue>;
    }
  }
  getWithDefault(defaultValue: Value): Value {
    if (this.tag === "Done") {
      return this.value as Value;
    } else {
      return defaultValue;
    }
  }
  match<ReturnValue>(config: {
    Done: (value: Value) => ReturnValue;
    Loading: () => ReturnValue;
    NotAsked: () => ReturnValue;
  }): ReturnValue {
    if (this.tag === "Done") {
      return config.Done(this.value as Value);
    } else {
      if (this.tag === "Loading") {
        return config.Loading();
      } else {
        return config.NotAsked();
      }
    }
  }
  isDone(): this is AsyncDataClass<Value> & { tag: "Done"; value: Value } {
    return this.tag === "Done";
  }
  isLoading(): this is AsyncDataClass<Value> & {
    tag: "Loading";
    value: undefined;
  } {
    return this.tag === "Loading";
  }
  isNotAsked(): this is AsyncDataClass<Value> & {
    tag: "NotAsked";
    value: undefined;
  } {
    return this.tag === "NotAsked";
  }
  toOption() {
    if (this.tag === "Done") {
      return Option.Some(this.value);
    } else {
      return Option.None();
    }
  }
}

export const AsyncData = {
  Done: <Value>(value: Value): AsyncData<Value> => {
    const option = Object.create(AsyncDataClass.prototype) as AsyncData<Value>;
    option.tag = "Done";
    option.value = value;
    return Object.freeze(option);
  },
  Loading: <Value>(): AsyncData<Value> => {
    const option = Object.create(AsyncDataClass.prototype) as AsyncData<Value>;
    option.tag = "Loading";
    option.value = undefined;
    return Object.freeze(option);
  },
  NotAsked: <Value>(): AsyncData<Value> => {
    const option = Object.create(AsyncDataClass.prototype) as AsyncData<Value>;
    option.tag = "NotAsked";
    option.value = undefined;
    return Object.freeze(option);
  },
  equals: <Value>(
    a: AsyncData<Value>,
    b: AsyncData<Value>,
    equals: (a: Value, b: Value) => boolean
  ) => {
    if (a.tag === "Done" && b.tag === "Done") {
      return equals(a.value, b.value);
    }
    return a.tag === b.tag;
  },
  pattern: {
    Done: <T>(x: T) => ({ tag: "Done", value: x } as const),
    NotAsked: { tag: "NotAsked" } as const,
    Loading: { tag: "Loading" } as const,
  },
};
