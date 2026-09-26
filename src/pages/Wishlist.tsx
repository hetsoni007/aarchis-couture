import { PageLoader } from '../components/brand/Motifs'
import { Seo } from '../lib/seo'
import { getProduct, type Product } from '../lib/catalog'
import { useWishlist } from '../store/wishlist'
import { useBag } from '../store/bag'
import { useUi } from '../store/ui'
import { defaultCustom } from '../components/product/customLabels'
import { ProductCard } from '../components/product/ProductCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Crumbs } from '../components/ui/Kit'
import { plural } from '../lib/format'
import './content.css'

export default function Wishlist() {
  const slugs = useWishlist((s) => s.slugs)
  const remove = useWishlist((s) => s.remove)
  const add = useBag((s) => s.add)
  const toast = useUi((s) => s.toast)
  const setBag = useUi((s) => s.setBag)
  const items = slugs.map(getProduct).filter(Boolean) as Product[]
  const hydrated = useUi((s) => s.hydrated)
  if (!hydrated) return <PageLoader />
  return (
    <div className="wrap content-page">
      <Seo title="Wishlist" description="Pieces you have pinned at Aarchi's by Archana Soni." noindex />
      <Crumbs trail={[{ name: 'Home', to: '/' }, { name: 'Wishlist' }]} />
      <header className="acc-head">
        <p className="eyebrow">Pinned pieces</p>
        <h1 className="h1">Wishlist</h1>
        {items.length > 0 && <p className="muted">{plural(items.length, 'piece')} pinned on this device.</p>}
      </header>
      {items.length ? (
        <ul role="list" className="pgrid is-dense wish-grid">
          {items.map((p) => (
            <li key={p.slug} className="wish-item">
              <ProductCard p={p} sizes="(min-width: 90rem) 22vw, (min-width: 64rem) 30vw, (min-width: 37.5rem) 46vw, 92vw" />
              <div className="wish-actions">
                <Button size="sm" variant="secondary" onClick={() => {
                  add(p.slug, defaultCustom(p)); remove(p.slug)
                  toast({ message: `${p.name} — folded into your bag.`, tone: 'success', action: { label: 'View bag', run: () => setBag(true) } })
                }}>Move to bag</Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState kind="wishlist" title="Nothing pinned yet."
          actions={<><Button to="/shop">Browse the collections</Button><Button to="/shop?new=1" variant="ghost">New arrivals</Button></>}>
          Tap the heart on any piece to keep it close — your pins stay on this device.
        </EmptyState>
      )}
    </div>
  )
}
