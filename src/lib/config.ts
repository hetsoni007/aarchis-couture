/** Site-wide switches. Anything that must change before launch lives here. */
export const SITE_URL = 'https://www.aarchisbyarchanasoni.com'
export const WHATSAPP_E164 = '919879390731'
export const WHATSAPP_DISPLAY = '+91 98793 90731'

/** 40 of 48 prices are indicative placeholders until the studio publishes real ones. */
export const SHOW_INDICATIVE_MARKER = true

/** Set to an ESP endpoint (e.g. a Brevo form URL) to collect emails; until then
 *  "Atelier notes" opts people into WhatsApp updates instead of pretending to store an email. */
export const NEWSLETTER_ENDPOINT: string | null = null
