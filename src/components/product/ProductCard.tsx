import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Img } from '../ui/Img'
import { Icon } from '../ui/Icon'
import { Price } from '../ui/Kit'
import { COLOUR_FAMILIES, productUrl, type Product } from '../../lib/catalog'
import { cx } from '../../lib/format'
import { useWishlist } from '../../store/wishlist'
import { useBag, type Customisation } from '../../store/bag'
import { useUi } from '../../store/ui'
import './product.css'

/** The second photograph shown on hover — the on-figure "look" from the piece's own campaign, when it has one. */
export function altImage(p: Product) {
  const s = p.story?.slides
  if (!s?.length) return null
  // only captioned on-figure frames — the uncaptioned campaign slides carry baked-in headline text
  return s.find((x) => /look/i.test(x.kicker ?? '')) ?? s.find((x) => x.kicker && !/detail/i.test(x.kicker)) ?? null
}

/** Add to bag → count bumps → the bag drawer slides in (the standard storefront confirmation). */
export function useAddToBag() {
  const add = useBag((s) => s.add)
  const setBag = useUi((s) => s.setBag)
  const bump = useUi((s) => s.bump)
  return (p: Product, custom: Customisation) => {
    add(p.slug, custom)
    bump()
    setBag(true)
  }
}

export function WishButton({ p, className, withLabel }: { p: Product; className?: string; withLabel?: boolean }) {
  const on = useWishlist((s) => s.slugs.includes(p.slug))
  const toggle = useWishlist((s) => s.toggle)
  const toast = useUi((s) => s.toast)
  const [pop, setPop] = useState(0)
  return (
    <button
      type="button"
      className={cx('wish', on && 'is-on', withLabel && 'has-label', className)}
      aria-pressed={on}
      aria-label={withLabel ? undefined : on ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
      onClick={(e) => {
        e.preventDefault()
        const added = toggle(p.slug)
        setPop((n) => n + 1)
        toast({ message: added ? `${p.name} saved to your wishlist.` : `${p.name} removed from your wishlist.`, tone: added ? 'success' : 'default' })
      }}
    >
      <Icon key={pop} name="heart" size={withLabel ? 18 : 20} className={cx('wish-ic', pop > 0 && 'is-pop')} />
      {withLabel && <span>{on ? 'Saved' : 'Wishlist'}</span>}
    </button>
  )
}

function Swatches({ p }: { p: Product }) {
  const fams = COLOUR_FAMILIES.filter((c) => p.derived.families.includes(c.name))
  if (!fams.length) return null
  return (
    <span className="pc-sw" aria-label={`In the photograph: ${fams.map((f) => f.name).join(', ')}`} role="img">
      {fams.slice(0, 4).map((f) => <i key={f.name} style={{ background: f.swatch }} />)}
      {fams.length > 4 && <span className="pc-sw-more">+{fams.length - 4}</span>}
    </span>
  )
}

export const CARD_SIZES = '(min-width: 90rem) 22vw, (min-width: 64rem) 24vw, (min-width: 48rem) 31vw, 48vw'

export function ProductCard({ p, sizes = CARD_SIZES, priority, badge }: { p: Product; sizes?: string; priority?: boolean; badge?: ReactNode }) {
  const setQuick = useUi((s) => s.setQuick)
  const alt = altImage(p)
  return (
    <article className={cx('pc', alt && 'has-alt')}>
      <div className="pc-media">
        <Img folder="p" name={p.image.file} alt={p.image.alt} sizes={sizes} ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} priority={priority} className="pc-img" />
        {alt && <Img folder="e" name={alt.file} alt="" sizes={sizes} ratio={3 / 4} focus="50% 30%" className="pc-img-alt" />}
        <div className="pc-badges">
          {badge ?? (p.isNew && <span className="badge">New</span>)}
        </div>
        <WishButton p={p} className="pc-wish" />
        <button type="button" className="pc-quick" onClick={() => setQuick(p.slug)} aria-label={`Quick view: ${p.name}`}>
          <Icon name="eye" size={16} /><span>Quick view</span>
        </button>
      </div>
      <div className="pc-body">
        <p className="pc-cat">{p.categoryLabel}</p>
        <h3 className="pc-name"><Link to={productUrl(p)} className="pc-link">{p.name}</Link></h3>
        <Price inr={p.price.inr} indicative={p.price.placeholder} className="pc-price" />
        <Swatches p={p} />
      </div>
    </article>
  )
}

export function ProductGrid({ items, sizes, className, priorityCount = 0 }: { items: Product[]; sizes?: string; className?: string; priorityCount?: number }) {
  return (
    <ul role="list" className={cx('pgrid', className)}>
      {items.map((p, i) => <li key={p.slug}><ProductCard p={p} sizes={sizes} priority={i < priorityCount} /></li>)}
    </ul>
  )
}
