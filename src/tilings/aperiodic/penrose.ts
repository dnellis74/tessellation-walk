import { graphFromPolygons } from '../graph'
import type { GenerateOptions, Point, TileGraph } from '../types'

const INV_PHI = 2 / (1 + Math.sqrt(5))

type TriKind = 'acute' | 'obtuse'

/** Half-rhomb Robinson triangle used to generate Penrose P3. */
type Tri = {
  kind: TriKind
  a: Point // apex
  b: Point
  c: Point
}

function lerp(p: Point, q: Point, t: number): Point {
  return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }
}

/** Classic 2-child Robinson triangle deflation. */
function subdivide(tri: Tri): Tri[] {
  if (tri.kind === 'acute') {
    // 36° at a; sides ab, ac equal
    const p = lerp(tri.a, tri.b, INV_PHI)
    return [
      { kind: 'acute', a: tri.c, b: p, c: tri.a },
      { kind: 'obtuse', a: p, b: tri.c, c: tri.b },
    ]
  }
  // 108° at a
  const q = lerp(tri.b, tri.a, INV_PHI)
  return [
    { kind: 'acute', a: q, b: tri.c, c: tri.a },
    { kind: 'obtuse', a: tri.c, b: q, c: tri.b },
  ]
}

function seedSun(cx: number, cy: number, radius: number): Tri[] {
  const tris: Tri[] = []
  for (let i = 0; i < 5; i++) {
    const a0 = ((-90 + i * 72) * Math.PI) / 180
    const a1 = ((-90 + (i + 1) * 72) * Math.PI) / 180
    const b = { x: cx + radius * Math.cos(a0), y: cy + radius * Math.sin(a0) }
    const c = { x: cx + radius * Math.cos(a1), y: cy + radius * Math.sin(a1) }
    tris.push({ kind: 'acute', a: { x: cx, y: cy }, b, c })
  }
  return tris
}

function generationsForScale(scale: number): number {
  if (scale >= 48) return 4
  if (scale >= 36) return 5
  if (scale >= 24) return 6
  return 7
}

function trianglesToRhombs(tris: Tri[]): Point[][] {
  const used = new Set<number>()
  const rhombs: Point[][] = []

  const baseKey = (t: Tri): string => {
    const ax = Math.round(t.b.x * 40)
    const ay = Math.round(t.b.y * 40)
    const bx = Math.round(t.c.x * 40)
    const by = Math.round(t.c.y * 40)
    if (ax < bx || (ax === bx && ay < by)) return `${ax},${ay}|${bx},${by}`
    return `${bx},${by}|${ax},${ay}`
  }

  const byBase = new Map<string, number[]>()
  tris.forEach((t, i) => {
    const key = baseKey(t)
    const list = byBase.get(key)
    if (list) list.push(i)
    else byBase.set(key, [i])
  })

  for (const indices of byBase.values()) {
    if (indices.length < 2) continue
    const i = indices[0]
    const j = indices[1]
    if (used.has(i) || used.has(j)) continue
    const t1 = tris[i]
    const t2 = tris[j]
    used.add(i)
    used.add(j)
    rhombs.push([t1.a, t1.b, t2.a, t1.c])
  }

  for (let i = 0; i < tris.length; i++) {
    if (used.has(i)) continue
    const t = tris[i]
    rhombs.push([t.a, t.b, t.c])
  }

  return rhombs
}

export function generatePenrose({ width, height, scale }: GenerateOptions): TileGraph {
  const cx = width / 2
  const cy = height / 2
  const radius = Math.hypot(width, height) * 0.55
  const gens = generationsForScale(scale)

  let tris = seedSun(cx, cy, radius)
  for (let g = 0; g < gens; g++) {
    const next: Tri[] = []
    for (const t of tris) next.push(...subdivide(t))
    tris = next
  }

  return graphFromPolygons(trianglesToRhombs(tris))
}
