import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Seo, faqLd, breadcrumbLd } from '../lib/seo'
import { content } from '../lib/catalog'
import { useReveals } from '../lib/reveal'
import { askStylist } from '../lib/whatsapp'
import { PageHero, Steps, FaqBlock } from '../components/brand/PageBits'
import { Button } from '../components/ui/Button'
import { Img } from '../components/ui/Img'
import { ZariRule } from '../components/brand/Motifs'
import './content.css'

export default function HowItWorks() {
  const h = content.howItWorks
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)
  return (
    <div ref={root}>
      <Seo title="How it works — made to measure, step by step" description={h.metaDescription}
        jsonLd={[faqLd(h.faq), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'How It Works' }])]} />
      <PageHero eyebrow={h.eyebrow} title={<>Made for you, <em className="v">step by step</em></>} lead={h.lead}
        crumbs={[{ name: 'Home', to: '/' }, { name: 'How it works' }]}>
        <Button href={askStylist()} icon="whatsapp">Get a quote on WhatsApp</Button>
        <Button to="/shop" variant="ghost" iconRight="arrow">Browse the catalogue</Button>
      </PageHero>

      <section className="section hiw" aria-labelledby="steps-title">
        <h2 id="steps-title" className="sr-only">The six steps</h2>
        <div className="wrap hiw-grid">
          <Steps />
          <div className="hiw-frames" aria-hidden="true">
            <Img folder="e" name="blush-flatlay" alt="" sizes="(min-width: 64rem) 22vw, 40vw" ratio={9 / 14} className="hiw-f1" />
            <Img folder="e" name="grace-flatlay" alt="" sizes="(min-width: 64rem) 22vw, 40vw" ratio={9 / 14} className="hiw-f2" />
          </div>
        </div>
      </section>

      <section className="section paper-2 hiw-measure" aria-labelledby="measure-title">
        <div className="wrap hiw-measure-in">
          <div>
            <p className="eyebrow" data-reveal>Step 03, at home</p>
            <h2 id="measure-title" className="h2" data-reveal>Measure with the guide — or with Archana</h2>
            <p className="muted measure" data-reveal>The studio measures with you on a WhatsApp video call; all you need is a tape and a helper. If you’d like a head start, the guide on this site shows exactly where each tape goes and keeps your numbers on your device.</p>
          </div>
          <div className="hiw-measure-cta" data-reveal>
            <Button to="/account?tab=measurements" variant="secondary" icon="ruler">Open the measurement guide</Button>
          </div>
        </div>
      </section>

      <FaqBlock eyebrow="Good to know" title="Common questions" items={h.faq} />

      <section className="section night cta-band" aria-label="Start">
        <div className="wrap cta-band-in">
          <ZariRule />
          <h2 className="h1" data-reveal>Begin with a conversation.</h2>
          <div className="cta-band-btns" data-reveal>
            <Button href={askStylist()} variant="night" icon="whatsapp" size="lg">Get a quote on WhatsApp</Button>
            <Button to="/shop" variant="ghost">Browse the catalogue</Button>
          </div>
          <p className="muted" data-reveal>Ordering from outside India? See <Link to="/nri-brides" className="prose-link">how it works for NRI brides</Link>.</p>
        </div>
      </section>
    </div>
  )
}
