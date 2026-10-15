import { ageToColor, rgbToCss, TERRACOTTA } from '../theme/colors'
import type { TileGraph } from '../tilings/types'
import type { RandomWalk } from '../walk/RandomWalk'

export type RenderOptions = {
  showEdges: boolean
}

export class Renderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  graph: TileGraph | null = null
  walk: RandomWalk | null = null
  options: RenderOptions = { showEdges: true }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas unsupported')
    this.ctx = ctx
  }

  resize(width: number, height: number, dpr: number) {
    this.canvas.width = Math.max(1, Math.floor(width * dpr))
    this.canvas.height = Math.max(1, Math.floor(height * dpr))
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  setScene(graph: TileGraph, walk: RandomWalk, options?: Partial<RenderOptions>) {
    this.graph = graph
    this.walk = walk
    if (options) this.options = { ...this.options, ...options }
  }

  draw() {
    const { ctx, graph, walk } = this
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = rgbToCss(TERRACOTTA)
    ctx.fillRect(0, 0, w, h)

    if (!graph || !walk) return

    const showEdges = this.options.showEdges
    ctx.lineWidth = 0.6
    ctx.strokeStyle = 'rgba(40, 24, 18, 0.18)'

    for (const tile of graph.tiles) {
      const age = walk.ageOf(tile.id)
      ctx.fillStyle = ageToColor(age)
      const verts = tile.vertices
      if (verts.length < 2) continue
      ctx.beginPath()
      ctx.moveTo(verts[0].x, verts[0].y)
      for (let i = 1; i < verts.length; i++) {
        ctx.lineTo(verts[i].x, verts[i].y)
      }
      ctx.closePath()
      ctx.fill()
      if (showEdges) ctx.stroke()
    }

    // Highlight current walker tile
    const cur = graph.tiles[walk.currentId]
    if (cur) {
      ctx.fillStyle = rgbToCss(TERRACOTTA)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'
      ctx.lineWidth = 1.5
      const verts = cur.vertices
      ctx.beginPath()
      ctx.moveTo(verts[0].x, verts[0].y)
      for (let i = 1; i < verts.length; i++) {
        ctx.lineTo(verts[i].x, verts[i].y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }
}
