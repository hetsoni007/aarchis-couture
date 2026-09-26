import { content } from '../../lib/catalog'
import { ZariRule } from './Motifs'

interface Quote { name: string; place: string; quote: string }

/**
 * Data-gated. The live site has published no testimonials, so this renders nothing
 * until real, attributable client words are added to content.json → testimonials.items.
 */
export function Testimonials() {
  const items = (content.testimonials.items as Quote[]).filter((q) => q.quote && q.name && !/TODO/i.test(q.quote))
  if (!items.length) return null
  return (
    <section className="section testimonials" aria-labelledby="tst-title">
      <div className="wrap">
        <p className="eyebrow">In their words</p>
        <h2 id="tst-title" className="h1">From the brides</h2>
        <ZariRule />
        <ul role="list" className="tst-list">
          {items.map((q, i) => (
            <li key={i}>
              <blockquote className="italic-voice tst-q">“{q.quote}”</blockquote>
              <p className="tst-who">{q.name}{q.place && <span className="muted"> · {q.place}</span>}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
