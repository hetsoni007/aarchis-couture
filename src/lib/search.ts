import { categories, categoryUrl, products, type Product } from './catalog'

/** Words shoppers use → the words the catalogue uses. */
const SYNONYMS: Record<string, string[]> = {
  lehenga: ['lehenga', 'bridal'], lengha: ['lehenga', 'bridal'], bridal: ['bridal', 'lehenga', 'wedding'], bride: ['bridal', 'wedding'],
  saree: ['saree'], sari: ['saree'], dupatta: ['dupatta'], odhni: ['dupatta'], chunri: ['dupatta', 'bandhej'], chunni: ['dupatta'],
  suit: ['dress material', 'suit'], salwar: ['dress material', 'suit'], unstitched: ['dress material'], fabric: ['dress material'],
  anarkali: ['anarkali'], gown: ['ensemble', 'dress'], kurta: ['dress', 'ensemble'],
  men: ["men's", 'men'], groom: ["men's", 'men'], sherwani: ["men's"], kurta_men: ["men's"],
  maternity: ['baby shower', 'maternity'], godh: ['baby shower'], babyshower: ['baby shower'], pregnancy: ['maternity'],
  navratri: ['festive', 'ethnic'], garba: ['festive', 'ethnic'], chaniya: ['festive', 'ethnic'], festive: ['festive'], diwali: ['festive'],
  red: ['red', 'scarlet'], scarlet: ['red', 'scarlet'], maroon: ['maroon', 'red'], pink: ['pink', 'blush'], blush: ['blush', 'pink'],
  ivory: ['ivory', 'beige', 'white'], white: ['white', 'ivory'], gold: ['gold', 'golden'], golden: ['gold'], green: ['green', 'emerald', 'olive'],
  blue: ['blue', 'sapphire'], black: ['black', 'noir', 'onyx'], purple: ['purple', 'lavender'], pastel: ['pastel'],
  bandhani: ['bandhej'], bandhej: ['bandhej'], zardosi: ['zardozi'], zardozi: ['zardozi'], zari: ['zari'], silk: ['silk'],
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9' ]+/g, ' ')

function haystack(p: Product) {
  return {
    name: norm(p.name),
    cat: norm(p.categoryLabel),
    rest: norm([p.occasions, p.styles, p.crafts, p.derived.families, p.fabric?.name ?? '', p.copy.display ?? ''].flat().join(' ')),
  }
}
const INDEX = products.map((p) => ({ p, h: haystack(p) }))

export function searchProducts(q: string, limit = 48): Product[] {
  const terms = norm(q).split(' ').filter((t) => t.length > 1)
  if (!terms.length) return []
  const scored = INDEX.map(({ p, h }) => {
    let score = 0
    for (const t of terms) {
      const alts = SYNONYMS[t] ?? [t]
      let best = 0
      for (const a of alts) {
        if (h.name.includes(a)) best = Math.max(best, h.name.split(' ').some((w) => w.startsWith(a)) ? 6 : 4)
        else if (h.cat.includes(a)) best = Math.max(best, 3)
        else if (h.rest.includes(a)) best = Math.max(best, 2)
      }
      if (!best) return { p, score: 0 } // every term must match something
      score += best
    }
    return { p, score }
  }).filter((x) => x.score > 0)
  return scored.sort((a, b) => b.score - a.score || a.p.position - b.p.position).slice(0, limit).map((x) => x.p)
}

export function searchCategories(q: string) {
  const t = norm(q).trim()
  if (!t) return []
  return categories.filter((c) => norm(c.label).includes(t) || (SYNONYMS[t] ?? []).some((a) => norm(c.label).includes(a))).map((c) => ({ label: c.label, to: categoryUrl(c) }))
}

export const POPULAR_SEARCHES = ['Red bridal lehenga', 'Pastel lehenga', 'Bandhej dupatta', 'Silk suit', 'Navratri', 'Baby shower']
