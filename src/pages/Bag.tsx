import type { ReactNode } from 'react'
import { Seo } from '../lib/seo'
import { getProduct, products, type Product } from '../lib/catalog'
import { formatINR, plural } from '../lib/format'
import { waLink } from '../lib/whatsapp'
import { useBag, bagCount, bagTotal, bagHasIndicative } from '../store/bag'
import { useWishlist } from '../store/wishlist'
import { useUi } from '../store/ui'
import { BagLine } from '../components/layout/CartDrawer'
import { describeCustom } from '../components/product/customLabels'
import { ProductRail, RecentlyViewed } from '../components/product/Rails'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Crumbs, PageLoader } from '../components/ui/Kit'
import { Icon } from '../components/ui/Icon'
import './checkout.css'

/** Totals block shared by the bag page and checkout. */
export function Totals({ children }: { children?: ReactNode }) {
  const items = useBag((s) => s.items)
  const total = bagTotal(items)
  const indicative = bagHasIndicative(items)
  return (
    <div className="totals">
      <dl className="totals-rows">
        <div><dt>Subtotal · {plural(bagCount(items), 'piece')}</dt><dd className="t-num">{formatINR(total)}</dd></div>
        <div><dt>Shipping</dt><dd>Confirmed with your quote</dd></div>
        <div><dt>Payment today</dt><dd className="t-num">{formatINR(0)}</dd></div>
        <div className="totals-total"><dt>{indicative ? 'Indicative total' : 'Total'}</dt><dd className="t-num">{formatINR(total)}</dd></div>
      </dl>
      {indicative && <p className="t-small t-muted">Includes indicative starting prices. Archana confirms your final quote, deposit and timeline on WhatsApp before any work begins.</p>}
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
  const brief = items.map((i) => { const p = getProduct(i.slug)!; return `• ${p.name} ×${i.qty} — ${describeCustom(p, i.custom).join(', ')}` }).join('\n')
  const suggestions = products.filter((p) => !inBag.has(p.slug) && items.some((i) => getProduct(i.slug)?.occasions.some((o) => p.occasions.includes(o)))).slice(0, 8)

  return (
    <div className="bagpage">
      <Seo title="Your bag" description="Pieces in your bag at Aarchi's by Archana Soni." noindex />
      <div className="container">
        <Crumbs trail={[{ name: 'Home', to: '/' }, { name: 'Bag' }]} className="bag-crumbs" />
        <header className="bag-head">
          <h1 className="t-h1">Your bag</h1>
          {hydrated && items.length > 0 && <p className="t-muted">{plural(bagCount(items), 'piece')}, each made to order for you</p>}
        </header>
        {!hydrated ? <PageLoader /> : items.length ? (
          <div className="bag-grid">
            <section aria-label="Pieces in your bag">
              <ul role="list" className="lines bag-lines">{items.map((i) => <BagLine key={i.id} item={i} />)}</ul>
              <p className="bag-note"><Icon name="scissors" size={16} /> Colour, fabric and fit can still be changed at checkout and in your consultation.</p>
            </section>
            <aside className="bag-side" aria-label="Order summary">
              <h2 className="t-label">Order summary</h2>
              <Totals>
                <Button to="/checkout" size="lg" block>Checkout</Button>
                <Button href={waLink(`Namaste Archana — I'd love your advice on my bag:\n${brief}`)} variant="secondary" block icon="whatsapp">Ask a stylist about my bag</Button>
              </Totals>
              <ul role="list" className="bag-assure">
                <li><Icon name="shield" size={18} /><span><strong>Reserve, then pay.</strong> Nothing is charged at checkout.</span></li>
                <li><Icon name="video" size={18} /><span>Measured with you on video if you’d rather not measure alone.</span></li>
                <li><Icon name="truck" size={18} /><span>Shipped across India and worldwide.</span></li>
              </ul>
            </aside>
          </div>
        ) : (
          <EmptyState kind="bag" as="h2" title="Your bag is empty"
            actions={<><Button to="/shop">Shop the collection</Button>{wish.length > 0 && <Button to="/wishlist" variant="secondary">View your wishlist</Button>}</>}>
            Every piece is cut to your measurements. Start with one you love, and the studio takes care of the rest.
          </EmptyState>
        )}
      </div>
      {hydrated && saved.length > 0 && <ProductRail items={saved} title="Saved to your wishlist" id="saved" />}
      {hydrated && items.length > 0 && suggestions.length > 0 && <ProductRail items={suggestions} title="You may also like" id="suggest" />}
      <RecentlyViewed />
    </div>
  )
}
