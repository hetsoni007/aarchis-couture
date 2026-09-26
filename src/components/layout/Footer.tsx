import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '../brand/Logo'
import { Icon, type IconName } from '../ui/Icon'
import { categories, categoryUrl, content, getProduct } from '../../lib/catalog'
import { NEWSLETTER_ENDPOINT } from '../../lib/config'
import { atelierNotesOptIn, askStylist, productEnquiry } from '../../lib/whatsapp'
import { useUi } from '../../store/ui'
import './layout.css'

/** The four promises the studio's real process supports (How it works, live site). */
export const SERVICES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'scissors', title: 'Made to measure', text: 'Cut to your measurements in the Ahmedabad studio.' },
  { icon: 'video', title: 'Video consultation', text: 'Design, fabric and fitting guided over WhatsApp.' },
  { icon: 'truck', title: 'Shipped worldwide', text: 'Across India, the USA, UK, Canada, Australia and UAE.' },
  { icon: 'shield', title: 'Reserve, then pay', text: 'Nothing is charged until your quote is confirmed.' },
]

export function ServiceStrip() {
  return (
    <ul role="list" className="svc container">
      {SERVICES.map((s) => (
        <li key={s.title} className="svc-item">
          <Icon name={s.icon} size={24} />
          <div><p className="svc-title">{s.title}</p><p className="t-small t-muted">{s.text}</p></div>
        </li>
      ))}
    </ul>
  )
}

function Newsletter() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const toast = useUi((s) => s.toast)
  return (
    <div className="news">
      <div>
        <h2 className="t-h2">Join the Aarchi’s list</h2>
        <p className="t-muted">New pieces and festive-season slots, a few times a season.</p>
      </div>
      {NEWSLETTER_ENDPOINT ? (
        <form className="news-form" noValidate onSubmit={async (e) => {
          e.preventDefault()
          if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Please enter a complete email address.'); return }
          setErr(null)
          try { await fetch(NEWSLETTER_ENDPOINT!, { method: 'POST', body: new URLSearchParams({ email }) }); toast({ message: 'You’re on the list.', tone: 'success' }); setEmail('') }
          catch { setErr('That didn’t go through — please try again.') }
        }}>
          <label htmlFor="news-email" className="sr-only">Email address</label>
          <input id="news-email" type="email" className="fld-input" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err} aria-describedby={err ? 'news-err' : undefined} />
          <button className="btn btn-primary" type="submit"><span className="btn-label">Subscribe</span></button>
          {err && <p id="news-err" className="fld-msg is-error" role="alert">{err}</p>}
        </form>
      ) : (
        // No email service is connected yet, so the list lives on WhatsApp rather than pretending to store an email.
        <form className="news-form" onSubmit={(e) => {
          e.preventDefault()
          window.open(atelierNotesOptIn(name.trim()), '_blank', 'noopener')
          toast({ message: 'Opening WhatsApp — send the message and you’re on the list.', tone: 'success' })
        }}>
          <label htmlFor="news-name" className="sr-only">Your first name</label>
          <input id="news-name" className="fld-input" placeholder="Your first name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" maxLength={40} />
          <button className="btn btn-primary" type="submit"><Icon name="whatsapp" size={16} className="btn-ic" /><span className="btn-label">Join on WhatsApp</span></button>
          <p className="fld-msg">Updates arrive on WhatsApp from the studio’s own number.</p>
        </form>
      )}
    </div>
  )
}

export function Footer() {
  const s = content.contact.social
  const { pathname } = useLocation()
  const m = pathname.match(/^\/catalogue\/([^/]+)/)
  const p = m ? getProduct(m[1]) : undefined
  return (
    <footer className="ftr">
      <div className="ftr-svc"><ServiceStrip /></div>
      <div className="container">
        <Newsletter />
        <div className="ftr-cols">
          <div className="ftr-brand">
            <Logo />
            <p className="t-small t-muted">{content.brand.footerLine}</p>
            <a href={p ? productEnquiry(p, { Question: 'I have a question about this piece' }) : askStylist()} target="_blank" rel="noopener noreferrer" className="ftr-wa">
              <Icon name="whatsapp" size={16} /> {content.contact.whatsappDisplay}
            </a>
            <p className="t-small t-muted">{content.contact.studio} · {content.contact.visits.toLowerCase()}</p>
          </div>
          <nav aria-label="Shop" className="ftr-col">
            <h2 className="t-label">Shop</h2>
            <ul role="list">
              <li><Link to="/shop?new=1">New arrivals</Link></li>
              {categories.map((c) => <li key={c.key}><Link to={categoryUrl(c)}>{c.label}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label="Customer care" className="ftr-col">
            <h2 className="t-label">Customer care</h2>
            <ul role="list">
              <li><Link to="/how-it-works">How made-to-measure works</Link></li>
              <li><Link to="/size-guide">Size &amp; fit guide</Link></li>
              <li><Link to="/nri-brides">Ordering from abroad</Link></li>
              <li><Link to="/nri-brides/usa">Shipping to the USA</Link></li>
              <li><Link to="/nri-brides/uk">Shipping to the UK</Link></li>
              <li><Link to="/contact">Contact us</Link></li>
            </ul>
          </nav>
          <nav aria-label="The house" className="ftr-col">
            <h2 className="t-label">The house</h2>
            <ul role="list">
              <li><Link to="/about">About Archana Soni</Link></li>
              <li><Link to="/navratri-outfits-ahmedabad">The Navratri edit</Link></li>
              <li><Link to="/account">My account</Link></li>
              <li><Link to="/account">Track a reservation</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
            </ul>
          </nav>
        </div>
        <div className="ftr-bot">
          <div className="ftr-social">
            <a href={s.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Icon name="instagram" size={18} /></a>
            <a href={s.facebook.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Icon name="facebook" size={18} /></a>
            <a href={s.pinterest.url} target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><Icon name="pinterest" size={18} /></a>
            <a href={s.linkedin.url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Icon name="linkedin" size={18} /></a>
          </div>
          <p className="t-small t-muted">© {new Date().getFullYear()} Aarchi’s by Archana Soni. Made in Ahmedabad, India.</p>
        </div>
      </div>
    </footer>
  )
}
