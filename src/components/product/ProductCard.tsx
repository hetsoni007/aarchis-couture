import { Link } from 'react-router-dom'
import { Img } from '../ui/Img'
import { Icon } from '../ui/Icon'
import { Price } from '../ui/Kit'
import { productUrl, type Product } from '../../lib/catalog'
import { useWishlist } from '../../store/wishlist'
import { useUi } from '../../store/ui'
import { cx } from '../../lib/format'
import './product.css'

export function WishButton({ p, className, withLabel }: { p: Product; className?: string; withLabel?: boolean }) {
  const on = useWishlist((s) => s.slugs.includes(p.slug))
  const toggle = useWishlist((s) => s.toggle)
  const toast = useUi((s) => s.toast)
  return (
    <button
      className={cx('wish', on && 'is-on', withLabel && 'has-label', className)}
      aria-pressed={on}
      aria-label={on ? `Unpin ${p.name} from your wishlist` : `Pin ${p.name} to your wishlist`}
      data-cursor={on ? 'Unpin' : 'Pin'}
      onClick={(e) => {
        e.preventDefault()
        const now = toggle(p.slug)
        toast({ message: now ? `${p.name} pinned to your wishlist.` : `${p.name} unpinned.`, tone: now ? 'success' : 'default' })
      }}
    >
      <Icon name="heart" size={20} />
      {withLabel && <span>{on ? 'Pinned' : 'Pin to wishlist'}</span>}
    </button>
  )
}

/** Hover (or keyboard focus) reveals the next story frame if the piece has one. */
export function ProductCard({ p, sizes, priority, index }: { p: Product; sizes: string; priority?: boolean; index?: number }) {
  const alt = p.story?.slides.find((s) => s.file !== p.image.file)
  return (
    <article className={cx('pcard', alt && 'has-alt')} style={index !== undefined ? { ['--i' as string]: index % 4 } : undefined}>
      <Link to={productUrl(p)} className="pcard-link" data-cursor="View">
        <div className="pcard-media">
          <Img folder="p" name={p.image.file} alt={p.image.alt} sizes={sizes} ratio={4 / 5} fit={p.image.fit} focus={p.image.focus} priority={priority} className="pcard-img" />
          {alt && <Img folder="e" name={alt.file} alt="" sizes={sizes} ratio={4 / 5} focus="50% 30%" className="pcard-img2" />}
          {p.isNew && <span className="pcard-badge">New arrival</span>}
          <span className="pcard-sheen" aria-hidden="true" />
        </div>
        <div className="pcard-body">
          <p className="pcard-cat">{p.categoryLabel}</p>
          <h3 className="pcard-name">{p.name}</h3>
          <Price inr={p.price.inr} indicative={p.price.placeholder} className="pcard-price" />
          <p className="pcard-occ">{p.occasions.join(' · ')}</p>
        </div>
      </Link>
      <WishButton p={p} className="pcard-wish" />
    </article>
  )
}

export function ProductGrid({ items, dense, priorityCount = 0 }: { items: Product[]; dense?: boolean; priorityCount?: number }) {
  const sizes = dense
    ? '(min-width: 90rem) 22vw, (min-width: 64rem) 30vw, (min-width: 37.5rem) 46vw, 92vw'
    : '(min-width: 64rem) 30vw, (min-width: 37.5rem) 46vw, 92vw'
  return (
    <ul role="list" className={cx('pgrid', dense && 'is-dense')}>
      {items.map((p, i) => (
        <li key={p.slug}><ProductCard p={p} sizes={sizes} priority={i < priorityCount} index={i} /></li>
      ))}
    </ul>
  )
}
