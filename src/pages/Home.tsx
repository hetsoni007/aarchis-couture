import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Seo, ORG_LD, faqLd } from '../lib/seo'
import { SITE_URL } from '../lib/config'
import { categories, categoryUrl, content, getProduct, productUrl, products, storyProducts } from '../lib/catalog'
import { COVER, OCCASION_COVER, occasionsByImportance } from '../lib/nav'
import { useReveals } from '../lib/reveal'
import { askStylist } from '../lib/whatsapp'
import { ProductCard } from '../components/product/ProductCard'
import { ProductRail, RailArrows, RecentlyViewed, useRail } from '../components/product/Rails'
import { FaqSection, ImageTile, Steps } from '../components/brand/Blocks'
import { Testimonials } from '../components/brand/Testimonials'
import { Button } from '../components/ui/Button'
import { Img } from '../components/ui/Img'
import { Icon } from '../components/ui/Icon'
import './home.css'

const h = content.home
const BRIDAL_PICKS = ['scarlet-royal-bridal-lehenga', 'contemporary-pastel-bride', 'scarlet-sonnet-lehenga', 'blush-pastel-bridal-lehenga']
/** The on-figure frame that leads each campaign card. */
const slideAlt = (file: string) => storyProducts.flatMap((p) => p.story!.slides).find((s) => s.file === file)?.alt ?? ''
/** The on-figure frame that leads each campaign card (never one with baked-in headline text). */
const STORY_COVER: Record<string, { folder: 'e' | 's'; file: string }> = {
  'blush-pastel-bridal-lehenga': { folder: 'e', file: 'blush-look' }, 'scarlet-royal-bridal-lehenga': { folder: 's', file: 'story-lehenga' },
  'contemporary-pastel-bride': { folder: 'e', file: 'pastel-look' }, 'ivory-elegance-saree': { folder: 'e', file: 'elegance-portrait' },
  'sunset-bandhani-ombre-dupatta': { folder: 'e', file: 'sunset-look' }, 'scarlet-grace-anarkali': { folder: 'e', file: 'grace-courtyard' },
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true">
        <Img folder="e" name="pastel-palace" alt="" sizes="34vw" ratio={9 / 16} className="hero-side" focus="50% 30%" />
        <Img folder="e" name="blush-courtyard" alt="" sizes="(min-width: 48rem) 34vw, 100vw" ratio={9 / 16} className="hero-main" focus="50% 30%" priority />
        <Img folder="e" name="grace-jharokha" alt="" sizes="34vw" ratio={9 / 16} className="hero-side" focus="50% 30%" />
      </div>
      <div className="hero-copy">
        <div className="container hero-in">
          <p className="t-label">{h.hero.eyebrow}</p>
          <h1 id="hero-title" className="t-hero">{h.hero.title}</h1>
          <p className="hero-lead">{h.hero.lead}</p>
          <div className="hero-actions">
            <Button to="/shop/bridal-lehengas" variant="light" size="lg">Shop bridal</Button>
            <Button to="/shop" variant="outline-light" size="lg">Explore the collection</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function CategoryStrip() {
  return (
    <section className="section-sm" aria-labelledby="cats-title">
      <div className="container">
        <header className="sec-head">
          <div><h2 id="cats-title" className="t-h2">Shop by category</h2></div>
          <Link to="/shop" className="link-u t-small home-all">View all <Icon name="arrow" size={14} /></Link>
        </header>
        <ul role="list" className="cats rail">
          {categories.map((c) => {
            const p = getProduct(COVER[c.key])!
            return (
              <li key={c.key}>
                <Link to={categoryUrl(c)} className="cat">
                  <Img folder="p" name={p.image.file} alt="" sizes="(min-width: 80rem) 13vw, (min-width: 48rem) 22vw, 38vw" ratio={3 / 4} fit={p.image.fit} focus={p.image.focus} />
                  <span className="cat-name">{c.label}</span>
                  <span className="cat-count t-small t-muted">{c.count} {c.count === 1 ? 'piece' : 'pieces'}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function BridalFeature() {
  const c = categories.find((x) => x.key === 'bridal')!
  const items = BRIDAL_PICKS.map((s) => getProduct(s)!).filter(Boolean)
  return (
    <section className="section feature" aria-labelledby="bridal-title">
      <div className="container feature-grid">
        <Link to={categoryUrl(c)} className="feature-media" data-reveal aria-label={`Shop ${c.label}`}>
          <Img folder="e" name="blush-bench" alt={slideAlt('blush-bench')} sizes="(min-width: 64rem) 44vw, 100vw" ratio={4 / 5} focus="50% 45%" />
        </Link>
        <div className="feature-body">
          <header className="feature-head" data-reveal>
            <p className="t-label">The bridal atelier</p>
            <h2 id="bridal-title" className="t-h1">{c.label}</h2>
            <p className="t-lead">{c.intro}</p>
            <Button to={categoryUrl(c)} variant="secondary">Shop all {c.count} lehengas</Button>
          </header>
          <ul role="list" className="feature-products">
            {items.map((p) => <li key={p.slug} data-reveal><ProductCard p={p} sizes="(min-width: 64rem) 22vw, 46vw" /></li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Occasions() {
  const occ = occasionsByImportance()
  return (
    <section className="section bg-ivory" aria-labelledby="occ-title">
      <div className="container">
        <header className="sec-head is-center">
          <div>
            <p className="t-label">{h.edit.eyebrow}</p>
            <h2 id="occ-title" className="t-h2">{h.edit.title}</h2>
            <p className="t-muted measure">{h.edit.lead}</p>
          </div>
        </header>
        <ul role="list" className="occ rail">
          {occ.map((o) => {
            const p = getProduct(OCCASION_COVER[o.value])!
            return (
              <li key={o.value} data-reveal>
                <Link to={`/shop?occ=${encodeURIComponent(o.value)}`} className="occ-tile">
                  <Img folder="p" name={p.image.file} alt="" sizes="(min-width: 64rem) 22vw, 44vw" ratio={4 / 5} fit={p.image.fit} focus={p.image.focus} />
                  <span className="occ-copy"><span className="occ-t">{o.value}</span><span className="t-small">{o.count} {o.count === 1 ? 'piece' : 'pieces'}</span></span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function Stories() {
  const { ref, edge, update, move } = useRail<HTMLUListElement>()
  return (
    <section className="section on-dark stories" aria-labelledby="stories-title">
      <div className="container">
        <header className="sec-head">
          <div>
            <p className="t-label">{h.campaign.eyebrow}</p>
            <h2 id="stories-title" className="t-h1">{h.campaign.title}</h2>
            <p className="t-muted measure">{h.campaign.lead}</p>
          </div>
          <RailArrows edge={edge} move={move} />
        </header>
        <ul ref={ref} role="list" className="stories-list rail" onScroll={update}>
          {storyProducts.map((p) => {
            const s = p.story!
            const cover = STORY_COVER[p.slug] ?? { folder: 'e' as const, file: s.slides[0].file }
            const alt = s.slides.find((x) => x.file === cover.file)?.alt ?? `${p.name}, photographed for the Aarchi’s campaign`
            return (
              <li key={p.slug}>
                <Link to={`${productUrl(p)}#story`} className="story">
                  <Img folder={cover.folder} name={cover.file} alt={alt} sizes="(min-width: 64rem) 24vw, 70vw" ratio={9 / 16} focus="50% 30%" />
                  <span className="story-copy">
                    <span className="t-label">{p.categoryLabel}</span>
                    <span className="story-t">{s.title}</span>
                    <span className="story-cta">Discover the {p.name} <Icon name="arrow" size={14} /></span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function Edits() {
  return (
    <section className="section-sm" aria-label="More to explore">
      <div className="container edits">
        <ImageTile to="/shop/sarees" folder="s" file="sarees" alt="A handcrafted saree by Aarchi’s by Archana Soni" label="Handcrafted" title="Sarees" cta="Shop sarees" sizes="(min-width: 48rem) 50vw, 100vw" />
        <ImageTile to="/navratri-outfits-ahmedabad" folder="s" file="ethnic-festive" alt="Festive ethnic wear by Aarchi’s by Archana Soni" label="Festive & Navratri" title="Made to twirl" cta="Shop the Navratri edit" sizes="(min-width: 48rem) 50vw, 100vw" />
      </div>
    </section>
  )
}

function MadeToMeasure() {
  const hw = content.howItWorks
  return (
    <section className="section bg-ivory" aria-labelledby="mtm-title">
      <div className="container mtm">
        <header className="mtm-head" data-reveal>
          <p className="t-label">{hw.eyebrow}</p>
          <h2 id="mtm-title" className="t-h1">{hw.title}</h2>
          <p className="t-lead">{hw.lead}</p>
          <div className="mtm-actions">
            <Button to="/how-it-works" variant="primary">How it works</Button>
            <Button to="/size-guide" variant="ghost">Size &amp; fit guide</Button>
          </div>
        </header>
        <Steps />
      </div>
    </section>
  )
}

function Atelier() {
  return (
    <section className="section" aria-labelledby="atelier-title">
      <div className="container atelier">
        <div className="atelier-media" data-reveal>
          <Img folder="s" name="founder-portrait" alt={content.about.portraitAlt} sizes="(min-width: 64rem) 44vw, 100vw" ratio={843 / 648} focus="50% 30%" />
        </div>
        <div className="atelier-body" data-reveal>
          <p className="t-label">{h.studio.eyebrow}</p>
          <h2 id="atelier-title" className="t-h1">{h.studio.title}</h2>
          {h.studio.paragraphs.map((t) => <p key={t} className="t-lead">{t}</p>)}
          <div className="atelier-actions">
            <Button to="/about" variant="secondary">Meet Archana Soni</Button>
            <Button href={askStylist('a consultation')} variant="ghost" icon="whatsapp">Book a consultation</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Instagram() {
  const ig = content.contact.social.instagram
  return (
    <section className="section-sm" aria-labelledby="ig-title">
      <div className="container">
        <header className="sec-head">
          <div><p className="t-label">{h.instagram.eyebrow}</p><h2 id="ig-title" className="t-h2">{h.instagram.title}</h2></div>
          <a href={ig.url} target="_blank" rel="noopener noreferrer" className="link-u t-small home-all"><Icon name="instagram" size={16} /> {ig.handle}</a>
        </header>
        <ul role="list" className="ig">
          {h.instagram.items.map((it) => (
            <li key={it.file}>
              <a href={ig.url} target="_blank" rel="noopener noreferrer" className="ig-tile">
                <Img folder={it.folder === 'editorial' ? 'e' : it.folder === 'site' ? 's' : 'p'} name={it.file} alt={it.alt} sizes="(min-width: 64rem) 16vw, 33vw" ratio={1} focus="50% 30%" />
                <span className="ig-ov" aria-hidden="true"><Icon name="instagram" size={22} /></span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function Home() {
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)
  const newIn = products.filter((p) => p.isNew)
  const faq = h.faq.items
  return (
    <div ref={root}>
      <Seo
        title="Aarchi's by Archana Soni — Bridal & festive couture, made to measure"
        description={h.hero.lead}
        jsonLd={[ORG_LD, { '@context': 'https://schema.org', '@type': 'WebSite', name: "Aarchi's by Archana Soni", url: SITE_URL + '/', potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }, faqLd(faq)]}
      />
      <Hero />
      <CategoryStrip />
      <ProductRail items={newIn} label="Just in" title="New arrivals" id="new" action={<Link to="/shop?new=1" className="link-u t-small home-all">Shop new <Icon name="arrow" size={14} /></Link>} />
      <BridalFeature />
      <Occasions />
      <Edits />
      <Stories />
      <MadeToMeasure />
      <Atelier />
      <Testimonials />
      <Instagram />
      <FaqSection label={h.faq.eyebrow} title={h.faq.title} items={faq} />
      <section className="section-sm home-local-sec" aria-labelledby="local-title">
        <div className="container home-local">
          <p className="t-label t-muted">{h.localSeo.eyebrow}</p>
          <h2 id="local-title" className="t-h3">{h.localSeo.title}</h2>
          <div className="home-local-cols">{h.localSeo.paragraphs.map((t) => <p key={t} className="t-small t-muted">{t}</p>)}</div>
        </div>
      </section>
      <RecentlyViewed />
    </div>
  )
}
