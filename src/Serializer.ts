import { AsyncData } from "./AsyncData";
import { Option, Result } from "./OptionResult";

export const encode = (value: any, indent?: number | undefined) => {
  return JSON.stringify(value, null, indent);
};

export const decode = (value: string) => {
  return JSON.parse(value, function (key, value) {
    if (value == null) {
      return value;
    }
    if (value.__boxed_type__ === "Option") {
      return Option.fromJSON(value);
    }
    if (value.__boxed_type__ === "Result") {
      return Result.fromJSON(value);
    }
    if (value.__boxed_type__ === "AsyncData") {
      return AsyncData.fromJSON(value);
    }
    return value;
  });
};
