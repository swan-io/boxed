import { Option } from "./Option.js";

export type Result<Ok, Error> =
  | (ResultClass<Ok, Error> & { tag: "Ok"; value: Ok })
  | (ResultClass<Ok, Error> & { tag: "Error"; value: Error });

class ResultClass<Ok, Error> {
  tag: "Ok" | "Error";
  value: Ok | Error;
  constructor() {
    this.tag = undefined as unknown as "Ok" | "Error";
    this.value = undefined as unknown as Ok | Error;
  }
  map<ReturnValue>(f: (value: Ok) => ReturnValue): Result<ReturnValue, Error> {
    if (this.tag === "Ok") {
      return Result.Ok(f(this.value as Ok));
    } else {
      return this as unknown as Result<ReturnValue, Error>;
    }
  }
  flatMap<ReturnValue>(
    f: (value: Ok) => Result<ReturnValue, Error>
  ): Result<ReturnValue, Error> {
    if (this.tag === "Ok") {
      return f(this.value as Ok);
    } else {
      return this as unknown as Result<ReturnValue, Error>;
    }
  }
  getWithDefault(defaultValue: Ok): Ok {
    if (this.tag === "Ok") {
      return this.value as Ok;
    } else {
      return defaultValue;
    }
  }
  match<ReturnValue>(config: {
    Ok: (value: Ok) => ReturnValue;
    Error: (error: Error) => ReturnValue;
  }): ReturnValue {
    if (this.tag === "Ok") {
      return config.Ok(this.value as Ok);
    } else {
      return config.Error(this.value as Error);
    }
  }
  isOk(): this is Result<Ok, Error> & { tag: "Ok"; value: Ok } {
    return this.tag === "Ok";
  }
  isError(): this is Result<Ok, Error> & { tag: "Error"; value: Error } {
    return this.tag === "Error";
  }
  toOption(): Option<Ok> {
    if (this.tag === "Ok") {
      return Option.Some(this.value) as Option<Ok>;
    } else {
      return Option.None() as Option<Ok>;
    }
  }
}

export const Result = {
  Ok: <Ok, Error>(ok: Ok): Result<Ok, Error> => {
    const result = Object.create(ResultClass.prototype) as Result<Ok, Error>;
    result.tag = "Ok";
    result.value = ok;
    return Object.freeze(result);
  },
  Error: <Ok, Error>(error: Error): Result<Ok, Error> => {
    const result = Object.create(ResultClass.prototype) as Result<Ok, Error>;
    result.tag = "Error";
    result.value = error;
    return Object.freeze(result);
  },
  fromExecution<ReturnValue>(func: () => ReturnValue) {
    try {
      return Result.Ok(func());
    } catch (err) {
      return Result.Error(err);
    }
  },
  async fromPromise<ReturnValue>(promise: Promise<ReturnValue>) {
    try {
      const value = await promise;
      return Result.Ok<ReturnValue, unknown>(value);
    } catch (err) {
      return Result.Error<ReturnValue, unknown>(err);
    }
  },
  equals: <Value, Error>(
    a: Result<Value, Error>,
    b: Result<Value, Error>,
    equals: (a: Value, b: Value) => boolean
  ) => {
    if (a.tag !== b.tag) {
      return false;
    }
    if (a.tag === "Error" && b.tag === "Error") {
      return true;
    }
    return equals(a.value as unknown as Value, b.value as unknown as Value);
  },
  pattern: {
    Ok: <T>(x: T) => ({ tag: "Ok", value: x } as const),
    Error: <T>(x: T) => ({ tag: "Error", value: x } as const),
  },
};
