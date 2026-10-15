export type Point = { x: number; y: number }

export type Tile = {
  id: number
  vertices: Point[]
  centroid: Point
  neighbors: number[]
}

export type TileGraph = {
  tiles: Tile[]
}

export type GenerateOptions = {
  width: number
  height: number
  /** Approximate tile edge / cell size in pixels. */
  scale: number
}

export type TilingCategory = 'regular' | 'wallpaper' | 'aperiodic'

export type RegularPattern = 'square' | 'triangle' | 'hexagon'
export type WallpaperPattern = 'brick' | 'herringbone' | 'rhombille'
export type AperiodicPattern = 'penrose'

export type TilingPattern = RegularPattern | WallpaperPattern | AperiodicPattern

export const PATTERNS_BY_CATEGORY: Record<TilingCategory, TilingPattern[]> = {
  regular: ['square', 'triangle', 'hexagon'],
  wallpaper: ['brick', 'herringbone', 'rhombille'],
  aperiodic: ['penrose'],
}

export const PATTERN_LABELS: Record<TilingPattern, string> = {
  square: 'Square',
  triangle: 'Triangle',
  hexagon: 'Hexagon',
  brick: 'Brick',
  herringbone: 'Herringbone',
  rhombille: 'Rhombille',
  penrose: 'Penrose',
}

export const CATEGORY_LABELS: Record<TilingCategory, string> = {
  regular: 'Regular',
  wallpaper: 'Wallpaper',
  aperiodic: 'Aperiodic',
}

export function centroidOf(vertices: Point[]): Point {
  let x = 0
  let y = 0
  for (const v of vertices) {
    x += v.x
    y += v.y
  }
  const n = vertices.length || 1
  return { x: x / n, y: y / n }
}

export function dist2(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}
