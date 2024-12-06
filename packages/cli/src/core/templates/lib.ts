const isObject = (val: any): val is Record<string, any> =>
  val !== null && typeof val === 'object'

/**
 * Dead simple template engine, just like Python's `.format()`
 * Support passing variables as either in index based or object/name based approach
 * While using object/name based approach, you can pass a fallback value as the third argument
 *
 * @category String
 * @example
 * ```
 * const result = template(
 *   'Hello {0}! My name is {1}.',
 *   'Inès',
 *   'Anthony'
 * ) // Hello Inès! My name is Anthony.
 * ```
 *
 * ```
 * const result = namedTemplate(
 *   '{greet}! My name is {name}.',
 *   { greet: 'Hello', name: 'Anthony' }
 * ) // Hello! My name is Anthony.
 * ```
 *
 * const result = namedTemplate(
 *   '{greet}! My name is {name}.',
 *   { greet: 'Hello' }, // name isn't passed hence fallback will be used for name
 *   'placeholder'
 * ) // Hello! My name is placeholder.
 * ```
 */
export function template(
  str: string,
  object: Record<string | number, any>,
  fallback?: string | ((key: string) => string)
): string
export function template(
  str: string,
  ...args: (string | number | bigint | undefined | null)[]
): string
export function template(str: string, ...args: any[]): string {
  const [firstArg, fallback] = args

  if (isObject(firstArg)) {
    const vars = firstArg as Record<string, any>
    return str.replace(
      /{([\w\d]+)}/g,
      (_, key) =>
        vars[key] ||
        ((typeof fallback === 'function' ? fallback(key) : fallback) ?? key)
    )
  }

  return str.replace(/{(\d+)}/g, (_, key) => {
    const index = Number(key)
    if (Number.isNaN(index)) return key
    return args[index]
  })
}
