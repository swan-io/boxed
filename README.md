# @swan-io/boxed

> Utility types for functional TypeScript

**Boxed** provides functional utility types and functions, while focusing on ease-of-use.

## Design principles

- Provide utility types that **make data-manipulation and storage easier**
- **Immutable** (all provided types are immutable)
- Give a **good development experience** (chaining API, reliable types)
- Simple **interoperability** (you can convert back and forth to JS native types)
- Compatibility with `ts-pattern` (using `patterns` we provide).

## What's in the box?

- `Option<Value>`
- `Result<Ok, Error>`
- `AsyncData<Value>`
- `Future<Value>`
- `Lazy<Value>`
- Some utils like `Deferred`, `Dict` & `Array`

## Install

```console
$ yarn add @swan-io/boxed
```

or

```console
$ npm install --save @swan-io/boxed
```

## [Documentation](https://bloodyowl.github.io/boxed)

## [License](./MIT-LICENSE)
