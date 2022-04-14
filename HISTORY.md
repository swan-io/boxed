# 0.3.6

Changes:

- Add more guarantees on Future (7ba99ec)

# 0.3.5

Changes:

- Remove `Unwrap` type removing guarantees (bb83047)

# 0.3.4

Changes:

- Simplify `Future.mapResult` type (ce2749a)

# 0.3.3

Features:

- Add `Option.all`, `Result.all` & `AsyncData.all` (039eeda)

# 0.3.2

Features:

- Add tap functions on `Option`, `Result` and `AsyncData` for debugging (cb63dcf)
- Add `mapError` and `flatMapError` to `Result` (0d36a03)

# 0.3.1

Changes:

- Improve typing for `Future` (f8d9e12)
- Make `Future.flatMapOk` & `Future.flatMapError` behave like the result ones (f8d9e12)

# 0.3.0

Changes:

- Make `flatMap` aggregate error types with a union (015da3b)

# 0.2.1

Features:

- Reexport `Array` static methods than can be shadowed when importing `Array` from boxed (2dd970b)

# 0.2.0

Changes:

- Better guaratees on `Dict.entries` and `Dict.keys` (Thanks [0xCAFEADD1C7](https://github.com/0xCAFEADD1C7)) (ec67c64, c572dab)
- Better typing for `Result.fromExecution` and `Result.fromPromise` (c25623f)

# 0.1.2

Changes:

- Improve exposed types readability (6fb0128)

# 0.1.1

Changes:

- Improve repository structure (9cd199a)

# 0.1.0

Initial version
