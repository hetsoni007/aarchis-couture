import type { ReactNode } from 'react'
import { content } from '../../lib/catalog'
import { Accordion, Crumbs } from '../ui/Kit'
import { JaalPattern } from './Motifs'

/** Editorial page header. `night` pages set data-nav-night so the nav reads light-on-dark. */
export function PageHero({ eyebrow, title, lead, night, crumbs, children, aside }: {
  eyebrow: string; title: ReactNode; lead?: ReactNode; night?: boolean; crumbs?: { name: string; to?: string }[]; children?: ReactNode; aside?: ReactNode
}) {
  return (
    <header className={`page-hero ${night ? 'night' : 'warp-lines'}`} data-nav-night={night || undefined}>
      {night && <JaalPattern className="page-hero-jaal" color="var(--zari-light)" opacity={0.07} size={72} />}
      <div className="wrap page-hero-in">
        <div className="page-hero-copy">
          {crumbs && <Crumbs trail={crumbs} />}
          <p className="eyebrow rise">{eyebrow}</p>
          <h1 className="h1 page-hero-title rise">{title}</h1>
          {lead && <p className="lead measure-lead rise">{lead}</p>}
          {children && <div className="page-hero-ctas rise">{children}</div>}
        </div>
        {aside && <div className="page-hero-aside rise">{aside}</div>}
      </div>
    </header>
  )
}

export function Steps({ night }: { night?: boolean }) {
  return (
    <ol role="list" className={`steps ${night ? 'is-night' : ''}`}>
      {content.howItWorks.steps.map((s, i) => (
        <li key={s.title} className="step" data-reveal>
          <span className="step-no num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <span className="step-knot" aria-hidden="true" />
          <div>
            <h3 className="h3">{s.title}</h3>
            <p className="muted">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function FaqBlock({ eyebrow = 'Good to know', title, items, id = 'faq' }: { eyebrow?: string; title: string; items: { q: string; a: string }[]; id?: string }) {
  return (
    <section className="section faq-block" aria-labelledby={`${id}-title`} id={id}>
      <div className="wrap faq-grid">
        <header>
          <p className="eyebrow" data-reveal>{eyebrow}</p>
          <h2 id={`${id}-title`} className="h1" data-reveal>{title}</h2>
        </header>
        <Accordion items={items} />
      </div>
    </section>
  )
}
