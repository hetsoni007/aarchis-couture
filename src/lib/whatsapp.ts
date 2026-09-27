import { WHATSAPP_E164, SITE_URL } from './config'
import type { Product } from './catalog'
import type { Order } from '../store/orders'
import { formatINR } from './format'

export const waLink = (text: string) => `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(text)}`
export const waLinkTo = (phone: string, text: string) => `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`

export const askStylist = (context?: string) =>
  waLink(`Namaste Archana — I'd love a stylist's help${context ? ` with ${context}` : ''}.\n\n(via aarchisbyarchanasoni.com)`)

export const productEnquiry = (p: Product, extra: Record<string, string | undefined> = {}) => {
  const lines = Object.entries(extra).filter(([, v]) => v).map(([k, v]) => `• ${k}: ${v}`)
  return waLink(
    `Namaste Archana — I'm looking at the ${p.name} (${p.categoryLabel}).\n${lines.join('\n')}${lines.length ? '\n' : ''}\n${SITE_URL}/catalogue/${p.slug}/`,
  )
}

export const atelierNotesOptIn = (name: string) =>
  waLink(`Namaste — please add ${name ? name + ' ' : 'me '}to Aarchi's atelier notes (new pieces & festive slots).`)

export function orderMessageForStudio(order: Order) {
  const items = order.lines.map((l) => `• ${l.name} ×${l.qty} — ${formatINR(l.priceINR * l.qty)}`).join('\n')
  const c = order.contact
  return `🛍️ New Order — ${order.ref}

${items}

${order.hasIndicative ? 'Indicative total' : 'Total'}: ${formatINR(order.total)}

Customer: ${c.name}
Phone: ${c.phone}${c.email ? `\nEmail: ${c.email}` : ''}
Ship to: ${c.address}, ${c.city} ${c.postcode}, ${c.country}

(via aarchisbyarchanasoni.com)`
}

export function orderMessageForCustomer(order: Order) {
  const items = order.lines.map((l) => `• ${l.name} ×${l.qty} — ${formatINR(l.priceINR * l.qty)}`).join('\n')
  return `✅ Order Confirmed — ${order.ref}

Thank you for ordering from Aarchi's by Archana Soni!

${items}

${order.hasIndicative ? 'Indicative total' : 'Total'}: ${formatINR(order.total)}

Shipping to: ${order.contact.city}, ${order.contact.country}

We'll be in touch shortly to confirm your order details. For any questions, reach us at +91 98793 90731.`
}

export const studioOrderLink = (order: Order) => waLink(orderMessageForStudio(order))
export const customerOrderLink = (order: Order) => waLinkTo(order.contact.phone, orderMessageForCustomer(order))

export function customerEmailLink(order: Order) {
  const items = order.lines.map((l) => `  • ${l.name} ×${l.qty} — ${formatINR(l.priceINR * l.qty)}`).join('\n')
  const body = `Order Confirmed — ${order.ref}

Thank you for ordering from Aarchi's by Archana Soni!

${items}

${order.hasIndicative ? 'Indicative total' : 'Total'}: ${formatINR(order.total)}

Shipping to: ${order.contact.address}, ${order.contact.city} ${order.contact.postcode}, ${order.contact.country}

We'll be in touch shortly to confirm your order details.
For any questions, reach us on WhatsApp at +91 98793 90731.

— Aarchi's by Archana Soni
aarchisbyarchanasoni.com`
  return `mailto:${encodeURIComponent(order.contact.email)}?subject=${encodeURIComponent(`Order Confirmed — ${order.ref} | Aarchi's by Archana Soni`)}&body=${encodeURIComponent(body)}`
}

export function studioEmailLink(order: Order) {
  const items = order.lines.map((l) => `  • ${l.name} ×${l.qty} — ${formatINR(l.priceINR * l.qty)}`).join('\n')
  const c = order.contact
  const body = `New Order — ${order.ref}

${items}

${order.hasIndicative ? 'Indicative total' : 'Total'}: ${formatINR(order.total)}

Customer: ${c.name}
Phone: ${c.phone}${c.email ? `\nEmail: ${c.email}` : ''}
Ship to: ${c.address}, ${c.city} ${c.postcode}, ${c.country}`
  return `mailto:?subject=${encodeURIComponent(`New Order — ${order.ref}`)}&body=${encodeURIComponent(body)}`
}
