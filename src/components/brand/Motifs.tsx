import { useId, type CSSProperties } from 'react'
import { Monogram } from './Monogram'
import './brand.css'

/** Hairline that thickens toward a bandhani knot — the section divider. */
export function ZariRule({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`zari-rule ${className ?? ''}`} style={style} role="presentation">
      <span className="zr-wing" />
      <span className="zr-knot"><i /><i /><i /></span>
      <span className="zr-wing is-r" />
    </div>
  )
}

/** Jittered tied-dot lattice. Deterministic jitter so it never shimmers between renders. */
export function BandhaniField({ className, color = 'currentColor', opacity = 0.18, cell = 22 }: { className?: string; color?: string; opacity?: number; cell?: number }) {
  const id = useId().replace(/:/g, '')
  const dots: [number, number, number][] = [
    [0.18, 0.22, 1.5], [0.66, 0.14, 1.1], [0.42, 0.58, 1.8], [0.86, 0.66, 1.2], [0.12, 0.84, 1.0],
  ]
  return (
    <svg className={`bandhani-field ${className ?? ''}`} aria-hidden="true" width="100%" height="100%">
      <defs>
        <pattern id={`bf${id}`} width={cell * 3} height={cell * 3} patternUnits="userSpaceOnUse">
          {Array.from({ length: 9 }).flatMap((_, k) =>
            dots.map(([x, y, r], j) => {
              const ox = (k % 3) * cell, oy = Math.floor(k / 3) * cell
              const jit = ((k * 7 + j * 13) % 5) / 10 - 0.2
              return (
                <g key={`${k}-${j}`} transform={`translate(${ox + (x + jit * 0.2) * cell} ${oy + (y - jit * 0.15) * cell})`}>
                  <circle r={r * 1.9} fill="none" stroke={color} strokeWidth="0.5" opacity="0.55" />
                  <circle r={r * 0.7} fill={color} />
                </g>
              )
            }),
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#bf${id})`} opacity={opacity} />
    </svg>
  )
}

/** Interlocking ogee lattice derived from the monogram's arch. */
export function JaalPattern({ className, color = 'currentColor', opacity = 0.12, size = 56 }: { className?: string; color?: string; opacity?: number; size?: number }) {
  const id = useId().replace(/:/g, '')
  const s = size, h = s * 1.25
  const ogee = `M0 ${h / 2} C${s * 0.18} ${h * 0.28} ${s * 0.36} ${h * 0.18} ${s / 2} 0 C${s * 0.64} ${h * 0.18} ${s * 0.82} ${h * 0.28} ${s} ${h / 2} C${s * 0.82} ${h * 0.72} ${s * 0.64} ${h * 0.82} ${s / 2} ${h} C${s * 0.36} ${h * 0.82} ${s * 0.18} ${h * 0.72} 0 ${h / 2} Z`
  return (
    <svg className={`jaal ${className ?? ''}`} aria-hidden="true" width="100%" height="100%">
      <defs>
        <pattern id={`jl${id}`} width={s} height={h} patternUnits="userSpaceOnUse">
          <path d={ogee} fill="none" stroke={color} strokeWidth="0.8" />
          <circle cx={s / 2} cy={h / 2} r="1.6" fill={color} />
          <circle cx="0" cy="0" r="1.1" fill={color} />
          <circle cx={s} cy="0" r="1.1" fill={color} />
          <circle cx="0" cy={h} r="1.1" fill={color} />
          <circle cx={s} cy={h} r="1.1" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#jl${id})`} opacity={opacity} />
    </svg>
  )
}

/** The shuttle loader: a lozenge carries the weft through five warp threads. */
export function Loader({ label = 'Threading the loom…', inline }: { label?: string; inline?: boolean }) {
  return (
    <div className={`loom-loader ${inline ? 'is-inline' : ''}`} role="status" aria-live="polite">
      <svg viewBox="0 0 120 48" aria-hidden="true">
        {[16, 38, 60, 82, 104].map((x) => <line key={x} x1={x} y1="4" x2={x} y2="44" className="ll-warp" />)}
        <path className="ll-weft" d="M4 24 C16 18 28 30 38 24 S60 18 60 24 82 30 82 24 104 18 116 24" />
        <g className="ll-shuttle"><path d="M-7 24 L0 20.5 L7 24 L0 27.5 Z" /></g>
      </svg>
      <span className={inline ? 'sr-only' : 'll-label'}>{label}</span>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <Monogram size={44} animated />
      <Loader />
    </div>
  )
}
