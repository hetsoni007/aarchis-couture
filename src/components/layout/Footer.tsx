import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wordmark } from '../brand/Wordmark'
import { ZariRule, JaalPattern } from '../brand/Motifs'
import { Icon } from '../ui/Icon'
import { categories, categoryUrl, content } from '../../lib/catalog'
import { NEWSLETTER_ENDPOINT } from '../../lib/config'
import { atelierNotesOptIn, askStylist } from '../../lib/whatsapp'
import { useUi } from '../../store/ui'
import './layout.css'

function AtelierNotes() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const toast = useUi((s) => s.toast)

  // No ESP connected: opt in via WhatsApp rather than pretend to store an email.
  if (!NEWSLETTER_ENDPOINT) {
    return (
      <form className="notes" onSubmit={(e) => {
        e.preventDefault()
        window.open(atelierNotesOptIn(name.trim()), '_blank', 'noopener')
        toast({ message: 'Opening WhatsApp — send the note and you’re on the list.', tone: 'success' })
      }}>
        <label htmlFor="notes-name" className="sr-only">Your first name</label>
        <input id="notes-name" className="notes-input" placeholder="Your first name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" maxLength={40} />
        <button className="notes-btn" type="submit" data-cursor="Join"><Icon name="whatsapp" size={16} /> <span>Join on WhatsApp</span></button>
      </form>
    )
  }
  return (
    <form className="notes" noValidate onSubmit={async (e) => {
      e.preventDefault()
      if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('That address doesn’t look complete.'); return }
      setErr(null)
      try { await fetch(NEWSLETTER_ENDPOINT!, { method: 'POST', body: new URLSearchParams({ email }) }); toast({ message: 'You’re on the list. The first note arrives with the next new piece.', tone: 'success' }); setEmail('') }
      catch { setErr('That didn’t go through — try once more?') }
    }}>
      <label htmlFor="notes-email" className="sr-only">Email address</label>
      <input id="notes-email" type="email" className="notes-input" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err} aria-describedby={err ? 'notes-err' : undefined} />
      <button className="notes-btn" type="submit">Join</button>
      {err && <p id="notes-err" className="notes-err" role="alert">{err}</p>}
    </form>
  )
}

export function Footer() {
  const s = content.contact.social
  return (
    <footer className="footer night">
      <JaalPattern className="footer-jaal" color="var(--zari-light)" opacity={0.05} size={64} />
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Wordmark />
            <p className="footer-line italic-voice">{content.brand.footerLine}</p>
            <div className="footer-notes">
              <p className="eyebrow">Atelier notes</p>
              <p className="small muted">New pieces and festive slots, a few times a season — straight from the studio.</p>
              <AtelierNotes />
            </div>
          </div>
          <nav aria-label="Collections" className="footer-col">
            <h2 className="footer-h">Collections</h2>
            <ul role="list">
              <li><Link to="/shop" className="link-thread">All pieces</Link></li>
              {categories.map((c) => <li key={c.key}><Link to={categoryUrl(c)} className="link-thread">{c.label}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label="The house" className="footer-col">
            <h2 className="footer-h">The house</h2>
            <ul role="list">
              <li><Link to="/about" className="link-thread">The atelier</Link></li>
              <li><Link to="/how-it-works" className="link-thread">How it works</Link></li>
              <li><Link to="/nri-brides" className="link-thread">For NRI brides</Link></li>
              <li><Link to="/nri-brides/usa" className="link-thread">Ordering from the USA</Link></li>
              <li><Link to="/nri-brides/uk" className="link-thread">Ordering from the UK</Link></li>
              <li><Link to="/navratri-outfits-ahmedabad" className="link-thread">The Navratri edit</Link></li>
            </ul>
          </nav>
          <nav aria-label="Your pieces" className="footer-col">
            <h2 className="footer-h">Your pieces</h2>
            <ul role="list">
              <li><Link to="/bag" className="link-thread">Bag</Link></li>
              <li><Link to="/wishlist" className="link-thread">Wishlist</Link></li>
              <li><Link to="/account" className="link-thread">Reservations</Link></li>
              <li><Link to="/account?tab=measurements" className="link-thread">Saved measurements</Link></li>
              <li><Link to="/contact" className="link-thread">Contact &amp; style quiz</Link></li>
            </ul>
          </nav>
          <div className="footer-col">
            <h2 className="footer-h">The studio</h2>
            <address className="footer-addr">
              <span>{content.contact.studio}</span>
              <span className="muted">{content.contact.visits}</span>
              <a href={askStylist()} target="_blank" rel="noopener noreferrer" className="link-thread footer-wa"><Icon name="whatsapp" size={15} /> {content.contact.whatsappDisplay}</a>
            </address>
            <div className="footer-social">
              <a href={s.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram — @aarchis.byarchanasoni" data-cursor="Follow"><Icon name="instagram" size={19} /></a>
              <a href={s.facebook.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" data-cursor="Follow"><Icon name="facebook" size={19} /></a>
              <a href={s.pinterest.url} target="_blank" rel="noopener noreferrer" aria-label="Pinterest" data-cursor="Follow"><Icon name="pinterest" size={19} /></a>
              <a href={s.linkedin.url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" data-cursor="Follow"><Icon name="linkedin" size={19} /></a>
            </div>
          </div>
        </div>
        <ZariRule className="footer-rule" />
        <div className="footer-bot small">
          <span>© {new Date().getFullYear()} Aarchi's by Archana Soni. All rights reserved.</span>
          <span className="muted">Made to measure in Ahmedabad · shipped worldwide</span>
        </div>
      </div>
    </footer>
  )
}
