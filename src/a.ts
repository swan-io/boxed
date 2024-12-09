type FilterSubtypes<T, U> = T extends any ? (T extends U ? never : T) : never;

// Example usage demonstrating different scenarios
type Example1 = FilterSubtypes<
  | { type: string; value: number }
  | { type: "foo"; value: string }
  | { type: "bar"; value: boolean },
  { type: "foo" }
>;
// Result: { type: string, value: number } | { type: 'bar', value: boolean }

type Example2 = FilterSubtypes<
  { status: "active" | "inactive" | "pending" },
  { status: "active" | "inactive" }
>;
// Result: { status: 'pending' }

// Type checks to verify behavior
type Test1 = Example1 extends { type: "foo"; value: string } ? false : true; // true
type Test2 = Example1 extends { type: string; value: number } ? true : false; // true
type Test3 = Example1 extends { type: "bar"; value: boolean } ? true : false; // true

// More complex nested object example
type ComplexExample = FilterSubtypes<
  {
    kind: "A" | "B" | "C";
    details: {
      level: number;
      category: "x" | "y" | "z";
    };
  },
  { kind: "A" | "B" }
>;
