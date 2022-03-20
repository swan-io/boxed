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

## Where's _{insert category theory terminology}_?

We want this library to be **as simple as possible**.

While the theoretical concepts in languages such as Haskell are really interesting and powerful, we don't want to add that kind of **knowledge barrier** for a library that can benefit to lots. That's also the reason why we use simple wording, such as `Result.Ok` & `Result.Error` instead of more abstract naming like `Either.Left` & `Either.Right`.

That's also the reason why we settled on an API that leverages JavaScript objects to provide chaining (although we're likely to provide a functional API once [the pipeline operator](https://github.com/tc39/proposal-pipeline-operator) lands in JS).

![](/img/profunctor-optics.jpg)
