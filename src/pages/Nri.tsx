import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Seo, faqLd, breadcrumbLd } from '../lib/seo'
import { content, inCategory } from '../lib/catalog'
import { useReveals } from '../lib/reveal'
import { askStylist } from '../lib/whatsapp'
import { PageHero, Steps, FaqBlock } from '../components/brand/PageBits'
import { ProductGrid } from '../components/product/ProductCard'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import NotFound from './NotFound'
import './content.css'

/** A zari thread leaving Ahmedabad for the five places the studio ships most — an original map-less route line. */
function Route({ highlight }: { highlight?: 'usa' | 'uk' }) {
  const dest = [
    { id: 'usa', label: 'USA', x: 60, y: 70 }, { id: 'uk', label: 'UK', x: 150, y: 40 }, { id: 'ca', label: 'Canada', x: 90, y: 30 },
    { id: 'ae', label: 'UAE', x: 250, y: 96 }, { id: 'au', label: 'Australia', x: 360, y: 160 },
  ]
  const home = { x: 290, y: 110 }
  return (
    <svg viewBox="0 0 400 200" className="route" aria-hidden="true">
      {dest.map((d) => {
        const mx = (d.x + home.x) / 2, my = Math.min(d.y, home.y) - 50
        const on = highlight ? d.id === highlight : true
        return (
          <g key={d.id} className={on ? 'is-on' : ''}>
            <path d={`M${home.x} ${home.y} Q${mx} ${my} ${d.x} ${d.y}`} className="route-line" />
            <rect x={d.x - 3} y={d.y - 3} width="6" height="6" transform={`rotate(45 ${d.x} ${d.y})`} className="route-dot" />
            <text x={d.x} y={d.y + 16} textAnchor="middle" className="route-label">{d.label}</text>
          </g>
        )
      })}
      <circle cx={home.x} cy={home.y} r="5" className="route-home" />
      <text x={home.x} y={home.y + 20} textAnchor="middle" className="route-label is-home">Ahmedabad</text>
    </svg>
  )
}

export default function Nri() {
  const { country } = useParams()
  const root = useRef<HTMLDivElement>(null)
  useReveals(root, [country])
  const n = content.nri
  const c = country === 'usa' || country === 'uk' ? n.countries[country] : undefined
  if (country && !c) return <NotFound />
  const bridal = inCategory('bridal').slice(0, 6)

  if (c) {
    return (
      <div ref={root} key={country}>
        <Seo title={`Custom bridal lehengas from India to ${c.name}`} description={c.metaDescription}
          jsonLd={[faqLd(c.faq), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'NRI Brides', path: '/nri-brides/' }, { name: country!.toUpperCase() }])]} />
        <PageHero night eyebrow={c.eyebrow} title={<>From Ahmedabad <em className="v">to {c.name}</em></>} lead={c.lead}
          crumbs={[{ name: 'Home', to: '/' }, { name: 'NRI brides', to: '/nri-brides' }, { name: country!.toUpperCase() }]}
          aside={<Route highlight={country as 'usa' | 'uk'} />}>
          <Button href={askStylist(`a bridal outfit delivered to ${c.name}`)} variant="night" icon="whatsapp">Get a quote on WhatsApp</Button>
          <Button to="/how-it-works" variant="ghost">How it works</Button>
        </PageHero>
        <section className="section" aria-labelledby="practical-title">
          <div className="wrap practical">
            <header>
              <p className="eyebrow" data-reveal>Ordering from {c.name}</p>
              <h2 id="practical-title" className="h2" data-reveal>The practical details</h2>
            </header>
            <dl className="practical-list">
              {n.countries.practical.map((f) => <div key={f.label} data-reveal><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
            </dl>
          </div>
        </section>
        <section className="section paper-2" aria-labelledby="picks-title">
          <div className="wrap">
            <header className="pdp-rel-head">
              <h2 id="picks-title" className="h2" data-reveal>Bridal pieces brides abroad start from</h2>
              <Button to="/shop/bridal-lehengas" variant="ghost" iconRight="arrow">View the full catalogue</Button>
            </header>
            <ProductGrid items={bridal} />
          </div>
        </section>
        <FaqBlock title={`Questions from ${c.name === 'the USA' ? 'the USA' : 'the UK'}`} items={c.faq} />
        <section className="section night cta-band" aria-label="Start">
          <div className="wrap cta-band-in">
            <Button href={askStylist(`a bridal outfit delivered to ${c.name}`)} variant="night" size="lg" icon="whatsapp">Get a quote on WhatsApp</Button>
            <Link to="/nri-brides" className="prose-link">All NRI info</Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div ref={root}>
      <Seo title="Custom Indian bridal outfits for NRI brides — made in India, delivered worldwide" description={n.metaDescription}
        jsonLd={[faqLd(n.faq), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'NRI Brides' }])]} />
      <PageHero night eyebrow={n.eyebrow} title={<>Made in India, <em className="v">delivered worldwide</em></>} lead={n.lead}
        crumbs={[{ name: 'Home', to: '/' }, { name: 'NRI brides' }]} aside={<Route />}>
        <Button href={askStylist('a bridal outfit delivered abroad')} variant="night" icon="whatsapp">Get a quote on WhatsApp</Button>
        <Button to="/how-it-works" variant="ghost">How it works</Button>
      </PageHero>
      <section className="section" aria-labelledby="remote-title">
        <div className="wrap nri-steps">
          <header>
            <p className="eyebrow" data-reveal>{n.processEyebrow}</p>
            <h2 id="remote-title" className="h1" data-reveal>{n.processTitle}</h2>
            <dl className="practical-list is-compact">
              {n.facts.map((f) => <div key={f.label} data-reveal><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
            </dl>
          </header>
          <Steps />
        </div>
      </section>
      <section className="section paper-2" aria-labelledby="country-title">
        <div className="wrap">
          <p className="eyebrow" data-reveal>Your country</p>
          <h2 id="country-title" className="h1" data-reveal>Ordering from…</h2>
          <ul role="list" className="countries">
            <li data-reveal><Link to="/nri-brides/usa" className="country"><span className="h2">United States</span><Icon name="arrow" /></Link></li>
            <li data-reveal><Link to="/nri-brides/uk" className="country"><span className="h2">United Kingdom</span><Icon name="arrow" /></Link></li>
            <li data-reveal><a href={askStylist('ordering from Canada, Australia or the UAE')} target="_blank" rel="noopener noreferrer" className="country"><span className="h2">{n.otherCountries}</span><Icon name="whatsapp" /></a></li>
          </ul>
        </div>
      </section>
      <FaqBlock title="NRI orders, answered" items={n.faq} />
      <section className="section night cta-band" aria-label="Start">
        <div className="wrap cta-band-in">
          <Button href={askStylist('a bridal outfit delivered abroad')} variant="night" size="lg" icon="whatsapp">Get a quote on WhatsApp</Button>
          <Button to="/shop" variant="ghost">Browse designs</Button>
        </div>
      </section>
    </div>
  )
}
