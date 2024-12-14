/**
 * These functions implement a min heap which can be used to pop the lowest
 * key.  It uses an array as the heap, and each row in the heap must be an
 * array with the key as the first element:
 *
 * heap: [number, ...T][]
 *
 * The main thing to keep in mind is that a heap sort just ensures that the
 * parent key <= child keys, it won't be in ascending order.
 *
 * The >> operator is the bit shift operator.  It's used to calculate the index
 * of the parent of a node.  This is one of the unique characteristics of a
 * heap -- no pointers are needed to keep track of child or parent indexes,
 * the structure of the heap itself determines that:
 * 0 root
 * 1 parent 0
 * 2 parent 0
 * 3 parent 1
 * 4 parent 1
 * 5 parent 2
 * 6 parent 2
 * 7 parent 3
 *
 * parent(7) = 7 >> 1 = 3 (0111 >> 1 = 0011)
 * children(2) = 2 * 2 + 1 = 5 and 5 + 1
 */

/**
 * Replace the root node of the given heap with the given node, and return the
 * previous root. Returns the given node if the heap is empty.  Similar to
 * calling pop and push, but more efficient.
 */
function _exchange<T extends any[]>(
  arr: [number, ...T][],
  value: [number, ...T]
) {
  if (arr.length === 0) return value
  // Get the root node, so to return it later
  const oldValue = arr[0]
  // Inject the replacing node using the sift-down process
  _siftDown(arr, 0, value)
  return oldValue
}

/**
 * Reorder the given array in-place so that it becomes a valid heap.  Elements
 * in the given array must have a [0] property (e.g. arrays).  That [0] value
 * serves as the key to establish the heap order. The rest of such an element
 * is just payload. It also returns the heap.
 */
function heapify<T extends any[]>(arr: [number, ...T][]) {
  // Establish heap with an incremental, bottom-up process
  for (let i = arr.length >> 1; i--; ) _siftDown(arr, i)
  return arr
}

/**
 * Extract the root of the given heap and return it (the subarray).  Returns
 * undefined if the heap is empty
 */
function pop<T extends any[]>(arr: [number, ...T][]) {
  // Pop the last leaf from the given heap, and exchange it with its root
  return arr.length === 0 ? undefined : _exchange(arr, arr.pop()!) // Returns the old root
}

/**
 * Inserts the given node into the given heap. Return the heap.
 */
function push<T extends any[]>(arr: [number, ...T][], value: [number, ...T]) {
  const key = value[0]
  let i = arr.length // First assume the insertion spot is at the very end (as a leaf)
  let j: number
  // Then follow the path to the root, moving values down for as long as they
  // are greater than the value to be inserted
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  while ((j = (i - 1) >> 1) >= 0 && key < arr[j][0]) {
    arr[i] = arr[j]
    i = j
  }
  // Found the insertion spot
  arr[i] = value
  return arr
}

/**
 * The node at the given index of the given heap is sifted down in
 * its subtree until it does not have a child with a lesser value.
 */
function _siftDown(arr: any[][], i = 0, value = arr[i]) {
  if (i < arr.length) {
    const key = value[0] // Grab the value to compare with
    while (true) {
      // Choose the child with the least value
      let j = i * 2 + 1
      if (j + 1 < arr.length && arr[j][0] > arr[j + 1][0]) j++
      // If no child has lesser value, then we've found the spot!
      if (j >= arr.length || key <= arr[j][0]) break
      // Copy the selected child node one level up...
      arr[i] = arr[j]
      // ...and consider the child slot for putting our sifted node
      // biome-ignore lint/style/noParameterAssign: <explanation>
      i = j
    }
    arr[i] = value // Place the sifted node at the found spot
  }
}

export { heapify, pop, push }
