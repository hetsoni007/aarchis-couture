import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo, ORG_LD, faqLd } from '../lib/seo'
import { content, categories, categoryUrl, getProduct, products, storyProducts, productUrl, inCategory } from '../lib/catalog'
import { useDevice, useIdleReady } from '../lib/device'
import { useReveals } from '../lib/reveal'
import { askStylist } from '../lib/whatsapp'
import { Button } from '../components/ui/Button'
import { Img } from '../components/ui/Img'
import { Accordion, Price } from '../components/ui/Kit'
import { Icon } from '../components/ui/Icon'
import { ProductCard } from '../components/product/ProductCard'
import { ZariRule, BandhaniField } from '../components/brand/Motifs'
import { HeroPoster } from '../components/brand/HeroPoster'
import { Testimonials } from '../components/brand/Testimonials'
import { SITE_URL } from '../lib/config'
import './content.css'
import './home.css'

const LoomHero = lazy(() => import('../components/three/LoomHero'))

/** campaign covers — the frames the live home page leads each story with (Scarlet Royal's carries baked-in
 *  campaign text, so its clean product portrait stands in) */
const STORY_COVER: Record<string, string> = {
  'blush-pastel-bridal-lehenga': 'blush-courtyard',
  'contemporary-pastel-bride': 'pastel-palace', 'ivory-elegance-saree': 'elegance-portrait',
  'scarlet-grace-anarkali': 'grace-jharokha', 'sunset-bandhani-ombre-dupatta': 'sunset-look',
}
const CAT_COVER: Record<string, string> = {
  bridal: 'blush-pastel-bridal-lehenga', saree: 'ivory-elegance-saree', dupatta: 'gharchola-heritage-dupatta',
  dressmaterial: 'noir-vine-embroidered-silk-suit', ethnic: 'sangeet-special-anarkali', mens: 'coral-turquoise-men-s-ensemble',
  babyshower: 'motherhood-baby-shower-ensemble',
}

function Hero() {
  const device = useDevice()
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [ready, setReady] = useState(false)
  const idle = useIdleReady()
  const draws3D = device.tier !== 'none'
  const rig = draws3D && device.finePointer && device.tier !== 'low' && !device.reducedMotion
  const h = content.home.hero

  useEffect(() => {
    if (!rig) return
    const el = section.current!
    let ctx: { revert(): void } | undefined
    let dead = false
    import('../lib/motion').then(({ gsap }) => {
      if (dead) return
      ctx = gsap.context(() => {
      // desktop: pin the loom; scroll drapes the cloth and hands over to the second line
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el, start: 'top top', end: '+=110%', pin: true, scrub: 0.6, anticipatePin: 1,
          onUpdate: (s) => { progress.current = s.progress },
        },
      })
      tl.to('.hero-copy', { yPercent: -14, opacity: 0, ease: 'power2.in', duration: 0.3 }, 0.02)
        .to('.hero-cue', { opacity: 0, duration: 0.15 }, 0)
        .fromTo('.hero-second', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3 }, 0.5)
        .to('.hero-second', { opacity: 0, y: -30, duration: 0.2 }, 0.9)
      }, el)
    })
    return () => { dead = true; ctx?.revert() }
  }, [rig])

  return (
    <section ref={section} className="hero night" aria-labelledby="hero-title" data-nav-night>
      <div className="hero-stage">
        <HeroPoster className={ready ? 'is-hidden' : ''} />
        {draws3D && idle && (
          <Suspense fallback={null}>
            <LoomHero device={device} progress={progress} eventSource={section} onReady={() => setReady(true)} />
          </Suspense>
        )}
        <div className="hero-vignette" aria-hidden="true" />
      </div>
      <div className="hero-copy wrap">
        <p className="eyebrow hero-fade">{h.eyebrow}</p>
        <h1 id="hero-title" className="display hero-title">
          <span className="hero-line"><span>Where Tradition</span></span>
          <span className="hero-line"><span><em className="v">Meets</em> Trend</span></span>
        </h1>
        <p className="lead hero-lead hero-fade">{h.lead}</p>
        <div className="hero-ctas hero-fade">
          <Button to="/shop" size="lg" iconRight="arrow" cursor="Enter">Enter the collections</Button>
          <Button href={askStylist()} variant="ghost" icon="whatsapp" className="hero-ghost">Ask a stylist</Button>
        </div>
      </div>
      <div className="hero-second wrap" aria-hidden={!rig}>
        <p className="italic-voice">Every piece is made to measure <em>and designed around you.</em></p>
      </div>
      <div className="hero-cue hero-fade" aria-hidden="true">
        <span className="hero-cue-line" />
        <span>{rig ? 'Scroll — the cloth drapes' : 'Scroll'}</span>
      </div>
    </section>
  )
}

function Marquee() {
  const items = content.home.marquee
  const row = [...items, ...items]
  return (
    <div className="marquee">
      <p className="sr-only">{items.join(' · ')}</p>
      <div className="marquee-track" aria-hidden="true">
        {[0, 1].map((k) => (
          <div className="marquee-set" key={k}>
            {row.map((t, i) => (<span key={i} className="marquee-item">{t}<i className="marquee-knot" /></span>))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Stories() {
  const device = useDevice()
  const wrap = useRef<HTMLElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const c = content.home.campaign
  const pin = device.finePointer && !device.reducedMotion

  useEffect(() => {
    if (!pin) return
    let mm: { revert(): void } | undefined
    let dead = false
    import('../lib/motion').then(({ gsap }) => {
      if (dead) return
      const m = gsap.matchMedia()
      mm = m
      m.add('(min-width: 64rem)', () => {
      const r = rail.current!
      const dist = () => r.scrollWidth - window.innerWidth + 64
      gsap.to(r, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: wrap.current, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.7, invalidateOnRefresh: true },
      })
      })
    })
    return () => { dead = true; mm?.revert() }
  }, [pin])

  return (
    <section ref={wrap} className="stories" aria-labelledby="stories-title">
      <div className={`stories-head wrap ${pin ? 'lg:hidden' : ''}`}>
        <div>
          <p className="eyebrow" data-reveal>{c.eyebrow}</p>
          {pin ? <p className="h1" data-reveal>{c.title}</p> : <h2 id="stories-title" className="h1" data-reveal>{c.title}</h2>}
        </div>
        <p className="lead measure-lead" data-reveal>{c.lead}</p>
      </div>
      <div ref={rail} className={`stories-rail ${pin ? 'is-pinned' : 'rail'}`} data-cursor="Drag" tabIndex={0} role="region" aria-label="Signature stories — scroll sideways">
        {pin && (
          <div className="story-intro hidden lg:grid">
            <p className="eyebrow">{c.eyebrow}</p>
            <h2 id="stories-title" className="h1">{c.title}</h2>
            <p className="lead">{c.lead}</p>
            <span className="story-intro-cue"><Icon name="arrow" size={18} /> Scroll to turn the pages</span>
          </div>
        )}
        {storyProducts.map((p, i) => {
          const cover = STORY_COVER[p.slug] ? p.story!.slides.find((s) => s.file === STORY_COVER[p.slug])! : null
          return (
            <article key={p.slug} className="story">
              <Link to={`${productUrl(p)}#story`} className="story-media" aria-label={`${p.name} — view the story`} data-cursor="Read">
                {cover
                  ? <Img folder="e" name={cover.file} alt={cover.alt} sizes="(min-width: 64rem) 30vw, 78vw" ratio={9 / 16} />
                  : <Img folder="p" name={p.image.file} alt={p.image.alt} sizes="(min-width: 64rem) 30vw, 78vw" ratio={9 / 16} focus="50% 30%" />}
                <span className="story-no num">{String(i + 1).padStart(2, '0')} / {String(storyProducts.length).padStart(2, '0')}</span>
              </Link>
              <div className="story-body">
                <p className="eyebrow plain">{p.categoryLabel}</p>
                <h3 className="h3">{p.name}</h3>
                <p className="story-line"><em className="v">{p.story!.title}</em> — {p.copy.display ?? p.copy.detail}</p>
                <div className="story-foot">
                  <Price inr={p.price.inr} indicative={p.price.placeholder} />
                  <Link to={productUrl(p)} className="link-thread story-link">View &amp; customise</Link>
                </div>
              </div>
            </article>
          )
        })}
        <div className="story story-end">
          <p className="italic-voice">{products.length - storyProducts.length} more pieces, each cut to one person.</p>
          <Button to="/shop" variant="secondary" iconRight="arrow">See every piece</Button>
        </div>
      </div>
    </section>
  )
}

function CategoryArches() {
  const e = content.home.edit
  return (
    <section className="section cats warp-lines" aria-labelledby="cats-title">
      <div className="wrap">
        <header className="cats-head">
          <p className="eyebrow" data-reveal>{e.eyebrow}</p>
          <h2 id="cats-title" className="h1" data-reveal>{e.title}</h2>
          <p className="lead measure-lead" data-reveal>{e.lead}</p>
        </header>
        <ul role="list" className="cats-grid">
          {categories.map((c, i) => {
            const p = getProduct(CAT_COVER[c.key])!
            return (
              <li key={c.key} className={`cat cat-${i + 1}`} data-reveal>
                <Link to={categoryUrl(c)} className="cat-link" data-cursor="Enter">
                  <span className="cat-arch">
                    <Img folder="p" name={p.image.file} alt="" sizes="(min-width: 64rem) 24vw, (min-width: 48rem) 40vw, 80vw" ratio={3 / 4} focus={p.image.focus} fit="cover" />
                    <svg className="cat-arch-line" viewBox="0 0 100 133" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M1 132 V57 C1 37 20 25 33 16 C42 10 47.5 5 50 1 C52.5 5 58 10 67 16 C80 25 99 37 99 57 V132" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </span>
                  <span className="cat-meta">
                    <span className="cat-no num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="cat-name">{c.label}</span>
                    <span className="cat-count">{inCategory(c.key).length} {inCategory(c.key).length === 1 ? 'design' : 'designs'}</span>
                  </span>
                  <span className="cat-intro">{c.intro}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function NewArrivals() {
  const fresh = products.filter((p) => p.isNew)
  return (
    <section className="section paper-2 fresh" aria-labelledby="fresh-title">
      <div className="wrap">
        <header className="fresh-head">
          <div>
            <p className="eyebrow" data-reveal>New arrivals</p>
            <h2 id="fresh-title" className="h1" data-reveal>Fresh off the <em className="v">loom</em></h2>
          </div>
          <Button to="/shop?new=1" variant="ghost" iconRight="arrow">All {fresh.length} new pieces</Button>
        </header>
      </div>
      <div className="fresh-rail rail" tabIndex={0} role="region" aria-label="New arrivals — scroll sideways">
        {fresh.map((p) => (
          <div key={p.slug} className="fresh-item"><ProductCard p={p} sizes="(min-width: 64rem) 22vw, 70vw" /></div>
        ))}
      </div>
    </section>
  )
}

function Studio() {
  const s = content.home.studio
  return (
    <section className="section studio" aria-labelledby="studio-title">
      <div className="wrap studio-grid">
        <figure className="studio-portrait" data-reveal="mask">
          <Img folder="s" name="founder-portrait" alt="Archana Soni, founder of Aarchi's" sizes="(min-width: 64rem) 34vw, 86vw" ratio={4 / 5} focus="50% 30%" />
        </figure>
        <div className="studio-copy">
          <p className="eyebrow" data-reveal>{s.eyebrow}</p>
          <h2 id="studio-title" className="h1" data-reveal>{s.title}</h2>
          <ZariRule className="studio-rule" />
          {s.paragraphs.map((t, i) => <p key={i} className={i ? 'muted' : 'lead'} data-reveal>{t}</p>)}
          <div className="studio-ctas" data-reveal>
            <Button to="/about" variant="secondary" iconRight="arrow">Our story</Button>
            <Button to="/how-it-works" variant="ghost">How a piece is made</Button>
          </div>
        </div>
        <figure className="studio-detail" data-reveal="mask" aria-hidden="true">
          <Img folder="s" name="story-lehenga" alt="" sizes="(min-width: 64rem) 18vw, 40vw" ratio={1} />
        </figure>
      </div>
    </section>
  )
}

function Process() {
  const steps = content.howItWorks.steps
  return (
    <section className="section night process" aria-labelledby="process-title">
      <div className="wrap">
        <header className="process-head">
          <p className="eyebrow" data-reveal>{content.howItWorks.eyebrow}</p>
          <h2 id="process-title" className="h1" data-reveal>Made for you, <em className="v">step by step</em></h2>
        </header>
        <ol className="process-thread" role="list">
          {steps.map((s, i) => (
            <li key={s.title} className="process-step" data-reveal>
              <span className="process-knot" aria-hidden="true" />
              <span className="process-no num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="h3">{s.title}</h3>
              <p className="muted">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="process-cta"><Button to="/how-it-works" variant="night" iconRight="arrow">The full process</Button></div>
      </div>
    </section>
  )
}

function Faq() {
  const f = content.home.faq
  return (
    <section className="section faq" aria-labelledby="faq-title" id="faq">
      <div className="wrap faq-grid">
        <header>
          <p className="eyebrow" data-reveal>{f.eyebrow}</p>
          <h2 id="faq-title" className="h1" data-reveal>{f.title}</h2>
        </header>
        <Accordion items={f.items.map((i) => ({ q: i.q, a: i.a }))} />
      </div>
    </section>
  )
}

function Ahmedabad() {
  const l = content.home.localSeo
  return (
    <section className="section local paper-2" aria-labelledby="local-title">
      <BandhaniField className="local-dots" color="var(--sindoor)" opacity={0.1} />
      <div className="wrap local-grid">
        <p className="eyebrow" data-reveal>{l.eyebrow}</p>
        <h2 id="local-title" className="h2" data-reveal>{l.title}</h2>
        <div className="local-copy">
          {l.paragraphs.map((t, i) => <p key={i} data-reveal>{t}</p>)}
          <div className="local-ctas" data-reveal>
            <Button to="/navratri-outfits-ahmedabad" variant="secondary">Navratri outfits</Button>
            <Button href={askStylist('a studio visit in Ahmedabad')} variant="ghost" icon="whatsapp">Book a studio visit</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Instagram() {
  const ig = content.home.instagram
  return (
    <section className="section insta" aria-labelledby="insta-title">
      <div className="wrap">
        <header className="insta-head">
          <div>
            <p className="eyebrow" data-reveal>{ig.eyebrow}</p>
            <h2 id="insta-title" className="h1" data-reveal>{ig.title}</h2>
          </div>
          <Button href={content.contact.social.instagram.url} variant="ghost" icon="instagram">{content.contact.social.instagram.handle}</Button>
        </header>
        <ul role="list" className="insta-grid">
          {ig.items.map((it, i) => (
            <li key={i} className="insta-tile" data-reveal>
              <a href={content.contact.social.instagram.url} target="_blank" rel="noopener noreferrer" data-cursor="Follow">
                <Img folder="e" name={it.file} alt={it.alt} sizes="(min-width: 64rem) 16vw, 45vw" ratio={9 / 14} />
                <span className="insta-handle"><Icon name="instagram" size={14} /> {content.contact.social.instagram.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function FinalCta() {
  const f = content.home.finalCta
  return (
    <section className="section night final" aria-labelledby="final-title">
      <div className="wrap final-in">
        <p className="eyebrow" data-reveal>{f.eyebrow}</p>
        <h2 id="final-title" className="display final-title" data-reveal>{f.title}</h2>
        <p className="lead measure-lead" data-reveal>{f.text}</p>
        <div className="final-ctas" data-reveal>
          <Button href={askStylist('a made-to-measure piece')} variant="night" icon="whatsapp" size="lg">Get a quote on WhatsApp</Button>
          <Button to="/contact" variant="ghost">All ways to reach us</Button>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)
  return (
    <div ref={root} className="home">
      <Seo
        title="Aarchi's by Archana Soni — Made-to-measure bridal & festive couture, Ahmedabad"
        description={content.brand.schemaDescription}
        jsonLd={[ORG_LD, { '@context': 'https://schema.org', '@type': 'WebSite', name: content.brand.name, url: SITE_URL + '/' }, faqLd(content.home.faq.items)]}
      />
      <Hero />
      <Marquee />
      <Stories />
      <CategoryArches />
      <NewArrivals />
      <Studio />
      <Process />
      <Faq />
      <Ahmedabad />
      <Testimonials />
      <Instagram />
      <FinalCta />
    </div>
  )
}
