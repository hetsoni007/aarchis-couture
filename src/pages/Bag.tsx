import type { ReactNode } from 'react'
import { Seo } from '../lib/seo'
import { getProduct, products, type Product } from '../lib/catalog'
import { formatINR, plural } from '../lib/format'
import { useBag, bagCount, bagTotal, bagHasIndicative } from '../store/bag'
import { useWishlist } from '../store/wishlist'
import { useUi } from '../store/ui'
import { BagLine } from '../components/layout/CartDrawer'
import { ProductRail, RecentlyViewed } from '../components/product/Rails'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Crumbs, PageLoader } from '../components/ui/Kit'
import { Icon } from '../components/ui/Icon'
import './checkout.css'

export function Totals({ children }: { children?: ReactNode }) {
  const items = useBag((s) => s.items)
  const total = bagTotal(items)
  const indicative = bagHasIndicative(items)
  return (
    <div className="totals">
      <dl className="totals-rows">
        <div><dt>Subtotal · {plural(bagCount(items), 'piece')}</dt><dd className="t-num">{formatINR(total)}</dd></div>
        <div><dt>Shipping</dt><dd>Calculated at checkout</dd></div>
        <div className="totals-total"><dt>{indicative ? 'Indicative total' : 'Total'}</dt><dd className="t-num">{formatINR(total)}</dd></div>
      </dl>
      {indicative && <p className="t-small t-muted">Some prices are indicative starting prices. Final price will be confirmed.</p>}
      {children}
    </div>
  )
}

export default function Bag() {
  const items = useBag((s) => s.items)
  const wish = useWishlist((s) => s.slugs)
  const hydrated = useUi((s) => s.hydrated)
  const inBag = new Set(items.map((i) => i.slug))
  const saved = wish.filter((s) => !inBag.has(s)).map(getProduct).filter(Boolean) as Product[]
  const suggestions = products.filter((p) => !inBag.has(p.slug) && items.some((i) => getProduct(i.slug)?.occasions.some((o) => p.occasions.includes(o)))).slice(0, 8)

  return (
    <div className="bagpage">
      <Seo title="Your bag" description="Pieces in your bag at Aarchi's by Archana Soni." noindex />
      <div className="container">
        <Crumbs trail={[{ name: 'Home', to: '/' }, { name: 'Bag' }]} className="bag-crumbs" />
        <header className="bag-head">
          <h1 className="t-h1">Your bag</h1>
          {hydrated && items.length > 0 && <p className="t-muted">{plural(bagCount(items), 'piece')}</p>}
        </header>
        {!hydrated ? <PageLoader /> : items.length ? (
          <div className="bag-grid">
            <section aria-label="Pieces in your bag">
              <ul role="list" className="lines bag-lines">{items.map((i) => <BagLine key={i.id} item={i} />)}</ul>
              <p className="bag-note"><Icon name="scissors" size={16} /> Every piece is handcrafted to order in Ahmedabad.</p>
            </section>
            <aside className="bag-side" aria-label="Order summary">
              <h2 className="t-label">Order summary</h2>
              <Totals>
                <Button to="/checkout" size="lg" block>Checkout</Button>
              </Totals>
              <ul role="list" className="bag-assure">
                <li><Icon name="truck" size={18} /><span>Shipped across India and worldwide.</span></li>
                <li><Icon name="whatsapp" size={18} /><span>Order confirmation sent on WhatsApp.</span></li>
              </ul>
            </aside>
          </div>
        ) : (
          <EmptyState kind="bag" as="h2" title="Your bag is empty"
            actions={<><Button to="/shop">Shop the collection</Button>{wish.length > 0 && <Button to="/wishlist" variant="secondary">View your wishlist</Button>}</>}>
            Browse our collection and add pieces you love to your bag.
          </EmptyState>
        )}
      </div>
      {hydrated && saved.length > 0 && <ProductRail items={saved} title="Saved to your wishlist" id="saved" />}
      {hydrated && items.length > 0 && suggestions.length > 0 && <ProductRail items={suggestions} title="You may also like" id="suggest" />}
      <RecentlyViewed />
    </div>
  )
}
