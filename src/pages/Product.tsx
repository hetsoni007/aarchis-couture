import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Seo, breadcrumbLd, ORG_LD } from '../lib/seo'
import { CRAFT_GLOSSARY, FABRIC_PREFS, STUDIO_PALETTE, categoryUrl, content, fitKindFor, getCategory, getProduct, images, related, stripEmoji, type Product as P } from '../lib/catalog'
import { SITE_URL } from '../lib/config'
import { cx } from '../lib/format'
import { useReveals } from '../lib/reveal'
import { productEnquiry } from '../lib/whatsapp'
import type { Customisation } from '../store/bag'
import { useMeasurements, type MeasureProfile } from '../store/measurements'
import { useRecent } from '../store/recent'
import { useUi } from '../store/ui'
import { Gallery, framesOf } from '../components/product/Gallery'
import { WishButton, useAddToBag } from '../components/product/ProductCard'
import { ProductRail, RecentlyViewed } from '../components/product/Rails'
import { MeasureGuide } from '../components/product/MeasureGuide'
import { FitWays, SizeGuideDrawer } from '../components/product/SizeGuide'
import { colourName, defaultCustom } from '../components/product/customLabels'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Field'
import { Accordion, Crumbs, Drawer, Price } from '../components/ui/Kit'
import { Img } from '../components/ui/Img'
import { Icon } from '../components/ui/Icon'
import NotFound from './NotFound'
import './pdp.css'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const studioNoteOf = (p: P) => p.copy.studioDescription?.split(/(?<=\.)\s+/).filter((s) => !/^Enquire/i.test(s)).join(' ') || null
/** The buy box already carries the studio's own product copy; this holds everything else, or nothing. */
const hasDescription = (p: P) => !!studioNoteOf(p) || p.copy.displaySource === 'instagram-caption' || p.copy.displaySource === 'none' || p.copy.displaySource === 'image-text'

function Description({ p }: { p: P }) {
  const c = p.copy
  const studioNote = studioNoteOf(p)
  return (
    <div className="pdp-desc">
      {c.displaySource === 'image-text' && <p className="t-small t-muted">The description above is from the studio’s presentation card for this piece.</p>}
      {c.displaySource === 'instagram-caption' && (
        <figure className="pdp-quote">
          <blockquote>“{stripEmoji(c.display!)}”</blockquote>
          <figcaption className="t-small t-muted">
            The studio, on Instagram{p.instagram && <> · <a href={p.instagram.url} target="_blank" rel="noopener noreferrer" className="link">see the original post</a></>}
          </figcaption>
        </figure>
      )}
      {c.displaySource === 'none' && (
        <p className="t-muted">The studio hasn’t written this piece up yet. Ask a stylist about its fabric and hand-work, or see it on <a href={p.instagram?.url ?? content.contact.social.instagram.url} target="_blank" rel="noopener noreferrer" className="link">Instagram</a>.</p>
      )}
      {studioNote && <p>{studioNote}</p>}
    </div>
  )
}

function Details({ p }: { p: P }) {
  return (
    <dl className="pdp-dl">
      <div><dt>Occasion</dt><dd>{p.occasions.join(', ')}</dd></div>
      <div><dt>Style</dt><dd>{p.styles.join(', ')}</dd></div>
      <div><dt>Crafting</dt><dd>{p.copy.crafting}</dd></div>
      <div><dt>Fabric</dt><dd>{p.fabric ? p.fabric.name : 'Chosen with Archana at your consultation'}</dd></div>
      {p.crafts.length > 0 && <div><dt>Hand-work</dt><dd>{p.crafts.join(', ')}</dd></div>}
      <div><dt>Colours in the photograph</dt><dd>{p.derived.families.join(', ')}</dd></div>
    </dl>
  )
}

/* ═══════════════ Buy box ═══════════════ */
function BuyBox({ p, c, setC, onAdd }: { p: P; c: Customisation; setC: (fn: (c: Customisation) => Customisation) => void; onAdd: () => void }) {
  const kind = fitKindFor(p)
  const measureKind = kind === 'men' ? 'men' : 'women'
  const profiles = useMeasurements((s) => s.profiles).filter((x) => x.kind === measureKind)
  const toast = useUi((s) => s.toast)
  const [guide, setGuide] = useState(false)
  const [measure, setMeasure] = useState(false)
  const fabrics = FABRIC_PREFS[p.category]
  const tailored = kind === 'unstitched' && c.fit !== 'unstitched'
  const needsBody = kind === 'women' || kind === 'men' || tailored
  const sizeValue = c.fit === 'standard' ? c.size : c.fit === 'profile' ? `p:${c.profileId}` : 'mtm'
  const pick = (v: string) => setC((x) => (
    v === 'mtm' ? { ...x, fit: 'video', size: undefined, profileId: undefined }
    : v.startsWith('p:') ? { ...x, fit: 'profile', profileId: v.slice(2), size: undefined }
    : { ...x, fit: 'standard', size: v, profileId: undefined }
  ))
  const copy = p.copy.displaySource === 'live-detail' || p.copy.displaySource === 'image-text' ? p.copy.display : null
  const sizeHint = c.fit === 'standard' ? 'Standard sizes are a starting point, refined at your fitting review before the piece ships.'
    : c.fit === 'profile' ? 'Your saved measurements go with the brief. Archana checks them before cutting.'
    : 'After you reserve, Archana takes your measurements with you on a guided WhatsApp video call.'

  return (
    <div className="bb">
      <div className="bb-head">
        <p className="bb-cat t-label">{p.categoryLabel}{p.isNew && <span className="badge is-dark">New</span>}</p>
        <h1 className="bb-name">{p.name}</h1>
        <Price inr={p.price.inr} className="bb-price" />
        {p.price.placeholder && <p className="t-small t-muted">Indicative starting price. Archana confirms your final quote, shaped by fabric, hand-work and your changes, before any work begins.</p>}
        {copy && <p className="bb-copy">{copy}</p>}
      </div>

      <fieldset className="bb-field">
        <legend className="bb-legend">Colour: <span>{colourName(c.colour)}</span></legend>
        <div className="bb-swatches">
          {STUDIO_PALETTE.map((s) => (
            <label key={s.id} className={cx('bb-sw', c.colour === s.id && 'is-on')} title={s.name}>
              <input type="radio" name="colour" value={s.id} checked={c.colour === s.id} onChange={() => setC((x) => ({ ...x, colour: s.id }))} />
              {s.id === 'as-photographed'
                ? <span className="bb-sw-chip is-photo"><Img folder="p" name={p.image.file} alt="" sizes="44px" ratio={1} focus={p.image.focus} /></span>
                : <span className="bb-sw-chip" style={{ backgroundColor: s.hex }} />}
              <span className="sr-only">{s.name}</span>
            </label>
          ))}
        </div>
        <p className="bb-hint">Any design can be re-coloured. This sets the starting point for your consultation.</p>
      </fieldset>

      {fabrics.length > 1 && (
        <fieldset className="bb-field">
          <legend className="bb-legend">Fabric: <span>{c.fabric === 'As photographed' && p.fabric ? `As photographed (${p.fabric.name})` : c.fabric}</span></legend>
          <div className="bb-opts">
            {fabrics.map((f) => (
              <label key={f} className={cx('bb-opt', c.fabric === f && 'is-on')}>
                <input type="radio" name="fabric" value={f} checked={c.fabric === f} onChange={() => setC((x) => ({ ...x, fabric: f }))} />
                {f}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {kind === 'none' && <p className="bb-legend bb-onesize">Size: <span>One size, nothing to measure</span></p>}

      {kind === 'unstitched' && (
        <fieldset className="bb-field">
          <legend className="bb-legend">Stitching: <span>{tailored ? 'Tailored to my measurements' : 'Unstitched'}</span></legend>
          <div className="bb-opts is-2">
            {([['unstitched', 'Unstitched'], ['tailored', 'Tailor it for me']] as const).map(([v, label]) => {
              const on = v === 'tailored' ? tailored : !tailored
              return (
                <label key={v} className={cx('bb-opt', on && 'is-on')}>
                  <input type="radio" name="stitch" checked={on} onChange={() => setC((x) => ({ ...x, fit: v === 'tailored' ? 'video' : 'unstitched', size: undefined, profileId: undefined }))} />
                  {label}
                </label>
              )
            })}
          </div>
          <p className="bb-hint">{tailored ? 'Stitched to your measurements at the studio.' : 'The suit piece and matching dupatta, as they are.'}</p>
        </fieldset>
      )}

      {needsBody && (
        <fieldset className="bb-field">
          <div className="bb-legend-row">
            <legend className="bb-legend">Size: <span>{c.fit === 'standard' ? c.size : c.fit === 'profile' ? profiles.find((x) => x.id === c.profileId)?.name ?? 'Saved measurements' : 'Made to measure'}</span></legend>
            <button type="button" className="bb-guide" onClick={() => setGuide(true)}><Icon name="ruler" size={16} /> Size guide</button>
          </div>
          <div className="bb-sizes" role="radiogroup" aria-label="Size">
            <label className={cx('bb-size is-mtm', sizeValue === 'mtm' && 'is-on')}>
              <input type="radio" name="size" checked={sizeValue === 'mtm'} onChange={() => pick('mtm')} />
              <Icon name="scissors" size={15} /> Made to measure
            </label>
            {SIZES.map((s) => (
              <label key={s} className={cx('bb-size', sizeValue === s && 'is-on')}>
                <input type="radio" name="size" checked={sizeValue === s} onChange={() => pick(s)} />{s}
              </label>
            ))}
            {profiles.map((pr) => (
              <label key={pr.id} className={cx('bb-size is-prof', sizeValue === `p:${pr.id}` && 'is-on')}>
                <input type="radio" name="size" checked={sizeValue === `p:${pr.id}`} onChange={() => pick(`p:${pr.id}`)} />
                <Icon name="ruler" size={15} /> {pr.name}
              </label>
            ))}
          </div>
          <p className="bb-hint">{sizeHint}</p>
          <button type="button" className="bb-measure link" onClick={() => setMeasure(true)}>{profiles.length ? 'Add another set of measurements' : 'Enter my own measurements'}</button>
        </fieldset>
      )}

      <details className="bb-notes" open={!!c.notes || undefined}>
        <summary><Icon name="edit" size={16} /> Add a note for Archana <span className="t-muted">(optional)</span></summary>
        <Textarea label="Changes for this piece" value={c.notes ?? ''} onChange={(e) => { const v = e.target.value; setC((x) => ({ ...x, notes: v })) }}
          placeholder="Sleeve length, neckline, a different border, your event date…" maxLength={400} />
      </details>

      <div className="bb-actions" id="add-anchor">
        <Button size="lg" block onClick={onAdd}>Add to bag</Button>
        <WishButton p={p} className="bb-wish" />
      </div>
      <Button href={productEnquiry(p, { Colour: colourName(c.colour), Fabric: c.fabric !== 'As photographed' ? c.fabric : undefined, Notes: c.notes || undefined })}
        variant="secondary" block icon="whatsapp">Ask a stylist on WhatsApp</Button>

      <ul role="list" className="bb-service">
        <li><Icon name="scissors" size={18} /><span>Made to measure in Ahmedabad</span></li>
        <li><Icon name="shield" size={18} /><span>Reserve now. Nothing is charged until your quote is confirmed</span></li>
        <li><Icon name="video" size={18} /><span>Progress photos and a fitting review before it ships</span></li>
        <li><Icon name="truck" size={18} /><span>Shipped across India and worldwide · <Link to="/nri-brides" className="link">ordering from abroad</Link></span></li>
      </ul>

      <SizeGuideDrawer open={guide} onClose={() => setGuide(false)} initialKind={measureKind} />
      <Drawer open={measure} onClose={() => setMeasure(false)} title="Your measurements" size="lg">
        <MeasureGuide kind={measureKind} compact onSaved={(pr: MeasureProfile) => {
          setC((x) => ({ ...x, fit: 'profile', profileId: pr.id, size: undefined }))
          setMeasure(false)
          toast({ message: `Measurements for “${pr.name}” saved.`, tone: 'success' })
        }} />
      </Drawer>
    </div>
  )
}

function StickyBar({ p, onAdd }: { p: P; onAdd: () => void }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = document.getElementById('add-anchor')
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [p.slug])
  useEffect(() => {
    const lift = show && innerWidth < 1024 ? '72px' : '0px'
    document.documentElement.style.setProperty('--fab-lift', lift)
    document.documentElement.style.setProperty('--toast-lift', lift)
    return () => { document.documentElement.style.setProperty('--fab-lift', '0px'); document.documentElement.style.setProperty('--toast-lift', '0px') }
  }, [show])
  return (
    <div className={cx('pdp-sticky', show && 'is-on')} aria-hidden={!show} inert={!show}>
      <Img folder="p" name={p.image.file} alt="" sizes="48px" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} className="pdp-sticky-img" />
      <div className="pdp-sticky-info">
        <span className="pdp-sticky-name">{p.name}</span>
        <Price inr={p.price.inr} className="t-small" />
      </div>
      <Button size="md" onClick={onAdd}>Add to bag</Button>
    </div>
  )
}

export default function Product() {
  const { slug } = useParams()
  const p = getProduct(slug)
  const root = useRef<HTMLDivElement>(null)
  useReveals(root, [slug])
  const rel = useMemo(() => (p ? related(p, 8) : []), [p])
  const [c, setCustom] = useState<Customisation>(() => (p ? defaultCustom(p) : ({} as Customisation)))
  const addToBag = useAddToBag()
  const hydrated = useUi((s) => s.hydrated)
  const push = useRecent((s) => s.push)
  useEffect(() => { if (p) setCustom(defaultCustom(p)) }, [p])
  useEffect(() => { if (p && hydrated) push(p.slug) }, [p, hydrated, push])
  if (!p) return <NotFound />

  const setC = (fn: (c: Customisation) => Customisation) => setCustom(fn)
  const onAdd = () => addToBag(p, c)
  const cat = getCategory(p.category)
  const frames = framesOf(p)
  const glossary = p.crafts.filter((k) => CRAFT_GLOSSARY[k])
  const practical = content.nri.countries.practical
  const ld = [
    ORG_LD,
    breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop/' }, { name: cat.label, path: categoryUrl(cat) + '/' }, { name: p.name }]),
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
      <Seo title={`${p.name} — made-to-measure ${p.categoryLabel.toLowerCase()}`} description={p.copy.metaDescription}
        image={`/img/p/${p.image.file}-${images['p/' + p.image.file].widths.at(-1)}.webp`} jsonLd={ld} />

      <div className="container">
        <Crumbs className="pdp-crumbs" trail={[{ name: 'Home', to: '/' }, { name: cat.label, to: categoryUrl(cat) }, { name: p.name }]} />
        <div className="pdp-top">
          <div className="pdp-media"><Gallery p={p} /></div>
          <div className="pdp-info">
            <BuyBox p={p} c={c} setC={setC} onAdd={onAdd} />
            <Accordion className="pdp-acc" group="pdp" openFirst items={[
              ...(hasDescription(p) ? [{ id: 'desc', q: 'Description', a: <Description p={p} /> }] : []),
              { id: 'details', q: 'Details', a: <Details p={p} /> },
              ...(glossary.length ? [{ id: 'craft', q: 'The hand-work, explained', a: (
                <dl className="pdp-dl is-stack">{glossary.map((k) => <div key={k}><dt>{k}</dt><dd>{CRAFT_GLOSSARY[k]}</dd></div>)}</dl>
              ) }] : []),
              { id: 'fit', q: 'Size & fit', a: <><FitWays className="is-compact" /><p><Link to="/size-guide" className="link">Read the full size &amp; fit guide</Link></p></> },
              { id: 'delivery', q: 'Delivery & payment', a: (
                <><dl className="pdp-dl">{practical.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value.charAt(0).toUpperCase() + f.value.slice(1)}.</dd></div>)}</dl>
                <p><Link to="/how-it-works" className="link">How made-to-measure works</Link> · <Link to="/nri-brides" className="link">Ordering from abroad</Link></p></>
              ) },
            ]} />
          </div>
        </div>
      </div>

      {p.story && (
        <section id="story" className="section bg-ivory pdp-story" aria-labelledby="story-title">
          <div className="container">
            <header className="sec-head is-center">
              <div>
                <p className="t-label">The story</p>
                <h2 id="story-title" className="t-h1">{p.story.title}</h2>
                <p className="t-lead measure">{p.story.lead}</p>
              </div>
            </header>
            <ul role="list" className="pdp-slides rail">
              {p.story.slides.map((s) => (
                <li key={s.file} data-reveal>
                  <figure className="pdp-slide">
                    <Img folder="e" name={s.file} alt={s.alt} sizes="(min-width: 64rem) 24vw, 72vw" ratio={9 / 16} />
                    {(s.kicker || s.caption) && (
                      <figcaption>
                        {s.kicker && <span className="t-label">{s.kicker}</span>}
                        {s.caption && <p className="t-small t-muted">{s.caption}</p>}
                      </figcaption>
                    )}
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ProductRail items={rel} id="related" label={p.crossSell.length ? 'Complete the look' : undefined}
        title={p.crossSell.length ? 'Pieces that belong together' : 'You may also like'}
        action={<Link to={categoryUrl(cat)} className="link-u t-small pdp-all">All {cat.label.toLowerCase()} <Icon name="arrow" size={14} /></Link>} />
      <RecentlyViewed exclude={p.slug} />
      <StickyBar p={p} onAdd={onAdd} />
    </div>
  )
}
