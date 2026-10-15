import { graphFromPolygons, padBounds } from '../graph'
import type { GenerateOptions, Point, TileGraph } from '../types'

/** Running-bond brick layout (offset rectangular rows). */
export function generateBrick({ width, height, scale }: GenerateOptions): TileGraph {
  const bw = Math.max(16, scale * 1.6)
  const bh = Math.max(10, scale * 0.7)
  const { minX, minY, maxX, maxY } = padBounds(width, height, bw)
  const polygons: Point[][] = []

  const rows = Math.ceil((maxY - minY) / bh) + 1
  const cols = Math.ceil((maxX - minX) / bw) + 2

  for (let row = 0; row < rows; row++) {
    const y = minY + row * bh
    const xOff = row % 2 === 0 ? 0 : bw / 2
    for (let col = 0; col < cols; col++) {
      const x = minX + col * bw + xOff
      polygons.push([
        { x, y },
        { x: x + bw, y },
        { x: x + bw, y: y + bh },
        { x, y: y + bh },
      ])
    }
  }

  return graphFromPolygons(polygons)
}
