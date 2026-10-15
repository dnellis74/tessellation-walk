import {
  CATEGORY_LABELS,
  PATTERN_LABELS,
  PATTERNS_BY_CATEGORY,
  type TilingCategory,
  type TilingPattern,
} from '../tilings/types'

export type AppParams = {
  category: TilingCategory
  pattern: TilingPattern
  scale: number
  showEdges: boolean
  stepsPerSecond: number
  trailLength: number
  selfAvoiding: boolean
  centerBias: number
  paused: boolean
}

type Props = {
  open: boolean
  params: AppParams
  onChange: (patch: Partial<AppParams>) => void
  onResetWalk: () => void
  onRegenerate: () => void
  onToggleOpen: () => void
}

export function ControlTray({
  open,
  params,
  onChange,
  onResetWalk,
  onRegenerate,
  onToggleOpen,
}: Props) {
  const patterns = PATTERNS_BY_CATEGORY[params.category]

  return (
    <div className={`tray ${open ? 'tray--open' : ''}`}>
      <button
        type="button"
        className="tray__handle"
        onClick={onToggleOpen}
        aria-expanded={open}
        aria-label={open ? 'Hide controls' : 'Show controls'}
      >
        <span className="tray__handle-bar" />
        <span className="tray__handle-label">{open ? 'Hide' : 'Controls'}</span>
      </button>

      <div className="tray__panel">
        <section className="tray__section">
          <h2>Tessellation</h2>
          <div className="tray__row">
            <span className="tray__label">Category</span>
            <div className="seg">
              {(Object.keys(CATEGORY_LABELS) as TilingCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={params.category === cat ? 'seg__btn seg__btn--active' : 'seg__btn'}
                  onClick={() => {
                    const nextPattern = PATTERNS_BY_CATEGORY[cat][0]
                    onChange({ category: cat, pattern: nextPattern })
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="tray__row">
            <span className="tray__label">Pattern</span>
            <div className="seg">
              {patterns.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={params.pattern === p ? 'seg__btn seg__btn--active' : 'seg__btn'}
                  onClick={() => onChange({ pattern: p })}
                >
                  {PATTERN_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <label className="tray__row tray__row--slider">
            <span className="tray__label">Tile size</span>
            <input
              type="range"
              min={16}
              max={72}
              value={params.scale}
              onChange={(e) => onChange({ scale: Number(e.target.value) })}
            />
            <span className="tray__value">{params.scale}</span>
          </label>

          <label className="tray__check">
            <input
              type="checkbox"
              checked={params.showEdges}
              onChange={(e) => onChange({ showEdges: e.target.checked })}
            />
            Show edges
          </label>
        </section>

        <section className="tray__section">
          <h2>Random walk</h2>
          <label className="tray__row tray__row--slider">
            <span className="tray__label">Steps / sec</span>
            <input
              type="range"
              min={1}
              max={60}
              value={params.stepsPerSecond}
              onChange={(e) => onChange({ stepsPerSecond: Number(e.target.value) })}
            />
            <span className="tray__value">{params.stepsPerSecond}</span>
          </label>

          <label className="tray__row tray__row--slider">
            <span className="tray__label">Trail length</span>
            <input
              type="range"
              min={8}
              max={400}
              value={params.trailLength}
              onChange={(e) => onChange({ trailLength: Number(e.target.value) })}
            />
            <span className="tray__value">{params.trailLength}</span>
          </label>

          <label className="tray__row tray__row--slider">
            <span className="tray__label">Center bias</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(params.centerBias * 100)}
              onChange={(e) => onChange({ centerBias: Number(e.target.value) / 100 })}
            />
            <span className="tray__value">{Math.round(params.centerBias * 100)}%</span>
          </label>

          <label className="tray__check">
            <input
              type="checkbox"
              checked={params.selfAvoiding}
              onChange={(e) => onChange({ selfAvoiding: e.target.checked })}
            />
            Self-avoiding
          </label>

          <div className="tray__actions">
            <button type="button" className="btn" onClick={() => onChange({ paused: !params.paused })}>
              {params.paused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" className="btn" onClick={onResetWalk}>
              Reset walk
            </button>
            <button type="button" className="btn btn--primary" onClick={onRegenerate}>
              Regenerate
            </button>
          </div>
        </section>

        <p className="tray__hint">Press ? to toggle · Esc to hide</p>
      </div>
    </div>
  )
}
