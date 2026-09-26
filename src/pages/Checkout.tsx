import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageLoader } from '../components/brand/Motifs'
import { Seo } from '../lib/seo'
import { FABRIC_PREFS, STUDIO_PALETTE, fitKindFor, getProduct, productUrl } from '../lib/catalog'
import { cx, formatINR } from '../lib/format'
import { scrollToTop } from '../lib/scroll'
import { useBag, bagTotal, bagHasIndicative, type BagItem, type FitMode } from '../store/bag'
import { useMeasurements, type MeasureProfile } from '../store/measurements'
import { useOrders, type Contact } from '../store/orders'
import { useUi } from '../store/ui'
import { describeCustom } from '../components/product/customLabels'
import { MeasureGuide } from '../components/product/MeasureGuide'
import { Summary } from './Bag'
import { Button } from '../components/ui/Button'
import { ChoiceGroup, Input, Select, Textarea } from '../components/ui/Field'
import { Img } from '../components/ui/Img'
import { Qty, Sheet } from '../components/ui/Kit'
import { Icon } from '../components/ui/Icon'
import { EmptyState } from '../components/ui/EmptyState'
import { ACTIVE_PROVIDER } from '../lib/payments'
import './checkout.css'

const STEPS = ['Your pieces', 'Fit', 'Delivery', 'Review'] as const
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
  if (i.custom.fit === 'standard' && !i.custom.size) return 'Choose a size — or let Archana measure on video.'
  if (i.custom.fit === 'profile' && !i.custom.profileId) return 'Choose a saved set of measurements.'
  return null
}

function Knots({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <nav className="knots" aria-label="Checkout progress">
      <ol role="list">
        {[...STEPS, 'Reserved'].map((s, i) => (
          <li key={s} className={cx('knot', i < step && 'is-done', i === step && 'is-now')} aria-current={i === step ? 'step' : undefined}>
            {i < step ? (
              <button onClick={() => onJump(i)} className="knot-btn"><i aria-hidden="true" /><span>{s}</span><span className="sr-only"> — completed, edit</span></button>
            ) : (
              <span className="knot-btn"><i aria-hidden="true" /><span>{s}</span></span>
            )}
          </li>
        ))}
      </ol>
      <span className="knots-thread" style={{ ['--p' as string]: step / STEPS.length }} aria-hidden="true" />
    </nav>
  )
}

function PiecesStep() {
  const items = useBag((s) => s.items)
  const update = useBag((s) => s.update)
  const setQty = useBag((s) => s.setQty)
  return (
    <div className="co-pieces">
      {items.map((i) => {
        const p = getProduct(i.slug)!
        const fabrics = FABRIC_PREFS[p.category]
        return (
          <article key={i.id} className="co-piece">
            <Link to={productUrl(p)} className="co-piece-img" aria-hidden="true" tabIndex={-1}><Img folder="p" name={p.image.file} alt="" sizes="120px" ratio={4 / 5} fit={p.image.fit} focus={p.image.focus} /></Link>
            <div className="co-piece-body">
              <p className="eyebrow plain">{p.categoryLabel}</p>
              <h3 className="h3">{p.name}</h3>
              <div className="co-piece-fields">
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
              <div className="co-piece-foot">
                <Qty value={i.qty} onChange={(n) => setQty(i.id, n)} label={p.name} />
                <span className="num">{formatINR(p.price.inr * i.qty)}{p.price.placeholder && <span className="price-ind"> Indicative</span>}</span>
              </div>
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
    <div className="co-fit">
      <p className="co-lede muted">Not sure? <strong>Measure with Archana</strong> is how most of the studio’s clients do it — a short guided video call after you reserve.</p>
      {items.map((i) => {
        const p = getProduct(i.slug)!
        const kind = fitKindFor(p)
        const mine = profiles.filter((x) => x.kind === (kind === 'men' ? 'men' : 'women'))
        const problem = tried ? fitProblem(i) : null
        return (
          <article key={i.id} className={cx('co-fit-item', problem && 'has-error')}>
            <header className="co-fit-head">
              <span className="co-fit-img" aria-hidden="true"><Img folder="p" name={p.image.file} alt="" sizes="56px" ratio={1} focus={p.image.focus} /></span>
              <div><h3 className="h3">{p.name}</h3><p className="small muted">{p.categoryLabel}</p></div>
            </header>
            {kind === 'none' && <p className="fit-note"><Icon name="check" size={18} /> One size — nothing to measure.</p>}
            {kind === 'unstitched' && (
              <ChoiceGroup legend="How would you like it?" name={`st-${i.id}`} value={i.custom.fit === 'unstitched' ? 'unstitched' : 'tailored'} columns={2}
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
                  <div className="fit-profiles">
                    {mine.map((m) => <button key={m.id} className={cx('chip', i.custom.profileId === m.id && 'chip-on')} aria-pressed={i.custom.profileId === m.id} onClick={() => update(i.id, { profileId: m.id })}>{m.name}</button>)}
                    <button className="link-thread fit-new" onClick={() => setSheetFor(i)}><Icon name="plus" size={16} /> Another set</button>
                  </div>
                )}
                {i.custom.fit === 'standard' && (
                  <div className="sizes" role="radiogroup" aria-label={`Size for ${p.name}`}>
                    {SIZES.map((s) => <button key={s} role="radio" aria-checked={i.custom.size === s} className={cx('size', i.custom.size === s && 'is-on')} onClick={() => update(i.id, { size: s })}>{s}</button>)}
                  </div>
                )}
              </>
            )}
            {problem && <p className="custom-err" role="alert">{problem}</p>}
          </article>
        )
      })}
      <Sheet open={!!sheetFor} onClose={() => setSheetFor(null)} title="Your measurements" wide>
        {sheetFor && (
          <MeasureGuide kind={fitKindFor(getProduct(sheetFor.slug)!) === 'men' ? 'men' : 'women'} compact onSaved={(pr: MeasureProfile) => {
            update(sheetFor.id, { fit: 'profile', profileId: pr.id }); setSheetFor(null)
            toast({ message: `Measurements for “${pr.name}” saved.`, tone: 'success' })
          }} />
        )}
      </Sheet>
    </div>
  )
}

function validateContact(c: Contact) {
  const e: Partial<Record<keyof Contact, string>> = {}
  if (c.name.trim().length < 2) e.name = 'Who are we making this for?'
  if (!/^\+?[\d\s-]{8,18}$/.test(c.phone.trim())) e.phone = 'Include the country code — e.g. +91 98793 90731 — so the studio can reach you on WhatsApp.'
  if (c.email && !/^\S+@\S+\.\S+$/.test(c.email)) e.email = 'That address doesn’t look complete.'
  if (!c.city.trim()) e.city = 'Which city should it travel to?'
  if (c.address.trim().length < 6) e.address = 'We’ll need the full address to send it home.'
  if (!c.postcode.trim()) e.postcode = 'A postcode or PIN, please.'
  if (c.eventDate && new Date(c.eventDate) < new Date(new Date().toDateString())) e.eventDate = 'That date has already passed.'
  return e
}

function DeliveryStep({ c, setC, errors }: { c: Contact; setC: (c: Contact) => void; errors: Partial<Record<keyof Contact, string>> }) {
  const f = (k: keyof Contact) => ({ value: c[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setC({ ...c, [k]: e.target.value }), error: errors[k] ?? null })
  return (
    <div className="co-form">
      <fieldset>
        <legend className="co-legend">Who it’s for</legend>
        <Input label="Full name" autoComplete="name" required {...f('name')} />
        <Input label="WhatsApp number" type="tel" inputMode="tel" autoComplete="tel" required hint="The studio confirms everything here." {...f('phone')} />
        <Input label="Email" type="email" autoComplete="email" optional {...f('email')} />
      </fieldset>
      <fieldset>
        <legend className="co-legend">Where it’s going</legend>
        <Select label="Country" autoComplete="country-name" {...f('country')}>{COUNTRIES.map((x) => <option key={x}>{x}</option>)}</Select>
        <div className="co-row">
          <Input label="City" autoComplete="address-level2" required {...f('city')} />
          <Input label="Postcode / PIN" autoComplete="postal-code" required {...f('postcode')} />
        </div>
        <Textarea label="Address" autoComplete="street-address" required {...f('address')} />
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
      <section className="co-rev-block">
        <header><h3 className="h3">Pieces &amp; fit</h3><button className="link-thread" onClick={() => go(0)}>Edit</button></header>
        <ul role="list">
          {items.map((i) => {
            const p = getProduct(i.slug)!
            const prof = profiles.find((x) => x.id === i.custom.profileId)
            return (
              <li key={i.id} className="co-rev-item">
                <span className="co-fit-img" aria-hidden="true"><Img folder="p" name={p.image.file} alt="" sizes="56px" ratio={1} focus={p.image.focus} /></span>
                <div>
                  <p><strong>{p.name}</strong> × {i.qty}</p>
                  <p className="small muted">{describeCustom(p, i.custom).join(' · ')}</p>
                  {prof && <p className="small muted num">{Object.entries(prof.values).map(([k, v]) => `${k} ${prof.unit === 'in' ? Math.round((v / 2.54) * 4) / 4 : v}${prof.unit}`).join(' · ')}</p>}
                  {i.custom.notes && <p className="small">“{i.custom.notes}”</p>}
                </div>
                <span className="num">{formatINR(p.price.inr * i.qty)}</span>
              </li>
            )
          })}
        </ul>
      </section>
      <section className="co-rev-block">
        <header><h3 className="h3">Delivery</h3><button className="link-thread" onClick={() => go(2)}>Edit</button></header>
        <p>{c.name} · {c.phone}{c.email && ` · ${c.email}`}</p>
        <p className="muted">{c.address}, {c.city} {c.postcode}, {c.country}</p>
        {(c.occasion || c.eventDate) && <p className="muted">{c.occasion}{c.occasion && c.eventDate && ' · '}{c.eventDate && new Date(c.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
      </section>
      <section className="co-rev-block co-how">
        <h3 className="h3">What happens when you reserve</h3>
        <ol role="list">
          <li><span className="num">01</span> Your pieces are held and a reference is created — <strong>no payment is taken</strong>.</li>
          <li><span className="num">02</span> You send the brief to Archana on WhatsApp in one tap.</li>
          <li><span className="num">03</span> She confirms the final quote, deposit and timeline with you — then the cutting begins.</li>
        </ol>
        <p className="small muted">Payment: {ACTIVE_PROVIDER.label.toLowerCase()}.</p>
      </section>
      <label className={cx('co-agree', tried && !agreed && 'has-error')}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span className="fbox" aria-hidden="true"><Icon name="check" size={12} /></span>
        <span>I understand this reserves my pieces without payment, and that the final price, deposit and timeline are confirmed with the studio on WhatsApp.</span>
      </label>
      {tried && !agreed && <p className="custom-err" role="alert">Tick the box above so we both know how this works.</p>}
    </div>
  )
}

export default function Checkout() {
  const items = useBag((s) => s.items)
  const clear = useBag((s) => s.clear)
  const add = useOrders((s) => s.add)
  const profiles = useMeasurements((s) => s.profiles)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const step = Math.min(3, Math.max(0, Number(params.get('step') ?? 0)))
  const [contact, setContact] = useSessionState<Contact>('aarchis-checkout-contact', EMPTY)
  const [agreed, setAgreed] = useState(false)
  const [tried, setTried] = useState<Record<number, boolean>>({})
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>>>({})
  const [busy, setBusy] = useState(false)
  const head = useRef<HTMLHeadingElement>(null)

  useEffect(() => { head.current?.focus({ preventScroll: true }) }, [step])
  const go = (i: number) => { setParams(i ? { step: String(i) } : {}); scrollToTop(false) }

  const hydrated = useUi((s) => s.hydrated)
  if (!hydrated) return <PageLoader />
  if (!items.length && !busy) {
    return (
      <div className="wrap co-page">
        <Seo title="Reserve & confirm" description="Reserve your made-to-measure pieces." noindex />
        <EmptyState as="h1" kind="bag" title="Your bag is waiting for its first piece." actions={<Button to="/shop">Browse the collections</Button>}>
          Fold a piece into your bag, then come back here to reserve it.
        </EmptyState>
      </div>
    )
  }

  const next = () => {
    setTried({ ...tried, [step]: true })
    if (step === 1 && items.some(fitProblem)) { document.querySelector('.co-fit-item.has-error, .custom-err')?.scrollIntoView({ block: 'center', behavior: 'smooth' }); return }
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
      }, 900)
      return
    }
    go(step + 1)
  }

  return (
    <div className="co-page">
      <Seo title="Reserve & confirm" description="Reserve your made-to-measure pieces with Aarchi's by Archana Soni." noindex />
      <div className="co-top">
        <div className="wrap"><Knots step={step} onJump={go} /></div>
      </div>
      <div className="wrap co-grid">
        <section className="co-main" aria-labelledby="co-title">
          <p className="eyebrow">Step {step + 1} of {STEPS.length}</p>
          <h1 id="co-title" ref={head} tabIndex={-1} className="h2 co-title">
            {['Confirm your pieces', 'How should it fit?', 'Where is it going?', 'One last look'][step]}
          </h1>
          <details className="co-mobile-summary lg:hidden">
            <summary><span>Summary</span><span className="num">{formatINR(bagTotal(items))}</span><Icon name="chevron" size={16} /></summary>
            <Summary compact />
          </details>
          {step === 0 && <PiecesStep />}
          {step === 1 && <FitStep tried={!!tried[1]} />}
          {step === 2 && <DeliveryStep c={contact} setC={setContact} errors={tried[2] ? errors : {}} />}
          {step === 3 && <ReviewStep c={contact} agreed={agreed} setAgreed={setAgreed} tried={!!tried[3]} go={go} />}
          <div className="co-actions">
            {step > 0 ? <Button variant="ghost" icon="arrowL" onClick={() => go(step - 1)}>Back</Button> : <Button variant="ghost" icon="arrowL" to="/bag">Bag</Button>}
            <Button size="lg" onClick={next} busy={busy} iconRight={step < 3 ? 'arrow' : undefined}>
              {step < 3 ? `Continue to ${STEPS[step + 1].toLowerCase()}` : 'Reserve & confirm'}
            </Button>
          </div>
        </section>
        <div className="co-side hidden lg:block"><Summary /></div>
      </div>
    </div>
  )
}
