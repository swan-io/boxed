import { keys, values } from "./Dict";
import { Option } from "./OptionResult";
import { zip } from "./ZipUnzip";

export class AsyncData<A> {
  /**
   * Create an AsyncData.Done value
   */
  static Done = <A = never>(value: A): AsyncData<A> => {
    const asyncData = Object.create(proto) as AsyncData<A>;
    asyncData.value = { tag: "Done", value };
    return asyncData;
  };

  /**
   * Create an AsyncData.Loading value
   */
  static Loading = <A = never>(): AsyncData<A> => {
    return LOADING as AsyncData<A>;
  };

  /**
   * Create an AsyncData.NotAsked value
   */
  static NotAsked = <A = never>(): AsyncData<A> => {
    return NOT_ASKED as AsyncData<A>;
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

  /**
   * Turns an dict of asyncData into a asyncData of dict
   */
  static allFromDict = <Dict extends Record<string, AsyncData<any>>>(
    dict: Dict,
  ): AsyncData<{
    -readonly [P in keyof Dict]: Dict[P] extends AsyncData<infer T> ? T : never;
  }> => {
    const dictKeys = keys(dict);
    return AsyncData.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    );
  };

  static equals = <A>(
    a: AsyncData<A>,
    b: AsyncData<A>,
    equals: (a: A, b: A) => boolean,
  ) => {
    if (a.isDone() && b.isDone()) {
      return equals(a.value.value, b.value.value);
    }
    return a.value.tag === b.value.tag;
  };

  static pattern = {
    Done: <T>(x: T) => ({ value: { tag: "Done", value: x } } as const),
    NotAsked: { value: { tag: "NotAsked" } } as const,
    Loading: { value: { tag: "Loading" } } as const,
  };

  value: { tag: "NotAsked" } | { tag: "Loading" } | { tag: "Done"; value: A };

  constructor() {
    this.value = { tag: "NotAsked" };
  }
  /**
   * Returns the AsyncData containing the value from the callback
   *
   * (AsyncData\<A>, A => B) => AsyncData\<B>
   */
  map<B>(f: (value: A) => B): AsyncData<B> {
    if (this.value.tag === "Done") {
      return AsyncData.Done(f(this.value.value as A));
    } else {
      return this as unknown as AsyncData<B>;
    }
  }
  /**
   * Returns the AsyncData containing the value from the callback
   *
   * (AsyncData\<A>, A => AsyncData\<B>) => AsyncData\<B>
   */
  flatMap<B>(f: (value: A) => AsyncData<B>): AsyncData<B> {
    if (this.value.tag === "Done") {
      return f(this.value.value as A);
    } else {
      return this as unknown as AsyncData<B>;
    }
  }
  /**
   * Return the value if present, and the fallback otherwise
   *
   * (AsyncData\<A>, A) => A
   */
  getWithDefault(defaultValue: A): A {
    if (this.value.tag === "Done") {
      return this.value.value as A;
    } else {
      return defaultValue;
    }
  }
  /**
   * Explodes the AsyncData given its case
   */
  match<B>(config: {
    Done: (value: A) => B;
    Loading: () => B;
    NotAsked: () => B;
  }): B {
    if (this.value.tag === "Done") {
      return config.Done(this.value.value as A);
    } else {
      if (this.value.tag === "Loading") {
        return config.Loading();
      } else {
        return config.NotAsked();
      }
    }
  }
  /**
   * Runs the callback and returns `this`
   */
  tap(func: (asyncData: AsyncData<A>) => unknown): AsyncData<A> {
    func(this);
    return this;
  }
  /**
   * Typeguard
   */
  isDone(): this is AsyncData<A> & {
    value: { tag: "Done"; value: A };
  } {
    return this.value.tag === "Done";
  }
  /**
   * Typeguard
   */
  isLoading(): this is AsyncData<A> & {
    value: { tag: "Loading" };
  } {
    return this.value.tag === "Loading";
  }
  /**
   * Typeguard
   */
  isNotAsked(): this is AsyncData<A> & {
    value: { tag: "NotAsked" };
  } {
    return this.value.tag === "NotAsked";
  }
  /**
   * Return an option of the value
   *
   * (AsyncData\<A>) => Option\<A>
   */
  toOption(): Option<A> {
    if (this.value.tag === "Done") {
      return Option.Some(this.value.value) as Option<A>;
    } else {
      return Option.None() as Option<A>;
    }
  }

  /**
   * Returns the value. Use within `if (asyncData.isDone()) { ... }`
   */
  get(this: AsyncData<A> & { value: { tag: "Done"; value: A } }): A {
    return this.value.value;
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
  asyncData.value = { tag: "Loading" };
  return asyncData;
})();

const NOT_ASKED = (() => {
  const asyncData = Object.create(proto);
  asyncData.value = { tag: "NotAsked" };
  return asyncData;
})();
