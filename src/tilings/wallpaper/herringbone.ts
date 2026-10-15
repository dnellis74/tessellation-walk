import { graphFromPolygons, padBounds } from '../graph'
import type { GenerateOptions, Point, TileGraph } from '../types'

function rect(x: number, y: number, w: number, h: number): Point[] {
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ]
}

/**
 * Orthogonal herringbone of 2×1 rectangles.
 * Origins on a checkerboard of the short grid avoid double-covering.
 */
export function generateHerringbone({ width, height, scale }: GenerateOptions): TileGraph {
  const u = Math.max(10, scale * 0.65)
  const { minX, minY, maxX, maxY } = padBounds(width, height, u * 2)
  const polygons: Point[][] = []

  const cols = Math.ceil((maxX - minX) / u) + 2
  const rows = Math.ceil((maxY - minY) / u) + 2

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if ((col + row) % 2 !== 0) continue
      const x = minX + col * u
      const y = minY + row * u
      if (row % 2 === 0) polygons.push(rect(x, y, 2 * u, u))
      else polygons.push(rect(x, y, u, 2 * u))
    }
  }

  return graphFromPolygons(polygons)
}
