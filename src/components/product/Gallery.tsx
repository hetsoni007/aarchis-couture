import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Img } from '../ui/Img'
import { Icon } from '../ui/Icon'
import { Loader } from '../brand/Motifs'
import { imgSource } from '../../lib/img'
import { useDevice } from '../../lib/device'
import { useFocusTrap } from '../../lib/a11y'
import { lockScroll } from '../../lib/scroll'
import { paintFabric, specOf } from '../../lib/fabric'
import { cx } from '../../lib/format'
import type { Product } from '../../lib/catalog'
import type { ViewerApi } from '../three/GarmentViewer'
import './gallery.css'

const GarmentViewer = lazy(() => import('../three/GarmentViewer'))

export interface Frame { folder: 'p' | 'e'; file: string; alt: string; caption?: string | null; fit?: 'cover' | 'contain'; focus?: string }

export function framesOf(p: Product): Frame[] {
  const main: Frame = { folder: 'p', file: p.image.file, alt: p.image.alt, fit: p.image.fit, focus: p.image.focus }
  const story = (p.story?.slides ?? []).map((s) => ({ folder: 'e' as const, file: s.file, alt: s.alt, caption: s.caption }))
  return [main, ...story]
}

/* ═══════════════ Lightbox with wheel / pinch / double-tap zoom and drag-pan ═══════════════ */
function Lightbox({ frames, index, onClose, onIndex }: { frames: Frame[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [z, setZ] = useState({ s: 1, x: 0, y: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ d: number; s: number } | null>(null)
  const lastTap = useRef(0)
  useFocusTrap(ref, true, onClose)
  useEffect(() => { lockScroll(true); return () => lockScroll(false) }, [])
  useEffect(() => setZ({ s: 1, x: 0, y: 0 }), [index])
  const f = frames[index]
  const src = imgSource(f.folder, f.file)
  const big = `/img/${f.folder}/${f.file}-${src.meta.widths[src.meta.widths.length - 1]}.webp`
  const clamp = (s: number, x: number, y: number) => {
    const el = stage.current
    if (!el) return { s, x, y }
    const mx = (el.clientWidth * (s - 1)) / 2, my = (el.clientHeight * (s - 1)) / 2
    return { s, x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) }
  }
  const zoomTo = (s: number) => setZ((c) => clamp(Math.max(1, Math.min(3, s)), s === 1 ? 0 : c.x, s === 1 ? 0 : c.y))
  const go = (d: number) => onIndex((index + d + frames.length) % frames.length)

  return createPortal(
    <div ref={ref} className="lightbox" role="dialog" aria-modal="true" aria-label={`Photograph ${index + 1} of ${frames.length}`}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); if (e.key === '+' || e.key === '=') zoomTo(z.s + 0.5); if (e.key === '-') zoomTo(z.s - 0.5) }}>
      <div className="lb-top">
        <span className="num lb-count">{index + 1} / {frames.length}</span>
        <div className="lb-tools">
          <button onClick={() => zoomTo(z.s - 0.5)} disabled={z.s <= 1} aria-label="Zoom out"><Icon name="zoomOut" /></button>
          <span className="num lb-zoom" aria-live="polite">{Math.round(z.s * 100)}%</span>
          <button onClick={() => zoomTo(z.s + 0.5)} disabled={z.s >= 3} aria-label="Zoom in"><Icon name="zoomIn" /></button>
          <button onClick={onClose} aria-label="Close" data-autofocus><Icon name="close" /></button>
        </div>
      </div>
      <div ref={stage} className={cx('lb-stage', z.s > 1 && 'is-zoomed')} data-cursor={z.s > 1 ? 'Drag' : 'Zoom'}
        onWheel={(e) => zoomTo(z.s * (e.deltaY < 0 ? 1.15 : 0.87))}
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId)
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
          if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()]
            pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: z.s }
          }
          const now = Date.now()
          if (now - lastTap.current < 280 && pointers.current.size === 1) zoomTo(z.s > 1 ? 1 : 2.2)
          lastTap.current = now
        }}
        onPointerMove={(e) => {
          const prev = pointers.current.get(e.pointerId)
          if (!prev) return
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
          if (pointers.current.size === 2 && pinch.current) {
            const [a, b] = [...pointers.current.values()]
            const d = Math.hypot(a.x - b.x, a.y - b.y)
            setZ((c) => clamp(Math.max(1, Math.min(3, (pinch.current!.s * d) / pinch.current!.d)), c.x, c.y))
          } else if (z.s > 1) {
            setZ((c) => clamp(c.s, c.x + e.clientX - prev.x, c.y + e.clientY - prev.y))
          }
        }}
        onPointerUp={(e) => { pointers.current.delete(e.pointerId); if (pointers.current.size < 2) pinch.current = null }}
        onPointerCancel={(e) => { pointers.current.delete(e.pointerId); pinch.current = null }}
      >
        <img src={big} alt={f.alt} draggable={false} style={{ transform: `translate3d(${z.x}px, ${z.y}px, 0) scale(${z.s})` }} />
      </div>
      {frames.length > 1 && (
        <>
          <button className="lb-nav is-prev" onClick={() => go(-1)} aria-label="Previous photograph"><Icon name="arrowL" /></button>
          <button className="lb-nav is-next" onClick={() => go(1)} aria-label="Next photograph"><Icon name="arrow" /></button>
        </>
      )}
      {f.caption && <p className="lb-cap italic-voice">{f.caption}</p>}
      <p className="lb-hint small">{z.s > 1 ? 'Drag to look around · double-tap to reset' : 'Pinch, scroll or double-tap to look closer'}</p>
    </div>,
    document.body,
  )
}

/* ═══════════════ Fabric study — the 2D textile, used before/instead of WebGL ═══════════════ */
export function FabricStudy({ p, className }: { p: Product; className?: string }) {
  const url = useMemo(() => {
    try { return paintFabric(specOf(p), 512).colour.toDataURL('image/webp', 0.85) } catch { return '' }
  }, [p])
  return <span className={cx('fabric-study', className)} style={{ backgroundImage: url ? `url(${url})` : undefined }} aria-hidden="true" />
}

/* ═══════════════ 3D panel with real controls ═══════════════ */
function ViewerPanel({ p }: { p: Product }) {
  const device = useDevice()
  const api = useRef<ViewerApi | null>(null)
  const [auto, setAuto] = useState(!device.reducedMotion)
  const [ready, setReady] = useState(false)
  // the study is opened on request, so reduced-motion visitors still get it (still, no turntable); only no-WebGL falls back
  if (!device.webgl) {
    return (
      <div className="viewer is-fallback">
        <FabricStudy p={p} className="viewer-fabric" />
        <p className="viewer-note small">A 3D study needs WebGL, which isn’t available on this device — here is the woven fabric study instead: this piece’s colours and craft, laid flat.</p>
      </div>
    )
  }
  const key = (e: React.KeyboardEvent) => {
    const a = api.current; if (!a) return
    const map: Record<string, () => void> = { ArrowLeft: () => a.rotate(-1), ArrowRight: () => a.rotate(1), '+': () => a.zoom(1), '=': () => a.zoom(1), '-': () => a.zoom(-1), d: () => a.detail(), r: () => a.reset(), ' ': () => setAuto((v) => !v) }
    if (map[e.key]) { e.preventDefault(); map[e.key]() }
  }
  const silhouetteWord = { lehenga: 'lehenga', saree: 'saree drape', dupatta: 'dupatta on a stand', suit: 'draped suit fabric', anarkali: 'anarkali', gown: 'gown', menswear: 'men’s ensemble', maternity: 'maternity ensemble', kurta: 'kurta set' }[p.derived.silhouette]
  return (
    <div className="viewer">
      <div className="viewer-stage" tabIndex={0} onKeyDown={key} role="group" aria-roledescription="3D viewer"
        aria-label={`Interpretive 3D study of the ${p.name}: a ${silhouetteWord} in ${p.derived.families.join(', ').toLowerCase()}. Arrow keys turn it, plus and minus zoom, D shows the border up close, R resets, space pauses.`}
        data-cursor="Turn" data-lenis-prevent>
        {!ready && <div className="viewer-poster"><FabricStudy p={p} /><Loader label="Draping the study…" /></div>}
        <Suspense fallback={null}>
          <GarmentViewer ref={api} p={p} device={device} auto={auto} onReady={() => setTimeout(() => setReady(true), 250)} />
        </Suspense>
      </div>
      <div className="viewer-bar" role="toolbar" aria-label="3D study controls">
        <button onClick={() => api.current?.rotate(-1)} aria-label="Turn left"><Icon name="rotateL" size={20} /></button>
        <button onClick={() => api.current?.rotate(1)} aria-label="Turn right"><Icon name="rotateR" size={20} /></button>
        <span className="viewer-sep" aria-hidden="true" />
        <button onClick={() => api.current?.zoom(1)} aria-label="Zoom in"><Icon name="zoomIn" size={20} /></button>
        <button onClick={() => api.current?.zoom(-1)} aria-label="Zoom out"><Icon name="zoomOut" size={20} /></button>
        <button onClick={() => api.current?.detail()} className="viewer-detail" aria-label="Close-up of the border and hand-work"><Icon name="detail" size={20} /><span>Detail</span></button>
        <span className="viewer-sep" aria-hidden="true" />
        <button onClick={() => setAuto((v) => !v)} aria-pressed={!auto} aria-label={auto ? 'Pause turntable' : 'Resume turntable'}><Icon name={auto ? 'pause' : 'play'} size={20} /></button>
        <button onClick={() => api.current?.reset()} aria-label="Reset view"><Icon name="reset" size={20} /></button>
      </div>
      <p className="viewer-note small">Interpretive study — silhouette, colour and craft drawn from this piece. The photographs are the true reference.</p>
    </div>
  )
}

/* ═══════════════ Gallery ═══════════════ */
export function Gallery({ p }: { p: Product }) {
  const frames = framesOf(p)
  const [mode, setMode] = useState<'photo' | '3d'>('photo')
  const [active, setActive] = useState(0)
  const [lb, setLb] = useState<number | null>(null)
  const rail = useRef<HTMLDivElement>(null)

  // keep dots in sync with swipe position on the mobile rail
  useEffect(() => {
    const r = rail.current
    if (!r) return
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)) }), { root: r, threshold: 0.6 })
    r.querySelectorAll('[data-i]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [mode, p.slug])
  useEffect(() => { setActive(0); setMode('photo') }, [p.slug])

  const goTo = (i: number) => {
    setActive(i)
    const el = rail.current?.querySelector<HTMLElement>(`[data-i="${i}"]`)
    if (el && rail.current) rail.current.scrollTo({ left: el.offsetLeft - rail.current.offsetLeft, behavior: 'smooth' })
  }

  return (
    <div className="gallery" data-fly-source>
      <div className="gallery-tabs" role="tablist" aria-label="View">
        <button role="tab" aria-selected={mode === 'photo'} className={cx(mode === 'photo' && 'is-on')} onClick={() => setMode('photo')}>
          <Icon name="image" size={18} /> Photographs <span className="num">{frames.length}</span>
        </button>
        <button role="tab" aria-selected={mode === '3d'} className={cx(mode === '3d' && 'is-on')} onClick={() => setMode('3d')} data-cursor="3D">
          <Icon name="cube" size={18} /> 3D study
        </button>
      </div>

      {mode === 'photo' ? (
        <div className="gallery-body" role="tabpanel">
          {frames.length > 1 && (
            <ul role="list" className="gallery-thumbs hidden lg:grid">
              {frames.map((f, i) => (
                <li key={f.file + i}>
                  <button className={cx('gthumb', i === active && 'is-on')} onClick={() => goTo(i)} aria-label={`Show photograph ${i + 1}`} aria-current={i === active || undefined}>
                    <Img folder={f.folder} name={f.file} alt="" sizes="80px" ratio={4 / 5} fit={f.fit} focus={f.focus} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div ref={rail} className="gallery-rail rail" tabIndex={-1}>
            {frames.map((f, i) => (
              <figure key={f.file + i} className="gframe" data-i={i}>
                <button className="gframe-btn" onClick={() => setLb(i)} aria-label={`Open photograph ${i + 1} larger`} data-cursor="Zoom">
                  <Img folder={f.folder} name={f.file} alt={f.alt} sizes="(min-width: 64rem) 46vw, 100vw" ratio={4 / 5} fit={f.fit ?? 'cover'} focus={f.focus ?? '50% 30%'} priority={i === 0} className={i === 0 ? 'gframe-main' : undefined} />
                  <span className="gframe-zoom" aria-hidden="true"><Icon name="expand" size={18} /></span>
                </button>
                {f.caption && <figcaption className="gframe-cap">{f.caption}</figcaption>}
              </figure>
            ))}
          </div>
          {frames.length > 1 && (
            <div className="gallery-dots lg:hidden" aria-hidden="true">
              {frames.map((_, i) => <i key={i} className={cx(i === active && 'is-on')} />)}
              <span className="num">{active + 1}/{frames.length}</span>
            </div>
          )}
        </div>
      ) : (
        <div role="tabpanel" className="gallery-body is-3d"><ViewerPanel p={p} /></div>
      )}

      {lb !== null && <Lightbox frames={frames} index={lb} onClose={() => setLb(null)} onIndex={setLb} />}
    </div>
  )
}
