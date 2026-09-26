import { useLocation } from 'react-router-dom'
import { SITE_URL } from './config'

interface SeoProps {
  title: string
  description: string
  image?: string
  jsonLd?: object | object[]
  noindex?: boolean
}

/** React 19 hoists <title>/<meta>/<link> rendered anywhere into <head>. */
export function Seo({ title, description, image, jsonLd, noindex }: SeoProps) {
  const { pathname } = useLocation()
  const url = SITE_URL + (pathname.endsWith('/') ? pathname : pathname + '/')
  const full = title.includes("Aarchi's") ? title : `${title} | Aarchi's by Archana Soni`
  const img = image ? SITE_URL + image : SITE_URL + '/og.jpg'
  return (
    <>
      <title>{full}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:title" content={full} />
      <meta name="twitter:description" content={description} />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </>
  )
}

export const ORG_LD = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  '@id': SITE_URL + '/#business',
  name: "Aarchi's by Archana Soni",
  url: SITE_URL + '/',
  image: SITE_URL + '/og.jpg',
  logo: SITE_URL + '/icon-512.png',
  description: 'Custom fashion designer in Ahmedabad — made-to-measure bridal lehengas, sarees, festive and baby-shower outfits, shipped worldwide.',
  founder: { '@type': 'Person', name: 'Archana Soni' },
  telephone: '+91-98793-90731',
  address: { '@type': 'PostalAddress', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' },
  areaServed: ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates'].map((name) => ({ '@type': 'Country', name })),
  sameAs: [
    'https://www.instagram.com/aarchis.byarchanasoni/',
    'https://www.facebook.com/aarchis.byearchanasonii/',
    'https://in.pinterest.com/aarchisbyarchanasoni/',
    'https://in.linkedin.com/company/aarchi-s-by-archana-soni',
  ],
}

export const faqLd = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
})

export const breadcrumbLd = (trail: { name: string; path?: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, ...(t.path ? { item: SITE_URL + t.path } : {}) })),
})
