import { Option } from "./OptionResult";
import { Union } from "./match";
import { GetPatternForInput } from "./matchCompatibility";
import { DeepExclude } from "./matchExclude";
import {
  FlattenWithStructure,
  GetMatch,
  RefineWithPattern,
} from "./matchRefine";
import { createMatcher } from "./matchRuntime";
import { Pattern } from "./matchTypes";
import { getId } from "./patterns";

class ExhaustiveError<Input extends unknown> extends Error {
  missingCases: Input;
  constructor(missingCases: Input) {
    super("ExhaustiveError");
    this.missingCases = missingCases;
  }
}

export type Match<Input, Output = never> = {
  when<
    P extends CompatiblePattern,
    ReturnValue,
    CompatiblePattern extends Pattern = GetPatternForInput<Input>,
  >(
    pattern: P,
    func: (data: GetMatch<Input, P>) => ReturnValue,
  ): Match<
    DeepExclude<
      Input,
      FlattenWithStructure<RefineWithPattern<Input, P, false>>
    >,
    Union<Output, ReturnValue>
  >;

  otherwise<Func extends (data: Input) => Output>(func: Func): Output;

  exhaustive: [Input] extends [never] ? () => Output : ExhaustiveError<Input>;
};

type MatchResult = {
  matches: boolean;
  selection: unknown;
};

const MATCHER_CACHE = new Map<any, (value: unknown) => MatchResult>();

const getOrCreateFunction = (
  value: Pattern,
): ((value: unknown) => MatchResult) => {
  const id = getId(value);
  if (MATCHER_CACHE.has(id)) {
    return MATCHER_CACHE.get(id) as (value: unknown) => MatchResult;
  }
  const func = Function("$", createMatcher(value)) as (
    value: unknown,
  ) => MatchResult;
  MATCHER_CACHE.set(id, func);
  return func;
};

export const match = <Input, Output = never>(input: Input) => {
  let returnValue: Option<any> = Option.None();

  const matcher = {
    when(pattern: Pattern, func: (value: unknown) => unknown) {
      if (returnValue.isSome()) {
        return this;
      }
      const matcher = getOrCreateFunction(pattern);
      const result = matcher(input);

      if (result.matches) {
        const value = func(result.selection);
        returnValue = Option.Some(value);
      }
      return this;
    },
    otherwise(func: (value: unknown) => unknown) {
      if (returnValue.isSome()) {
        return returnValue.get() as unknown as Output;
      }
      return func(input);
    },
    exhaustive() {
      if (returnValue.isSome()) {
        return returnValue.get() as unknown as Output;
      }
      throw new ExhaustiveError(input as unknown as string);
    },
  } as unknown as Match<Input, Output>;

  return matcher;
};
