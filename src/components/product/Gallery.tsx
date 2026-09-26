import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Img } from '../ui/Img'
import { Icon } from '../ui/Icon'
import { Spinner } from '../ui/Kit'
import { imgSource } from '../../lib/img'
import { useDevice } from '../../lib/device'
import { useFocusTrap } from '../../lib/a11y'
import { lockScroll } from '../../lib/scroll'
import { paintFabric, specOf } from '../../lib/fabric'
import { cx } from '../../lib/format'
import type { Product } from '../../lib/catalog'
import type { ViewerApi } from '../three/GarmentViewer'
import './product.css'

const GarmentViewer = lazy(() => import('../three/GarmentViewer'))

export interface Frame { folder: 'p' | 'e'; file: string; alt: string; caption?: string | null; fit?: 'cover' | 'contain'; focus?: string }

export function framesOf(p: Product): Frame[] {
  const main: Frame = { folder: 'p', file: p.image.file, alt: p.image.alt, fit: p.image.fit, focus: p.image.focus }
  const story = (p.story?.slides ?? []).map((s) => ({ folder: 'e' as const, file: s.file, alt: s.alt, caption: s.caption, focus: '50% 35%' }))
  return [main, ...story]
}

// 88vw on phones: at DPR ~1.75 that selects the 640w file instead of 800w — visually identical, a third lighter
export const GALLERY_SIZES = '(min-width: 64rem) 46vw, 88vw'

/* ═══════════════ Lightbox: wheel / pinch / double-tap zoom and drag-pan ═══════════════ */
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
  const zoomTo = (s: number) => setZ((c) => clamp(Math.max(1, Math.min(3, s)), s <= 1 ? 0 : c.x, s <= 1 ? 0 : c.y))
  const go = (d: number) => onIndex((index + d + frames.length) % frames.length)

  return createPortal(
    <div ref={ref} className="lb" role="dialog" aria-modal="true" aria-label={`Photograph ${index + 1} of ${frames.length}`}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); if (e.key === '+' || e.key === '=') zoomTo(z.s + 0.5); if (e.key === '-') zoomTo(z.s - 0.5) }}>
      <div className="lb-top">
        <span className="t-num lb-count">{index + 1} / {frames.length}</span>
        <div className="lb-tools">
          <button onClick={() => zoomTo(z.s - 0.5)} disabled={z.s <= 1} aria-label="Zoom out"><Icon name="zoomOut" /></button>
          <button onClick={() => zoomTo(z.s + 0.5)} disabled={z.s >= 3} aria-label="Zoom in"><Icon name="zoomIn" /></button>
          <button onClick={onClose} aria-label="Close" data-autofocus><Icon name="close" /></button>
        </div>
      </div>
      <div ref={stage} className={cx('lb-stage', z.s > 1 && 'is-zoomed')}
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
          <button className="lb-nav is-prev" onClick={() => go(-1)} aria-label="Previous photograph"><Icon name="chevronL" size={22} /></button>
          <button className="lb-nav is-next" onClick={() => go(1)} aria-label="Next photograph"><Icon name="chevronR" size={22} /></button>
        </>
      )}
      <div className="lb-foot">
        {f.caption && <p className="lb-cap">{f.caption}</p>}
        <p className="lb-hint">{z.s > 1 ? 'Drag to look around · double-tap to reset' : 'Scroll, pinch or double-tap to zoom'}</p>
      </div>
    </div>,
    document.body,
  )
}

/* ═══════════════ Fabric study — the 2D textile, shown before / instead of WebGL ═══════════════ */
export function FabricStudy({ p, className }: { p: Product; className?: string }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    try { setUrl(paintFabric(specOf(p), 512).colour.toDataURL('image/webp', 0.85)) } catch { setUrl('') }
  }, [p])
  return <span className={cx('fabric-study', className)} style={{ backgroundImage: url ? `url(${url})` : undefined }} aria-hidden="true" />
}

/* ═══════════════ 3D study with real controls ═══════════════ */
function ViewerPanel({ p }: { p: Product }) {
  const device = useDevice()
  const api = useRef<ViewerApi | null>(null)
  const [auto, setAuto] = useState(!device.reducedMotion)
  const [ready, setReady] = useState(false)
  if (!device.webgl) {
    return (
      <div className="viewer is-fallback">
        <FabricStudy p={p} className="viewer-fabric" />
        <p className="viewer-note">A 3D study needs WebGL, which isn’t available on this device. Here is the fabric study instead: this piece’s colours and craft, laid flat.</p>
      </div>
    )
  }
  const key = (e: React.KeyboardEvent) => {
    const a = api.current; if (!a) return
    const map: Record<string, () => void> = { ArrowLeft: () => a.rotate(-1), ArrowRight: () => a.rotate(1), '+': () => a.zoom(1), '=': () => a.zoom(1), '-': () => a.zoom(-1), d: () => a.detail(), r: () => a.reset(), ' ': () => setAuto((v) => !v) }
    if (map[e.key]) { e.preventDefault(); map[e.key]() }
  }
  const word = { lehenga: 'lehenga', saree: 'saree drape', dupatta: 'dupatta on a stand', suit: 'draped suit fabric', anarkali: 'anarkali', gown: 'gown', menswear: 'men’s ensemble', maternity: 'maternity ensemble', kurta: 'kurta set' }[p.derived.silhouette]
  return (
    <div className="viewer">
      <div className="viewer-stage" tabIndex={0} onKeyDown={key} role="group" aria-roledescription="3D viewer"
        aria-label={`Interpretive 3D study of the ${p.name}: a ${word} in ${p.derived.families.join(', ').toLowerCase()}. Arrow keys turn it, plus and minus zoom, D shows the border up close, R resets, space pauses.`}>
        {!ready && <div className="viewer-poster"><FabricStudy p={p} /><Spinner label="Loading the 3D study" /></div>}
        <Suspense fallback={null}>
          <GarmentViewer ref={api} p={p} device={device} auto={auto} onReady={() => setTimeout(() => setReady(true), 250)} />
        </Suspense>
      </div>
      <div className="viewer-bar" role="toolbar" aria-label="3D study controls">
        <button onClick={() => api.current?.rotate(-1)} aria-label="Turn left"><Icon name="rotateL" size={18} /></button>
        <button onClick={() => api.current?.rotate(1)} aria-label="Turn right"><Icon name="rotateR" size={18} /></button>
        <button onClick={() => api.current?.zoom(1)} aria-label="Zoom in"><Icon name="zoomIn" size={18} /></button>
        <button onClick={() => api.current?.zoom(-1)} aria-label="Zoom out"><Icon name="zoomOut" size={18} /></button>
        <button onClick={() => api.current?.detail()} aria-label="Close-up of the border and hand-work"><Icon name="detail" size={18} /></button>
        <button onClick={() => setAuto((v) => !v)} aria-pressed={!auto} aria-label={auto ? 'Pause turntable' : 'Resume turntable'}><Icon name={auto ? 'pause' : 'play'} size={18} /></button>
        <button onClick={() => api.current?.reset()} aria-label="Reset view"><Icon name="reset" size={18} /></button>
      </div>
      <p className="viewer-note">An interpretive study of silhouette, colour and craft, drawn from this piece. The photographs are the true reference.</p>
    </div>
  )
}

/* ═══════════════ The gallery: thumbnails + stage on desktop, swipe rail on mobile ═══════════════ */
export function Gallery({ p }: { p: Product }) {
  const frames = useMemo(() => framesOf(p), [p])
  const total = frames.length + 1 // + the 3D study
  const rail = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  const [lb, setLb] = useState<number | null>(null)
  const [study, setStudy] = useState(false)
  const device = useDevice()

  useEffect(() => { setI(0); setStudy(false); rail.current?.scrollTo({ left: 0 }) }, [p.slug])

  const go = (n: number) => {
    const el = rail.current
    if (!el) return
    const k = Math.max(0, Math.min(total - 1, n))
    el.scrollTo({ left: k * el.clientWidth, behavior: device.reducedMotion ? 'auto' : 'smooth' })
    setI(k)
  }
  const onScroll = () => {
    const el = rail.current
    if (el) setI(Math.round(el.scrollLeft / el.clientWidth))
  }
  const zoom = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--zx', `${((e.clientX - r.left) / r.width) * 100}%`)
    e.currentTarget.style.setProperty('--zy', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <div className="gal">
      <ul role="list" className="gal-thumbs" aria-label="Choose a view">
        {frames.map((f, k) => (
          <li key={f.file}>
            <button className={cx('gal-thumb', i === k && 'is-on')} onClick={() => go(k)} aria-label={`View photograph ${k + 1}`} aria-current={i === k || undefined}>
              <Img folder={f.folder} name={f.file} alt="" sizes="80px" ratio={3 / 4} fit={f.fit} focus={f.focus} />
            </button>
          </li>
        ))}
        <li>
          <button className={cx('gal-thumb is-3d', i === frames.length && 'is-on')} onClick={() => go(frames.length)} aria-label="View the 3D study">
            <Icon name="cube" size={22} /><span>3D</span>
          </button>
        </li>
      </ul>

      <div className="gal-stage">
        <div ref={rail} className="gal-rail rail" onScroll={onScroll} aria-roledescription="carousel" aria-label={`${p.name} photographs`}>
          {frames.map((f, k) => (
            <figure key={f.file} className="gal-slide" aria-roledescription="slide" aria-label={`${k + 1} of ${total}`}>
              <button className="gal-zoom" onClick={() => setLb(k)} onMouseMove={device.finePointer ? zoom : undefined} aria-label={`Open photograph ${k + 1} full screen`}>
                <Img folder={f.folder} name={f.file} alt={f.alt} sizes={GALLERY_SIZES} ratio={3 / 4} fit={f.fit} focus={f.focus} priority={k === 0} />
              </button>
            </figure>
          ))}
          <figure className="gal-slide is-3d" aria-roledescription="slide" aria-label={`${total} of ${total}: 3D study`}>
            {study ? <ViewerPanel p={p} /> : (
              <div className="gal-3d-poster">
                <FabricStudy p={p} />
                <div className="gal-3d-card">
                  <Icon name="cube" size={28} />
                  <p className="t-h3">The 3D study</p>
                  <p className="t-small t-muted">Turn an interpretive 3D model of this {p.derived.silhouette === 'saree' ? 'drape' : 'piece'}, drawn from its colours and craft.</p>
                  <button className="btn btn-primary btn-md" onClick={() => setStudy(true)}><span className="btn-label">Open the 3D study</span></button>
                </div>
              </div>
            )}
          </figure>
        </div>
        <button className="gal-nav is-prev" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous view"><Icon name="chevronL" size={20} /></button>
        <button className="gal-nav is-next" onClick={() => go(i + 1)} disabled={i === total - 1} aria-label="Next view"><Icon name="chevronR" size={20} /></button>
        <div className="gal-dots" aria-hidden="true">
          {Array.from({ length: total }).map((_, k) => <i key={k} className={cx(k === i && 'is-on')} />)}
        </div>
        {i < frames.length && <span className="gal-hint" aria-hidden="true"><Icon name="expand" size={14} /> {device.finePointer ? 'Hover to zoom · click to enlarge' : 'Tap to enlarge'}</span>}
      </div>

      {lb !== null && <Lightbox frames={frames} index={lb} onClose={() => setLb(null)} onIndex={setLb} />}
    </div>
  )
}
