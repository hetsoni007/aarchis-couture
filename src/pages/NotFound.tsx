import { Link } from 'react-router-dom'
import { Seo } from '../lib/seo'
import { categories, categoryUrl } from '../lib/catalog'
import { askStylist } from '../lib/whatsapp'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { JaalPattern } from '../components/brand/Motifs'
import './content.css'

export default function NotFound() {
  return (
    <div className="notfound night" data-nav-night>
      <Seo title="This thread came loose" description="The page you were looking for isn't here." noindex />
      <JaalPattern className="notfound-jaal" color="var(--zari-light)" opacity={0.06} size={80} />
      <div className="wrap notfound-in">
        <p className="notfound-code num" aria-hidden="true">404</p>
        <EmptyState as="h1" kind="lost" title="This thread came loose."
          actions={<><Button to="/" variant="night">Back to the house</Button><Button to="/shop" variant="ghost">The collections</Button></>}>
          The page you were after isn’t on the loom. Perhaps one of these — or <a href={askStylist('finding something on the site')} target="_blank" rel="noopener noreferrer" className="prose-link">ask a stylist</a>.
        </EmptyState>
        <ul role="list" className="notfound-links">
          {categories.map((c) => <li key={c.key}><Link to={categoryUrl(c)} className="link-thread">{c.label}</Link></li>)}
          <li><Link to="/how-it-works" className="link-thread">How it works</Link></li>
          <li><Link to="/nri-brides" className="link-thread">NRI brides</Link></li>
        </ul>
      </div>
    </div>
  )
}
