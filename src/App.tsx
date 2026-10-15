import { useCallback, useEffect, useRef, useState } from 'react'
import { Renderer } from './canvas/Renderer'
import { ControlTray, type AppParams } from './components/ControlTray'
import { generateTiling } from './tilings'
import { RandomWalk } from './walk/RandomWalk'

const DEFAULT_PARAMS: AppParams = {
  category: 'regular',
  pattern: 'hexagon',
  scale: 36,
  showEdges: true,
  stepsPerSecond: 12,
  trailLength: 80,
  selfAvoiding: true,
  centerBias: 0.75,
  paused: false,
}

const IDLE_MS = 4000

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<Renderer | null>(null)
  const walkRef = useRef<RandomWalk | null>(null)
  const paramsRef = useRef(DEFAULT_PARAMS)
  const sizeRef = useRef({ w: 0, h: 0 })
  const idleTimer = useRef<number | null>(null)

  const [params, setParams] = useState<AppParams>(DEFAULT_PARAMS)
  const [trayOpen, setTrayOpen] = useState(true)

  paramsRef.current = params

  const bumpIdle = useCallback(() => {
    setTrayOpen(true)
    if (idleTimer.current) window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => setTrayOpen(false), IDLE_MS)
  }, [])

  const rebuild = useCallback((next: AppParams = paramsRef.current) => {
    const renderer = rendererRef.current
    if (!renderer) return

    const { w, h } = sizeRef.current
    if (w < 2 || h < 2) return

    const graph = generateTiling(next.pattern, {
      width: w,
      height: h,
      scale: next.scale,
    })

    const walk = new RandomWalk(graph, w, h, {
      selfAvoiding: next.selfAvoiding,
      centerBias: next.centerBias,
      trailLength: next.trailLength,
    })
    walkRef.current = walk
    renderer.setScene(graph, walk, { showEdges: next.showEdges })
    renderer.draw()
  }, [])

  const applyWalkParams = useCallback((next: AppParams) => {
    const walk = walkRef.current
    if (!walk) return
    walk.setParams({
      selfAvoiding: next.selfAvoiding,
      centerBias: next.centerBias,
      trailLength: next.trailLength,
    })
    rendererRef.current?.setScene(walk.graph, walk, { showEdges: next.showEdges })
  }, [])

  const onChange = useCallback(
    (patch: Partial<AppParams>) => {
      bumpIdle()
      const next = { ...paramsRef.current, ...patch }
      paramsRef.current = next
      setParams(next)

      const tilingChanged =
        patch.category !== undefined ||
        patch.pattern !== undefined ||
        patch.scale !== undefined
      if (tilingChanged) rebuild(next)
      else applyWalkParams(next)
    },
    [applyWalkParams, bumpIdle, rebuild],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new Renderer(canvas)
    rendererRef.current = renderer

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      sizeRef.current = { w, h }
      renderer.resize(w, h, window.devicePixelRatio || 1)
      rebuild(paramsRef.current)
    }

    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    let last = performance.now()
    let acc = 0

    const loop = (now: number) => {
      const dt = now - last
      last = now
      const p = paramsRef.current
      const walk = walkRef.current

      if (walk && !p.paused) {
        acc += dt
        const interval = 1000 / Math.max(1, p.stepsPerSecond)
        while (acc >= interval) {
          acc -= interval
          walk.tick()
        }
      }

      renderer.draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    bumpIdle()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      if (idleTimer.current) window.clearTimeout(idleTimer.current)
    }
  }, [bumpIdle, rebuild])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault()
        setTrayOpen((open) => !open)
        bumpIdle()
      } else if (e.key === 'Escape') {
        setTrayOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bumpIdle])

  return (
    <div className="app">
      <canvas ref={canvasRef} className="stage" aria-label="Tessellation walk" />
      <ControlTray
        open={trayOpen}
        params={params}
        onChange={onChange}
        onResetWalk={() => {
          bumpIdle()
          walkRef.current?.reset()
        }}
        onRegenerate={() => {
          bumpIdle()
          rebuild()
        }}
        onToggleOpen={() => {
          setTrayOpen((open) => !open)
          bumpIdle()
        }}
      />
    </div>
  )
}
