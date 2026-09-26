import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Seo, faqLd, breadcrumbLd } from '../lib/seo'
import { content } from '../lib/catalog'
import { useReveals } from '../lib/reveal'
import { askStylist } from '../lib/whatsapp'
import { CtaBand, FaqSection, PageHeader, Steps } from '../components/brand/Blocks'
import { FitWays } from '../components/product/SizeGuide'
import { Button } from '../components/ui/Button'
import { Img } from '../components/ui/Img'
import './content.css'

export default function HowItWorks() {
  const h = content.howItWorks
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)
  return (
    <div ref={root}>
      <Seo title="How it works — made to measure, step by step" description={h.metaDescription}
        jsonLd={[faqLd(h.faq), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'How It Works' }])]} />
      <PageHeader label={h.eyebrow} title={h.title} lead={h.lead} crumbs={[{ name: 'Home', to: '/' }, { name: 'How it works' }]}
        image={{ folder: 'e', file: 'blush-flatlay', alt: '', focus: '50% 40%', ratio: 4 / 5 }}
        actions={<><Button href={askStylist()} icon="whatsapp">Get a quote on WhatsApp</Button><Button to="/shop" variant="secondary">Browse the collection</Button></>} />

      <section className="section" aria-labelledby="steps-title">
        <div className="container">
          <header className="sec-head"><div><p className="t-label t-muted">Six steps</p><h2 id="steps-title" className="t-h2">From first message to your door</h2></div></header>
          <Steps />
        </div>
      </section>

      <section className="section bg-ivory" aria-labelledby="fit-title">
        <div className="container hiw-fit">
          <div className="hiw-fit-copy" data-reveal>
            <p className="t-label t-muted">Measurements</p>
            <h2 id="fit-title" className="t-h2">Measure with the guide, or with Archana</h2>
            <p className="t-muted">The studio measures with you on a WhatsApp video call; all you need is a tape and a helper. If you’d like a head start, the guide on this site shows exactly where each tape goes and keeps your numbers on your device.</p>
            <div className="phead-actions">
              <Button to="/size-guide" variant="secondary" icon="ruler">Open the size &amp; fit guide</Button>
              <Button to="/account?tab=measurements" variant="ghost">Save my measurements</Button>
            </div>
          </div>
          <div data-reveal><FitWays /></div>
        </div>
      </section>

      <section className="section-sm" aria-label="From the studio">
        <div className="container hiw-imgs" data-reveal>
          <Img folder="e" name="grace-flatlay" alt="" sizes="(min-width: 48rem) 33vw, 50vw" ratio={4 / 5} focus="50% 40%" />
          <Img folder="e" name="pastel-silhouette" alt="" sizes="(min-width: 48rem) 33vw, 50vw" ratio={4 / 5} focus="50% 30%" />
          <Img folder="e" name="elegance-drape" alt="" sizes="33vw" ratio={4 / 5} focus="50% 30%" className="hiw-img-3" />
        </div>
      </section>

      <FaqSection title="Common questions" items={h.faq} aside={
        <p className="t-small t-muted">Ordering from outside India? See <Link to="/nri-brides" className="link">how it works for NRI brides</Link>.</p>
      } />
      <CtaBand />
    </div>
  )
}
