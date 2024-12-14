/**
 * compareFn to sort two numbers by ascending order.
 * @example [8,7,6,5,4].sort(asc) => [4,5,6,7,8]
 * @returns number
 */
export const asc: (a: number, b: number) => number = (a, b) => {
  if (a < b) return -1
  if (a === b) return 0
  return +1
}

/**
 * compareFn to sort two numbers by descending order.
 * @example [4,5,6,78].sort(asc) => [8,7,6,5,4]
 * @returns number
 */
export const desc: (a: number, b: number) => number = (a, b) => {
  if (a > b) return -1
  if (a === b) return 0
  return +1
}
/**
 * Compares a key by a provided compareFn.
 * @returns void
 */
export function by<O, K extends keyof O>(
  key: K,
  compareFn: (a: O[K], b: O[K]) => number
) {
  return (a: O, b: O) => compareFn(a[key], b[key])
}
