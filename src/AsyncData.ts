import { Option } from "./Option";

export type AsyncData<Value> = AsyncDataClass<Value> &
  (
    | { tag: "NotAsked"; value: undefined }
    | { tag: "Loading"; value: undefined }
    | { tag: "Done"; value: Value }
  );

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
    f: (value: Value) => AsyncData<ReturnValue>,
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
  toOption(): Option<Value> {
    if (this.tag === "Done") {
      return Option.Some(this.value) as Option<Value>;
    } else {
      return Option.None() as Option<Value>;
    }
  }
}

// @ts-expect-error
AsyncDataClass.prototype.__boxed_type__ = "AsyncData";

const proto = Object.create(
  null,
  Object.getOwnPropertyDescriptors(AsyncDataClass.prototype),
);

const LOADING = (() => {
  const asyncData = Object.create(proto);
  asyncData.tag = "Loading";
  asyncData.value = undefined;
  return asyncData;
})();

const NOT_ASKED = (() => {
  const asyncData = Object.create(proto);
  asyncData.tag = "NotAsked";
  asyncData.value = undefined;
  return asyncData;
})();

export const AsyncData = {
  Done: <Value>(value: Value): AsyncData<Value> => {
    const asyncData = Object.create(proto) as AsyncData<Value>;
    asyncData.tag = "Done";
    asyncData.value = value;
    return asyncData;
  },
  Loading: <Value>(): AsyncData<Value> => {
    return LOADING as AsyncData<Value>;
  },
  NotAsked: <Value>(): AsyncData<Value> => {
    return NOT_ASKED as AsyncData<Value>;
  },
  equals: <Value>(
    a: AsyncData<Value>,
    b: AsyncData<Value>,
    equals: (a: Value, b: Value) => boolean,
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
