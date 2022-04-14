---
title: Option<Value>
sidebar_label: Option
---

The `Option` type can be used as a replacement for `null` and `undefined` when manipulating optional data. Contrary to `null` and `undefined`, an option is kind of like a box, that contains a value or not.

It can be useful to distinguish values between each other: you can represent `Some(None)` with options, whereas `undefined` or `null` replace the value they intend to make optional.

An option can have two possible states:

- `Some(value)`
- `None`

## Create an Option value

To create an option, use the `Some` and `None` constructors:

```ts
import { Option } from "@swan-io/boxed";

const aName = Option.Some("John");
const bName = Option.None<string>();
```

You get interop with `null` and `undefined`:

```ts
// `value` being `null` or `undefined` makes a `None`
const a = Option.fromNullable(value);
// `value` being `null` makes a `None`
const b = Option.fromNull(value);
// `value` being `undefined` makes a `None`
const c = Option.fromUndefined(value);
```

The option type provides a few manipulation functions:

## .map(f)

If the option is `Some(value)` returns `Some(f(value))`, otherwise returns `None`.

```ts
Option.Some(2).map((x) => x * 2); // Option.Some(4)
```

## .flatMap(f)

If the option is `Some(value)` returns `f(value)`, otherwise returns `None`.

```ts
Option.Some(2).flatMap((x) => {
  if (x > 1) {
    return Option.None();
  } else {
    return Option.Some(2);
  }
});
```

## .getWithDefault(defaultValue)

If the option is `Some(value)` returns `value`, otherwise returns `defaultValue`.

```ts
Option.Some(2).getWithDefault(1); // 2
Option.None().getWithDefault(1); // 1
```

## .isSome()

Type guard. Checks if the option is `Some(value)`

```ts
Option.Some(2).isSome(); // true
Option.None().isSome(); // false
```

## .isNone()

Type guard. Checks if the option is `None`

```ts
Option.Some(2).isNone(); // false
Option.None().isNone(); // true
```

## .toNull()

Returns `null` if the option is `None`, returns the value otherwise

```ts
Option.Some(2).toNull(); // 2
Option.None().toNull(); // null
```

## .toUndefined()

Returns `undefined` if the option is `None`, returns the value otherwise

```ts
Option.Some(2).toUndefined(); // 2
Option.None().toUndefined(); // undefined
```

## .match()

Match the option state

```ts
const valueToDisplay = option.match({
  Some: (value) => value,
  None: () => "No value",
});
```

## .tap(func)

Executes `func` with `option`, and returns `option`. Useful for logging and debugging.

```ts
option.tap(console.log).map((x) => x * 2);
```

## Option.all(options)

Turns an "array of options of value" into a "option of array of value".

```ts
Option.all([Option.Some(1), Option.Some(2), Option.Some(3)]);
// Some([1, 2, 3])
Option.all([Option.None(), Option.Some(2), Option.Some(3)]);
// None
```

## TS Pattern interop

```ts
import { match, select } from "ts-pattern";
import { Option } from "@swan-io/boxed";

match(myOption)
  .with(Option.pattern.Some(select()), (value) => console.log(value))
  .with(Option.pattern.None, () => "No value")
  .exhaustive();
```
