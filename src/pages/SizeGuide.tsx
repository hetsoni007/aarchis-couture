import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo, breadcrumbLd, faqLd } from '../lib/seo'
import { askStylist } from '../lib/whatsapp'
import { FaqSection, PageHeader } from '../components/brand/Blocks'
import { MeasureHowTo } from '../components/product/MeasureGuide'
import { FitWays, SizeTabs } from '../components/product/SizeGuide'
import { Button } from '../components/ui/Button'
import type { BodyKind } from '../store/measurements'
import './content.css'

/** Answers drawn from the studio's own process (How it works) and this site's fit options. */
const FAQ = [
  { q: 'Is there a size chart?', a: 'Every Aarchi’s piece is cut to your measurements, so there is no fixed chart to squeeze into. If you prefer, choose a standard size from XS to XXL as a starting point, and your fit is refined at the fitting review before the piece ships.' },
  { q: 'Do I have to measure myself?', a: 'No. The studio’s own process is a video-guided session: after you reserve, Archana takes your measurements with you on a guided WhatsApp video call. All you need is a tape and a helper.' },
  { q: 'What do I need to measure at home?', a: 'A soft tape, a helper and the clothes and heels you plan to wear on the day. The starred measurements in the guide are all the studio needs to begin; the rest are confirmed on your video fitting.' },
  { q: 'Where are my saved measurements stored?', a: 'On this device only, in your account. Nothing is sent anywhere until you share your brief with the studio on WhatsApp.' },
]

export default function SizeGuide() {
  const [kind, setKind] = useState<BodyKind>('women')
  return (
    <div>
      <Seo title="Size & fit guide — how to measure for made-to-measure" description="How to measure for a made-to-measure lehenga, saree blouse or menswear piece from Aarchi's by Archana Soni: measure with Archana on video, enter your own, or start from a standard size."
        jsonLd={[faqLd(FAQ), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Size & fit guide' }])]} />
      <PageHeader label="Size & fit" title="Size & fit guide" crumbs={[{ name: 'Home', to: '/' }, { name: 'Size & fit guide' }]}
        lead="Every piece is made to order and cut to your measurements. Choose whichever route suits you; Archana checks every set before cutting."
        actions={<><Button to="/account?tab=measurements" icon="ruler">Save my measurements</Button><Button href={askStylist('my measurements')} variant="secondary" icon="whatsapp">Measure with Archana</Button></>} />
      <section className="section-sm" aria-labelledby="ways-title">
        <div className="container">
          <h2 id="ways-title" className="sr-only">Three ways to get your fit</h2>
          <FitWays />
        </div>
      </section>
      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <header className="sec-head">
            <div><p className="t-label t-muted">At home</p><h2 id="how-title" className="t-h2">How to measure</h2></div>
            <SizeTabs kind={kind} onKind={setKind} />
          </header>
          <MeasureHowTo key={kind} kind={kind} />
          <p className="t-small t-muted sg-note">Starred measurements are all the studio needs to begin. For a lehenga, measure waist to floor in the heels you’ll wear on the day. <Link to="/how-it-works" className="link">How made-to-measure works</Link></p>
        </div>
      </section>
      <FaqSection title="Fit questions" items={FAQ} className="bg-ivory" />
    </div>
  )
}
