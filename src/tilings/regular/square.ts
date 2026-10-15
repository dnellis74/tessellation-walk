import { graphFromPolygons, padBounds } from '../graph'
import type { GenerateOptions, Point, TileGraph } from '../types'

export function generateSquare({ width, height, scale }: GenerateOptions): TileGraph {
  const s = Math.max(12, scale)
  const { minX, minY, maxX, maxY } = padBounds(width, height, s)
  const polygons: Point[][] = []

  const cols = Math.ceil((maxX - minX) / s)
  const rows = Math.ceil((maxY - minY) / s)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = minX + col * s
      const y = minY + row * s
      polygons.push([
        { x, y },
        { x: x + s, y },
        { x: x + s, y: y + s },
        { x, y: y + s },
      ])
    }
  }

  return graphFromPolygons(polygons)
}
