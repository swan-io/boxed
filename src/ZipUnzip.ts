export const unzip = <A, B>(array: Array<[A, B]> | ReadonlyArray<[A, B]>) => {
  const length = array.length;
  const arrayA = Array(length);
  const arrayB = Array(length);
  let index = -1;
  while (++index < length) {
    const match = array[index];
    if (match !== undefined) {
      arrayA[index] = match[0];
      arrayB[index] = match[1];
    }
  }
  return [arrayA, arrayB] as [A[], B[]];
};

export const zip = <A, B>(
  arrayA: A[] | ReadonlyArray<A>,
  arrayB: B[] | ReadonlyArray<B>,
) => {
  const length = Math.min(arrayA.length, arrayB.length);
  const array = Array(length);
  let index = -1;
  while (++index < length) {
    array[index] = [arrayA[index], arrayB[index]];
  }
  return array as [A, B][];
};
