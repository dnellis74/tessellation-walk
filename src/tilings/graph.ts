import { centroidOf, dist2, type Point, type Tile, type TileGraph } from './types'

const SNAP = 0.5

function snapCoord(n: number): number {
  return Math.round(n / SNAP) * SNAP
}

function snapPoint(p: Point): Point {
  return { x: snapCoord(p.x), y: snapCoord(p.y) }
}

function edgeKey(a: Point, b: Point): string {
  if (a.x < b.x || (a.x === b.x && a.y < b.y)) {
    return `${a.x},${a.y}|${b.x},${b.y}`
  }
  return `${b.x},${b.y}|${a.x},${a.y}`
}

function link(tiles: Tile[], a: number, b: number) {
  if (a === b) return
  if (!tiles[a].neighbors.includes(b)) tiles[a].neighbors.push(b)
  if (!tiles[b].neighbors.includes(a)) tiles[b].neighbors.push(a)
}

/**
 * Build a tile graph from polygons by linking tiles that share an edge.
 * Vertices are snapped so floating-point cracks don't break adjacency.
 * Duplicate cells (same snapped centroid) are dropped.
 * Orphan tiles get a spatial fallback so the walk never sits isolated.
 */
export function graphFromPolygons(polygons: Point[][]): TileGraph {
  const seen = new Set<string>()
  const tiles: Tile[] = []

  for (const raw of polygons) {
    const vertices = raw.map(snapPoint)
    const c = centroidOf(vertices)
    const key = `${snapCoord(c.x)},${snapCoord(c.y)}`
    if (seen.has(key)) continue
    seen.add(key)
    tiles.push({
      id: tiles.length,
      vertices,
      centroid: c,
      neighbors: [],
    })
  }

  const edgeOwners = new Map<string, number[]>()
  for (const tile of tiles) {
    const n = tile.vertices.length
    for (let i = 0; i < n; i++) {
      const a = tile.vertices[i]
      const b = tile.vertices[(i + 1) % n]
      if (a.x === b.x && a.y === b.y) continue
      const key = edgeKey(a, b)
      const list = edgeOwners.get(key)
      if (list) list.push(tile.id)
      else edgeOwners.set(key, [tile.id])
    }
  }

  for (const owners of edgeOwners.values()) {
    if (owners.length < 2) continue
    for (let i = 0; i < owners.length; i++) {
      for (let j = i + 1; j < owners.length; j++) {
        link(tiles, owners[i], owners[j])
      }
    }
  }

  const orphans = tiles.filter((t) => t.neighbors.length === 0)
  if (orphans.length > 0 && tiles.length > 1) {
    for (const orphan of orphans) {
      let best = -1
      let bestD = Infinity
      for (const other of tiles) {
        if (other.id === orphan.id) continue
        const d = dist2(orphan.centroid, other.centroid)
        if (d < bestD) {
          bestD = d
          best = other.id
        }
      }
      if (best >= 0) link(tiles, orphan.id, best)
    }
  }

  return { tiles }
}

export function padBounds(width: number, height: number, pad: number) {
  return {
    minX: -pad,
    minY: -pad,
    maxX: width + pad,
    maxY: height + pad,
  }
}
