import { AsyncData } from "./AsyncData";
import { Option } from "./Option";
import { Result } from "./Result";

export const encode = (value: any, indent?: number | undefined) => {
  return JSON.stringify(
    value,
    function (key, value) {
      if (value == null) {
        return;
      }
      if (value.__boxed_type__ === "Option") {
        return {
          __boxed_type__: "Option",
          tag: value.value.tag,
          value: value.value.value,
        };
      }
      if (value.__boxed_type__ === "Result") {
        return {
          __boxed_type__: "Result",
          tag: value.value.tag,
          value: value.value.value,
        };
      }
      if (value.__boxed_type__ === "AsyncData") {
        return {
          __boxed_type__: "AsyncData",
          tag: value.value.tag,
          value: value.value.value,
        };
      }
      return value;
    },
    indent,
  );
};

export const decode = (value: string) => {
  return JSON.parse(value, function (key, value) {
    if (value == null) {
      return value;
    }
    if (value.__boxed_type__ === "Option") {
      return value.tag === "Some" ? Option.Some(value.value) : Option.None();
    }
    if (value.__boxed_type__ === "Result") {
      return value.tag === "Ok"
        ? Result.Ok(value.value)
        : Result.Error(value.value);
    }
    if (value.__boxed_type__ === "AsyncData") {
      return value.tag === "NotAsked"
        ? AsyncData.NotAsked()
        : value.tag === "Loading"
        ? AsyncData.Loading()
        : AsyncData.Done(value.value);
    }
    return value;
  });
};
