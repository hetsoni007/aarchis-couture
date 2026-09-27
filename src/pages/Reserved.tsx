import { useParams } from 'react-router-dom'
import { Seo } from '../lib/seo'
import { getProduct } from '../lib/catalog'
import { formatINR } from '../lib/format'
import { waLink, studioOrderLink, customerOrderLink } from '../lib/whatsapp'
import { useOrders } from '../store/orders'
import { useUi } from '../store/ui'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Img } from '../components/ui/Img'
import { Icon } from '../components/ui/Icon'
import { PageLoader } from '../components/ui/Kit'
import './checkout.css'

export default function Reserved() {
  const { ref } = useParams()
  const order = useOrders((s) => s.orders.find((x) => x.ref === ref))
  const hydrated = useUi((s) => s.hydrated)
  if (!hydrated) return <PageLoader />
  if (!order) {
    return (
      <div className="container co-empty">
        <Seo title="Order" description="Your order with Aarchi's by Archana Soni." noindex />
        <EmptyState as="h1" kind="lost" title="We can't find that order on this device"
          actions={<><Button to="/account">Your orders</Button><Button href={waLink(`Namaste — I'm looking for my order ${ref ?? ''}.`)} variant="secondary" icon="whatsapp">Ask the studio</Button></>}>
          Orders are kept in the browser you placed them in. Contact us on WhatsApp for help.
        </EmptyState>
      </div>
    )
  }
  const firstName = order.contact.name.split(' ')[0]
  return (
    <div className="rsv">
      <Seo title={`Order confirmed — ${order.ref}`} description="Your order with Aarchi's by Archana Soni has been placed." noindex />
      <div className="container rsv-grid">
        <section className="rsv-main" aria-labelledby="rsv-title">
          <span className="rsv-check" aria-hidden="true"><Icon name="check" size={28} /></span>
          <p className="t-label t-muted">Order <span className="t-num">{order.ref}</span></p>
          <h1 id="rsv-title" className="t-h1">Thank you, {firstName}! Your order has been placed.</h1>
          <p className="t-lead">Order notifications have been sent on WhatsApp. If they didn't open automatically, you can send them manually below.</p>
          <div className="rsv-cta">
            <Button href={studioOrderLink(order)} size="lg" icon="whatsapp">Send order to studio</Button>
            <Button href={customerOrderLink(order)} variant="secondary" size="lg" icon="whatsapp">Send your confirmation</Button>
          </div>
          <div className="rsv-next">
            <h2 className="t-label">What happens next</h2>
            <ol role="list" className="journey">
              <li className="is-done"><span className="journey-dot" aria-hidden="true"><Icon name="check" size={12} /></span><span className="journey-t">Order placed</span><span className="journey-tag">Done</span></li>
              <li className="is-next"><span className="journey-dot" aria-hidden="true" /><span className="journey-t">Order confirmed by studio</span><span className="journey-tag is-next">Next</span></li>
              <li><span className="journey-dot" aria-hidden="true" /><span className="journey-t">Crafted in Ahmedabad</span></li>
              <li><span className="journey-dot" aria-hidden="true" /><span className="journey-t">Shipped to you</span></li>
              <li><span className="journey-dot" aria-hidden="true" /><span className="journey-t">Delivered to your door</span></li>
            </ol>
          </div>
          <Button to="/shop" variant="secondary">Continue shopping</Button>
        </section>
        <aside className="rsv-side" aria-label="Your order">
          <h2 className="t-label">Your order</h2>
          <ul role="list" className="os-lines">
            {order.lines.map((l) => {
              const p = getProduct(l.slug)!
              return (
                <li key={l.id} className="os-line">
                  <span className="os-img">
                    <Img folder="p" name={p.image.file} alt="" sizes="64px" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} />
                    <span className="os-qty t-num">{l.qty}</span>
                  </span>
                  <span className="os-body"><span className="os-name">{l.name}</span><span className="t-small t-muted">{p.categoryLabel}</span></span>
                  <span className="t-num os-price">{formatINR(l.priceINR * l.qty)}</span>
                </li>
              )
            })}
          </ul>
          <dl className="totals-rows">
            <div className="totals-total"><dt>{order.hasIndicative ? 'Indicative total' : 'Total'}</dt><dd className="t-num">{formatINR(order.total)}</dd></div>
          </dl>
          <div className="rsv-ship">
            <p className="t-label t-muted">Delivering to</p>
            <p className="t-small">{order.contact.name}<br />{order.contact.address}<br />{order.contact.city} {order.contact.postcode}, {order.contact.country}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
