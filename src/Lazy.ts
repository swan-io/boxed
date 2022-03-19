type Ref<T> = { contents: T };

const NOT_COMPUTED = Symbol.for("NOT_COMPUTED");

export const Lazy = <Value>(func: () => Value): { value: Value } => {
  const value: Ref<Value | typeof NOT_COMPUTED> = { contents: NOT_COMPUTED };
  return {
    get value() {
      if (value.contents === NOT_COMPUTED) {
        value.contents = func();
      }
      return value.contents;
    },
  };
};
