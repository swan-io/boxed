export const createStore = () => {
  const store = new Map<unknown, WeakRef<object>>();

  const registry = new FinalizationRegistry((value) => {
    store.delete(value);
  });

  return {
    set: (key: unknown, value: object) => {
      store.set(key, new WeakRef(value));
      registry.register(value, key);
    },
    get: (key: unknown): unknown => {
      const value = store.get(key);
      if (value !== undefined) {
        return value.deref();
      }
    },
  };
};
