import { Link } from 'react-router-dom'
import { Seo } from '../lib/seo'
import { categories, categoryUrl } from '../lib/catalog'
import { askStylist } from '../lib/whatsapp'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import './content.css'

export default function NotFound() {
  return (
    <div className="container nf">
      <Seo title="Page not found" description="The page you were looking for isn't here." noindex />
      <p className="nf-code t-num" aria-hidden="true">404</p>
      <EmptyState as="h1" kind="lost" title="We couldn’t find that page"
        actions={<><Button to="/">Back to home</Button><Button to="/shop" variant="secondary">Shop the collection</Button></>}>
        It may have moved, or the link may be mistyped. Try a category below, or <a href={askStylist('finding something on the site')} target="_blank" rel="noopener noreferrer" className="link">ask a stylist</a>.
      </EmptyState>
      <ul role="list" className="nf-links">
        {categories.map((c) => <li key={c.key}><Link to={categoryUrl(c)} className="pill">{c.label}</Link></li>)}
        <li><Link to="/how-it-works" className="pill">How it works</Link></li>
        <li><Link to="/nri-brides" className="pill">Ordering from abroad</Link></li>
      </ul>
    </div>
  )
}
