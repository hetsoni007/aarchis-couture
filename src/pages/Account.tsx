import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageLoader } from '../components/brand/Motifs'
import { Seo } from '../lib/seo'
import { getProduct, productUrl } from '../lib/catalog'
import { cx, formatINR, plural } from '../lib/format'
import { waLink } from '../lib/whatsapp'
import { useOrders, JOURNEY } from '../store/orders'
import { useMeasurements, type MeasureProfile } from '../store/measurements'
import { useWishlist } from '../store/wishlist'
import { useUi } from '../store/ui'
import { briefFor } from './Reserved'
import { MeasureGuide, FIELDS } from '../components/product/MeasureGuide'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Crumbs, Sheet } from '../components/ui/Kit'
import { Img } from '../components/ui/Img'
import { ChoiceGroup } from '../components/ui/Field'
import './content.css'
import './checkout.css'

type Tab = 'reservations' | 'measurements'

function Reservations() {
  const list = useOrders((s) => s.reservations)
  if (!list.length) {
    return (
      <EmptyState kind="loom" title="No reservations on the loom yet."
        actions={<Button to="/shop">Find your first piece</Button>}>
        When you reserve a piece, it appears here with each step of its making — from consultation to your door.
      </EmptyState>
    )
  }
  return (
    <ul role="list" className="acc-res">
      {list.map((r) => (
        <li key={r.ref} className="acc-res-card">
          <header>
            <div>
              <p className="eyebrow plain num">{r.ref}</p>
              <p className="small muted">Reserved {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {plural(r.lines.reduce((n, l) => n + l.qty, 0), 'piece')} · {r.hasIndicative ? 'indicative ' : ''}{formatINR(r.indicativeTotal)}</p>
            </div>
            <Button href={waLink(briefFor(r))} variant="secondary" size="sm" icon="whatsapp">Send brief</Button>
          </header>
          <ul role="list" className="acc-res-pieces">
            {r.lines.map((l) => {
              const p = getProduct(l.slug)
              return p ? (
                <li key={l.id}>
                  <Link to={productUrl(p)} className="acc-res-piece">
                    <Img folder="p" name={p.image.file} alt="" sizes="64px" ratio={4 / 5} fit={p.image.fit} focus={p.image.focus} />
                    <span>{l.name}</span>
                  </Link>
                </li>
              ) : null
            })}
          </ul>
          <ol role="list" className="acc-track" aria-label="Making progress">
            {JOURNEY.map((s, i) => (
              <li key={s} className={cx(i === 0 && 'is-done', i === 1 && 'is-next')}>
                <i aria-hidden="true" /><span>{s}</span>
              </li>
            ))}
          </ol>
          <p className="small muted">Tracking updates as the studio confirms each step on WhatsApp. This record lives on this device only.</p>
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
  const [editing, setEditing] = useState<MeasureProfile | 'new-women' | 'new-men' | null>(null)
  const [kind, setKind] = useState<'women' | 'men'>('women')
  return (
    <div className="acc-meas">
      {profiles.length ? (
        <ul role="list" className="acc-prof">
          {profiles.map((pr) => (
            <li key={pr.id} className="acc-prof-card">
              <header>
                <h3 className="h3">{pr.name}</h3>
                <span className="small muted">{pr.kind === 'men' ? 'Menswear' : 'Womenswear'} · updated {new Date(pr.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </header>
              <dl className="acc-prof-vals">
                {FIELDS[pr.kind].filter((f) => pr.values[f.id] != null).map((f) => (
                  <div key={f.id}><dt>{f.label}</dt><dd className="num">{pr.unit === 'in' ? Math.round((pr.values[f.id] / 2.54) * 4) / 4 : pr.values[f.id]} {pr.unit}</dd></div>
                ))}
              </dl>
              <div className="acc-prof-actions">
                <Button variant="secondary" size="sm" icon="edit" onClick={() => setEditing(pr)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  remove(pr.id)
                  toast({ message: `“${pr.name}” removed.`, action: { label: 'Undo', run: () => upsert(pr) } })
                }}>Remove</Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState kind="tape" title="No measurements saved yet.">
          Save a set once and use it on every piece. Or skip it entirely — Archana measures with you on video before cutting.
        </EmptyState>
      )}
      <div className="acc-new">
        <ChoiceGroup legend="Add a set for" name="kind" value={kind} onChange={(v) => setKind(v)} columns={2}
          options={[{ value: 'women', label: 'Womenswear' }, { value: 'men', label: 'Menswear' }]} />
        <Button icon="ruler" onClick={() => setEditing(kind === 'men' ? 'new-men' : 'new-women')}>Open the measurement guide</Button>
      </div>
      <Sheet open={!!editing} onClose={() => setEditing(null)} title={typeof editing === 'object' && editing ? `Edit “${editing.name}”` : 'New measurements'} wide>
        {editing && (
          <MeasureGuide
            kind={typeof editing === 'object' ? editing.kind : editing === 'new-men' ? 'men' : 'women'}
            initial={typeof editing === 'object' ? editing : undefined}
            onSaved={(p) => { setEditing(null); toast({ message: `Measurements for “${p.name}” saved.`, tone: 'success' }) }}
          />
        )}
      </Sheet>
    </div>
  )
}

export default function Account() {
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'measurements' ? 'measurements' : 'reservations'
  const wish = useWishlist((s) => s.slugs.length)
  const res = useOrders((s) => s.reservations.length)
  const meas = useMeasurements((s) => s.profiles.length)
  const hydrated = useUi((s) => s.hydrated)
  if (!hydrated) return <PageLoader />
  return (
    <div className="wrap content-page acc">
      <Seo title="Your account" description="Reservations, saved measurements and pinned pieces." noindex />
      <Crumbs trail={[{ name: 'Home', to: '/' }, { name: 'Account' }]} />
      <header className="acc-head">
        <p className="eyebrow">Your atelier</p>
        <h1 className="h1">Account</h1>
        <p className="muted measure-lead">Everything here is saved on this device — no sign-in, nothing sent anywhere until you choose to share it with the studio on WhatsApp.</p>
      </header>
      <div className="acc-tabs" role="tablist" aria-label="Account sections">
        <button role="tab" aria-selected={tab === 'reservations'} className={cx(tab === 'reservations' && 'is-on')} onClick={() => setParams({}, { replace: true })}>Reservations <span className="num">{res}</span></button>
        <button role="tab" aria-selected={tab === 'measurements'} className={cx(tab === 'measurements' && 'is-on')} onClick={() => setParams({ tab: 'measurements' }, { replace: true })}>Measurements <span className="num">{meas}</span></button>
        <Link to="/wishlist" className="acc-tab-link">Wishlist <span className="num">{wish}</span></Link>
      </div>
      <div role="tabpanel">{tab === 'reservations' ? <Reservations /> : <Measurements />}</div>
    </div>
  )
}
