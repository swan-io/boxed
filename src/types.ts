export type LooseRecord<T> = Record<PropertyKey, T>;

export type JsonResult<A, E> =
  | { __boxed_type__: "Result"; tag: "Ok"; value: A }
  | { __boxed_type__: "Result"; tag: "Error"; error: E };

export type JsonAsyncData<A> =
  | { __boxed_type__: "AsyncData"; tag: "NotAsked" }
  | { __boxed_type__: "AsyncData"; tag: "Loading" }
  | { __boxed_type__: "AsyncData"; tag: "Done"; value: A };

export type JsonOption<A> =
  | { __boxed_type__: "Option"; tag: "None" }
  | { __boxed_type__: "Option"; tag: "Some"; value: A };
