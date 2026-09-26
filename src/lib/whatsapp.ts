import { WHATSAPP_E164, SITE_URL } from './config'
import type { Product } from './catalog'

export const waLink = (text: string) => `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(text)}`

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
