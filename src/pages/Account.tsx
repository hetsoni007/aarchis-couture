import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Seo } from '../lib/seo'
import { getProduct, productUrl } from '../lib/catalog'
import { cx, formatINR, plural } from '../lib/format'
import { waLink } from '../lib/whatsapp'
import { useOrders } from '../store/orders'
import { useMeasurements, type MeasureProfile } from '../store/measurements'
import { useWishlist } from '../store/wishlist'
import { useUi } from '../store/ui'
import { briefFor, Journey } from './Reserved'
import { MeasureGuide, FIELDS } from '../components/product/MeasureGuide'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Crumbs, Drawer, PageLoader } from '../components/ui/Kit'
import { Img } from '../components/ui/Img'
import { Icon, type IconName } from '../components/ui/Icon'
import './content.css'
import './checkout.css'

type Tab = 'reservations' | 'measurements'

function Reservations() {
  const list = useOrders((s) => s.reservations)
  if (!list.length) {
    return (
      <EmptyState kind="orders" title="No reservations yet" actions={<Button to="/shop">Shop the collection</Button>}>
        When you reserve a piece, it appears here with each step of its making, from consultation to your door.
      </EmptyState>
    )
  }
  return (
    <ul role="list" className="res-list">
      {list.map((r) => (
        <li key={r.ref} className="res">
          <header className="res-head">
            <div>
              <p className="res-ref t-num">{r.ref}</p>
              <p className="t-small t-muted">Reserved {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {plural(r.lines.reduce((n, l) => n + l.qty, 0), 'piece')} · {r.hasIndicative ? 'indicative ' : ''}{formatINR(r.indicativeTotal)}</p>
            </div>
            <Button href={waLink(briefFor(r))} variant="secondary" size="sm" icon="whatsapp">Send brief</Button>
          </header>
          <div className="res-body">
            <ul role="list" className="res-pieces">
              {r.lines.map((l) => {
                const p = getProduct(l.slug)
                return p ? (
                  <li key={l.id}>
                    <Link to={productUrl(p)} className="res-piece">
                      <Img folder="p" name={p.image.file} alt="" sizes="64px" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} />
                      <span className="t-small">{l.name}{l.qty > 1 && <span className="t-muted"> ×{l.qty}</span>}</span>
                    </Link>
                  </li>
                ) : null
              })}
            </ul>
            <Journey compact />
          </div>
          <p className="t-small t-muted">Progress is confirmed step by step by the studio on WhatsApp. This record lives on this device only.</p>
        </li>
      ))}
    </ul>
  )
}

function Measurements() {
  const profiles = useMeasurements((s) => s.profiles)
  const remove = useMeasurements((s) => s.remove)
  const upsert = useMeasurements((s) => s.upsert)
  const toast = useUi((s) => s.toast)
  const [editing, setEditing] = useState<MeasureProfile | 'women' | 'men' | null>(null)
  return (
    <div className="meas">
      {profiles.length ? (
        <ul role="list" className="prof-list">
          {profiles.map((pr) => (
            <li key={pr.id} className="prof">
              <header className="prof-head">
                <div><h3 className="t-h3">{pr.name}</h3><p className="t-small t-muted">{pr.kind === 'men' ? 'Menswear' : 'Womenswear'} · updated {new Date(pr.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p></div>
                <div className="prof-actions">
                  <button className="link t-small" onClick={() => setEditing(pr)}>Edit</button>
                  <button className="link t-small" onClick={() => { remove(pr.id); toast({ message: `“${pr.name}” removed.`, action: { label: 'Undo', run: () => upsert(pr) } }) }}>Remove</button>
                </div>
              </header>
              <dl className="prof-vals">
                {FIELDS[pr.kind].filter((f) => pr.values[f.id] != null).map((f) => (
                  <div key={f.id}><dt>{f.label}</dt><dd className="t-num">{pr.unit === 'in' ? Math.round((pr.values[f.id] / 2.54) * 4) / 4 : pr.values[f.id]} {pr.unit}</dd></div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState kind="measure" title="No measurements saved yet">
          Save a set once and use it on every piece. Or skip it: Archana measures with you on video before cutting.
        </EmptyState>
      )}
      <div className="meas-new">
        <Button icon="plus" onClick={() => setEditing('women')}>Add womenswear measurements</Button>
        <Button icon="plus" variant="secondary" onClick={() => setEditing('men')}>Add menswear measurements</Button>
        <Link to="/size-guide" className="link t-small">How to measure</Link>
      </div>
      <Drawer open={!!editing} onClose={() => setEditing(null)} title={typeof editing === 'object' && editing ? `Edit “${editing.name}”` : 'New measurements'} size="lg">
        {editing && (
          <MeasureGuide
            kind={typeof editing === 'object' ? editing.kind : editing}
            initial={typeof editing === 'object' ? editing : undefined}
            onSaved={(p) => { setEditing(null); toast({ message: `Measurements for “${p.name}” saved.`, tone: 'success' }) }}
          />
        )}
      </Drawer>
    </div>
  )
}

export default function Account() {
  const [params, setParams] = useSearchParams()
  const hydrated = useUi((s) => s.hydrated)
  const tab: Tab = hydrated && params.get('tab') === 'measurements' ? 'measurements' : 'reservations' // query applies after hydration
  const wish = useWishlist((s) => s.slugs.length)
  const res = useOrders((s) => s.reservations.length)
  const meas = useMeasurements((s) => s.profiles.length)
  const nav: { id: Tab | 'wishlist'; label: string; icon: IconName; n: number }[] = [
    { id: 'reservations', label: 'Reservations', icon: 'box', n: res },
    { id: 'measurements', label: 'Measurements', icon: 'ruler', n: meas },
    { id: 'wishlist', label: 'Wishlist', icon: 'heart', n: wish },
  ]
  return (
    <div className="acct">
      <Seo title="My account" description="Reservations, saved measurements and your wishlist." noindex />
      <div className="container">
        <Crumbs trail={[{ name: 'Home', to: '/' }, { name: 'My account' }]} className="acct-crumbs" />
        <header className="acct-head">
          <h1 className="t-h1">My account</h1>
          <p className="t-muted measure">Everything here is saved on this device. There’s no sign-in, and nothing is sent anywhere until you share it with the studio on WhatsApp.</p>
        </header>
        <div className="acct-grid">
          <nav className="acct-nav" aria-label="Account sections">
            <ul role="list">
              {nav.map((n) => (
                <li key={n.id}>
                  {n.id === 'wishlist'
                    ? <Link to="/wishlist" className="acct-link"><Icon name={n.icon} size={18} /> {n.label} <span className="t-num">{hydrated ? n.n : ''}</span></Link>
                    : <button className={cx('acct-link', tab === n.id && 'is-on')} aria-current={tab === n.id ? 'page' : undefined}
                        onClick={() => setParams(n.id === 'reservations' ? {} : { tab: n.id }, { replace: true })}>
                        <Icon name={n.icon} size={18} /> {n.label} <span className="t-num">{hydrated ? n.n : ''}</span>
                      </button>}
                </li>
              ))}
            </ul>
          </nav>
          <section className="acct-main" aria-label={tab === 'reservations' ? 'Reservations' : 'Measurements'}>
            <h2 className="t-h2 acct-title">{tab === 'reservations' ? 'Reservations' : 'Measurements'}</h2>
            {!hydrated ? <PageLoader /> : tab === 'reservations' ? <Reservations /> : <Measurements />}
          </section>
        </div>
      </div>
    </div>
  )
}
