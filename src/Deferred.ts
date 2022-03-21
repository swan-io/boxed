import { Future } from "./Future";

export const Deferred = {
  make<Value>() {
    let resolver: ((value: Value) => void) | undefined = undefined;
    const future = Future.make((resolve) => {
      resolver = resolve;
    });
    return [future, resolver as unknown as (value: Value) => void] as const;
  },
};
