import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { cx, formatINR } from '../../lib/format'
import { SHOW_INDICATIVE_MARKER } from '../../lib/config'
import { useFocusTrap } from '../../lib/a11y'
import { lockScroll } from '../../lib/scroll'
import { useMedia } from '../../lib/device'
import { useUi } from '../../store/ui'
import './ui.css'

/* ── Price ───────────────────────────────────────────────── */
export function Price({ inr, indicative, from = true, className }: { inr: number; indicative?: boolean; from?: boolean; className?: string }) {
  return (
    <span className={cx('price num', className)}>
      {from && <span className="price-from">From </span>}
      {formatINR(inr)}
      {indicative && SHOW_INDICATIVE_MARKER && (
        <abbr className="price-ind" title="Indicative starting price — Archana confirms your final quote after the design consultation.">
          Indicative
        </abbr>
      )}
    </span>
  )
}

/* ── Accordion (FAQ) ─────────────────────────────────────── */
export function Accordion({ items, className }: { items: { q: string; a: ReactNode }[]; className?: string }) {
  return (
    <div className={cx('accordion', className)}>
      {items.map((it, i) => (
        <details key={i} className="acc-item" name={className ? undefined : 'faq'}>
          <summary className="acc-q" data-cursor="Open">
            <span>{it.q}</span>
            <span className="acc-knot" aria-hidden="true"><i /><i /></span>
          </summary>
          <div className="acc-a"><div>{typeof it.a === 'string' ? <p>{it.a}</p> : it.a}</div></div>
        </details>
      ))}
    </div>
  )
}

/* ── Sheet: right drawer ≥1024, bottom sheet below ───────── */
export function Sheet({ open, onClose, title, children, footer, side = 'right', wide }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; side?: 'right' | 'left'; wide?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  const desktop = useMedia('(min-width: 64rem)')
  const [mounted, setMounted] = useState(open)
  useEffect(() => {
    if (open) setMounted(true)
    else { const t = setTimeout(() => setMounted(false), 420); return () => clearTimeout(t) }
  }, [open])
  useEffect(() => { if (open) { lockScroll(true); return () => lockScroll(false) } }, [open])
  useFocusTrap(ref, open, onClose)
  if (!mounted) return null
  return createPortal(
    <div className={cx('sheet-root', open && 'is-open', desktop ? `is-${side}` : 'is-bottom', wide && 'is-wide')}>
      <div className="sheet-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="sheet" role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}>
        {!desktop && <span className="sheet-grip" aria-hidden="true" />}
        <header className="sheet-head">
          <h2 id={id} className="sheet-title">{title}</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close" data-cursor="Close"><Icon name="close" /></button>
        </header>
        <div className="sheet-body" data-lenis-prevent>{children}</div>
        {footer && <footer className="sheet-foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

/* ── Toaster ─────────────────────────────────────────────── */
export function Toaster() {
  const toasts = useUi((s) => s.toasts)
  const dismiss = useUi((s) => s.dismiss)
  return (
    <div className="toaster" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={cx('toast', t.tone === 'success' && 'is-success')}>
          <span className="toast-knot" aria-hidden="true" />
          <span className="toast-msg">{t.message}</span>
          {t.action && (
            <button className="toast-act" onClick={() => { t.action!.run(); dismiss(t.id) }}>{t.action.label}</button>
          )}
          <button className="toast-x" onClick={() => dismiss(t.id)} aria-label="Dismiss"><Icon name="close" size={16} /></button>
        </div>
      ))}
    </div>
  )
}

/* ── Breadcrumbs ─────────────────────────────────────────── */
export function Crumbs({ trail }: { trail: { name: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <ol role="list">
        {trail.map((t, i) => (
          <li key={i}>
            {t.to ? <Link to={t.to} className="link-thread">{t.name}</Link> : <span aria-current="page">{t.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ── Chip ────────────────────────────────────────────────── */
export function Chip({ children, onRemove, tone }: { children: ReactNode; onRemove?: () => void; tone?: 'new' | 'soft' }) {
  return (
    <span className={cx('chip', tone && `chip-${tone}`)}>
      {children}
      {onRemove && (
        <button onClick={onRemove} className="chip-x" aria-label={`Remove ${typeof children === 'string' ? children : 'filter'}`}>
          <Icon name="close" size={14} />
        </button>
      )}
    </span>
  )
}

/* ── Qty stepper ─────────────────────────────────────────── */
export function Qty({ value, onChange, max = 5, label }: { value: number; onChange: (n: number) => void; max?: number; label: string }) {
  return (
    <div className="qty" role="group" aria-label={`Quantity for ${label}`}>
      <button onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="One fewer"><Icon name="minus" size={16} /></button>
      <output className="num" aria-live="polite">{value}</output>
      <button onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="One more"><Icon name="plus" size={16} /></button>
    </div>
  )
}
