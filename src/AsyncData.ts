import { Option } from "./Option";

export class AsyncData<Value> {
  /**
   * Create an AsyncData.Done value
   */
  static Done = <Value>(value: Value): AsyncData<Value> => {
    const asyncData = Object.create(proto) as AsyncData<Value>;
    asyncData.tag = "Done";
    asyncData.value = value;
    return asyncData;
  };

  /**
   * Create an AsyncData.Loading value
   */
  static Loading = <Value>(): AsyncData<Value> => {
    return LOADING as AsyncData<Value>;
  };

  /**
   * Create an AsyncData.NotAsked value
   */
  static NotAsked = <Value>(): AsyncData<Value> => {
    return NOT_ASKED as AsyncData<Value>;
  };

  /**
   * Turns an array of asyncData into an asyncData of array
   */
  static all = <AsyncDatas extends readonly AsyncData<any>[] | []>(
    asyncDatas: AsyncDatas,
  ): AsyncData<{
    -readonly [P in keyof AsyncDatas]: AsyncDatas[P] extends AsyncData<infer V>
      ? V
      : never;
  }> => {
    const length = asyncDatas.length;
    let acc = AsyncData.Done<Array<unknown>>([]);
    let index = 0;
    while (true) {
      if (index >= length) {
        return acc as unknown as AsyncData<{
          -readonly [P in keyof AsyncDatas]: AsyncDatas[P] extends AsyncData<
            infer V
          >
            ? V
            : never;
        }>;
      }
      const item = asyncDatas[index] as AsyncData<unknown>;
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
    a: AsyncData<Value>,
    b: AsyncData<Value>,
    equals: (a: Value, b: Value) => boolean,
  ) => {
    if (a.isDone() && b.isDone()) {
      return equals(a.value, b.value);
    }
    return a.tag === b.tag;
  };

  static pattern = {
    Done: <T>(x: T) => ({ tag: "Done", value: x } as const),
    NotAsked: { tag: "NotAsked" } as const,
    Loading: { tag: "Loading" } as const,
  };

  tag: "NotAsked" | "Loading" | "Done";
  value: Value | undefined;
  constructor() {
    this.tag = "NotAsked";
    this.value = undefined;
  }
  /**
   * Returns the AsyncData containing the value from the callback
   *
   * (AsyncData\<A>, A => B) => AsyncData\<B>
   */
  map<ReturnValue>(
    this: AsyncData<Value>,
    f: (value: Value) => ReturnValue,
  ): AsyncData<ReturnValue> {
    if (this.tag === "Done") {
      return AsyncData.Done(f(this.value as Value));
    } else {
      return this as unknown as AsyncData<ReturnValue>;
    }
  }
  /**
   * Returns the AsyncData containing the value from the callback
   *
   * (AsyncData\<A>, A => AsyncData\<B>) => AsyncData\<B>
   */
  flatMap<ReturnValue>(
    this: AsyncData<Value>,
    f: (value: Value) => AsyncData<ReturnValue>,
  ): AsyncData<ReturnValue> {
    if (this.tag === "Done") {
      return f(this.value as Value);
    } else {
      return this as unknown as AsyncData<ReturnValue>;
    }
  }
  /**
   * Return the value if present, and the fallback otherwise
   *
   * (AsyncData\<A>, A) => A
   */
  getWithDefault(this: AsyncData<Value>, defaultValue: Value): Value {
    if (this.tag === "Done") {
      return this.value as Value;
    } else {
      return defaultValue;
    }
  }
  /**
   * Explodes the AsyncData given its case
   */
  match<ReturnValue>(
    this: AsyncData<Value>,
    config: {
      Done: (value: Value) => ReturnValue;
      Loading: () => ReturnValue;
      NotAsked: () => ReturnValue;
    },
  ): ReturnValue {
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
  /**
   * Runs the callback and returns `this`
   */
  tap(
    this: AsyncData<Value>,
    func: (asyncData: AsyncData<Value>) => unknown,
  ): AsyncData<Value> {
    func(this);
    return this;
  }
  /**
   * Typeguard
   */
  isDone(): this is AsyncData<Value> & { tag: "Done"; value: Value } {
    return this.tag === "Done";
  }
  /**
   * Typeguard
   */
  isLoading(): this is AsyncData<Value> & {
    tag: "Loading";
    value: undefined;
  } {
    return this.tag === "Loading";
  }
  /**
   * Typeguard
   */
  isNotAsked(): this is AsyncData<Value> & {
    tag: "NotAsked";
    value: undefined;
  } {
    return this.tag === "NotAsked";
  }
  /**
   * Return an option of the value
   *
   * (AsyncData\<A>) => Option\<A>
   */
  toOption(): Option<Value> {
    if (this.tag === "Done") {
      return Option.Some(this.value) as Option<Value>;
    } else {
      return Option.None() as Option<Value>;
    }
  }
}

// @ts-expect-error
AsyncData.prototype.__boxed_type__ = "AsyncData";

const proto = Object.create(
  null,
  Object.getOwnPropertyDescriptors(AsyncData.prototype),
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
