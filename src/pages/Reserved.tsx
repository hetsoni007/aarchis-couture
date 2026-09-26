import { useLayoutEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { PageLoader } from '../components/brand/Motifs'
import { useUi } from '../store/ui'
import { Seo } from '../lib/seo'
import { getProduct } from '../lib/catalog'
import { formatINR } from '../lib/format'
import { gsap } from 'gsap'
import { detectDevice } from '../lib/device'
import { waLink } from '../lib/whatsapp'
import { useOrders, JOURNEY, type Reservation } from '../store/orders'
import { describeCustom } from '../components/product/customLabels'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Img } from '../components/ui/Img'
import { ARCH_PATH } from '../components/brand/Monogram'
import './checkout.css'

export function briefFor(r: Reservation) {
  const lines = r.lines.map((l) => {
    const p = getProduct(l.slug)!
    const m = l.profile ? `\n  Measurements (${l.profile.name}, cm): ${Object.entries(l.profile.values).map(([k, v]) => `${k} ${v}`).join(', ')}` : ''
    return `• ${l.name} ×${l.qty} — ${describeCustom(p, l.custom).join(', ')}${m}${l.custom.notes ? `\n  Notes: ${l.custom.notes}` : ''}`
  }).join('\n')
  const c = r.contact
  const when = [c.occasion, c.eventDate && new Date(c.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })].filter(Boolean).join(' · ')
  return `Namaste Archana — I've just reserved on aarchisbyarchanasoni.com.
Reference: ${r.ref}

${lines}

Deliver to: ${c.city}, ${c.country}${when ? `\nOccasion: ${when}` : ''}
${r.hasIndicative ? 'Indicative total' : 'Total'}: ${formatINR(r.indicativeTotal)}
${c.name} · ${c.phone}${c.email ? ` · ${c.email}` : ''}`
}

/** The unboxing: bow unties → ribbons slip away → lid lifts → tissue parts → the card rises. */
function Reveal({ r }: { r: Reservation }) {
  const svg = useRef<SVGSVGElement>(null)
  useLayoutEffect(() => {
    const el = svg.current!
    const q = (s: string) => el.querySelectorAll(s)
    const ctx = gsap.context(() => {
      if (detectDevice().reducedMotion) {
        gsap.set(q('.rv-bow, .rv-tassel, .rv-rib-v, .rv-rib-h, .rv-lid'), { opacity: 0 })
        gsap.set(q('.rv-tissue-l'), { rotation: -68, svgOrigin: '100 186', opacity: 0.6 })
        gsap.set(q('.rv-tissue-r'), { rotation: 68, svgOrigin: '300 186', opacity: 0.6 })
        gsap.set(q('.rv-card'), { y: -104 })
        gsap.set('.rv-after', { opacity: 1, y: 0 })
        return
      }
      const tl = gsap.timeline({ delay: 0.35, defaults: { ease: 'power3.inOut' } })
      tl.to(q('.rv-bow'), { scale: 0, rotation: 40, transformOrigin: '50% 50%', opacity: 0, duration: 0.7 })
        .to(q('.rv-tassel'), { y: 40, opacity: 0, duration: 0.6, ease: 'power2.in' }, '<0.1')
        .to(q('.rv-rib-v'), { y: -60, opacity: 0, duration: 0.7 }, '-=0.25')
        .to(q('.rv-rib-h-l'), { x: -140, opacity: 0, duration: 0.8 }, '<')
        .to(q('.rv-rib-h-r'), { x: 140, opacity: 0, duration: 0.8 }, '<')
        .to(q('.rv-lid'), { y: -120, rotation: -9, svgOrigin: '200 160', opacity: 0, duration: 1.1, ease: 'power2.inOut' }, '-=0.3')
        .to(q('.rv-tissue-l'), { rotation: -68, opacity: 0.6, svgOrigin: '100 186', duration: 0.9 }, '-=0.6')
        .to(q('.rv-tissue-r'), { rotation: 68, opacity: 0.6, svgOrigin: '300 186', duration: 0.9 }, '<')
        .to(q('.rv-card'), { y: -104, duration: 1.3, ease: 'expo.out' }, '-=0.4')
        .fromTo(q('.rv-dust'), { opacity: 0, y: 0, scale: 0.4, transformOrigin: '50% 50%' }, { opacity: 1, y: (i: number) => -40 - (i % 4) * 22, x: (i: number) => (i % 2 ? 1 : -1) * (20 + i * 9), scale: 1, duration: 1.2, stagger: 0.04, ease: 'expo.out' }, '<0.1')
        .to(q('.rv-dust'), { opacity: 0, duration: 0.8 }, '-=0.4')
        .fromTo('.rv-after', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'expo.out' }, '-=1.2')
    })
    return () => ctx.revert()
  }, [r.ref])

  return (
    <svg ref={svg} className="rv" viewBox="0 0 400 330" aria-hidden="true">
      <defs>
        <pattern id="rv-jaal" width="22" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 14 C4 8 7 5 11 0 C15 5 18 8 22 14 C18 20 15 23 11 28 C7 23 4 20 0 14Z" fill="none" stroke="#dcc28e" strokeWidth="0.6" opacity="0.35" />
        </pattern>
        <linearGradient id="rv-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7f2e9" /><stop offset="1" stopColor="#eae1d2" /></linearGradient>
      </defs>
      {/* box back */}
      <rect x="80" y="160" width="240" height="120" fill="#211b18" />
      {/* the card rises from inside */}
      <g className="rv-card">
        <rect x="118" y="150" width="164" height="150" fill="url(#rv-card)" stroke="#b8955a" strokeWidth="1" />
        <rect x="124" y="156" width="152" height="138" fill="none" stroke="#b8955a" strokeWidth="0.5" />
        <g transform="translate(188 164) scale(0.5)"><path d={ARCH_PATH} fill="none" stroke="#15110f" strokeWidth="1.6" /><path d="M24 17 L13.4 55.4 M24 17 L34.6 55.4" stroke="#15110f" strokeWidth="1.6" /><path d="M11.2 45.2 C16.8 42.2 21.2 46.8 26.2 44.1 S34.2 40.6 38.2 42.6" fill="none" stroke="#b8955a" strokeWidth="1.4" /></g>
        <text x="200" y="222" textAnchor="middle" className="rv-t1">Reserved</text>
        <text x="200" y="244" textAnchor="middle" className="rv-t2">{r.ref}</text>
        <line x1="160" y1="256" x2="240" y2="256" stroke="#b8955a" strokeWidth="0.8" />
        <text x="200" y="272" textAnchor="middle" className="rv-t3">MADE TO MEASURE · AHMEDABAD</text>
      </g>
      {/* tissue */}
      <path className="rv-tissue-l" d="M100 186 L200 186 L160 150 Z" fill="#efe4d0" opacity="0.92" />
      <path className="rv-tissue-r" d="M300 186 L200 186 L240 150 Z" fill="#e6d9c2" opacity="0.92" />
      {/* box front */}
      <rect x="80" y="186" width="240" height="104" fill="#2d2622" />
      <rect x="80" y="186" width="240" height="104" fill="url(#rv-jaal)" />
      <rect x="80" y="186" width="240" height="3" fill="#b8955a" />
      <rect x="80" y="276" width="240" height="2" fill="#b8955a" opacity="0.7" />
      {/* ribbons */}
      <rect className="rv-rib-h rv-rib-h-l" x="80" y="228" width="120" height="9" fill="#c9a660" />
      <rect className="rv-rib-h rv-rib-h-r" x="200" y="228" width="120" height="9" fill="#c9a660" />
      <rect className="rv-rib-v" x="195" y="186" width="10" height="104" fill="#c9a660" />
      {/* lid */}
      <g className="rv-lid">
        <rect x="70" y="150" width="260" height="38" fill="#342b26" />
        <rect x="70" y="150" width="260" height="38" fill="url(#rv-jaal)" />
        <rect x="70" y="184" width="260" height="4" fill="#b8955a" />
        <rect x="195" y="150" width="10" height="38" fill="#c9a660" />
      </g>
      {/* bow + tassel */}
      <g className="rv-bow">
        <ellipse cx="180" cy="143" rx="22" ry="11" fill="none" stroke="#dcc28e" strokeWidth="5" transform="rotate(-18 180 143)" />
        <ellipse cx="220" cy="143" rx="22" ry="11" fill="none" stroke="#dcc28e" strokeWidth="5" transform="rotate(18 220 143)" />
        <rect x="193" y="137" width="14" height="14" fill="#b8955a" transform="rotate(45 200 144)" />
      </g>
      <g className="rv-tassel">
        <path d="M200 151 C198 170 203 182 199 196" stroke="#dcc28e" strokeWidth="2" fill="none" />
        <path d="M193 196 L205 196 L208 222 L190 222 Z" fill="#a12f1d" />
        <circle cx="199" cy="195" r="4" fill="#dcc28e" />
      </g>
      {/* zari dust */}
      {Array.from({ length: 12 }).map((_, i) => <rect key={i} className="rv-dust" x={196 + (i % 3) * 3} y={150} width="5" height="5" fill="#dcc28e" transform={`rotate(45 ${198 + (i % 3) * 3} 152)`} />)}
    </svg>
  )
}

export default function Reserved() {
  const { ref } = useParams()
  const r = useOrders((s) => s.reservations.find((x) => x.ref === ref))
  const hydrated = useUi((s) => s.hydrated)
  if (!hydrated) return <PageLoader />
  if (!r) {
    return (
      <div className="wrap co-page">
        <Seo title="Reservation" description="Your reservation with Aarchi's by Archana Soni." noindex />
        <EmptyState as="h1" kind="lost" title="We can’t find that reservation on this device."
          actions={<><Button to="/account">Your reservations</Button><Button href={waLink(`Namaste — I'm looking for my reservation ${ref ?? ''}.`)} variant="ghost" icon="whatsapp">Ask the studio</Button></>}>
          Reservations are kept in the browser you made them in. The studio has every brief you sent on WhatsApp.
        </EmptyState>
      </div>
    )
  }
  const firstName = r.contact.name.split(' ')[0]
  return (
    <div className="reserved">
      <Seo title={`Reserved — ${r.ref}`} description="Your pieces are reserved with Aarchi's by Archana Soni." noindex />
      <section className="night reserved-hero" data-nav-night>
        <div className="wrap reserved-in">
          <Reveal r={r} />
          <div className="reserved-copy">
            <p className="eyebrow rv-after">Reference {r.ref}</p>
            <h1 className="display reserved-title rv-after">Reserved.</h1>
            <p className="lead rv-after">Thank you, {firstName}. Your {r.lines.length === 1 ? 'piece is' : 'pieces are'} on the loom list — nothing has been charged.</p>
            <div className="reserved-ctas rv-after">
              <Button href={waLink(briefFor(r))} variant="night" size="lg" icon="whatsapp" cursor="Send">Send your brief to Archana</Button>
              <Button to="/account" variant="ghost">See it in your account</Button>
            </div>
            <p className="small rv-after reserved-note">One tap opens WhatsApp with everything filled in — pieces, fit, measurements and delivery. Archana replies with your final quote, deposit and timeline.</p>
          </div>
        </div>
      </section>
      <section className="section wrap reserved-body">
        <div>
          <p className="eyebrow">What happens next</p>
          <ol className="journey" role="list">
            {JOURNEY.map((s, i) => (
              <li key={s} className={i === 0 ? 'is-done' : i === 1 ? 'is-next' : ''}>
                <i aria-hidden="true" />
                <span>{s}</span>
                {i === 0 && <span className="journey-tag">Done</span>}
                {i === 1 && <span className="journey-tag is-next">Next — send your brief</span>}
              </li>
            ))}
          </ol>
        </div>
        <div className="reserved-summary">
          <p className="eyebrow">Your reservation</p>
          <ul role="list">
            {r.lines.map((l) => {
              const p = getProduct(l.slug)!
              return (
                <li key={l.id} className="co-rev-item">
                  <span className="co-fit-img" aria-hidden="true"><Img folder="p" name={p.image.file} alt="" sizes="56px" ratio={1} focus={p.image.focus} /></span>
                  <div><p><strong>{l.name}</strong> × {l.qty}</p><p className="small muted">{describeCustom(p, l.custom).join(' · ')}</p></div>
                  <span className="num">{formatINR(l.priceINR * l.qty)}</span>
                </li>
              )
            })}
          </ul>
          <p className="reserved-total"><span>{r.hasIndicative ? 'Indicative total' : 'Total'}</span><span className="num">{formatINR(r.indicativeTotal)}</span></p>
          <p className="small muted">Delivering to {r.contact.city}, {r.contact.country}.</p>
        </div>
      </section>
    </div>
  )
}
