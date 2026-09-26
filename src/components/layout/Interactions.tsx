import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToTop } from '../../lib/scroll'
import { detectDevice } from '../../lib/device'
import { Monogram } from '../brand/Monogram'
import { Icon } from '../ui/Icon'
import { getProduct } from '../../lib/catalog'
import { askStylist, productEnquiry } from '../../lib/whatsapp'
import { useUi } from '../../store/ui'
import './layout.css'

/* ═══════════════ Custom cursor — zari needle-eye with a trailing thread ═══════════════ */
const INTERACTIVE = 'a,button,[data-cursor],summary,label,select,[role="button"],[role="tab"],[role="radio"]'

export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const [on, setOn] = useState(false)
  const enabled = useRef(false)

  useEffect(() => {
    const d = detectDevice()
    if (!d.finePointer || d.reducedMotion) return
    enabled.current = true
    document.documentElement.classList.add('has-cursor')
    const target = { x: -100, y: -100 }, ringPos = { x: -100, y: -100 }
    let raf = 0, visible = false
    const place = (el: HTMLElement | null, x: number, y: number) => { if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)` }
    const tick = () => {
      ringPos.x += (target.x - ringPos.x) * 0.2
      ringPos.y += (target.y - ringPos.y) * 0.2
      place(ring.current, ringPos.x, ringPos.y)
      // sleep once the ring has caught up — no rAF while the pointer rests
      raf = Math.abs(target.x - ringPos.x) + Math.abs(target.y - ringPos.y) > 0.3 ? requestAnimationFrame(tick) : 0
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      target.x = e.clientX; target.y = e.clientY
      place(dot.current, e.clientX, e.clientY)
      if (!visible) { visible = true; ringPos.x = e.clientX; ringPos.y = e.clientY; ring.current?.classList.add('is-visible'); dot.current?.classList.add('is-visible') }
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const over = (e: PointerEvent) => {
      const t = (e.target as Element).closest?.(INTERACTIVE) as HTMLElement | null
      setOn(!!t)
      setLabel(t?.dataset.cursor ?? '')
    }
    const leave = () => { visible = false; ring.current?.classList.remove('is-visible'); dot.current?.classList.remove('is-visible') }
    const down = () => ring.current?.classList.add('is-down')
    const up = () => ring.current?.classList.remove('is-down')
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className={`cursor-ring ${on ? 'is-on' : ''} ${label ? 'has-label' : ''}`}>
        <span className="cursor-label">{label}</span>
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  )
}

/* ═══════════════ Route transition — the weft pass ═══════════════ */
export function WeftCurtain() {
  const navigate = useNavigate()
  const root = useRef<HTMLDivElement>(null)
  const busy = useRef(false)

  useEffect(() => {
    if (detectDevice().reducedMotion) return
    const el = root.current!
    const panel = el.querySelector<HTMLElement>('.weft-panel')!
    const mark = el.querySelector<HTMLElement>('.weft-mark')!

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return
      const a = (e.target as Element).closest?.('a') as HTMLAnchorElement | null
      if (!a || !a.href || a.target === '_blank' || a.hasAttribute('download') || a.getAttribute('aria-disabled') === 'true' || a.dataset.noWeft !== undefined) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return
      if (url.pathname === location.pathname) return // same page (filters, anchors): no curtain
      e.preventDefault() // Link's own onClick still runs; the router sees defaultPrevented and waits for us
      if (busy.current) return
      busy.current = true
      el.classList.add('is-active')
      const io = 'cubic-bezier(0.65, 0, 0.35, 1)'
      const cover = panel.animate([{ transform: 'translateX(-101%)' }, { transform: 'translateX(0)' }], { duration: 460, easing: 'cubic-bezier(0.55, 0, 0.9, 0.4)', fill: 'forwards' })
      cover.onfinish = () => {
        mark.animate([{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 200, fill: 'forwards' })
        navigate(url.pathname + url.search + url.hash)
        scrollToTop(true)
        setTimeout(() => {
          mark.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' })
          const reveal = panel.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(101%)' }], { duration: 660, easing: io, fill: 'forwards' })
          reveal.onfinish = () => { busy.current = false; el.classList.remove('is-active'); reveal.cancel(); cover.cancel() }
        }, 320)
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [navigate])

  return (
    <div ref={root} className="weft" aria-hidden="true">
      <div className="weft-panel">
        <span className="weft-thread is-lead" /><span className="weft-thread is-tail" />
        <span className="weft-shuttle" />
      </div>
      <div className="weft-mark"><Monogram size={46} ink="var(--khadi)" thread="var(--zari-light)" /></div>
    </div>
  )
}

/* ═══════════════ Concierge — "Ask a stylist" ═══════════════ */
export function Concierge() {
  const { pathname } = useLocation()
  const m = pathname.match(/^\/catalogue\/([^/]+)/)
  const p = m ? getProduct(m[1]) : undefined
  const hide = pathname.startsWith('/checkout')
  if (hide) return null
  return (
    <a className={`concierge ${p ? 'is-pdp' : ''}`} href={p ? productEnquiry(p, { Question: 'I’d love a stylist’s advice on this piece' }) : askStylist()}
      target="_blank" rel="noopener noreferrer" data-cursor="Chat" aria-label="Ask a stylist on WhatsApp (opens WhatsApp)">
      <span className="concierge-ic"><Icon name="whatsapp" size={18} /></span>
      <span className="concierge-txt">Ask a stylist</span>
    </a>
  )
}

/* ═══════════════ Add-to-bag flight ═══════════════ */
export function flyToBag(source: Element | null) {
  const bump = useUi.getState().bump
  const target = document.querySelector('[data-bag-target]')
  const img = source?.querySelector('img') ?? (source instanceof HTMLImageElement ? source : null)
  if (!img || !target || detectDevice().reducedMotion) { bump(); return }
  const a = img.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const ghost = img.cloneNode() as HTMLImageElement
  ghost.removeAttribute('srcset'); ghost.removeAttribute('sizes'); ghost.src = img.currentSrc || img.src
  ghost.className = 'fly-ghost'
  Object.assign(ghost.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, objectPosition: img.style.objectPosition })
  document.body.appendChild(ghost)
  const tx = b.left + b.width / 2 - (a.left + a.width / 2)
  const ty = b.top + b.height / 2 - (a.top + a.height / 2)
  // sample a quadratic bezier that lifts the piece up and over into the bag
  const cx = tx * 0.35, cy = Math.min(ty, 0) - 140
  const frames: Keyframe[] = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12, u = 1 - t
    const x = 2 * u * t * cx + t * t * tx
    const y = 2 * u * t * cy + t * t * ty
    const s = 1 - 0.92 * t * t
    return { transform: `translate(${x}px, ${y}px) scale(${s})`, opacity: t > 0.82 ? 0.3 : 1, borderRadius: `${t * 50}%`, offset: t }
  })
  const anim = ghost.animate(frames, { duration: 900, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' })
  anim.onfinish = () => { ghost.remove(); bump() }
}
