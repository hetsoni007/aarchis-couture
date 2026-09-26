import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { cx, formatINR } from '../../lib/format'
import { useFocusTrap } from '../../lib/a11y'
import { lockScroll } from '../../lib/scroll'
import { useMedia } from '../../lib/device'
import { useUi } from '../../store/ui'
import './ui.css'

/* ── Price ─────────────────────────────────────────────────────────────── */
export function Price({ inr, from = true, indicative, className }: { inr: number; from?: boolean; indicative?: boolean; className?: string }) {
  return (
    <span className={cx('price t-num', className)}>
      {from && <span className="price-from">From </span>}
      {formatINR(inr)}
      {indicative && <span className="price-ind" title="Indicative starting price — your final quote is confirmed after the design consultation."> · indicative</span>}
    </span>
  )
}

/* ── Accordion ─────────────────────────────────────────────────────────── */
export function Accordion({ items, group, openFirst, className }: { items: { q: ReactNode; a: ReactNode; id?: string }[]; group?: string; openFirst?: boolean; className?: string }) {
  return (
    <div className={cx('acc', className)}>
      {items.map((it, i) => (
        <details key={it.id ?? i} className="acc-item" name={group} open={openFirst && i === 0 ? true : undefined}>
          <summary className="acc-q"><span>{it.q}</span><Icon name="plus" size={18} className="acc-ic" /></summary>
          <div className="acc-a">{typeof it.a === 'string' ? <p>{it.a}</p> : it.a}</div>
        </details>
      ))}
    </div>
  )
}

/* ── Portal helper (portals only exist in the browser) ────────────────── */
function useMounted() {
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  return m
}

/* ── Drawer: right/left panel, or a bottom sheet on small screens ───────── */
export function Drawer({ open, onClose, title, children, footer, side = 'right', mobile = 'bottom', size = 'md', headerExtra }: {
  open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode
  side?: 'right' | 'left'; mobile?: 'bottom' | 'side'; size?: 'md' | 'lg'; headerExtra?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  const desktop = useMedia('(min-width: 48rem)')
  const [rendered, setRendered] = useState(open)
  const mounted = useMounted()
  useEffect(() => {
    if (open) setRendered(true)
    else { const t = setTimeout(() => setRendered(false), 350); return () => clearTimeout(t) }
  }, [open])
  useEffect(() => { if (open) { lockScroll(true); return () => lockScroll(false) } }, [open])
  // the panel mounts one render after `open` flips, so the trap waits until it exists
  useFocusTrap(ref, open && rendered && mounted, onClose)
  if (!mounted || !rendered) return null
  const placement = desktop || mobile === 'side' ? `is-${side}` : 'is-bottom'
  return createPortal(
    <div className={cx('drawer-root', open && 'is-open', placement, `is-${size}`)}>
      <div className="drawer-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="drawer" role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}>
        <header className="drawer-head">
          <h2 id={id} className="drawer-title">{title}</h2>
          {headerExtra}
          <button className="drawer-close" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer && <footer className="drawer-foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

/* ── Modal: centred dialog (quick view, lightbox-lite) ─────────────────── */
export function Modal({ open, onClose, label, children, size = 'lg' }: { open: boolean; onClose: () => void; label: string; children: ReactNode; size?: 'md' | 'lg' }) {
  const ref = useRef<HTMLDivElement>(null)
  const mounted = useMounted()
  useEffect(() => { if (open) { lockScroll(true); return () => lockScroll(false) } }, [open])
  useFocusTrap(ref, open && mounted, onClose)
  if (!mounted || !open) return null
  return createPortal(
    <div className="modal-root">
      <div className="modal-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className={cx('modal', `is-${size}`)} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        {children}
      </div>
    </div>,
    document.body,
  )
}

/* ── Toaster ───────────────────────────────────────────────────────────── */
export function Toaster() {
  const toasts = useUi((s) => s.toasts)
  const dismiss = useUi((s) => s.dismiss)
  return (
    <div className="toaster" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={cx('toast', t.tone === 'success' && 'is-success')}>
          <Icon name={t.tone === 'success' ? 'check' : 'info'} size={18} className="toast-ic" />
          <span className="toast-msg">{t.message}</span>
          {t.action && <button className="toast-act" onClick={() => { t.action!.run(); dismiss(t.id) }}>{t.action.label}</button>}
          <button className="toast-x" onClick={() => dismiss(t.id)} aria-label="Dismiss"><Icon name="close" size={16} /></button>
        </div>
      ))}
    </div>
  )
}

/* ── Breadcrumbs ───────────────────────────────────────────────────────── */
export function Crumbs({ trail, className }: { trail: { name: string; to?: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cx('crumbs', className)}>
      <ol role="list">
        {trail.map((t, i) => (
          <li key={i}>{t.to ? <Link to={t.to} className="link-u">{t.name}</Link> : <span aria-current="page">{t.name}</span>}</li>
        ))}
      </ol>
    </nav>
  )
}

/* ── Chip ──────────────────────────────────────────────────────────────── */
export function Chip({ children, onRemove, active, onClick }: { children: ReactNode; onRemove?: () => void; active?: boolean; onClick?: () => void }) {
  if (onClick) return <button className={cx('chip', active && 'is-active')} aria-pressed={active} onClick={onClick}>{children}</button>
  return (
    <span className={cx('chip', active && 'is-active')}>
      {children}
      {onRemove && <button onClick={onRemove} className="chip-x" aria-label={`Remove ${typeof children === 'string' ? children : 'filter'}`}><Icon name="close" size={12} /></button>}
    </span>
  )
}

/* ── Quantity stepper ─────────────────────────────────────────────────── */
export function Qty({ value, onChange, max = 5, label }: { value: number; onChange: (n: number) => void; max?: number; label: string }) {
  return (
    <div className="qty" role="group" aria-label={`Quantity for ${label}`}>
      <button onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity"><Icon name="minus" size={14} /></button>
      <output className="t-num" aria-live="polite">{value}</output>
      <button onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity"><Icon name="plus" size={14} /></button>
    </div>
  )
}

/* ── Spinner (route chunks, 3D) ────────────────────────────────────────── */
export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <span className="spinner" role="status"><span className="sr-only">{label}</span></span>
}
export function PageLoader() {
  return <div className="page-loader"><Spinner /></div>
}
