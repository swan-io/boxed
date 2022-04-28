---
title: Trivia
sidebar_label: Trivia
---

## Why is it called Boxed?

Most of the types we provide can be seen as **container** boxing **values**, hence the **box**. This approach makes disambiguation between certain values possible, where regular JavaScript construct don't (e.g. the return value from `array.find(x => x === undefined)` doesn't give you any information).

That's how we think of the `Option`, `Result` and `AsyncData` types: little boxes that may or may not contain certain informations (like [Schrödinger's cat](https://en.wikipedia.org/wiki/Schrödinger%27s_cat) 🐈).

## How does Boxed work?

We aim for a good compromise between **performance**, **developer experience** and ability to **leverage TypeScript**.

We settled on using classes, as it provides a familiar chaining API.

```ts
class Option<Value> {
  value: { tag: "Some"; value: Value } | { tag: "None" };
  // ...
  map(f) {
    /* ... */
  }
}
```

Having a union type within the `value` allows us **pattern-match** the values, while sharing the methods in memory.

For performance, we make the prototype methods cleaner make rebuilding it from `Object.create(null)`:

```ts
const proto = Object.create(
  null,
  Object.getOwnPropertyDescriptors(OptionClass.prototype),
);
```

We then use `Object.create(proto)` to create new instances, on which we set our values:

```ts
const option = Object.create(proto) as Option<Value>;
option.value = { tag: "Some", value: value };
```

## Where's _{insert category theory terminology}_?

We want this library to be **as simple as possible**.

While the theoretical concepts in languages such as Haskell are really interesting and powerful, we don't want to add that kind of **knowledge barrier** for a library that can benefit to lots. That's also the reason why we use simple wording, such as `Result.Ok` & `Result.Error` instead of more abstract naming like `Either.Left` & `Either.Right`.

This approach made us settle on an API that leverages JavaScript objects to provide chaining (although we're likely to provide a functional API once [the pipeline operator](https://github.com/tc39/proposal-pipeline-operator) lands in JS).

![](/img/profunctor-optics.jpg)
