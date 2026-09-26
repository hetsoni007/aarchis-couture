import type { ReactNode } from 'react'
import { ARCH_PATH } from '../brand/Monogram'
import './ui.css'

type Kind = 'bag' | 'wishlist' | 'results' | 'lost' | 'loom' | 'tape'

/** Line illustrations — one per empty state, each telling its own small story. */
function Art({ kind }: { kind: Kind }) {
  const ink = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' as const }
  const zari = { fill: 'none', stroke: 'var(--zari)', strokeWidth: 1.3, strokeLinecap: 'round' as const }
  switch (kind) {
    case 'bag': // an empty arch; a single thread hangs from the apex, waiting
      return (
        <svg viewBox="0 0 120 150" className="es-art">
          <g transform="translate(12 6) scale(2)"><path d={ARCH_PATH} {...ink} strokeWidth={0.7} /></g>
          <path className="es-sway" d="M60 16 C60 50 58 70 61 92" {...zari} />
          <path className="es-sway" d="M57 94 l4 -3 4 3 -4 9z" fill="var(--zari)" />
          <path d="M20 134 H100" {...ink} opacity="0.4" />
        </svg>
      )
    case 'wishlist': // an unthreaded needle and its loose thread
      return (
        <svg viewBox="0 0 150 120" className="es-art">
          <path d="M30 96 L112 22" {...ink} strokeWidth={1.6} />
          <ellipse cx="108" cy="26" rx="5" ry="1.8" transform="rotate(-42 108 26)" {...ink} strokeWidth={0.9} />
          <path className="es-drift" d="M22 60 C40 40 58 88 76 70 S104 48 120 80 132 100 118 104" {...zari} />
          <path d="M70 104 C70 98 76 96 78 101 C80 96 86 98 86 104 C86 110 78 114 78 114 S70 110 70 104Z" fill="none" stroke="var(--sindoor)" strokeWidth="1.1" />
        </svg>
      )
    case 'results': // two wefts that don't meet
      return (
        <svg viewBox="0 0 160 110" className="es-art">
          {[20, 44, 68, 92, 116, 140].map((x) => <line key={x} x1={x} y1="14" x2={x} y2="96" {...ink} opacity="0.35" />)}
          <path d="M6 55 C20 48 34 62 50 55 S66 50 70 55" {...zari} />
          <path d="M154 55 C140 62 126 48 110 55 S94 60 90 55" {...zari} />
          <circle cx="78" cy="55" r="1.6" fill="var(--sindoor)" /><circle cx="84" cy="52" r="1.1" fill="var(--sindoor)" />
        </svg>
      )
    case 'lost': // the arch-A, its thread coming loose
      return (
        <svg viewBox="0 0 170 150" className="es-art">
          <g transform="translate(34 4) scale(2)"><path d={ARCH_PATH} {...ink} strokeWidth={0.7} /></g>
          <path d="M82 36 L60 116 M82 36 L104 116" {...ink} />
          <path className="es-drift" d="M56 92 C70 84 84 98 98 90 S120 78 134 98 C144 112 128 128 142 138 S166 132 160 118" {...zari} />
        </svg>
      )
    case 'loom': // warp strung, no weft yet
      return (
        <svg viewBox="0 0 150 120" className="es-art">
          <rect x="20" y="14" width="110" height="92" {...ink} />
          {Array.from({ length: 11 }).map((_, i) => <line key={i} x1={30 + i * 9} y1="14" x2={30 + i * 9} y2="106" {...ink} strokeWidth={0.6} opacity="0.55" />)}
          <g className="es-shuttle"><path d="M44 62 l9 -4 9 4 -9 4z" fill="var(--zari)" /></g>
        </svg>
      )
    case 'tape':
      return (
        <svg viewBox="0 0 150 120" className="es-art">
          <path d="M20 88 C20 40 70 26 96 44 C118 60 104 92 80 86 C62 82 66 60 84 62" {...zari} strokeWidth={6} opacity="0.35" />
          <path d="M20 88 C20 40 70 26 96 44 C118 60 104 92 80 86 C62 82 66 60 84 62" {...ink} strokeDasharray="1 5" />
          <path d="M20 88 H130" {...ink} opacity="0.4" />
        </svg>
      )
  }
}

export function EmptyState({ kind, title, children, actions, as: H = 'h2' }: { kind: Kind; title: string; children?: ReactNode; actions?: ReactNode; as?: 'h1' | 'h2' }) {
  return (
    <div className="empty">
      <Art kind={kind} />
      <H className="h3 empty-title">{title}</H>
      {children && <div className="empty-body muted">{children}</div>}
      {actions && <div className="empty-actions">{actions}</div>}
    </div>
  )
}
