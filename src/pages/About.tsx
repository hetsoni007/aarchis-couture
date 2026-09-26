import { useRef } from 'react'
import { Seo, ORG_LD, breadcrumbLd } from '../lib/seo'
import { content } from '../lib/catalog'
import { useReveals } from '../lib/reveal'
import { askStylist } from '../lib/whatsapp'
import { Button } from '../components/ui/Button'
import { Img } from '../components/ui/Img'
import { Crumbs } from '../components/ui/Kit'
import { ZariRule, BandhaniField } from '../components/brand/Motifs'
import { Monogram } from '../components/brand/Monogram'
import './content.css'

export default function About() {
  const a = content.about
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)
  return (
    <div ref={root} className="about">
      <Seo title="About Archana Soni — custom fashion designer, Ahmedabad" description={a.metaDescription}
        jsonLd={[ORG_LD, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'About' }]), { '@context': 'https://schema.org', '@type': 'Person', name: 'Archana Soni', jobTitle: 'Founder & designer', worksFor: { '@id': ORG_LD['@id'] }, address: { '@type': 'PostalAddress', addressLocality: 'Ahmedabad', addressCountry: 'IN' } }]} />
      <section className="about-hero warp-lines">
        <div className="wrap about-grid">
          <div className="about-copy">
            <Crumbs trail={[{ name: 'Home', to: '/' }, { name: 'The atelier' }]} />
            <p className="eyebrow rise">{a.eyebrow}</p>
            <h1 className="display about-title rise">Meet <em className="v">Archana</em> Soni</h1>
            <ZariRule className="about-rule" />
            {a.paragraphs.map((t, i) => <p key={i} className={i ? 'muted about-p rise' : 'lead about-lead rise'}>{t}</p>)}
            <p className="about-sign italic-voice rise">— Archana</p>
            <div className="about-ctas rise">
              <Button to="/contact" iconRight="arrow">Work with us</Button>
              <Button href={askStylist()} variant="ghost" icon="whatsapp">Message the studio</Button>
            </div>
          </div>
          <figure className="about-portrait rise">
            <Img folder="s" name="founder-portrait" alt={a.portraitAlt} sizes="(min-width: 64rem) 40vw, 90vw" ratio={4 / 5} focus="50% 28%" priority />
            <figcaption className="small muted"><Monogram size={18} /> {content.contact.studio} · {content.contact.visits.toLowerCase()}</figcaption>
          </figure>
        </div>
      </section>

      <section className="section night about-services" aria-labelledby="svc-title">
        <BandhaniField color="var(--zari-light)" opacity={0.06} />
        <div className="wrap">
          <p className="eyebrow" data-reveal>What we do</p>
          <h2 id="svc-title" className="h1" data-reveal>Services</h2>
          <ol role="list" className="svc-list">
            {a.services.map((s, i) => (
              <li key={s.title} data-reveal>
                <span className="num svc-no">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="h2">{s.title}</h3>
                <p className="muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section about-mosaic" aria-labelledby="mosaic-title">
        <div className="wrap">
          <header className="about-mosaic-head">
            <p className="eyebrow" data-reveal>From the studio</p>
            <h2 id="mosaic-title" className="h2" data-reveal><em className="v">{content.brand.tagline}</em></h2>
          </header>
          <div className="mosaic">
            {[['bridal-lehengas', 1], ['sarees', 4 / 5], ['ethnic-festive', 4 / 5], ['custom-couture', 4 / 5], ['baby-shower', 4 / 5]].map(([n, r], i) => (
              <Img key={n as string} folder="s" name={n as string} alt="" sizes="(min-width: 64rem) 22vw, 45vw" ratio={r as number} className={`mosaic-${i + 1}`} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
