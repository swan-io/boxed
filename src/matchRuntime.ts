import {
  ANY_PATTERN,
  ARRAY_PATTERN,
  BIGINT_PATTERN,
  BOOLEAN_PATTERN,
  DICT_PATTERN,
  DONE_PATTERN,
  ERROR_PATTERN,
  LOADING_PATTERN,
  NONE_PATTERN,
  NOT_ASKED_PATTERN,
  NUMBER_PATTERN,
  OK_PATTERN,
  Pattern,
  SELECT_PATTERN,
  SOME_PATTERN,
  STRING_PATTERN,
  UNION_PATTERN,
} from "./matchTypes";

export const createMatcher = (
  typePattern: Pattern,
  varName: string = "$",
  ref: { counter: number } = { counter: -1 },
  isChild: boolean = false,
): string => {
  let value: string = "";

  if (typeof typePattern === "symbol") {
    if (typePattern === ANY_PATTERN) {
      value = `true`;
    }
    if (typePattern === STRING_PATTERN) {
      value = `typeof ${varName} === "string"`;
    }
    if (typePattern === NUMBER_PATTERN) {
      value = `typeof ${varName} === "number"`;
    }
    if (typePattern === BOOLEAN_PATTERN) {
      value = `typeof ${varName} === "boolean"`;
    }
    if (typePattern === BIGINT_PATTERN) {
      value = `typeof ${varName} === "bigint"`;
    }
    if (typePattern === NONE_PATTERN) {
      value = `${varName} != null && ${varName}.__boxed_type__ === "Option" && ${varName}.tag === "None"`;
    }
    if (typePattern === NOT_ASKED_PATTERN) {
      value = `${varName} != null && ${varName}.__boxed_type__ === "AsyncData" && ${varName}.tag === "NotAsked"`;
    }
    if (typePattern === LOADING_PATTERN) {
      value = `${varName} != null && ${varName}.__boxed_type__ === "AsyncData" && ${varName}.tag === "Loading"`;
    }
  } else {
    if (typeof typePattern === "object") {
      if (typePattern === null) {
        value = `${varName} === null`;
      } else {
        if (typePattern.type === SOME_PATTERN) {
          value = `${varName} != null && ${varName}.__boxed_type__ === "Option" && ${varName}.tag === "Some" && (${`$${++ref.counter}=${varName}.value`},${createMatcher(
            typePattern.value,
            `$${ref.counter}`,
            ref,
            true,
          )})`;
        }
        if (typePattern.type === DONE_PATTERN) {
          value = `${varName} != null && ${varName}.__boxed_type__ === "AsyncData" && ${varName}.tag === "Done" && (${`$${++ref.counter}=${varName}.value`},${createMatcher(
            typePattern.value,
            `$${ref.counter}`,
            ref,
            true,
          )})`;
        }
        if (typePattern.type === OK_PATTERN) {
          value = `${varName} != null && ${varName}.__boxed_type__ === "Result" && ${varName}.tag === "Ok" && (${`$${++ref.counter}=${varName}.value`},${createMatcher(
            typePattern.value,
            `$${ref.counter}`,
            ref,
            true,
          )})`;
        }
        if (typePattern.type === ERROR_PATTERN) {
          value = `${varName} != null && ${varName}.__boxed_type__ === "Result" && ${varName}.tag === "Error" && (${`$${++ref.counter}=${varName}.error`},${createMatcher(
            typePattern.value,
            `$${ref.counter}`,
            ref,
            true,
          )})`;
        }
        if (typePattern.type === ARRAY_PATTERN) {
          value = `Array.isArray(${varName}) && ${varName}.every(${`$=>${createMatcher(
            typePattern.value,
            "$",
            ref,
            true,
          )}`})`;
        }
        if (typePattern.type === DICT_PATTERN) {
          value =
            `${varName}!=null && typeof ${varName}==="object" &&` +
            Object.entries(typePattern.value)
              .filter(([, value]) => value !== undefined)
              .map(
                ([key, value]) =>
                  `($${++ref.counter}=${varName}[${JSON.stringify(
                    key,
                  )}],${createMatcher(
                    value as Pattern,
                    `$${ref.counter}`,
                    ref,
                    true,
                  )})`,
              )
              .join(" && ");
        }
        if (typePattern.type === SELECT_PATTERN) {
          value = `($_=typeof $_==="undefined"?{}:$_,$_[${JSON.stringify(
            typePattern.key,
          )}]=${varName},${createMatcher(
            typePattern.value,
            varName,
            ref,
            true,
          )})`;
        }
        if (typePattern.type === UNION_PATTERN) {
          const patterns = typePattern.value as Array<Pattern>;
          value = `(${patterns
            .map((item) => createMatcher(item, varName, ref))
            .join("||")})`;
        }
      }
    }
    if (typeof typePattern === "bigint") {
      value = `${varName} === ${typePattern.toString()}n`;
    }
    if (
      typeof typePattern === "string" ||
      typeof typePattern === "number" ||
      typeof typePattern === "boolean" ||
      typeof typePattern === "undefined"
    ) {
      value = `${varName} === ${JSON.stringify(typePattern)}`;
    }
  }

  return (
    (isChild === false ? `let $_;` : ``) +
    (ref.counter > -1 && isChild === false
      ? `let ${Array.from(
          { length: ref.counter + 1 },
          (_, index) => `$${index}`,
        ).join(",")}; `
      : ``) +
    (isChild === false ? `return ` : ``) +
    `${value} ${
      isChild === false
        ? `? ({matches: true, selection: typeof $_==="undefined"?$:$_}) : ({matches:false})`
        : ``
    }`
  );
};
