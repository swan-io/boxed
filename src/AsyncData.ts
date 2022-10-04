import { keys, values } from "./Dict";
import { Option, Result } from "./OptionResult";
import { LooseRecord, Remap } from "./types";
import { zip } from "./ZipUnzip";

interface IAsyncData<A> {
  /**
   * Returns the AsyncData containing the value from the callback
   *
   * (AsyncData\<A>, A => B) => AsyncData\<B>
   */
  map<B>(this: AsyncData<A>, func: (value: A) => B): AsyncData<B>;

  /**
   * Returns the AsyncData containing the value from the callback
   *
   * (AsyncData\<A>, A => AsyncData\<B>) => AsyncData\<B>
   */
  flatMap<B>(
    this: AsyncData<A>,
    func: (value: A) => AsyncData<B>,
  ): AsyncData<B>;

  /**
   * Takes a callback taking the Ok value and returning a new result and returns an AsyncData with this new result
   *
   * (AsyncData\<Result<A, E>>, A => \<Result<B, F>) => AsyncData\<Result<B, F | E>>
   */
  mapResult<A, E, B, F = E>(
    this: AsyncData<Result<A, E>>,
    func: (value: A) => Result<B, F>,
  ): AsyncData<Result<B, F | E>>;

  /**
   * Takes a callback taking the Ok value and returning a new ok value and returns an AsyncData resolving to this new result
   *
   * (AsyncData\<Result<A, E>>, A => B) => AsyncData\<Result<B, E>>
   */
  mapOk<A, E, B>(
    this: AsyncData<Result<A, E>>,
    func: (value: A) => B,
  ): AsyncData<Result<B, E>>;

  /**
   * Takes a callback taking the Error value and returning a new error value and returns an AsyncData to this new result
   *
   * (AsyncData\<Result<A, E>>, E => B) => AsyncData\<Result<A, B>>
   */
  mapError<A, E, B>(
    this: AsyncData<Result<A, E>>,
    func: (value: E) => B,
  ): AsyncData<Result<A, B>>;

  /**
   * Takes a callback taking the Ok value and returning an AsyncData
   *
   * (AsyncData\<Result<A, E>>, A => AsyncData\<Result\<B, F>>) => AsyncData\<Result<B, F | E>>
   */
  flatMapOk<A, E, B, F = E>(
    this: AsyncData<Result<A, E>>,
    func: (value: A) => AsyncData<Result<B, F>>,
  ): AsyncData<Result<B, F | E>>;

  /**
   * Takes a callback taking the Error value and returning an AsyncData
   *
   * (AsyncData\<Result<A, E>>, E => AsyncData\<Result\<B, F>>) => AsyncData\<Result<A | B, F | E>>
   */
  flatMapError<A, E, B, F>(
    this: AsyncData<Result<A, E>>,
    func: (value: E) => AsyncData<Result<B, F>>,
  ): AsyncData<Result<A | B, F>>;

  /**
   * Return the value if present, and the fallback otherwise
   *
   * (AsyncData\<A>, A) => A
   */
  getWithDefault(this: AsyncData<A>, defaultValue: A): A;

  /**
   * Explodes the AsyncData given its case
   */
  match<B>(
    this: AsyncData<A>,
    config: {
      Done: (value: A) => B;
      Loading: () => B;
      NotAsked: () => B;
    },
  ): B;

  /**
   * Runs the callback and returns `this`
   */
  tap(
    this: AsyncData<A>,
    func: (asyncData: AsyncData<A>) => unknown,
  ): AsyncData<A>;

  /**
   * Return an option of the value
   *
   * (AsyncData\<A>) => Option\<A>
   */
  toOption(this: AsyncData<A>): Option<A>;

  /**
   * Typeguard
   */
  isDone(this: AsyncData<A>): this is Done<A>;

  /**
   * Typeguard
   */
  isLoading(this: AsyncData<A>): this is Loading<A>;

  /**
   * Typeguard
   */
  isNotAsked(this: AsyncData<A>): this is NotAsked<A>;
}

type Done<A> = Remap<IAsyncData<A>> & {
  tag: "Done";
  value: A;

  /**
   * Returns the value. Use within `if (asyncData.isDone()) { ... }`
   */
  get(this: Done<A>): A;
};

type Loading<A> = Remap<IAsyncData<A>> & {
  tag: "Loading";
};

type NotAsked<A> = Remap<IAsyncData<A>> & {
  tag: "NotAsked";
};

export type AsyncData<A> = Done<A> | Loading<A> | NotAsked<A>;

const asyncDataProto = (<A>(): IAsyncData<A> => ({
  map<B>(this: AsyncData<A>, func: (value: A) => B) {
    return this.tag === "Done"
      ? Done(func(this.value))
      : (this as unknown as AsyncData<B>);
  },

  flatMap<B>(this: AsyncData<A>, func: (value: A) => AsyncData<B>) {
    return this.tag === "Done"
      ? func(this.value)
      : (this as unknown as AsyncData<B>);
  },

  /**
   * For AsyncData<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new result and returns an AsyncData with this new result
   */
  mapResult<A, E, B, F = E>(
    this: AsyncData<Result<A, E>>,
    func: (value: A) => Result<B, F>,
  ): AsyncData<Result<B, F | E>> {
    return this.map((value) => {
      return value.match({
        Ok: (value) => func(value),
        Error: () => value as unknown as Result<B, E | F>,
      });
    });
  },

  /**
   * For AsyncData<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning a new ok value and returns an AsyncData resolving to this new result
   */
  mapOk<A, E, B>(
    this: AsyncData<Result<A, E>>,
    func: (value: A) => B,
  ): AsyncData<Result<B, E>> {
    return this.map((value) => {
      return value.match({
        Ok: (value) => Result.Ok(func(value)),
        Error: () => value as unknown as Result<B, E>,
      });
    });
  },

  /**
   * For AsyncData<Result<*>>:
   *
   * Takes a callback taking the Error value and returning a new error value and returns an AsyncData to this new result
   *
   */
  mapError<A, E, B>(
    this: AsyncData<Result<A, E>>,
    func: (value: E) => B,
  ): AsyncData<Result<A, B>> {
    return this.map((value) => {
      return value.match({
        Ok: () => value as unknown as Result<A, B>,
        Error: (error) => Result.Error(func(error)),
      });
    });
  },

  /**
   * For AsyncData<Result<*>>:
   *
   * Takes a callback taking the Ok value and returning an AsyncData
   */
  flatMapOk<A, E, B, F = E>(
    this: AsyncData<Result<A, E>>,
    func: (value: A) => AsyncData<Result<B, F>>,
  ): AsyncData<Result<B, F | E>> {
    return this.flatMap((value) => {
      return value.match({
        Ok: (value) => func(value) as AsyncData<Result<B, F | E>>,
        Error: () => Done(value as unknown as Result<B, F | E>),
      });
    });
  },

  /**
   * For AsyncData<Result<*>>:
   *
   * Takes a callback taking the Error value and returning an AsyncData
   */
  flatMapError<A, E, B, F>(
    this: AsyncData<Result<A, E>>,
    func: (value: E) => AsyncData<Result<B, F>>,
  ): AsyncData<Result<A | B, F>> {
    return this.flatMap((value) => {
      return value.match({
        Ok: () => Done(value as unknown as Result<A | B, F>),
        Error: (error) => func(error) as AsyncData<Result<A | B, F>>,
      });
    });
  },

  getWithDefault(this: AsyncData<A>, defaultValue: A) {
    return this.tag === "Done" ? this.value : defaultValue;
  },

  match<B>(
    this: AsyncData<A>,
    config: {
      Done: (value: A) => B;
      Loading: () => B;
      NotAsked: () => B;
    },
  ) {
    return this.tag === "Done"
      ? config.Done(this.value)
      : this.tag === "Loading"
      ? config.Loading()
      : config.NotAsked();
  },

  tap(this: AsyncData<A>, func: (asyncData: AsyncData<A>) => unknown) {
    func(this);
    return this;
  },

  toOption(this: AsyncData<A>) {
    return this.tag === "Done" ? Option.Some(this.value) : Option.None();
  },

  isDone(this: AsyncData<A>): boolean {
    return this.tag === "Done";
  },

  isLoading(this: AsyncData<A>): boolean {
    return this.tag === "Loading";
  },

  isNotAsked(this: AsyncData<A>): boolean {
    return this.tag === "NotAsked";
  },
}))();

// @ts-expect-error
asyncDataProto.__boxed_type__ = "AsyncData";

const doneProto = (<A>(): Omit<Done<A>, "tag" | "value"> => ({
  ...(asyncDataProto as IAsyncData<A>),

  get() {
    return this.value;
  },
}))();

const Done = <A = never>(value: A): AsyncData<A> => {
  const asyncData = Object.create(doneProto) as Done<A>;
  asyncData.tag = "Done";
  asyncData.value = value;
  return asyncData;
};

const LOADING = (() => {
  const asyncData = Object.create(asyncDataProto) as Loading<unknown>;
  asyncData.tag = "Loading";
  return asyncData;
})();

const NOT_ASKED = (() => {
  const asyncData = Object.create(asyncDataProto) as NotAsked<unknown>;
  asyncData.tag = "NotAsked";
  return asyncData;
})();

const Loading = <A = never>(): AsyncData<A> => LOADING as Loading<A>;
const NotAsked = <A = never>(): AsyncData<A> => NOT_ASKED as NotAsked<A>;

export const AsyncData = {
  /**
   * Create an AsyncData.Done value
   */
  Done,

  /**
   * Create an AsyncData.Loading value
   */
  Loading,

  /**
   * Create an AsyncData.NotAsked value
   */
  NotAsked,

  /**
   * Turns an array of asyncData into an asyncData of array
   */
  all<AsyncDatas extends AsyncData<any>[] | []>(asyncDatas: AsyncDatas) {
    const length = asyncDatas.length;
    let acc = AsyncData.Done<Array<unknown>>([]);
    let index = 0;

    while (true) {
      if (index >= length) {
        return acc as AsyncData<{
          [K in keyof AsyncDatas]: AsyncDatas[K] extends AsyncData<infer T>
            ? T
            : never;
        }>;
      }

      const item = asyncDatas[index];

      if (item != null) {
        acc = acc.flatMap((array) => {
          return item.map((value) => {
            array.push(value);
            return array;
          });
        });
      }

      index++;
    }
  },

  /**
   * Turns an dict of asyncData into a asyncData of dict
   */
  allFromDict<Dict extends LooseRecord<AsyncData<any>>>(
    dict: Dict,
  ): AsyncData<{
    [K in keyof Dict]: Dict[K] extends AsyncData<infer T> ? T : never;
  }> {
    const dictKeys = keys(dict);

    return AsyncData.all(values(dict)).map((values) =>
      Object.fromEntries(zip(dictKeys, values)),
    );
  },

  equals<A>(a: AsyncData<A>, b: AsyncData<A>, equals: (a: A, b: A) => boolean) {
    return a.tag === "Done" && b.tag === "Done"
      ? equals(a.value, b.value)
      : a.tag === b.tag;
  },

  pattern: {
    Done: <T>(x: T) => ({ tag: "Done", value: x } as const),
    NotAsked: { tag: "NotAsked" } as const,
    Loading: { tag: "Loading" } as const,
  },
};
