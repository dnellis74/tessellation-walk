import { graphFromPolygons, padBounds } from '../graph'
import type { GenerateOptions, Point, TileGraph } from '../types'

/** Rhombille tiling: 60°/120° rhombi. */
export function generateRhombille({ width, height, scale }: GenerateOptions): TileGraph {
  const s = Math.max(12, scale)
  const h = (s * Math.sqrt(3)) / 2
  const { minX, minY, maxX, maxY } = padBounds(width, height, s * 2)
  const polygons: Point[][] = []

  const cellW = s * 1.5
  const cellH = 2 * h
  const cols = Math.ceil((maxX - minX) / cellW) + 2
  const rows = Math.ceil((maxY - minY) / cellH) + 2

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = minX + col * cellW
      const cy = minY + row * cellH
      // Three orientations pack the plane
      addRhomb(polygons, cx, cy, s, 0)
      addRhomb(polygons, cx + s * 0.75, cy + h, s, 60)
      addRhomb(polygons, cx + s * 0.75, cy - h, s, -60)
    }
  }

  return graphFromPolygons(polygons)
}

function addRhomb(out: Point[][], x: number, y: number, s: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  const ux = s * Math.cos(rad)
  const uy = s * Math.sin(rad)
  const vx = s * Math.cos(rad + Math.PI / 3)
  const vy = s * Math.sin(rad + Math.PI / 3)
  out.push([
    { x, y },
    { x: x + ux, y: y + uy },
    { x: x + ux + vx, y: y + uy + vy },
    { x: x + vx, y: y + vy },
  ])
}
