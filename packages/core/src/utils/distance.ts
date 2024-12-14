import * as queue from './heap'

/**
 * Dijkstra's algorithm
 *
 * Finds the lengths (summed weights) from a starting vertex to an ending
 * vertex or all vertices.
 * @param graph - Directed graph of parent to child edges with weights
 * @param start - The vertex to start the search from
 * @param end - [Optional] End the search when the distance to this vertex is found
 * @returns
 */
export function dijkstra(
  graph: Map<string, Map<string, number>>,
  start: string,
  end?: string
) {
  const distances: Map<string, number> = new Map()
  const unvisiteds: [number, string, string | undefined][] = [
    [0, start, undefined]
  ]
  const prevs: Map<string, string | undefined> = new Map()
  const path: string[] = []
  let distance: number | undefined,
    neighbor: string | undefined,
    prev: string | undefined
  while (unvisiteds.length > 0) {
    ;[distance, neighbor, prev] = queue.pop(unvisiteds)!
    if (distances.has(neighbor!)) {
      distance = undefined
      continue
    }
    distances.set(neighbor!, distance!)
    if (end !== undefined) {
      prevs.set(neighbor!, prev)
      if (neighbor === end) {
        while (neighbor !== undefined) {
          path.push(neighbor)
          neighbor = prevs.get(neighbor)
        }
        break
      }
    }
    for (const [nextNeighbor, nextDistance] of graph.get(neighbor!)!) {
      if (!distances.has(nextNeighbor))
        queue.push(unvisiteds, [
          distance! + nextDistance,
          nextNeighbor,
          neighbor
        ])
    }
    distance = undefined // in case no path start > end
  }
  for (const key of graph.keys())
    if (!distances.has(key)) distances.set(key, Number.POSITIVE_INFINITY)
  return { distance, distances, path }
}

/**
 * Floyd-Warshall algorithm
 *
 * Finds the lengths (summed weights) between all pairs of vertices.  Suitable
 * for relatively small numbers of vertices (V) since there are V**2 pairs,
 * requiring V**3 loops to calculate.
 * @param graph
 * @returns
 */
export function floydWarshall(graph: Map<string, Map<string, number>>) {
  const arr = [...graph]
  const nodes = arr.map((a) => a[0])
  const distances = new Map(
    arr.reduce(
      (p, c) => {
        p.push([`${c[0]}|${c[0]}`, 0])
        ;[...c[1]].forEach(([n, d]) => p.push([`${c[0]}|${n}`, d]))
        return p
      },
      [] as [string, number][]
    )
  )
  for (const k of nodes) {
    for (const i of nodes) {
      for (const j of nodes) {
        distances.set(
          `${i}|${j}`,
          Math.min(
            distances.get(`${i}|${j}`) ?? Number.POSITIVE_INFINITY,
            (distances.get(`${i}|${k}`) ?? Number.POSITIVE_INFINITY) +
              (distances.get(`${k}|${j}`) ?? Number.POSITIVE_INFINITY)
          )
        )
      }
    }
  }
  return distances
}

/**
 * Converts a maze-like grid into a graph
 * @param grid
 * @param pointsOfInterest
 * @param unpassables (optional)
 * @returns graph
 */
export function gridToGraph(
  grid: string[][],
  pointsOfInterest: string[],
  unpassables = '#'
) {
  const graph: Map<string, Map<string, number>> = new Map()
  const pois: [number, number][] = []
  for (const [y, row] of grid.entries()) {
    for (const [x, cell] of row.entries()) {
      if (pointsOfInterest.includes(cell)) pois.push([x, y])
    }
  }
  for (const [x, y] of pois) {
    const neighbors: Map<string, number> = new Map()
    graph.set(`${x},${y}`, neighbors)
    const unvisiteds: [number, number, number][] = [[0, x, y]]
    const visiteds: Set<string> = new Set()
    while (unvisiteds.length > 0) {
      const [d, qx, qy] = queue.pop(unvisiteds)!
      if (visiteds.has(`${qx},${qy}`)) continue
      visiteds.add(`${qx},${qy}`)
      for (const [nx, ny] of [
        [qx, qy - 1],
        [qx + 1, qy],
        [qx, qy + 1],
        [qx - 1, qy]
      ]) {
        if (unpassables.includes(grid[ny][nx]) || visiteds.has(`${nx},${ny}`))
          continue
        if (pointsOfInterest.includes(grid[ny][nx]))
          neighbors.set(`${nx},${ny}`, d + 1)
        else queue.push(unvisiteds, [d + 1, nx, ny])
      }
    }
  }
  const poiGraph: Map<string, Map<string, number>> = new Map(
    [...graph].map(([m, nmap]) => {
      const [x, y] = m.split(',').map(Number)
      const newNs = new Map(
        [...nmap].map(([nk, d]) => {
          const [nx, ny] = nk.split(',').map(Number)
          return [grid[ny][nx], d]
        })
      )
      return [grid[y][x], newNs]
    })
  )
  return poiGraph
}
