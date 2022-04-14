---
title: Core Concepts
sidebar_label: Core Concepts
---

The Boxed approach takes root in **typed functional paradigms**. We know that these concepts can be overwhelming, especially with their jargon and mathematical concepts, and therefore want to make them more **accessible**.

As beautiful and powerful these concepts are, they come with a huge learning curve that we want to avoid. We also want your code to be simple to read, write and reason about.

## Boxes

The way we like to think of the data-structures we expose are that they're **boxes** (or containers) that **may or may not contain a value**.

Here's a visual example using the **Option type**. The Option represents an optional value, **it can have two possible states**: either `Some(value)` or `None()`.

![Option of blue circle, it can be either a box containing a blue circle, which we call Some blue circle, or an empty box, which we call None](/img/option.png)

Option is a generic type, meaning you can define what type of value it holds: `Option<User>`, `Option<string>` (just like an array: `Array<User>`, `Array<string>`).

In your program flow, you don't know what's inside, **as if the box was closed**.

When you extract the value from the box, you have a few options:

```ts
// Let's assument we have `option` be of type `Option<number>`

// Returns the value if present or the fallback otherwise
const a = option.getWithDefault(0);

// Explode the box
const b = option.match({
  Some: (value) => value,
  None: () => 0,
});
```

## Data-manipulation basics

Most of the data-manipulation you'll do comes down to two function: `map` and `flatMap`.

Here's a visual explanation:

![The map function transforms the value with a callback, the flatMap function returns an box itself](/img/map-flatmap.png)

The `map` and `flatMap` functions allow you to transform data in a typesafe way:

```ts
const some = Option.Some(1);
// Some(1)
const none = Option.None();
// None()
const doubledSome = some.map((x) => x * 2);
// Some(2)
const doubledNone = none.map((x) => x * 2);
// None() -> Nothing to transform!
```

The `flatMap` let's you return another option, which can be useful for nested optional values:

```ts
type UserInfo = {
  name: Option<string>;
};

type User = {
  id: string;
  info: Option<UserInfo>;
};

const name = user
  .flatMap((user) => user.info) // Returns the Option<UserInfo>
  .flatMap((info) => info.name) // Returns the Option<string>
  .getWithDefault("Anonymous user");
```

## The main kind of boxes

### [**Option<Value\>**](/option)

Represents optional values:

- Replaces `undefined` and `null`
- Makes it possible to differentiate nested optionality (`Some(None())` vs `None()`)
- Reduces the number of codepaths needed to read and transform such values

### [**Result<Ok, Error\>**](/result)

Represents a computation that can either succeed or fail:

- Replaces exceptions
- Allows you to have a single codepath instead or "return or throw".
- Makes it easy to aggregate all possible errors a stack can generate

### [**AsyncData<Value\>**](/async-data)

Represents a value with an asynchronous lifecycle:

- Eliminates impossibles cases in your state
- Avoids inconsistent states induced by traditional modeling
- Allows you to tie the lifecycle information with the value itself

### [**Future<Value\>**](/future)

Represents an asynchronous value:

- Replaces promises
- Supports cancellation
- Delegates success/failure to the Result type
- Exposes a `map` & `flatMap` API
