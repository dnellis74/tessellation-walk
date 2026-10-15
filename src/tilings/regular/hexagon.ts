import { graphFromPolygons, padBounds } from '../graph'
import type { GenerateOptions, Point, TileGraph } from '../types'

function hexagon(cx: number, cy: number, r: number): Point[] {
  const pts: Point[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30) // pointy-top
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) })
  }
  return pts
}

export function generateHexagon({ width, height, scale }: GenerateOptions): TileGraph {
  const r = Math.max(10, scale * 0.55)
  const w = Math.sqrt(3) * r
  const h = 1.5 * r
  const { minX, minY, maxX, maxY } = padBounds(width, height, r * 2)
  const polygons: Point[][] = []

  const rows = Math.ceil((maxY - minY) / h) + 1
  const cols = Math.ceil((maxX - minX) / w) + 1

  for (let row = 0; row < rows; row++) {
    const cy = minY + r + row * h
    const xOff = row % 2 === 0 ? 0 : w / 2
    for (let col = 0; col < cols; col++) {
      const cx = minX + w / 2 + col * w + xOff
      polygons.push(hexagon(cx, cy, r))
    }
  }

  return graphFromPolygons(polygons)
}
