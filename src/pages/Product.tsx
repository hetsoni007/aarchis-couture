import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Seo, breadcrumbLd, ORG_LD } from '../lib/seo'
import { CRAFT_GLOSSARY, FABRIC_PREFS, images, STUDIO_PALETTE, categoryUrl, fitKindFor, getCategory, getProduct, related, stripEmoji, type Product as P } from '../lib/catalog'
import { SITE_URL } from '../lib/config'
import { cx, formatINR } from '../lib/format'
import { useReveals } from '../lib/reveal'
import { productEnquiry } from '../lib/whatsapp'
import { useBag, type Customisation, type FitMode } from '../store/bag'
import { useMeasurements, type MeasureProfile } from '../store/measurements'
import { useUi } from '../store/ui'
import { Gallery, framesOf } from '../components/product/Gallery'
import { ProductCard, WishButton } from '../components/product/ProductCard'
import { MeasureGuide } from '../components/product/MeasureGuide'
import { defaultCustom, colourName } from '../components/product/customLabels'
import { flyToBag } from '../components/layout/Interactions'
import { Button } from '../components/ui/Button'
import { ChoiceGroup, Textarea } from '../components/ui/Field'
import { Crumbs, Price, Sheet, Chip } from '../components/ui/Kit'
import { Img } from '../components/ui/Img'
import { Icon } from '../components/ui/Icon'
import { ZariRule } from '../components/brand/Motifs'
import NotFound from './NotFound'
import './pdp.css'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

function CopyBlock({ p }: { p: P }) {
  const c = p.copy
  if (c.displaySource === 'live-detail') return <p className="lead pdp-desc">{c.display}</p>
  if (c.displaySource === 'image-text') return (
    <div className="pdp-desc-wrap">
      <p className="lead pdp-desc">{c.display}</p>
      <p className="pdp-attrib small">— from the studio’s presentation card for this piece</p>
    </div>
  )
  if (c.displaySource === 'instagram-caption') return (
    <figure className="pdp-caption">
      <blockquote className="italic-voice">“{stripEmoji(c.display!)}”</blockquote>
      <figcaption className="small muted">
        From the studio’s Instagram{p.instagram && <> · <a href={p.instagram.url} target="_blank" rel="noopener noreferrer" className="prose-link">see the original post</a></>}
      </figcaption>
    </figure>
  )
  return <p className="pdp-desc-none muted">The studio hasn’t written this piece up yet — ask a stylist about its fabric and hand-work, or see it first on <a href={p.instagram?.url ?? 'https://www.instagram.com/aarchis.byarchanasoni/'} target="_blank" rel="noopener noreferrer" className="prose-link">Instagram</a>.</p>
}

function Facts({ p }: { p: P }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <dl className="pdp-facts">
      <div><dt>Occasion</dt><dd>{p.occasions.join(' · ')}</dd></div>
      <div><dt>Style</dt><dd>{p.styles.join(' · ')}</dd></div>
      <div><dt>Crafting</dt><dd>{p.copy.crafting}</dd></div>
      <div><dt>Fabric</dt><dd>{p.fabric ? p.fabric.name : 'Chosen with Archana at your consultation'}</dd></div>
      {p.crafts.length > 0 && (
        <div className="pdp-crafts">
          <dt>Hand-work</dt>
          <dd>
            <ul role="list">
              {p.crafts.map((c) => (
                <li key={c}>
                  <button className={cx('craft-chip', open === c && 'is-on')} aria-expanded={open === c} onClick={() => setOpen(open === c ? null : c)}>
                    {c}<Icon name="info" size={14} />
                  </button>
                </li>
              ))}
            </ul>
            {open && <p className="craft-def small" role="note"><strong>{open}</strong> — {CRAFT_GLOSSARY[open]}</p>}
          </dd>
        </div>
      )}
      <div><dt>In the photograph</dt><dd>{p.derived.families.join(', ')}</dd></div>
    </dl>
  )
}

function Customiser({ p }: { p: P }) {
  const kind = fitKindFor(p)
  const [c, setC] = useState<Customisation>(() => defaultCustom(p))
  const [tailor, setTailor] = useState(false) // dress material: unstitched vs tailored
  const [sheet, setSheet] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const all = useMeasurements((s) => s.profiles)
  const measureKind = kind === 'men' ? 'men' : 'women'
  const profiles = all.filter((x) => x.kind === measureKind)
  const add = useBag((s) => s.add)
  const toast = useUi((s) => s.toast)
  const setBag = useUi((s) => s.setBag)
  useEffect(() => { setC(defaultCustom(p)); setTailor(false); setErr(null) }, [p])

  const fabrics = FABRIC_PREFS[p.category]
  const needsBody = kind === 'women' || kind === 'men' || (kind === 'unstitched' && tailor)

  const setFit = (fit: FitMode) => {
    setErr(null)
    if (fit === 'profile' && !profiles.length) { setSheet(true); return }
    setC((x) => ({ ...x, fit, size: fit === 'standard' ? x.size : undefined, profileId: fit === 'profile' ? x.profileId ?? profiles[0]?.id : undefined }))
  }

  const submit = () => {
    if (c.fit === 'standard' && !c.size) { setErr('Choose a size — or let Archana measure you on video.'); return }
    if (c.fit === 'profile' && !c.profileId) { setSheet(true); return }
    add(p.slug, c)
    flyToBag(document.querySelector('.gframe-main'))
    toast({ message: `${p.name} — folded into your bag.`, tone: 'success', action: { label: 'View bag', run: () => setBag(true) } })
  }

  return (
    <div className="custom">
      <fieldset className="swatches">
        <legend className="choice-legend">Colour <span className="swatch-name">— {colourName(c.colour)}</span></legend>
        <div className="swatch-row">
          {STUDIO_PALETTE.map((s) => (
            <label key={s.id} className={cx('swatch', c.colour === s.id && 'is-on')} title={s.name}>
              <input type="radio" name="colour" value={s.id} checked={c.colour === s.id} onChange={() => setC({ ...c, colour: s.id })} />
              {s.id === 'as-photographed'
                ? <span className="swatch-chip is-photo"><Img folder="p" name={p.image.file} alt="" sizes="44px" ratio={1} focus={p.image.focus} /></span>
                : <span className="swatch-chip" style={{ backgroundColor: s.hex }} />}
              <span className="sr-only">{s.name}</span>
            </label>
          ))}
        </div>
        <p className="small muted">Any design can be re-coloured — this sets the starting point for your consultation.</p>
      </fieldset>

      {fabrics.length > 1 && (
        <ChoiceGroup legend="Fabric preference" name="fabric" value={c.fabric} onChange={(v) => setC({ ...c, fabric: v })}
          options={fabrics.map((f) => ({ value: f, label: f === 'As photographed' && p.fabric ? `As photographed · ${p.fabric.name}` : f }))} />
      )}

      {kind === 'none' && (
        <div className="fit-note"><Icon name="check" size={18} /> One size — a dupatta drapes as it is. Nothing to measure.</div>
      )}
      {kind === 'unstitched' && (
        <ChoiceGroup legend="How would you like it?" name="stitch" value={tailor ? 'tailored' : 'unstitched'} columns={2}
          onChange={(v) => { const t = v === 'tailored'; setTailor(t); setC({ ...c, fit: t ? 'video' : 'unstitched', size: undefined, profileId: undefined }) }}
          options={[
            { value: 'unstitched', label: 'Unstitched', hint: 'The suit piece and matching dupatta, as they are' },
            { value: 'tailored', label: 'Tailor it for me', hint: 'Stitched to your measurements at the studio' },
          ]} />
      )}
      {needsBody && (
        <div className="fit">
          <ChoiceGroup legend="Fit" name="fit" value={c.fit} onChange={setFit}
            options={[
              { value: 'video', label: 'Measure with Archana', hint: 'A guided WhatsApp video call after you reserve — the studio’s own way' },
              { value: 'profile', label: profiles.length ? 'My saved measurements' : 'Enter my measurements', hint: profiles.length ? profiles.map((x) => x.name).join(', ') : 'With the visual guide — saved on this device' },
              { value: 'standard', label: 'Standard size', hint: 'XS–XXL, refined at your fitting review' },
            ]} />
          {c.fit === 'profile' && profiles.length > 0 && (
            <div className="fit-profiles">
              {profiles.map((pr) => (
                <button key={pr.id} className={cx('chip', c.profileId === pr.id && 'chip-on')} aria-pressed={c.profileId === pr.id} onClick={() => setC({ ...c, profileId: pr.id })}>{pr.name}</button>
              ))}
              <button className="link-thread fit-new" onClick={() => setSheet(true)}><Icon name="plus" size={16} /> Another set</button>
            </div>
          )}
          {c.fit === 'standard' && (
            <div className="sizes" role="radiogroup" aria-label="Size">
              {SIZES.map((s) => (
                <button key={s} role="radio" aria-checked={c.size === s} className={cx('size', c.size === s && 'is-on')} onClick={() => { setErr(null); setC({ ...c, size: s }) }}>{s}</button>
              ))}
            </div>
          )}
          <button className="fit-guide link-thread" onClick={() => setSheet(true)}><Icon name="ruler" size={16} /> Open the measurement guide</button>
        </div>
      )}

      <Textarea label="Anything to change?" optional value={c.notes ?? ''} onChange={(e) => setC({ ...c, notes: e.target.value })}
        placeholder="Sleeve length, neckline, a different border, your event date…" maxLength={400} />

      {err && <p className="custom-err" role="alert">{err}</p>}
      <div className="custom-actions" id="add-anchor">
        <Button size="lg" block onClick={submit} cursor="Add">Add to your bag · {formatINR(p.price.inr)}</Button>
        <div className="custom-secondary">
          <WishButton p={p} withLabel />
          <Button href={productEnquiry(p, {
            Colour: colourName(c.colour), Fabric: c.fabric !== 'As photographed' ? c.fabric : undefined, Notes: c.notes || undefined,
          })} variant="ghost" icon="whatsapp">Ask a stylist</Button>
        </div>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Your measurements" wide>
        <MeasureGuide kind={measureKind} compact onSaved={(pr: MeasureProfile) => {
          setC((x) => ({ ...x, fit: 'profile', profileId: pr.id })); setSheet(false)
          toast({ message: `Measurements for “${pr.name}” saved.`, tone: 'success' })
        }} />
      </Sheet>
    </div>
  )
}

function StickyBar({ p, anchorId }: { p: P; anchorId: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = document.getElementById(anchorId)
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [anchorId, p.slug])
  useEffect(() => {
    const lift = show && innerWidth < 1024 ? '76px' : '0px'
    document.documentElement.style.setProperty('--fab-lift', lift)
    document.documentElement.style.setProperty('--toast-lift', lift)
    return () => { document.documentElement.style.setProperty('--fab-lift', '0px'); document.documentElement.style.setProperty('--toast-lift', '0px') }
  }, [show])
  return (
    <div className={cx('pdp-sticky lg:hidden', show && 'is-on')} aria-hidden={!show} inert={!show}>
      <div className="pdp-sticky-info">
        <span className="pdp-sticky-name">{p.name}</span>
        <Price inr={p.price.inr} indicative={p.price.placeholder} />
      </div>
      <Button size="sm" onClick={() => document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>Add to bag</Button>
    </div>
  )
}

export default function Product() {
  const { slug } = useParams()
  const p = getProduct(slug)
  const root = useRef<HTMLDivElement>(null)
  useReveals(root, [slug])
  const rel = useMemo(() => (p ? related(p, 4) : []), [p])
  if (!p) return <NotFound />

  const cat = getCategory(p.category)
  const frames = framesOf(p)
  const studioNote = p.copy.studioDescription?.split(/(?<=\.)\s+/).filter((s) => !/^Enquire/i.test(s)).join(' ')
  const ld = [
    ORG_LD,
    breadcrumbLd([{ name: 'Collections', path: '/shop/' }, { name: cat.label, path: categoryUrl(cat) + '/' }, { name: p.name }]),
    {
      '@context': 'https://schema.org', '@type': 'Product', name: p.name, category: p.categoryLabel,
      image: frames.map((f) => `${SITE_URL}/img/${f.folder}/${f.file}-${f.folder === 'p' ? 640 : 560}.webp`),
      description: p.copy.display && p.copy.displaySource !== 'instagram-caption' ? p.copy.display : p.copy.metaDescription,
      brand: { '@type': 'Brand', name: "Aarchi's by Archana Soni" },
      // placeholder prices are never published to search engines
      ...(p.price.placeholder ? {} : { offers: { '@type': 'Offer', price: p.price.inr, priceCurrency: 'INR', availability: 'https://schema.org/MadeToOrder', url: `${SITE_URL}/catalogue/${p.slug}/` } }),
    },
  ]

  return (
    <div ref={root} className="pdp" key={p.slug}>
      <Seo title={`${p.name} — made-to-measure ${p.categoryLabel.toLowerCase()}`} description={p.copy.metaDescription} image={`/img/p/${p.image.file}-${images['p/' + p.image.file].widths.at(-1)}.webp`} jsonLd={ld} />

      <section className="wrap pdp-top">
        <div className="pdp-media"><Gallery p={p} /></div>
        <div className="pdp-info">
          <Crumbs trail={[{ name: 'Collections', to: '/shop' }, { name: cat.label, to: categoryUrl(cat) }, { name: p.name }]} />
          <div className="pdp-head">
            <p className="eyebrow">{p.categoryLabel}{p.isNew && <span className="pdp-new">New arrival</span>}</p>
            <h1 className="h1 pdp-name">{p.name}</h1>
            <Price inr={p.price.inr} indicative={p.price.placeholder} className="pdp-price" />
            {p.price.placeholder && <p className="pdp-price-note small muted">An indicative starting price. Archana confirms your final quote — shaped by fabric, hand-work and your changes — before any work begins.</p>}
          </div>
          <CopyBlock p={p} />
          <div className="pdp-chips">
            {p.occasions.map((o) => <Chip key={o} tone="soft">{o}</Chip>)}
          </div>
          <ZariRule className="pdp-rule" />
          <Customiser p={p} />
          <ul role="list" className="assure">
            <li><Icon name="pin" size={18} /> Made to measure in Ahmedabad</li>
            <li><Icon name="check" size={18} /> No payment today — your quote, timeline and deposit are confirmed on WhatsApp first</li>
            <li><Icon name="video" size={18} /> Progress photos and a fitting review before it ships</li>
            <li><Icon name="globe" size={18} /><span>Shipped across India and worldwide — <Link to="/nri-brides" className="prose-link">ordering from abroad</Link></span></li>
          </ul>
        </div>
      </section>

      <section className="section pdp-details warp-lines" aria-labelledby="details-title">
        <div className="wrap pdp-details-grid">
          <header>
            <p className="eyebrow" data-reveal>The details</p>
            <h2 id="details-title" className="h2" data-reveal>What we know about this piece</h2>
          </header>
          <div data-reveal>
            <Facts p={p} />
            {studioNote && <p className="pdp-studio-note"><span className="eyebrow plain">The studio’s note</span>{studioNote}</p>}
          </div>
        </div>
      </section>

      {p.story && (
        <section id="story" className="section night pdp-story" aria-labelledby="story-title">
          <div className="wrap">
            <header className="pdp-story-head">
              <p className="eyebrow" data-reveal>The Story</p>
              <h2 id="story-title" className="h1" data-reveal>{p.story.title}</h2>
              <p className="lead measure-lead" data-reveal>{p.story.lead}</p>
            </header>
            <div className="pdp-slides">
              {p.story.slides.map((s, i) => (
                <figure key={s.file} className={cx('pdp-slide', `is-${i % 4}`)} data-reveal="mask">
                  <Img folder="e" name={s.file} alt={s.alt} sizes="(min-width: 64rem) 30vw, 80vw" ratio={9 / 16} />
                  {(s.kicker || s.caption) && (
                    <figcaption>
                      {s.kicker && <span className="eyebrow plain">{s.kicker}</span>}
                      {s.caption && <p>{s.caption}</p>}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {p.crafts.filter((c) => CRAFT_GLOSSARY[c]).length > 0 && (
        <section className="section pdp-craft" aria-labelledby="craft-title">
          <div className="wrap pdp-craft-grid">
            <header>
              <p className="eyebrow" data-reveal>Craft notes</p>
              <h2 id="craft-title" className="h2" data-reveal>The hand-work, <em className="v">explained</em></h2>
            </header>
            <dl className="craft-list">
              {p.crafts.filter((c) => CRAFT_GLOSSARY[c]).map((c) => (
                <div key={c} data-reveal><dt className="h3">{c}</dt><dd className="muted">{CRAFT_GLOSSARY[c]}</dd></div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {rel.length > 0 && (
        <section className="section paper-2 pdp-related" aria-labelledby="rel-title">
          <div className="wrap">
            <header className="pdp-rel-head">
              <div>
                <p className="eyebrow" data-reveal>{p.crossSell.length ? 'Complete the look' : 'You may also like'}</p>
                <h2 id="rel-title" className="h2" data-reveal>{p.crossSell.length ? 'Pieces that belong together' : `More from ${cat.label}`}</h2>
              </div>
              <Button to={categoryUrl(cat)} variant="ghost" iconRight="arrow">All {cat.label}</Button>
            </header>
            <ul role="list" className="pgrid is-dense">
              {rel.map((r) => <li key={r.slug}><ProductCard p={r} sizes="(min-width: 90rem) 22vw, (min-width: 64rem) 30vw, (min-width: 37.5rem) 46vw, 92vw" /></li>)}
            </ul>
          </div>
        </section>
      )}

      <StickyBar p={p} anchorId="add-anchor" />
    </div>
  )
}
