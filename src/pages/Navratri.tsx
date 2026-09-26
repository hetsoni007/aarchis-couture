import { Seo, faqLd, breadcrumbLd } from '../lib/seo'
import { content, inCategory } from '../lib/catalog'
import { askStylist } from '../lib/whatsapp'
import { CtaBand, FaqSection, PageHeader } from '../components/brand/Blocks'
import { ProductGrid } from '../components/product/ProductCard'
import { Button } from '../components/ui/Button'
import './content.css'

export default function Navratri() {
  const n = content.navratri
  const items = inCategory('ethnic')
  return (
    <div>
      <Seo title="Navratri chaniya choli & festive outfits, Ahmedabad" description={n.metaDescription}
        jsonLd={[faqLd(n.faq), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Navratri Outfits Ahmedabad' }])]} />
      <PageHeader label={n.eyebrow} title={n.title} lead={n.lead} crumbs={[{ name: 'Home', to: '/' }, { name: 'The Navratri edit' }]}
        image={{ folder: 's', file: 'ethnic-festive', alt: 'Festive ethnic wear by Aarchi’s by Archana Soni', focus: '50% 30%', ratio: 4 / 5 }}
        actions={<><Button href={askStylist('a Navratri outfit')} icon="whatsapp">Get a quote on WhatsApp</Button><Button to="/shop/ethnic-festive" variant="secondary">Shop all festive</Button></>} />
      <section className="section" aria-labelledby="edit-title">
        <div className="container">
          <header className="sec-head"><div><p className="t-label t-muted">The festive edit</p><h2 id="edit-title" className="t-h2">{items.length} pieces, each a starting point</h2></div></header>
          <ProductGrid items={items} />
        </div>
      </section>
      <FaqSection title="Navratri orders, answered" items={n.faq} className="bg-ivory" />
      <CtaBand context="a Navratri outfit" />
    </div>
  )
}
