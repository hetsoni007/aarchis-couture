import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Seo } from '../lib/seo'
import { getProduct, productUrl } from '../lib/catalog'
import { formatINR } from '../lib/format'
import { studioOrderLink, customerOrderLink } from '../lib/whatsapp'
import { useBag, bagTotal, bagHasIndicative } from '../store/bag'
import { useOrders, type Contact } from '../store/orders'
import { useUi } from '../store/ui'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Field'
import { Img } from '../components/ui/Img'
import { Icon } from '../components/ui/Icon'
import { EmptyState } from '../components/ui/EmptyState'
import { PageLoader, Qty } from '../components/ui/Kit'
import './checkout.css'

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates', 'Elsewhere']
const EMPTY: Contact = { name: '', phone: '', email: '', country: 'India', city: '', address: '', postcode: '' }

function useSessionState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => { try { const s = sessionStorage.getItem(key); return s ? { ...initial, ...JSON.parse(s) } : initial } catch { return initial } })
  useEffect(() => { try { sessionStorage.setItem(key, JSON.stringify(v)) } catch { /* private mode */ } }, [key, v])
  return [v, setV] as const
}

function validateContact(c: Contact) {
  const e: Partial<Record<keyof Contact, string>> = {}
  if (c.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!/^\+?[\d\s-]{8,18}$/.test(c.phone.trim())) e.phone = 'Please enter a valid phone number with country code (e.g. +91 98793 90731).'
  if (c.email && !/^\S+@\S+\.\S+$/.test(c.email)) e.email = 'Please enter a valid email address.'
  if (!c.city.trim()) e.city = 'Please enter your city.'
  if (c.address.trim().length < 6) e.address = 'Please enter your full delivery address.'
  if (!c.postcode.trim()) e.postcode = 'Please enter a postcode or PIN.'
  return e
}

function OrderSummary() {
  const items = useBag((s) => s.items)
  const setQty = useBag((s) => s.setQty)
  const remove = useBag((s) => s.remove)
  const total = bagTotal(items)
  const indicative = bagHasIndicative(items)
  return (
    <div className="os">
      <h2 className="t-label">Order summary</h2>
      <ul role="list" className="os-lines">
        {items.map((i) => {
          const p = getProduct(i.slug)!
          return (
            <li key={i.id} className="os-line">
              <span className="os-img">
                <Img folder="p" name={p.image.file} alt="" sizes="64px" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} />
                <span className="os-qty t-num" aria-label={`Quantity ${i.qty}`}>{i.qty}</span>
              </span>
              <span className="os-body">
                <Link to={productUrl(p)} className="os-name">{p.name}</Link>
                <span className="t-small t-muted">{p.categoryLabel}</span>
              </span>
              <span className="os-line-right">
                <span className="t-num os-price">{formatINR(p.price.inr * i.qty)}</span>
                <span className="os-line-actions">
                  <Qty value={i.qty} onChange={(n) => setQty(i.id, n)} label={p.name} />
                  <button className="link t-small" onClick={() => remove(i.id)}>Remove</button>
                </span>
              </span>
            </li>
          )
        })}
      </ul>
      <dl className="totals-rows">
        <div><dt>Subtotal</dt><dd className="t-num">{formatINR(total)}</dd></div>
        <div><dt>Shipping</dt><dd>Calculated after order</dd></div>
        <div className="totals-total"><dt>{indicative ? 'Indicative total' : 'Total'}</dt><dd className="t-num">{formatINR(total)}</dd></div>
      </dl>
      {indicative && <p className="t-small t-muted">Some prices are indicative starting prices. Final price will be confirmed.</p>}
    </div>
  )
}

export default function Checkout() {
  const items = useBag((s) => s.items)
  const clear = useBag((s) => s.clear)
  const add = useOrders((s) => s.add)
  const hydrated = useUi((s) => s.hydrated)
  const navigate = useNavigate()
  const [contact, setContact] = useSessionState<Contact>('aarchis-checkout-contact', EMPTY)
  const [tried, setTried] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>>>({})
  const [busy, setBusy] = useState(false)
  const head = useRef<HTMLHeadingElement>(null)

  useEffect(() => { if (hydrated) head.current?.focus({ preventScroll: true }) }, [hydrated])

  if (!hydrated) return <><Seo title="Checkout" description="Place your order." noindex /><PageLoader /></>
  if (!items.length && !busy) {
    return (
      <div className="container co-empty">
        <Seo title="Checkout" description="Place your order." noindex />
        <EmptyState as="h1" kind="bag" title="Your bag is empty" actions={<Button to="/shop">Shop the collection</Button>}>
          Add a piece to your bag, then come back here to place your order.
        </EmptyState>
      </div>
    )
  }

  const f = (k: keyof Contact) => ({ value: contact[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setContact({ ...contact, [k]: e.target.value }), error: tried ? (errors[k] ?? null) : null })

  const placeOrder = () => {
    setTried(true)
    const e = validateContact(contact)
    setErrors(e)
    if (Object.keys(e).length) {
      setTimeout(() => document.querySelector<HTMLElement>('.co-form [aria-invalid="true"]')?.focus(), 30)
      return
    }
    setBusy(true)
    const order = add({
      lines: items.map((i) => {
        const p = getProduct(i.slug)!
        return { ...i, name: p.name, priceINR: p.price.inr, indicative: p.price.placeholder }
      }),
      contact, total: bagTotal(items), hasIndicative: bagHasIndicative(items),
    })
    // Open WhatsApp to notify the studio
    window.open(studioOrderLink(order), '_blank')
    // Open WhatsApp to notify the customer
    setTimeout(() => window.open(customerOrderLink(order), '_blank'), 500)
    setTimeout(() => {
      navigate(`/reserved/${order.ref}`, { replace: true })
      clear()
      try { sessionStorage.removeItem('aarchis-checkout-contact') } catch { /* ignore */ }
    }, 800)
  }

  return (
    <div className="co">
      <Seo title="Checkout" description="Place your order with Aarchi's by Archana Soni." noindex />
      <details className="co-mobile-sum">
        <summary className="container">
          <span className="co-mobile-toggle"><Icon name="bag" size={18} /><span><span className="co-show">Show</span><span className="co-hide">Hide</span> order summary</span><Icon name="chevron" size={14} className="co-mobile-chev" /></span>
          <span className="t-num co-mobile-total">{formatINR(bagTotal(items))}</span>
        </summary>
        <div className="container co-mobile-body"><OrderSummary /></div>
      </details>
      <div className="co-grid">
        <section className="co-main" aria-labelledby="co-title">
          <div className="co-main-in">
            <nav className="co-steps" aria-label="Checkout progress">
              <ol role="list">
                <li><Link to="/bag" className="co-step is-done">Bag</Link></li>
                <li><Icon name="chevronR" size={12} className="co-step-sep" /><span className="co-step is-now" aria-current="step">Checkout</span></li>
              </ol>
            </nav>
            <h1 id="co-title" ref={head} tabIndex={-1} className="t-h2 co-title">Your details</h1>
            <div className="co-form">
              <fieldset>
                <legend className="co-legend">Contact</legend>
                <Input label="Full name" autoComplete="name" required {...f('name')} />
                <div className="co-row">
                  <Input label="WhatsApp / Phone number" type="tel" inputMode="tel" autoComplete="tel" required hint="We'll send your order confirmation here." {...f('phone')} />
                  <Input label="Email" type="email" autoComplete="email" optional {...f('email')} />
                </div>
              </fieldset>
              <fieldset>
                <legend className="co-legend">Delivery address</legend>
                <Select label="Country / region" autoComplete="country-name" {...f('country')}>{COUNTRIES.map((x) => <option key={x}>{x}</option>)}</Select>
                <Textarea label="Address" autoComplete="street-address" required rows={2} {...f('address')} />
                <div className="co-row">
                  <Input label="City" autoComplete="address-level2" required {...f('city')} />
                  <Input label="Postcode / PIN" autoComplete="postal-code" required {...f('postcode')} />
                </div>
              </fieldset>
            </div>
            <div className="co-actions">
              <Link to="/bag" className="co-back"><Icon name="chevronL" size={14} /> Back to bag</Link>
              <Button size="lg" onClick={placeOrder} busy={busy}>Place order</Button>
            </div>
            <p className="co-foot t-small t-muted"><Icon name="whatsapp" size={14} /> Order confirmation will be sent to you and the studio on WhatsApp.</p>
          </div>
        </section>
        <aside className="co-side" aria-label="Order summary">
          <div className="co-side-in"><OrderSummary /></div>
        </aside>
      </div>
    </div>
  )
}
