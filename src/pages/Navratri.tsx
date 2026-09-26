import { Suspense, lazy, useRef } from 'react'
import { Seo, faqLd, breadcrumbLd } from '../lib/seo'
import { content, inCategory } from '../lib/catalog'
import { useDevice, useIdleReady } from '../lib/device'
import { useReveals } from '../lib/reveal'
import { askStylist } from '../lib/whatsapp'
import { FaqBlock } from '../components/brand/PageBits'
import { AmbientFallback } from '../components/brand/AmbientFallback'
import { ProductGrid } from '../components/product/ProductCard'
import { Button } from '../components/ui/Button'
import { Crumbs } from '../components/ui/Kit'
import './content.css'
import './shop.css'

const Ambient = lazy(() => import('../components/three/Ambient'))

export default function Navratri() {
  const n = content.navratri
  const device = useDevice()
  const idle = useIdleReady()
  const root = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLElement>(null)
  useReveals(root)
  return (
    <div ref={root}>
      <Seo title="Navratri chaniya choli & festive outfits, Ahmedabad" description={n.metaDescription}
        jsonLd={[faqLd(n.faq), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Navratri Outfits Ahmedabad' }])]} />
      <header ref={head} className="shop-hero night" data-nav-night>
        <div className="shop-ambient" aria-hidden="true">
          <AmbientFallback mode="colour-burst" />
          {device.tier !== 'none' && idle && <Suspense fallback={null}><Ambient mode="colour-burst" device={device} eventSource={head} /></Suspense>}
        </div>
        <div className="wrap shop-hero-in">
          <Crumbs trail={[{ name: 'Home', to: '/' }, { name: 'The Navratri edit' }]} />
          <p className="eyebrow">{n.eyebrow}</p>
          <h1 className="display navratri-title">Navratri, <em className="v">made to twirl</em></h1>
          <p className="lead shop-adapted">{n.lead}</p>
          <div className="page-hero-ctas">
            <Button href={askStylist('a Navratri outfit')} variant="night" icon="whatsapp">Get a quote on WhatsApp</Button>
            <Button to="/shop/ethnic-festive" variant="ghost">Full festive catalogue</Button>
          </div>
        </div>
      </header>
      <section className="section" aria-labelledby="edit-title">
        <div className="wrap">
          <header className="pdp-rel-head">
            <div>
              <p className="eyebrow" data-reveal>The festive edit</p>
              <h2 id="edit-title" className="h2" data-reveal>Nine nights. Every piece a starting point.</h2>
            </div>
          </header>
          <ProductGrid items={inCategory('ethnic')} dense />
        </div>
      </section>
      <FaqBlock title="Navratri orders, answered" items={n.faq} />
    </div>
  )
}
