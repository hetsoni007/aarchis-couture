import { useRef, useState } from 'react'
import { Seo, ORG_LD, breadcrumbLd } from '../lib/seo'
import { content } from '../lib/catalog'
import { useReveals } from '../lib/reveal'
import { askStylist, waLink } from '../lib/whatsapp'
import { SITE_URL } from '../lib/config'
import { PageHero } from '../components/brand/PageBits'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { cx } from '../lib/format'
import './content.css'

/** The live site's style quiz — same four questions, same WhatsApp hand-off, new loom. */
function StyleQuiz() {
  const steps = content.contactPage.quiz
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [i, setI] = useState(0)
  const [name, setName] = useState('')
  const [sent, setSent] = useState(false)
  const total = steps.length + 1
  const done = i >= steps.length
  const heading = useRef<HTMLHeadingElement>(null)
  const move = (n: number) => { setI(n); requestAnimationFrame(() => heading.current?.focus()) }

  const submit = () => {
    const msg = `Hi Aarchi's! I'd love to enquire\n• Occasion: ${answers.occasion ?? '-'}\n• Piece: ${answers.piece ?? '-'}\n• Timeline: ${answers.timeline ?? '-'}\n• Deliver to: ${answers.location ?? '-'}\n${name ? `• Name: ${name}\n` : ''}\n(via ${SITE_URL.replace('https://', '')})`
    window.open(waLink(msg), '_blank', 'noopener')
    setSent(true)
  }

  if (sent) {
    return (
      <div className="quiz-done" role="status">
        <h3 className="h3">Opening WhatsApp…</h3>
        <p className="muted">Send the message and the studio will pick it up with ideas and a quote.</p>
        <Button variant="ghost" onClick={() => { setSent(false); setI(0); setAnswers({}) }}>Start again</Button>
      </div>
    )
  }
  return (
    <div className="quiz">
      <div className="quiz-top">
        <span className="small muted">Step {Math.min(i + 1, total)} of {total}</span>
        <span className="quiz-thread" aria-hidden="true"><i style={{ width: `${(i / total) * 100}%` }} /></span>
      </div>
      {!done ? (
        <fieldset className="quiz-step" key={i}>
          <legend><h3 ref={heading} tabIndex={-1} className="h3 quiz-q">{steps[i].q}</h3></legend>
          <div className="quiz-opts">
            {steps[i].opts.map((o) => (
              <button key={o} className={cx('quiz-opt', answers[steps[i].key] === o && 'is-on')} aria-pressed={answers[steps[i].key] === o}
                onClick={() => { setAnswers({ ...answers, [steps[i].key]: o }); move(i + 1) }}>{o}</button>
            ))}
          </div>
        </fieldset>
      ) : (
        <div className="quiz-step">
          <h3 ref={heading} tabIndex={-1} className="h3 quiz-q">Lovely — and your name?</h3>
          <p className="quiz-summary">{steps.map((s) => <span key={s.key} className="chip chip-soft">{answers[s.key]}</span>)}</p>
          <form className="quiz-name" onSubmit={(e) => { e.preventDefault(); submit() }}>
            <label htmlFor="quiz-name" className="sr-only">Your name</label>
            <input id="quiz-name" placeholder="Your name" autoComplete="name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" icon="whatsapp">Send my enquiry on WhatsApp</Button>
          </form>
        </div>
      )}
      {i > 0 && <button className="quiz-back link-thread" onClick={() => move(i - 1)}><Icon name="arrowL" size={16} /> Back</button>}
    </div>
  )
}

export default function Contact() {
  const c = content.contact
  const cp = content.contactPage
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)
  return (
    <div ref={root}>
      <Seo title="Contact — book a consultation" description={cp.metaDescription} jsonLd={[ORG_LD, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Contact' }])]} />
      <PageHero eyebrow={cp.eyebrow} title={<>Visit the <em className="v">studio</em></>} lead={c.intro} crumbs={[{ name: 'Home', to: '/' }, { name: 'Contact' }]} />
      <section className="section contact" aria-label="Ways to reach us">
        <div className="wrap contact-grid">
          <div className="contact-cards">
            <article className="ccard" data-reveal>
              <p className="eyebrow plain">WhatsApp / Phone</p>
              <p className="ccard-big num">{c.whatsappDisplay}</p>
              <div className="ccard-actions">
                <Button href={askStylist()} icon="whatsapp">Message on WhatsApp</Button>
                <Button href={`tel:+${c.whatsappE164}`} variant="ghost" external={false}>Call the studio</Button>
              </div>
            </article>
            <article className="ccard" data-reveal>
              <p className="eyebrow plain">Studio</p>
              <p className="ccard-big">{c.studio}</p>
              <p className="muted">{c.visits} — outstation and international clients are looked after end-to-end on WhatsApp.</p>
            </article>
            <article className="ccard" data-reveal>
              <p className="eyebrow plain">Follow the work</p>
              <ul role="list" className="ccard-social">
                <li><a href={c.social.instagram.url} target="_blank" rel="noopener noreferrer"><Icon name="instagram" size={18} /> Instagram <span className="muted">{c.social.instagram.handle}</span></a></li>
                <li><a href={c.social.facebook.url} target="_blank" rel="noopener noreferrer"><Icon name="facebook" size={18} /> Facebook</a></li>
                <li><a href={c.social.pinterest.url} target="_blank" rel="noopener noreferrer"><Icon name="pinterest" size={18} /> Pinterest</a></li>
                <li><a href={c.social.linkedin.url} target="_blank" rel="noopener noreferrer"><Icon name="linkedin" size={18} /> LinkedIn</a></li>
              </ul>
            </article>
          </div>
          <section className="quiz-card" aria-labelledby="quiz-title" data-reveal>
            <h2 id="quiz-title" className="h2">{cp.quizTitle}</h2>
            <p className="muted">{cp.quizLead}</p>
            <StyleQuiz />
          </section>
        </div>
      </section>
    </div>
  )
}
