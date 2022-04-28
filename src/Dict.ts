export function entries<T extends Record<string | number | symbol, unknown>>(
  value: T,
) {
  return Object.entries(value) as NonNullable<
    {
      [K in keyof T]: K extends string ? [K, T[K]] : never;
    }[keyof T]
  >[];
}

export function keys<T extends Record<string | number | symbol, unknown>>(
  value: T,
) {
  return Object.keys(value) as NonNullable<
    {
      [K in keyof T]: K extends string ? K : never;
    }[keyof T]
  >[];
}

export function values<T extends Record<string | number | symbol, unknown>>(
  value: T,
) {
  return Object.values(value) as {
    [K in keyof T]: K extends string ? T[K] : never;
  }[keyof T][];
}
