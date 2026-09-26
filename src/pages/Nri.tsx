import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Seo, faqLd, breadcrumbLd } from '../lib/seo'
import { content, inCategory } from '../lib/catalog'
import { useReveals } from '../lib/reveal'
import { askStylist } from '../lib/whatsapp'
import { CtaBand, FaqSection, PageHeader, Steps } from '../components/brand/Blocks'
import { ProductRail } from '../components/product/Rails'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import NotFound from './NotFound'
import './content.css'

function Practical({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="facts">
      {items.map((f) => (
        <div key={f.label} className="fact" data-reveal>
          <dt className="t-label t-muted">{f.label}</dt>
          <dd>{f.value.charAt(0).toUpperCase() + f.value.slice(1)}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function Nri() {
  const { country } = useParams()
  const root = useRef<HTMLDivElement>(null)
  useReveals(root, [country])
  const n = content.nri
  const c = country === 'usa' || country === 'uk' ? n.countries[country] : undefined
  if (country && !c) return <NotFound />
  const bridal = inCategory('bridal').slice(0, 10)
  const all = <Link to="/shop/bridal-lehengas" className="link-u t-small nri-all">All bridal lehengas <Icon name="arrow" size={14} /></Link>

  if (c) {
    return (
      <div ref={root} key={country}>
        <Seo title={`Custom bridal lehengas from India to ${c.name}`} description={c.metaDescription}
          jsonLd={[faqLd(c.faq), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'NRI Brides', path: '/nri-brides/' }, { name: country!.toUpperCase() }])]} />
        <PageHeader label={c.eyebrow} title={c.title} lead={c.lead}
          crumbs={[{ name: 'Home', to: '/' }, { name: 'Ordering from abroad', to: '/nri-brides' }, { name: country!.toUpperCase() }]}
          image={{ folder: 'e', file: country === 'usa' ? 'pastel-palace' : 'scarlet-palace', alt: '', focus: '50% 30%', ratio: 4 / 5 }}
          actions={<><Button href={askStylist(`a bridal outfit delivered to ${c.name}`)} icon="whatsapp">Get a quote on WhatsApp</Button><Button to="/how-it-works" variant="secondary">How it works</Button></>} />
        <section className="section" aria-labelledby="practical-title">
          <div className="container">
            <header className="sec-head"><div><p className="t-label t-muted">Ordering from {c.name}</p><h2 id="practical-title" className="t-h2">The practical details</h2></div></header>
            <Practical items={n.countries.practical} />
          </div>
        </section>
        <ProductRail items={bridal} id="picks" title="Bridal pieces to start from" action={all} className="bg-ivory" />
        <FaqSection title={`Questions from ${c.name}`} items={c.faq} />
        <CtaBand context={`a bridal outfit delivered to ${c.name}`} />
      </div>
    )
  }

  return (
    <div ref={root}>
      <Seo title="Custom Indian bridal outfits for NRI brides — made in India, delivered worldwide" description={n.metaDescription}
        jsonLd={[faqLd(n.faq), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'NRI Brides' }])]} />
      <PageHeader label={n.eyebrow} title={n.title} lead={n.lead} crumbs={[{ name: 'Home', to: '/' }, { name: 'Ordering from abroad' }]}
        image={{ folder: 'e', file: 'blush-bench', alt: '', focus: '50% 35%', ratio: 4 / 5 }}
        actions={<><Button href={askStylist('a bridal outfit delivered abroad')} icon="whatsapp">Get a quote on WhatsApp</Button><Button to="/how-it-works" variant="secondary">How it works</Button></>}>
        <Practical items={n.facts} />
      </PageHeader>

      <section className="section" aria-labelledby="country-title">
        <div className="container">
          <header className="sec-head"><div><p className="t-label t-muted">Your country</p><h2 id="country-title" className="t-h2">Ordering from…</h2></div></header>
          <ul role="list" className="countries">
            <li data-reveal><Link to="/nri-brides/usa" className="country"><span className="t-h3">The United States</span><Icon name="arrow" size={20} /></Link></li>
            <li data-reveal><Link to="/nri-brides/uk" className="country"><span className="t-h3">The United Kingdom</span><Icon name="arrow" size={20} /></Link></li>
            <li data-reveal><a href={askStylist('ordering from Canada, Australia or the UAE')} target="_blank" rel="noopener noreferrer" className="country"><span className="t-h3">{n.otherCountries}</span><Icon name="whatsapp" size={20} /></a></li>
          </ul>
        </div>
      </section>

      <section className="section bg-ivory" aria-labelledby="remote-title">
        <div className="container">
          <header className="sec-head"><div><p className="t-label t-muted">{n.processEyebrow}</p><h2 id="remote-title" className="t-h2">{n.processTitle}</h2></div></header>
          <Steps />
        </div>
      </section>
      <ProductRail items={bridal} id="picks" title="Bridal pieces to start from" action={all} />
      <FaqSection title="NRI orders, answered" items={n.faq} className="bg-ivory" />
      <CtaBand context="a bridal outfit delivered abroad" />
    </div>
  )
}
