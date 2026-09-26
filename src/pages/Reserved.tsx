import { useParams } from 'react-router-dom'
import { Seo } from '../lib/seo'
import { getProduct } from '../lib/catalog'
import { formatINR } from '../lib/format'
import { waLink } from '../lib/whatsapp'
import { useOrders, JOURNEY, type Reservation } from '../store/orders'
import { useUi } from '../store/ui'
import { describeCustom } from '../components/product/customLabels'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Img } from '../components/ui/Img'
import { Icon } from '../components/ui/Icon'
import { PageLoader } from '../components/ui/Kit'
import './checkout.css'

export function briefFor(r: Reservation) {
  const lines = r.lines.map((l) => {
    const p = getProduct(l.slug)!
    const m = l.profile ? `\n  Measurements (${l.profile.name}, cm): ${Object.entries(l.profile.values).map(([k, v]) => `${k} ${v}`).join(', ')}` : ''
    return `• ${l.name} ×${l.qty} — ${describeCustom(p, l.custom).join(', ')}${m}${l.custom.notes ? `\n  Notes: ${l.custom.notes}` : ''}`
  }).join('\n')
  const c = r.contact
  const when = [c.occasion, c.eventDate && new Date(c.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })].filter(Boolean).join(' · ')
  return `Namaste Archana — I've just reserved on aarchisbyarchanasoni.com.
Reference: ${r.ref}

${lines}

Deliver to: ${c.city}, ${c.country}${when ? `\nOccasion: ${when}` : ''}
${r.hasIndicative ? 'Indicative total' : 'Total'}: ${formatINR(r.indicativeTotal)}
${c.name} · ${c.phone}${c.email ? ` · ${c.email}` : ''}`
}

export function Journey({ compact }: { compact?: boolean }) {
  return (
    <ol role="list" className={compact ? 'journey is-compact' : 'journey'} aria-label="Making progress">
      {JOURNEY.map((s, i) => (
        <li key={s} className={i === 0 ? 'is-done' : i === 1 ? 'is-next' : ''}>
          <span className="journey-dot" aria-hidden="true">{i === 0 && <Icon name="check" size={12} />}</span>
          <span className="journey-t">{s}</span>
          {!compact && i === 0 && <span className="journey-tag">Done</span>}
          {!compact && i === 1 && <span className="journey-tag is-next">Next: send your brief</span>}
        </li>
      ))}
    </ol>
  )
}

export default function Reserved() {
  const { ref } = useParams()
  const r = useOrders((s) => s.reservations.find((x) => x.ref === ref))
  const hydrated = useUi((s) => s.hydrated)
  if (!hydrated) return <PageLoader />
  if (!r) {
    return (
      <div className="container co-empty">
        <Seo title="Reservation" description="Your reservation with Aarchi's by Archana Soni." noindex />
        <EmptyState as="h1" kind="lost" title="We can’t find that reservation on this device"
          actions={<><Button to="/account">Your reservations</Button><Button href={waLink(`Namaste — I'm looking for my reservation ${ref ?? ''}.`)} variant="secondary" icon="whatsapp">Ask the studio</Button></>}>
          Reservations are kept in the browser you made them in. The studio has every brief you sent on WhatsApp.
        </EmptyState>
      </div>
    )
  }
  const firstName = r.contact.name.split(' ')[0]
  return (
    <div className="rsv">
      <Seo title={`Reserved — ${r.ref}`} description="Your pieces are reserved with Aarchi's by Archana Soni." noindex />
      <div className="container rsv-grid">
        <section className="rsv-main" aria-labelledby="rsv-title">
          <span className="rsv-check" aria-hidden="true"><Icon name="check" size={28} /></span>
          <p className="t-label t-muted">Reference <span className="t-num">{r.ref}</span></p>
          <h1 id="rsv-title" className="t-h1">Thank you, {firstName}. Your {r.lines.length === 1 ? 'piece is' : 'pieces are'} reserved.</h1>
          <p className="t-lead">Nothing has been charged. One last step: send your brief to Archana on WhatsApp so she can confirm your final quote, deposit and timeline.</p>
          <div className="rsv-cta">
            <Button href={waLink(briefFor(r))} size="lg" icon="whatsapp">Send your brief to Archana</Button>
            <Button to="/account" variant="secondary" size="lg">View in your account</Button>
          </div>
          <p className="t-small t-muted">One tap opens WhatsApp with everything filled in: pieces, fit, measurements and delivery.</p>
          <div className="rsv-next">
            <h2 className="t-label">What happens next</h2>
            <Journey />
          </div>
        </section>
        <aside className="rsv-side" aria-label="Your reservation">
          <h2 className="t-label">Your reservation</h2>
          <ul role="list" className="os-lines">
            {r.lines.map((l) => {
              const p = getProduct(l.slug)!
              return (
                <li key={l.id} className="os-line">
                  <span className="os-img">
                    <Img folder="p" name={p.image.file} alt="" sizes="64px" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} />
                    <span className="os-qty t-num">{l.qty}</span>
                  </span>
                  <span className="os-body"><span className="os-name">{l.name}</span><span className="t-small t-muted">{describeCustom(p, l.custom).join(' · ')}</span></span>
                  <span className="t-num os-price">{formatINR(l.priceINR * l.qty)}</span>
                </li>
              )
            })}
          </ul>
          <dl className="totals-rows">
            <div><dt>Payment today</dt><dd className="t-num">{formatINR(0)}</dd></div>
            <div className="totals-total"><dt>{r.hasIndicative ? 'Indicative total' : 'Total'}</dt><dd className="t-num">{formatINR(r.indicativeTotal)}</dd></div>
          </dl>
          <div className="rsv-ship">
            <p className="t-label t-muted">Delivering to</p>
            <p className="t-small">{r.contact.name}<br />{r.contact.address}<br />{r.contact.city} {r.contact.postcode}, {r.contact.country}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
