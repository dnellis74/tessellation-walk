import { graphFromPolygons, padBounds } from '../graph'
import type { GenerateOptions, Point, TileGraph } from '../types'

/** Equilateral triangular tiling (up- and down-pointing). */
export function generateTriangle({ width, height, scale }: GenerateOptions): TileGraph {
  const s = Math.max(12, scale)
  const h = (s * Math.sqrt(3)) / 2
  const { minX, minY, maxX, maxY } = padBounds(width, height, s)
  const polygons: Point[][] = []

  const rows = Math.ceil((maxY - minY) / h) + 1
  const cols = Math.ceil((maxX - minX) / s) + 1

  for (let row = 0; row < rows; row++) {
    const y = minY + row * h
    for (let col = 0; col < cols; col++) {
      const x = minX + col * s + (row % 2 === 0 ? 0 : s / 2)

      polygons.push([
        { x, y },
        { x: x + s, y },
        { x: x + s / 2, y: y + h },
      ])
      polygons.push([
        { x: x + s / 2, y: y + h },
        { x: x + s + s / 2, y: y + h },
        { x: x + s, y },
      ])
    }
  }

  return graphFromPolygons(polygons)
}
