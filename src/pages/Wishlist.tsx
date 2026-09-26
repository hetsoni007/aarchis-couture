import { Seo } from '../lib/seo'
import { getProduct, type Product } from '../lib/catalog'
import { plural } from '../lib/format'
import { useWishlist } from '../store/wishlist'
import { useUi } from '../store/ui'
import { ProductCard, useAddToBag } from '../components/product/ProductCard'
import { defaultCustom } from '../components/product/customLabels'
import { RecentlyViewed } from '../components/product/Rails'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Crumbs, PageLoader } from '../components/ui/Kit'
import './content.css'

export default function Wishlist() {
  const slugs = useWishlist((s) => s.slugs)
  const remove = useWishlist((s) => s.remove)
  const addToBag = useAddToBag()
  const hydrated = useUi((s) => s.hydrated)
  const items = slugs.map(getProduct).filter(Boolean) as Product[]
  return (
    <div className="acct">
      <Seo title="Wishlist" description="Pieces you have saved at Aarchi's by Archana Soni." noindex />
      <div className="container">
        <Crumbs trail={[{ name: 'Home', to: '/' }, { name: 'Wishlist' }]} className="acct-crumbs" />
        <header className="acct-head">
          <h1 className="t-h1">Wishlist</h1>
          {hydrated && items.length > 0 && <p className="t-muted">{plural(items.length, 'piece')} saved on this device.</p>}
        </header>
        {!hydrated ? <PageLoader /> : items.length ? (
          <>
          <h2 className="sr-only">Saved pieces</h2>
          <ul role="list" className="pgrid wl-grid">
            {items.map((p) => (
              <li key={p.slug} className="wl-item">
                <ProductCard p={p} />
                <div className="wl-actions">
                  <Button size="sm" block onClick={() => { addToBag(p, defaultCustom(p)); remove(p.slug) }}>Move to bag</Button>
                  <button className="link t-small" onClick={() => remove(p.slug)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          </>
        ) : (
          <EmptyState kind="wishlist" title="Your wishlist is empty"
            actions={<><Button to="/shop">Shop the collection</Button><Button to="/shop?new=1" variant="secondary">New arrivals</Button></>}>
            Tap the heart on any piece to save it here. Your wishlist stays on this device.
          </EmptyState>
        )}
      </div>
      <RecentlyViewed />
    </div>
  )
}
