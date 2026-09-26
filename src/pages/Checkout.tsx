import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Seo } from '../lib/seo'
import { FABRIC_PREFS, STUDIO_PALETTE, fitKindFor, getProduct, productUrl } from '../lib/catalog'
import { cx, formatINR } from '../lib/format'
import { scrollToTop } from '../lib/scroll'
import { ACTIVE_PROVIDER } from '../lib/payments'
import { useBag, bagTotal, bagHasIndicative, type BagItem, type FitMode } from '../store/bag'
import { useMeasurements, type MeasureProfile } from '../store/measurements'
import { useOrders, type Contact } from '../store/orders'
import { useUi } from '../store/ui'
import { describeCustom } from '../components/product/customLabels'
import { MeasureGuide } from '../components/product/MeasureGuide'
import { Totals } from './Bag'
import { Button } from '../components/ui/Button'
import { ChoiceGroup, Input, Select, Textarea } from '../components/ui/Field'
import { Img } from '../components/ui/Img'
import { Drawer, PageLoader, Qty } from '../components/ui/Kit'
import { Icon } from '../components/ui/Icon'
import { EmptyState } from '../components/ui/EmptyState'
import './checkout.css'

const STEPS = ['Pieces', 'Fit', 'Delivery', 'Review'] as const
const TITLES = ['Confirm your pieces', 'How should it fit?', 'Where is it going?', 'Review & reserve']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates', 'Elsewhere']
const OCCASIONS = ['Wedding', 'Reception', 'Sangeet / Mehndi', 'Engagement', 'Festive / Navratri', 'Baby shower', 'Everyday / Other']
const EMPTY: Contact = { name: '', phone: '', email: '', country: 'India', city: '', address: '', postcode: '', eventDate: '', occasion: '' }

function useSessionState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => { try { const s = sessionStorage.getItem(key); return s ? { ...initial, ...JSON.parse(s) } : initial } catch { return initial } })
  useEffect(() => { try { sessionStorage.setItem(key, JSON.stringify(v)) } catch { /* private mode */ } }, [key, v])
  return [v, setV] as const
}

const itemNeedsBody = (i: BagItem) => { const k = fitKindFor(getProduct(i.slug)!); return k === 'women' || k === 'men' || (k === 'unstitched' && i.custom.fit !== 'unstitched') }
function fitProblem(i: BagItem): string | null {
  if (i.custom.fit === 'standard' && !i.custom.size) return 'Choose a size, or let Archana measure you on video.'
  if (i.custom.fit === 'profile' && !i.custom.profileId) return 'Choose a saved set of measurements.'
  return null
}

function Progress({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <nav className="co-steps" aria-label="Checkout progress">
      <ol role="list">
        <li><Link to="/bag" className="co-step is-done">Bag</Link></li>
        {STEPS.map((s, i) => (
          <li key={s}>
            <Icon name="chevronR" size={12} className="co-step-sep" />
            {i < step ? <button className="co-step is-done" onClick={() => onJump(i)}>{s}<span className="sr-only"> (completed, edit)</span></button>
              : <span className={cx('co-step', i === step && 'is-now')} aria-current={i === step ? 'step' : undefined}>{s}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ═══════════════ Order summary (right column / mobile disclosure) ═══════════════ */
function OrderSummary() {
  const items = useBag((s) => s.items)
  return (
    <div className="os">
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
                <span className="os-name">{p.name}</span>
                <span className="t-small t-muted">{describeCustom(p, i.custom).join(' · ')}</span>
              </span>
              <span className="t-num os-price">{formatINR(p.price.inr * i.qty)}</span>
            </li>
          )
        })}
      </ul>
      <Totals />
    </div>
  )
}

/* ═══════════════ Steps ═══════════════ */
function PiecesStep() {
  const items = useBag((s) => s.items)
  const update = useBag((s) => s.update)
  const setQty = useBag((s) => s.setQty)
  return (
    <div className="co-list">
      {items.map((i) => {
        const p = getProduct(i.slug)!
        const fabrics = FABRIC_PREFS[p.category]
        return (
          <article key={i.id} className="co-card">
            <Link to={productUrl(p)} className="co-card-img" aria-hidden="true" tabIndex={-1}><Img folder="p" name={p.image.file} alt="" sizes="120px" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} /></Link>
            <div className="co-card-body">
              <div className="co-card-top">
                <div><p className="t-label t-muted">{p.categoryLabel}</p><h3 className="co-card-name">{p.name}</h3></div>
                <span className="t-num">{formatINR(p.price.inr * i.qty)}</span>
              </div>
              <div className="co-fields">
                <Select label="Colour" value={i.custom.colour} onChange={(e) => update(i.id, { colour: e.target.value })}>
                  {STUDIO_PALETTE.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                {fabrics.length > 1 && (
                  <Select label="Fabric preference" value={i.custom.fabric} onChange={(e) => update(i.id, { fabric: e.target.value })}>
                    {fabrics.map((f) => <option key={f}>{f}</option>)}
                  </Select>
                )}
              </div>
              <Textarea label="Changes for this piece" optional value={i.custom.notes ?? ''} onChange={(e) => update(i.id, { notes: e.target.value })} placeholder="Sleeve length, neckline, border…" maxLength={400} />
              <Qty value={i.qty} onChange={(n) => setQty(i.id, n)} label={p.name} />
            </div>
          </article>
        )
      })}
    </div>
  )
}

function FitStep({ tried }: { tried: boolean }) {
  const items = useBag((s) => s.items)
  const update = useBag((s) => s.update)
  const profiles = useMeasurements((s) => s.profiles)
  const toast = useUi((s) => s.toast)
  const [sheetFor, setSheetFor] = useState<BagItem | null>(null)
  return (
    <div className="co-list">
      <p className="co-lede"><Icon name="info" size={16} /><span>Not sure? <strong>Measure with Archana</strong> is the studio’s own process: a short, guided WhatsApp video call after you reserve.</span></p>
      {items.map((i) => {
        const p = getProduct(i.slug)!
        const kind = fitKindFor(p)
        const mine = profiles.filter((x) => x.kind === (kind === 'men' ? 'men' : 'women'))
        const problem = tried ? fitProblem(i) : null
        return (
          <article key={i.id} className={cx('co-card is-fit', problem && 'has-error')}>
            <span className="co-card-img is-sm" aria-hidden="true"><Img folder="p" name={p.image.file} alt="" sizes="64px" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} /></span>
            <div className="co-card-body">
              <h3 className="co-card-name">{p.name}</h3>
              {kind === 'none' && <p className="co-ok"><Icon name="check" size={16} /> One size, nothing to measure.</p>}
              {kind === 'unstitched' && (
                <ChoiceGroup legend="Stitching" name={`st-${i.id}`} value={i.custom.fit === 'unstitched' ? 'unstitched' : 'tailored'} columns={2}
                  onChange={(v) => update(i.id, { fit: v === 'unstitched' ? 'unstitched' : 'video', size: undefined, profileId: undefined })}
                  options={[{ value: 'unstitched', label: 'Unstitched' }, { value: 'tailored', label: 'Tailor it for me' }]} />
              )}
              {itemNeedsBody(i) && (
                <>
                  <ChoiceGroup legend="Fit" name={`fit-${i.id}`} value={i.custom.fit as FitMode}
                    onChange={(v) => { if (v === 'profile' && !mine.length) { setSheetFor(i); return } update(i.id, { fit: v, size: v === 'standard' ? i.custom.size : undefined, profileId: v === 'profile' ? i.custom.profileId ?? mine[0]?.id : undefined }) }}
                    options={[
                      { value: 'video', label: 'Measure with Archana', hint: 'Guided video call' },
                      { value: 'profile', label: mine.length ? 'Saved measurements' : 'Enter measurements', hint: mine.length ? mine.map((m) => m.name).join(', ') : 'With the visual guide' },
                      { value: 'standard', label: 'Standard size', hint: 'XS–XXL' },
                    ]} />
                  {i.custom.fit === 'profile' && mine.length > 0 && (
                    <div className="co-chips">
                      {mine.map((m) => <button key={m.id} className={cx('chip', i.custom.profileId === m.id && 'is-active')} aria-pressed={i.custom.profileId === m.id} onClick={() => update(i.id, { profileId: m.id })}>{m.name}</button>)}
                      <button className="link t-small" onClick={() => setSheetFor(i)}>Add another set</button>
                    </div>
                  )}
                  {i.custom.fit === 'standard' && (
                    <div className="co-sizes" role="radiogroup" aria-label={`Size for ${p.name}`}>
                      {SIZES.map((s) => <button key={s} role="radio" aria-checked={i.custom.size === s} className={cx('bb-size', i.custom.size === s && 'is-on')} onClick={() => update(i.id, { size: s })}>{s}</button>)}
                    </div>
                  )}
                </>
              )}
              {problem && <p className="co-err" role="alert">{problem}</p>}
            </div>
          </article>
        )
      })}
      <Drawer open={!!sheetFor} onClose={() => setSheetFor(null)} title="Your measurements" size="lg">
        {sheetFor && (
          <MeasureGuide kind={fitKindFor(getProduct(sheetFor.slug)!) === 'men' ? 'men' : 'women'} compact onSaved={(pr: MeasureProfile) => {
            update(sheetFor.id, { fit: 'profile', profileId: pr.id }); setSheetFor(null)
            toast({ message: `Measurements for “${pr.name}” saved.`, tone: 'success' })
          }} />
        )}
      </Drawer>
    </div>
  )
}

function validateContact(c: Contact) {
  const e: Partial<Record<keyof Contact, string>> = {}
  if (c.name.trim().length < 2) e.name = 'Please enter the name the piece is for.'
  if (!/^\+?[\d\s-]{8,18}$/.test(c.phone.trim())) e.phone = 'Include the country code, e.g. +91 98793 90731, so the studio can reach you on WhatsApp.'
  if (c.email && !/^\S+@\S+\.\S+$/.test(c.email)) e.email = 'That email address doesn’t look complete.'
  if (!c.city.trim()) e.city = 'Please enter a city.'
  if (c.address.trim().length < 6) e.address = 'Please enter the full delivery address.'
  if (!c.postcode.trim()) e.postcode = 'Please enter a postcode or PIN.'
  if (c.eventDate && new Date(c.eventDate) < new Date(new Date().toDateString())) e.eventDate = 'That date has already passed.'
  return e
}

function DeliveryStep({ c, setC, errors }: { c: Contact; setC: (c: Contact) => void; errors: Partial<Record<keyof Contact, string>> }) {
  const f = (k: keyof Contact) => ({ value: c[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setC({ ...c, [k]: e.target.value }), error: errors[k] ?? null })
  return (
    <div className="co-form">
      <fieldset>
        <legend className="co-legend">Contact</legend>
        <Input label="Full name" autoComplete="name" required {...f('name')} />
        <div className="co-row">
          <Input label="WhatsApp number" type="tel" inputMode="tel" autoComplete="tel" required hint="The studio confirms everything here." {...f('phone')} />
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
      <fieldset>
        <legend className="co-legend">The occasion</legend>
        <div className="co-row">
          <Select label="Occasion" optional {...f('occasion')}><option value="">Choose…</option>{OCCASIONS.map((x) => <option key={x}>{x}</option>)}</Select>
          <Input label="Event date" type="date" optional min={new Date().toISOString().slice(0, 10)} hint="Helps Archana plan your timeline." {...f('eventDate')} />
        </div>
      </fieldset>
    </div>
  )
}

function ReviewStep({ c, agreed, setAgreed, tried, go }: { c: Contact; agreed: boolean; setAgreed: (v: boolean) => void; tried: boolean; go: (i: number) => void }) {
  const items = useBag((s) => s.items)
  const profiles = useMeasurements((s) => s.profiles)
  return (
    <div className="co-review">
      <div className="co-rev">
        <div className="co-rev-row">
          <span className="co-rev-k">Contact</span>
          <span className="co-rev-v">{c.name} · {c.phone}{c.email && ` · ${c.email}`}</span>
          <button className="link t-small" onClick={() => go(2)}>Change</button>
        </div>
        <div className="co-rev-row">
          <span className="co-rev-k">Ship to</span>
          <span className="co-rev-v">{c.address}, {c.city} {c.postcode}, {c.country}</span>
          <button className="link t-small" onClick={() => go(2)}>Change</button>
        </div>
        {(c.occasion || c.eventDate) && (
          <div className="co-rev-row">
            <span className="co-rev-k">Occasion</span>
            <span className="co-rev-v">{c.occasion}{c.occasion && c.eventDate && ' · '}{c.eventDate && new Date(c.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <button className="link t-small" onClick={() => go(2)}>Change</button>
          </div>
        )}
        {items.map((i) => {
          const p = getProduct(i.slug)!
          const prof = profiles.find((x) => x.id === i.custom.profileId)
          return (
            <div key={i.id} className="co-rev-row">
              <span className="co-rev-k">Fit</span>
              <span className="co-rev-v"><strong>{p.name}</strong>: {describeCustom(p, i.custom).join(' · ')}
                {prof && <span className="t-small t-muted t-num co-rev-m">{Object.entries(prof.values).map(([k, v]) => `${k} ${prof.unit === 'in' ? Math.round((v / 2.54) * 4) / 4 : v}${prof.unit}`).join(' · ')}</span>}
              </span>
              <button className="link t-small" onClick={() => go(1)}>Change</button>
            </div>
          )
        })}
      </div>
      <section className="co-how" aria-labelledby="how-title">
        <h3 id="how-title" className="t-label">What happens when you reserve</h3>
        <ol role="list">
          <li><span className="t-num">1</span><span>Your pieces are held and a reference is created. <strong>No payment is taken.</strong></span></li>
          <li><span className="t-num">2</span><span>You send the brief to Archana on WhatsApp in one tap.</span></li>
          <li><span className="t-num">3</span><span>She confirms the final quote, deposit and timeline with you, and then the making begins.</span></li>
        </ol>
        <p className="t-small t-muted">Payment: {ACTIVE_PROVIDER.label.toLowerCase()}.</p>
      </section>
      <label className={cx('co-agree', tried && !agreed && 'has-error')}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span className="fp-box" aria-hidden="true"><Icon name="check" size={12} /></span>
        <span>I understand this reserves my pieces without payment, and that the final price, deposit and timeline are confirmed with the studio on WhatsApp.</span>
      </label>
      {tried && !agreed && <p className="co-err" role="alert">Please tick the box to confirm how reserving works.</p>}
    </div>
  )
}

export default function Checkout() {
  const items = useBag((s) => s.items)
  const clear = useBag((s) => s.clear)
  const add = useOrders((s) => s.add)
  const profiles = useMeasurements((s) => s.profiles)
  const hydrated = useUi((s) => s.hydrated)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const step = Math.min(3, Math.max(0, Number(params.get('step') ?? 0)))
  const [contact, setContact] = useSessionState<Contact>('aarchis-checkout-contact', EMPTY)
  const [agreed, setAgreed] = useState(false)
  const [tried, setTried] = useState<Record<number, boolean>>({})
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>>>({})
  const [busy, setBusy] = useState(false)
  const head = useRef<HTMLHeadingElement>(null)

  useEffect(() => { if (hydrated) head.current?.focus({ preventScroll: true }) }, [step, hydrated])
  const go = (i: number) => { setParams(i ? { step: String(i) } : {}); scrollToTop(true) }

  if (!hydrated) return <><Seo title="Checkout" description="Reserve your made-to-measure pieces." noindex /><PageLoader /></>
  if (!items.length && !busy) {
    return (
      <div className="container co-empty">
        <Seo title="Checkout" description="Reserve your made-to-measure pieces." noindex />
        <EmptyState as="h1" kind="bag" title="Your bag is empty" actions={<Button to="/shop">Shop the collection</Button>}>
          Add a piece to your bag, then come back here to reserve it.
        </EmptyState>
      </div>
    )
  }

  const next = () => {
    setTried({ ...tried, [step]: true })
    if (step === 1 && items.some(fitProblem)) { document.querySelector('.co-card.has-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' }); return }
    if (step === 2) {
      const e = validateContact(contact); setErrors(e)
      if (Object.keys(e).length) { setTimeout(() => document.querySelector<HTMLElement>('.co-form [aria-invalid="true"]')?.focus(), 30); return }
    }
    if (step === 3) {
      if (!agreed) return
      setBusy(true)
      const res = add({
        lines: items.map((i) => {
          const p = getProduct(i.slug)!
          return { ...i, name: p.name, priceINR: p.price.inr, indicative: p.price.placeholder, profile: profiles.find((x) => x.id === i.custom.profileId) }
        }),
        contact, indicativeTotal: bagTotal(items), hasIndicative: bagHasIndicative(items),
      })
      setTimeout(() => {
        navigate(`/reserved/${res.ref}`, { replace: true })
        clear()
        try { sessionStorage.removeItem('aarchis-checkout-contact') } catch { /* ignore */ }
      }, 700)
      return
    }
    go(step + 1)
  }

  return (
    <div className="co">
      <Seo title="Checkout" description="Reserve your made-to-measure pieces with Aarchi's by Archana Soni." noindex />
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
            <Progress step={step} onJump={go} />
            <h1 id="co-title" ref={head} tabIndex={-1} className="t-h2 co-title">{TITLES[step]}</h1>
            {step === 0 && <PiecesStep />}
            {step === 1 && <FitStep tried={!!tried[1]} />}
            {step === 2 && <DeliveryStep c={contact} setC={setContact} errors={tried[2] ? errors : {}} />}
            {step === 3 && <ReviewStep c={contact} agreed={agreed} setAgreed={setAgreed} tried={!!tried[3]} go={go} />}
            <div className="co-actions">
              {step > 0
                ? <button className="co-back" onClick={() => go(step - 1)}><Icon name="chevronL" size={14} /> Back to {STEPS[step - 1].toLowerCase()}</button>
                : <Link to="/bag" className="co-back"><Icon name="chevronL" size={14} /> Back to bag</Link>}
              <Button size="lg" onClick={next} busy={busy}>
                {step < 3 ? `Continue to ${STEPS[step + 1].toLowerCase()}` : 'Reserve & confirm'}
              </Button>
            </div>
            <p className="co-foot t-small t-muted"><Icon name="shield" size={14} /> Nothing is charged today. Your details stay in this browser until you send your brief on WhatsApp.</p>
          </div>
        </section>
        <aside className="co-side" aria-label="Order summary">
          <div className="co-side-in"><OrderSummary /></div>
        </aside>
      </div>
    </div>
  )
}
