import productsJson from '../data/catalog.client.json'
import contentJson from '../data/content.json'
import imagesJson from '../data/images.json'

export type CategoryKey = 'bridal' | 'saree' | 'dupatta' | 'dressmaterial' | 'ethnic' | 'mens' | 'babyshower'
export type Silhouette = 'lehenga' | 'saree' | 'dupatta' | 'suit' | 'anarkali' | 'gown' | 'menswear' | 'maternity' | 'kurta'
export type Pattern =
  | 'gharchola' | 'bandhani-ombre' | 'dot-jaal' | 'zari-border' | 'gamthi' | 'floral' | 'butis' | 'beads'
  | 'chikan' | 'print' | 'patchwork' | 'patola' | 'plain' | 'jacquard' | 'vine' | 'stripes' | 'jaal'
export type Accent = 'gold' | 'silver' | 'pearl' | 'multi'
export type CopyQuality = 'product' | 'caption' | 'fragment'
export type DisplaySource = 'live-detail' | 'instagram-caption' | 'image-text' | 'none'

export interface Slide { file: string; alt: string; kicker: string | null; caption: string | null }
export interface Product {
  slug: string
  name: string
  category: CategoryKey
  categoryLabel: string
  position: number
  isNew: boolean
  occasions: string[]
  styles: string[]
  copy: {
    /** omitted from the client copy when identical to `display` */
    detail?: string
    quality: CopyQuality
    display: string | null
    displaySource: DisplaySource
    imageText: string | null
    crafting: string
    metaDescription: string
    studioDescription: string | null
  }
  story: { title: string; lead: string; slides: Slide[] } | null
  crossSell: string[]
  crafts: string[]
  fabric: { name: string } | null
  derived: { families: string[]; base: string; second: string; accent: Accent; pattern: Pattern; silhouette: Silhouette }
  image: { file: string; alt: string; fit: 'cover' | 'contain'; focus: string }
  price: { inr: number; placeholder: boolean }
  instagram: { shortcode: string; url: string; postedAt: string } | null
}
export interface Category {
  key: CategoryKey; slug: string; label: string; singular: string; ambient: string; intro: string; count: number
}
export interface ImageMeta { w: number; h: number; ratio: number; widths: number[]; tone: string }

export const products = productsJson as unknown as Product[]
export const content = contentJson
export const images = imagesJson as Record<string, ImageMeta>
export const categories = content.categories as Category[]

const bySlug = new Map(products.map((p) => [p.slug, p]))
export const getProduct = (slug: string | undefined) => (slug ? bySlug.get(slug) : undefined)
export const getCategory = (key: CategoryKey) => categories.find((c) => c.key === key)!
export const categoryBySlug = (slug: string | undefined) => categories.find((c) => c.slug === slug)
export const inCategory = (key: CategoryKey) => products.filter((p) => p.category === key)

/** Editorial stories, bridal first — the home "signature stories" reel. */
export const storyProducts = products.filter((p) => p.story)

export const COLOUR_FAMILIES: { name: string; swatch: string }[] = [
  { name: 'Red', swatch: '#B1261D' },
  { name: 'Maroon', swatch: '#5E2227' },
  { name: 'Pink', swatch: '#D42A6C' },
  { name: 'Blush & Peach', swatch: '#E6C4AE' },
  { name: 'Orange & Coral', swatch: '#E4691E' },
  { name: 'Ivory & Beige', swatch: '#E9DDC5' },
  { name: 'White', swatch: '#F4F2EE' },
  { name: 'Gold', swatch: '#C49A45' },
  { name: 'Green', swatch: '#6F7E34' },
  { name: 'Blue', swatch: '#2B4E7A' },
  { name: 'Purple', swatch: '#6B2B8F' },
  { name: 'Grey', swatch: '#7D7F6D' },
  { name: 'Brown', swatch: '#4A3025' },
  { name: 'Black', swatch: '#141313' },
  { name: 'Multicolour', swatch: 'conic-gradient(#D42A6C, #E4691E, #C49A45, #6F7E34, #2B8C8C, #2B4E7A, #6B2B8F, #D42A6C)' },
]

export const PRICE_BANDS = [
  { id: 'u5', label: 'Under ₹5,000', min: 0, max: 4999 },
  { id: '5-20', label: '₹5,000 – ₹20,000', min: 5000, max: 20000 },
  { id: '20-50', label: '₹20,000 – ₹50,000', min: 20001, max: 50000 },
  { id: '50-100', label: '₹50,000 – ₹1,00,000', min: 50001, max: 100000 },
  { id: '100+', label: 'Above ₹1,00,000', min: 100001, max: Infinity },
] as const

export const ALL_OCCASIONS = Array.from(new Set(products.flatMap((p) => p.occasions))).sort()
export const ALL_FABRICS = ['Pure silk', 'Silk', 'Linen silk', 'Organza', 'Net']
export const FABRIC_UNNAMED = 'Chosen with Archana'

/** Studio palette offered for customisation (the live FAQ: colours can be changed on any design). */
export const STUDIO_PALETTE = [
  { id: 'as-photographed', name: 'As photographed', hex: '' },
  { id: 'sindoor', name: 'Sindoor red', hex: '#A8261B' },
  { id: 'rani', name: 'Rani pink', hex: '#C8175F' },
  { id: 'blush', name: 'Blush', hex: '#E8C2BC' },
  { id: 'ivory', name: 'Ivory', hex: '#EFE6D2' },
  { id: 'haldi', name: 'Haldi', hex: '#D9982A' },
  { id: 'emerald', name: 'Emerald', hex: '#1F6B4F' },
  { id: 'neelam', name: 'Neelam blue', hex: '#1F3F7A' },
  { id: 'wine', name: 'Wine', hex: '#5E1A2A' },
] as const

/** Fabric *preferences* — the final fabric is always settled with Archana at consultation. */
export const FABRIC_PREFS: Record<string, string[]> = {
  bridal: ['As photographed', 'Raw silk', 'Organza', 'Velvet', 'Net', 'Georgette'],
  saree: ['As photographed', 'Silk', 'Linen silk', 'Georgette', 'Organza'],
  dupatta: ['As photographed', 'Silk', 'Net', 'Georgette'],
  dressmaterial: ['As photographed'],
  ethnic: ['As photographed', 'Silk', 'Georgette', 'Chanderi', 'Cotton silk'],
  mens: ['As photographed', 'Raw silk', 'Jacquard', 'Cotton silk'],
  babyshower: ['As photographed', 'Silk', 'Georgette', 'Cotton silk'],
}

export type FitKind = 'women' | 'men' | 'none' | 'unstitched'
export const fitKindFor = (p: Product): FitKind =>
  p.category === 'dupatta' ? 'none'
  : p.category === 'dressmaterial' ? 'unstitched'
  : p.category === 'mens' || p.derived.silhouette === 'menswear' ? 'men'
  : 'women'

export const productUrl = (p: Product | string) => `/catalogue/${typeof p === 'string' ? p : p.slug}`
export const categoryUrl = (c: Category | CategoryKey) =>
  `/shop/${typeof c === 'string' ? getCategory(c).slug : c.slug}`

/** Instagram captions sometimes carry emoji; the brand voice doesn't. Words stay verbatim. */
export const stripEmoji = (s: string) =>
  s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s{2,}/g, ' ').replace(/\s+([.,!?])/g, '$1').trim()

export function related(p: Product, n = 4): Product[] {
  const picked = p.crossSell.map(getProduct).filter(Boolean) as Product[]
  const same = products.filter((x) => x.category === p.category && x.slug !== p.slug && !picked.includes(x))
  const other = products.filter((x) => x.category !== p.category && x.occasions.some((o) => p.occasions.includes(o)))
  return [...picked, ...same, ...other].slice(0, n)
}

/** Short craft glossary (original editorial copy — general craft knowledge, not product claims). */
export const CRAFT_GLOSSARY: Record<string, string> = {
  zari: 'Metallic thread — traditionally gold or silver — woven or embroidered into the cloth.',
  zardozi: 'Raised metal-thread embroidery: coiled wire, sequins and beads, hand-worked on a frame.',
  'khat work': 'Hand-embroidery worked on a wooden khatla frame, layering thread, beads and stones.',
  bandhej: 'Tie-dye from Gujarat and Rajasthan: tiny points of cloth are bound with thread before dyeing, leaving dots.',
  gharchola: 'The Gujarati bridal odhni — a grid of checks with bandhej dots tied inside each square.',
  patola: 'Patan’s double-ikat silk, known for crisp geometric motifs; “patola-patterned” borrows its vocabulary.',
  jaal: 'An all-over lattice of linked motifs, like a net laid across the cloth.',
  gamthi: 'Gujarat’s rustic village embroidery — bold, colourful patches, often with mirror work.',
  jacquard: 'A pattern woven into the fabric on the loom, rather than printed or embroidered on top.',
  embroidery: 'Needlework on the finished cloth — by hand or, where the studio says so, hand and machine together.',
  beadwork: 'Beads stitched one by one to catch the light.',
  patchwork: 'Pieces of different fabrics joined into one surface.',
  butis: 'Small motifs scattered across the cloth like sown seeds.',
  sequins: 'Tiny reflective discs stitched along a line or border.',
  tassels: 'Latkans — hand-knotted drops finishing a dupatta corner or tie.',
  'temple border': 'A border of stepped, spire-like triangles borrowed from temple architecture.',
  woven: 'The pattern comes from the weave itself.',
  'hand & machine': 'The studio’s words: “crafts of hand and machine coming together”.',
}
