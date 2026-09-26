import { useRef } from 'react'
import { Seo, ORG_LD, breadcrumbLd } from '../lib/seo'
import { content } from '../lib/catalog'
import { useReveals } from '../lib/reveal'
import { askStylist } from '../lib/whatsapp'
import { CtaBand, ImageTile, PageHeader, Steps } from '../components/brand/Blocks'
import { Button } from '../components/ui/Button'
import './content.css'

export default function About() {
  const a = content.about
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)
  return (
    <div ref={root}>
      <Seo title="About Archana Soni — custom fashion designer, Ahmedabad" description={a.metaDescription}
        jsonLd={[ORG_LD, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'About' }]), { '@context': 'https://schema.org', '@type': 'Person', name: 'Archana Soni', jobTitle: 'Founder & designer', worksFor: { '@id': ORG_LD['@id'] }, address: { '@type': 'PostalAddress', addressLocality: 'Ahmedabad', addressCountry: 'IN' } }]} />
      <PageHeader label={a.eyebrow} title={a.title} crumbs={[{ name: 'Home', to: '/' }, { name: 'About' }]}
        image={{ folder: 's', file: 'founder-portrait', alt: a.portraitAlt, focus: '50% 30%', ratio: 843 / 648 }}
        lead={a.paragraphs[0]}
        actions={<><Button to="/contact">Book a consultation</Button><Button href={askStylist()} variant="secondary" icon="whatsapp">Message the studio</Button></>}>
        <p className="t-muted measure">{a.paragraphs[1]}</p>
        <p className="about-sign">Archana Soni</p>
      </PageHeader>

      <section className="section" aria-labelledby="svc-title">
        <div className="container">
          <header className="sec-head is-center"><div><p className="t-label t-muted">What we do</p><h2 id="svc-title" className="t-h1">Services</h2></div></header>
          <ol role="list" className="svc-cards">
            {a.services.map((s, i) => (
              <li key={s.title} className="svc-card" data-reveal>
                <span className="svc-no t-num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="t-h3">{s.title}</h3>
                <p className="t-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-sm" aria-label="From the studio">
        <div className="container about-tiles">
          <ImageTile to="/shop/bridal-lehengas" folder="s" file="bridal-lehengas" alt="Bridal lehenga by Aarchi’s by Archana Soni" label="Bridal & couture" title="Bridal lehengas" cta="Shop bridal" ratio={1} sizes="(min-width: 48rem) 33vw, 100vw" />
          <ImageTile to="/shop/sarees" folder="s" file="sarees" alt="Saree by Aarchi’s by Archana Soni" label="Sarees & ethnic wear" title="Sarees" cta="Shop sarees" ratio={1} sizes="(min-width: 48rem) 33vw, 100vw" />
          <ImageTile to="/shop/baby-shower-maternity" folder="s" file="baby-shower" alt="Baby-shower outfit by Aarchi’s by Archana Soni" label="Custom & made to measure" title="Maternity" cta="Shop maternity" ratio={1} sizes="(min-width: 48rem) 33vw, 100vw" />
        </div>
      </section>

      <section className="section bg-ivory" aria-labelledby="process-title">
        <div className="container">
          <header className="sec-head"><div><p className="t-label t-muted">{content.howItWorks.eyebrow}</p><h2 id="process-title" className="t-h2">{content.howItWorks.title}</h2></div>
            <Button to="/how-it-works" variant="secondary">How it works</Button></header>
          <Steps />
        </div>
      </section>
      <CtaBand />
    </div>
  )
}
