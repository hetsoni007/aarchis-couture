import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ProductCard, WishButton, useAddToBag } from './ProductCard'
import { defaultCustom } from './customLabels'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Img } from '../ui/Img'
import { Modal, Price } from '../ui/Kit'
import { fitKindFor, getProduct, productUrl, stripEmoji, type Product } from '../../lib/catalog'
import { cx } from '../../lib/format'
import { useRecent } from '../../store/recent'
import { useUi } from '../../store/ui'
import './product.css'

const RAIL_SIZES = '(min-width: 80rem) 22vw, (min-width: 48rem) 30vw, 46vw'

/** Scroll state + arrow handlers for any native scroll-snap rail. */
export function useRail<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null)
  const [edge, setEdge] = useState({ start: true, end: false })
  const update = () => {
    const el = ref.current
    if (el) setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(update, deps)
  const move = (d: 1 | -1) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.85, behavior: 'smooth' })
  return { ref, edge, update, move }
}

export function RailArrows({ edge, move, className }: { edge: { start: boolean; end: boolean }; move: (d: 1 | -1) => void; className?: string }) {
  if (edge.start && edge.end) return null
  return (
    <div className={cx('rail-arrows', className)}>
      <button onClick={() => move(-1)} disabled={edge.start} aria-label="Scroll back"><Icon name="chevronL" size={18} /></button>
      <button onClick={() => move(1)} disabled={edge.end} aria-label="Scroll forward"><Icon name="chevronR" size={18} /></button>
    </div>
  )
}

/** A horizontal product carousel: native scroll-snap, arrow buttons on desktop, swipe on touch. */
export function ProductRail({ items, title, label, action, className, id }: {
  items: Product[]; title: ReactNode; label?: string; action?: ReactNode; className?: string; id?: string
}) {
  const { ref, edge, update, move } = useRail<HTMLUListElement>([items.length])
  if (!items.length) return null
  const hid = id ? `${id}-title` : undefined
  return (
    <section className={cx('prail-sec', className)} aria-labelledby={hid}>
      <div className="container">
        <header className="sec-head">
          <div>
            {label && <p className="t-label">{label}</p>}
            <h2 id={hid} className="t-h2">{title}</h2>
          </div>
          <div className="prail-tools">
            {action}
            <RailArrows edge={edge} move={move} />
          </div>
        </header>
        <ul ref={ref} role="list" className="prail rail" onScroll={update}>
          {items.map((p) => <li key={p.slug}><ProductCard p={p} sizes={RAIL_SIZES} /></li>)}
        </ul>
      </div>
    </section>
  )
}

/** Pieces this visitor has opened (this device only). */
export function RecentlyViewed({ exclude, className }: { exclude?: string; className?: string }) {
  const slugs = useRecent((s) => s.slugs)
  const hydrated = useUi((s) => s.hydrated)
  if (!hydrated) return null
  const items = slugs.filter((s) => s !== exclude).map(getProduct).filter(Boolean).slice(0, 10) as Product[]
  return <ProductRail items={items} title="Recently viewed" id="recent" className={className} />
}

/** Short description for cards and quick view — never an unattributed Instagram caption. */
export function shortCopy(p: Product) {
  const c = p.copy
  if (c.displaySource === 'live-detail' || c.displaySource === 'image-text') return c.display
  return null
}

const FIT_NOTE = {
  women: 'Made to measure: Archana measures you on a guided video call after you reserve.',
  men: 'Made to measure: Archana measures you on a guided video call after you reserve.',
  none: 'One size: a dupatta drapes as it is, with nothing to measure.',
  unstitched: 'Unstitched suit piece with its dupatta. Tailoring can be added on the full page.',
} as const

/** Quick view: one modal for the whole app, opened from any product card. */
export function QuickView() {
  const slug = useUi((s) => s.quick)
  const setQuick = useUi((s) => s.setQuick)
  const { pathname } = useLocation()
  const addToBag = useAddToBag()
  useEffect(() => { setQuick(null) }, [pathname, setQuick])
  const p = getProduct(slug ?? undefined)
  if (!p) return null
  const copy = shortCopy(p)
  const close = () => setQuick(null)
  return (
    <Modal open={!!p} onClose={close} label={`Quick view: ${p.name}`}>
      <div className="qv">
        <div className="qv-media">
          <Img folder="p" name={p.image.file} alt={p.image.alt} sizes="(min-width: 48rem) 480px, 100vw" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} />
        </div>
        <div className="qv-info">
          <p className="t-label t-muted">{p.categoryLabel}</p>
          <h2 className="t-h2">{p.name}</h2>
          <Price inr={p.price.inr} indicative={p.price.placeholder} className="qv-price" />
          {copy && <p className="t-muted qv-copy">{copy}</p>}
          {!copy && p.copy.displaySource === 'instagram-caption' && p.copy.display && (
            <p className="t-muted qv-copy">“{stripEmoji(p.copy.display).slice(0, 180)}{p.copy.display.length > 180 ? '…' : ''}” <span className="t-small">— the studio, on Instagram</span></p>
          )}
          <ul role="list" className="qv-facts">
            <li><Icon name="scissors" size={16} /> {FIT_NOTE[fitKindFor(p)]}</li>
            <li><Icon name="shield" size={16} /> Nothing is charged until your quote is confirmed.</li>
          </ul>
          <div className="qv-actions">
            <Button block size="lg" onClick={() => { addToBag(p, defaultCustom(p)); close() }}>Add to bag</Button>
            <WishButton p={p} className="qv-wish" />
          </div>
          <Link to={productUrl(p)} className="link qv-more" onClick={close}>Choose colour, fabric &amp; size on the full page <Icon name="arrow" size={14} /></Link>
        </div>
      </div>
    </Modal>
  )
}
