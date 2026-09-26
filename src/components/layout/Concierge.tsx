import { useLocation } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { getProduct } from '../../lib/catalog'
import { askStylist, productEnquiry } from '../../lib/whatsapp'
import './layout.css'

/** Floating WhatsApp concierge — a service layer, never the only path to buy. */
export function Concierge() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/checkout')) return null
  const m = pathname.match(/^\/catalogue\/([^/]+)/)
  const p = m ? getProduct(m[1]) : undefined
  return (
    <a className="concierge" target="_blank" rel="noopener noreferrer"
      href={p ? productEnquiry(p, { Question: 'I’d love a stylist’s advice on this piece' }) : askStylist()}
      aria-label="Chat with a stylist on WhatsApp (opens WhatsApp)">
      <Icon name="whatsapp" size={22} />
      <span className="concierge-txt">Chat with a stylist</span>
    </a>
  )
}
