import { dist2, type TileGraph } from '../tilings/types'

export type WalkParams = {
  selfAvoiding: boolean
  /** 0–1: how strongly the seed prefers the viewport center. */
  centerBias: number
  trailLength: number
}

export class RandomWalk {
  graph: TileGraph
  currentId: number
  step: number
  /** step index when tile was last visited; -1 = never */
  visitStep: Int32Array
  params: WalkParams
  width: number
  height: number

  constructor(
    graph: TileGraph,
    width: number,
    height: number,
    params: WalkParams,
  ) {
    this.graph = graph
    this.width = width
    this.height = height
    this.params = params
    this.visitStep = new Int32Array(graph.tiles.length)
    this.visitStep.fill(-1)
    this.step = 0
    this.currentId = this.pickSeed()
    this.mark(this.currentId)
  }

  reset(graph?: TileGraph) {
    if (graph) {
      this.graph = graph
      this.visitStep = new Int32Array(graph.tiles.length)
    }
    this.visitStep.fill(-1)
    this.step = 0
    this.currentId = this.pickSeed()
    this.mark(this.currentId)
  }

  setParams(params: Partial<WalkParams>) {
    this.params = { ...this.params, ...params }
  }

  private pickSeed(): number {
    const tiles = this.graph.tiles
    if (tiles.length === 0) return 0
    const cx = this.width / 2
    const cy = this.height / 2
    const bias = Math.min(1, Math.max(0, this.params.centerBias))

    const sampleCount = Math.min(60, tiles.length)
    let best = 0
    let bestScore = -Infinity
    for (let i = 0; i < sampleCount; i++) {
      const id = Math.floor(Math.random() * tiles.length)
      const t = tiles[id]
      if (t.neighbors.length === 0) continue
      const d = Math.sqrt(dist2(t.centroid, { x: cx, y: cy }))
      const maxD = Math.hypot(this.width, this.height) * 0.5
      const centrality = 1 - Math.min(1, d / maxD)
      const noise = Math.random() * (1.1 - bias)
      const score = centrality * bias + noise
      if (score > bestScore) {
        bestScore = score
        best = id
      }
    }
    return best
  }

  private mark(id: number) {
    this.visitStep[id] = this.step
  }

  /**
   * Choose next tile among neighbors only — never teleports.
   * Self-avoiding prefers unvisited neighbors; if boxed in, steps to the
   * least-recently-visited neighbor so the path stays contiguous.
   */
  private chooseNext(neighbors: number[]): number {
    if (neighbors.length === 1) return neighbors[0]

    if (this.params.selfAvoiding) {
      const fresh = neighbors.filter((n) => this.visitStep[n] < 0)
      if (fresh.length > 0) {
        return fresh[Math.floor(Math.random() * fresh.length)]
      }
      // Boxed in: continue through the oldest neighbor (snake-like)
      let oldest = neighbors[0]
      let oldestStep = this.visitStep[oldest]
      for (let i = 1; i < neighbors.length; i++) {
        const n = neighbors[i]
        const s = this.visitStep[n]
        if (s < oldestStep) {
          oldestStep = s
          oldest = n
        }
      }
      return oldest
    }

    return neighbors[Math.floor(Math.random() * neighbors.length)]
  }

  /** Advance one step along an edge. Returns the new tile id. */
  tick(): number {
    const tile = this.graph.tiles[this.currentId]
    if (!tile) return this.currentId

    const neighbors = tile.neighbors
    if (neighbors.length === 0) {
      // Isolated tile — stay put rather than leaping across the field
      this.step++
      this.mark(this.currentId)
      return this.currentId
    }

    const next = this.chooseNext(neighbors)
    this.step++
    this.currentId = next
    this.mark(next)
    return next
  }

  /**
   * 0 = terracotta, 1 = fully powder blue.
   * Unvisited stays terracotta. Visited tiles start with a visible blue tint
   * so the path doesn't vanish into the field (which looked like jumping).
   */
  ageOf(tileId: number): number {
    const v = this.visitStep[tileId]
    if (v < 0) return 0
    const trail = Math.max(1, this.params.trailLength)
    const t = Math.min(1, (this.step - v) / trail)
    return 0.28 + 0.72 * t
  }
}
