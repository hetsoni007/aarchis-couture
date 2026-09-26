import { useRef } from 'react'
import { useUi } from '../store/ui'
import { PageLoader } from '../components/brand/Motifs'
import { Seo } from '../lib/seo'
import { getProduct, products } from '../lib/catalog'
import { formatINR, plural } from '../lib/format'
import { useReveals } from '../lib/reveal'
import { waLink } from '../lib/whatsapp'
import { useBag, bagCount, bagTotal, bagHasIndicative } from '../store/bag'
import { useWishlist } from '../store/wishlist'
import { BagLine } from '../components/layout/MiniBag'
import { describeCustom } from '../components/product/customLabels'
import { ProductCard } from '../components/product/ProductCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Crumbs } from '../components/ui/Kit'
import { Icon } from '../components/ui/Icon'
import { ZariRule } from '../components/brand/Motifs'
import './checkout.css'

export function Summary({ compact, cta }: { compact?: boolean; cta?: React.ReactNode }) {
  const items = useBag((s) => s.items)
  const total = bagTotal(items)
  const indicative = bagHasIndicative(items)
  return (
    <aside className={`summary ${compact ? 'is-compact' : ''}`} aria-label="Summary">
      <h2 className="summary-title">Summary</h2>
      <dl className="summary-rows">
        <div><dt>{plural(bagCount(items), 'piece')}</dt><dd className="num">{formatINR(total)}</dd></div>
        <div><dt>Deposit</dt><dd>Confirmed with your quote</dd></div>
        <div><dt>Shipping</dt><dd>Confirmed with your quote</dd></div>
        <div className="summary-total"><dt>{indicative ? 'Indicative total' : 'Total'}</dt><dd className="num">{formatINR(total)}</dd></div>
      </dl>
      <p className="summary-note small">
        <strong>No payment today.</strong> Reserving holds your pieces and books your consultation. Archana confirms the final quote, timeline and deposit on WhatsApp before a single thread is cut.
      </p>
      {cta}
    </aside>
  )
}

export default function Bag() {
  const items = useBag((s) => s.items)
  const pinned = useWishlist((s) => s.slugs).map(getProduct).filter(Boolean).slice(0, 4) as typeof products
  const root = useRef<HTMLDivElement>(null)
  useReveals(root, [items.length])
  const hydrated = useUi((s) => s.hydrated)
  const brief = items.map((i) => { const p = getProduct(i.slug)!; return `• ${p.name} ×${i.qty} — ${describeCustom(p, i.custom).join(', ')}` }).join('\n')

  if (!hydrated) return <div className="bagpage wrap"><PageLoader /></div>
  return (
    <div ref={root} className="bagpage wrap">
      <Seo title="Your bag" description="Pieces you have folded into your bag at Aarchi's by Archana Soni." noindex />
      <Crumbs trail={[{ name: 'Home', to: '/' }, { name: 'Bag' }]} />
      <header className="bag-head">
        <h1 className="h1">Your <em className="v">bag</em></h1>
        {items.length > 0 && <p className="muted num">{plural(bagCount(items), 'piece')}, each cut to measure</p>}
      </header>
      {items.length ? (
        <div className="bag-grid">
          <ul role="list" className="baglist bag-lines">{items.map((i) => <BagLine key={i.id} item={i} />)}</ul>
          <div className="bag-side">
            <Summary cta={
              <div className="summary-cta">
                <Button to="/checkout" size="lg" block iconRight="arrow">Reserve &amp; confirm</Button>
                <Button href={waLink(`Namaste Archana — I'd love your advice on my bag:\n${brief}`)} variant="ghost" icon="whatsapp">Talk it through with a stylist</Button>
              </div>
            } />
            <ul role="list" className="assure">
              <li><Icon name="video" size={18} /> Measured with you on video if you’d rather not measure alone</li>
              <li><Icon name="globe" size={18} /> Shipped across India and worldwide</li>
            </ul>
          </div>
        </div>
      ) : (
        <EmptyState kind="bag" title="Your bag is waiting for its first piece."
          actions={<><Button to="/shop">Browse the collections</Button><Button to="/wishlist" variant="ghost">See your pinned pieces</Button></>}>
          Every piece is cut to your measurements — start with one you love, and we’ll take care of the rest.
        </EmptyState>
      )}
      {pinned.length > 0 && (
        <section className="section bag-pinned" aria-labelledby="pinned-title">
          <ZariRule />
          <h2 id="pinned-title" className="h2" data-reveal>Pinned, not yet folded in</h2>
          <ul role="list" className="pgrid is-dense">{pinned.map((p) => <li key={p.slug}><ProductCard p={p} sizes="(min-width: 64rem) 22vw, 46vw" /></li>)}</ul>
        </section>
      )}
    </div>
  )
}
