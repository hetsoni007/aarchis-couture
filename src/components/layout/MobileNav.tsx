import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Drawer } from '../ui/Kit'
import { Icon } from '../ui/Icon'
import { Logo } from '../brand/Logo'
import { categories, content } from '../../lib/catalog'
import { HOUSE_LINKS, megaFor, occasionsWithCounts } from '../../lib/nav'
import { askStylist } from '../../lib/whatsapp'
import { useUi } from '../../store/ui'
import './layout.css'

export function MobileNav() {
  const open = useUi((s) => s.menuOpen)
  const setMenu = useUi((s) => s.setMenu)
  const setSearch = useUi((s) => s.setSearch)
  const { pathname, search } = useLocation()
  useEffect(() => { setMenu(false) }, [pathname, search, setMenu])
  const social = content.contact.social

  return (
    <Drawer open={open} onClose={() => setMenu(false)} side="left" mobile="side" title={<Logo compact />}>
      <div className="mnav">
        <button className="mnav-search" onClick={() => setSearch(true)}><Icon name="search" size={18} /> Search lehengas, sarees, colours…</button>

        <ul role="list" className="mnav-list">
          <li><Link to="/shop?new=1" className="mnav-top">New In</Link></li>
          {categories.map((c) => {
            const m = megaFor(c)
            return (
              <li key={c.key}>
                <details className="mnav-acc">
                  <summary className="mnav-top">{c.label}<Icon name="plus" size={16} className="acc-ic" /></summary>
                  <ul role="list" className="mnav-sub">
                    <li><Link to={m.base}>Shop all <span className="t-muted">({c.count})</span></Link></li>
                    {m.newCount > 0 && <li><Link to={`${m.base}?new=1`}>New arrivals</Link></li>}
                    {m.occasions.slice(0, 4).map((o) => <li key={o.label}><Link to={o.to}>{o.label}</Link></li>)}
                  </ul>
                </details>
              </li>
            )
          })}
          <li>
            <details className="mnav-acc">
              <summary className="mnav-top">Shop by occasion<Icon name="plus" size={16} className="acc-ic" /></summary>
              <ul role="list" className="mnav-sub">
                {occasionsWithCounts().map((o) => <li key={o.value}><Link to={`/shop?occ=${encodeURIComponent(o.value)}`}>{o.value} <span className="t-muted">({o.count})</span></Link></li>)}
              </ul>
            </details>
          </li>
        </ul>

        <ul role="list" className="mnav-house">
          {HOUSE_LINKS.map((l) => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}
        </ul>

        <div className="mnav-account">
          <Link to="/account"><Icon name="user" size={18} /> Account &amp; orders</Link>
          <Link to="/wishlist"><Icon name="heart" size={18} /> Wishlist</Link>
          <a href={askStylist()} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} /> {content.contact.whatsappDisplay}</a>
        </div>

        <div className="mnav-social">
          <a href={social.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Icon name="instagram" size={18} /></a>
          <a href={social.facebook.url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Icon name="facebook" size={18} /></a>
          <a href={social.pinterest.url} target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><Icon name="pinterest" size={18} /></a>
          <a href={social.linkedin.url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Icon name="linkedin" size={18} /></a>
        </div>
        <p className="t-small t-muted">{content.brand.footerLine}</p>
      </div>
    </Drawer>
  )
}
