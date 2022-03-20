---
title: Trivia
sidebar_label: Trivia
---

## How does Boxed work?

We aim for a good compromise between **performance**, **developer experience** and ability to **leverage TypeScript**.

How we achieve this is by "tweaking" how TypeScript sees our types. For most of them, the first thing we do is create a `class` that holds the utility methods.

```ts
class OptionClass<Value> {
  // ...
  map(f) {
    /* ... */
  }
}
```

Then, we create a type on top of it with a **discriminating union**:

```ts
type Option<Value> =
  | (OptionClass<Value> & { tag: "Some"; value: Value })
  | (OptionClass<Value> & { tag: "None"; value: undefined });
```

This allows to **pattern-match** the values, while sharing the methods in memory.

For performance, we make the prototype methods cleaner make rebuilding it from `Object.create(null)`:

```ts
const proto = Object.create(
  null,
  Object.getOwnPropertyDescriptors(OptionClass.prototype)
);
```

We then use `Object.create(proto)` to create new instances, on which we set our values:

```ts
const option = Object.create(proto) as Option<Value>;
option.tag = "Some";
option.value = value;
return option;
```

## Why don't the types implement monads?

Even though most of the provided type implement a `.map` and `.flatMap`, that's the furthest we'll go.

We want this library to be **as simple as possible**, and feel like those concepts bring too little value in a web application context, which is our main use-case.
