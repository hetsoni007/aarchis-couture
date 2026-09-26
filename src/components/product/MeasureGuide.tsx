import { useMemo, useState, type ReactElement } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Field'
import { cx } from '../../lib/format'
import { useMeasurements, type BodyKind, type MeasureProfile, type Unit } from '../../store/measurements'
import './measure.css'

interface FieldDef { id: string; label: string; how: string; min: number; max: number; required?: boolean; mark: ReactElement }

const Z = 'var(--accent)'
const line = (d: string) => <path d={d} fill="none" stroke={Z} strokeWidth="2.2" strokeLinecap="round" />
const ring = (cx: number, cy: number, rx: number, ry: number) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={Z} strokeWidth="2.2" />
const vbar = (x: number, y1: number, y2: number) => (
  <g stroke={Z} strokeWidth="2" strokeLinecap="round"><line x1={x} y1={y1} x2={x} y2={y2} /><line x1={x - 6} y1={y1} x2={x + 6} y2={y1} /><line x1={x - 6} y1={y2} x2={x + 6} y2={y2} /></g>
)

/** cm ranges are deliberately generous — they catch typos (e.g. 800 for 80), not bodies. */
const WOMEN: FieldDef[] = [
  { id: 'bust', label: 'Bust', how: 'Around the fullest part of the bust, tape level all the way round — snug, not tight.', min: 60, max: 160, required: true, mark: ring(100, 96, 54, 8) },
  { id: 'waist', label: 'Waist', how: 'Around the natural waist — the narrowest point, usually just above the navel.', min: 45, max: 150, required: true, mark: ring(100, 140, 38, 6) },
  { id: 'hips', label: 'Hips', how: 'Around the fullest part of the hips, feet together.', min: 65, max: 170, required: true, mark: ring(100, 192, 52, 7) },
  { id: 'shoulder', label: 'Shoulder', how: 'Across the back, from one shoulder point to the other.', min: 28, max: 55, mark: line('M50 52 Q100 38 150 52') },
  { id: 'armhole', label: 'Armhole', how: 'Around the arm where it meets the shoulder, tape under the armpit.', min: 28, max: 60, mark: ring(52, 72, 9, 20) },
  { id: 'sleeve', label: 'Sleeve length', how: 'From the shoulder point down to where you want the sleeve to end.', min: 8, max: 70, mark: line('M49 56 C44 90 40 120 37 152') },
  { id: 'blouse', label: 'Blouse length', how: 'From the highest point of the shoulder, over the bust, to where the blouse should end.', min: 28, max: 55, mark: vbar(118, 46, 150) },
  { id: 'length', label: 'Waist to floor', how: 'From the natural waist straight down to the floor — wear the heels you’ll wear on the day.', min: 80, max: 125, required: true, mark: vbar(164, 140, 400) },
  { id: 'height', label: 'Height', how: 'Standing straight against a wall, barefoot.', min: 120, max: 210, mark: vbar(190, 10, 400) },
]
const MEN: FieldDef[] = [
  { id: 'chest', label: 'Chest', how: 'Around the fullest part of the chest, under the arms.', min: 70, max: 160, required: true, mark: ring(100, 96, 56, 8) },
  { id: 'waist', label: 'Waist', how: 'Around where the trousers sit — usually at the navel.', min: 55, max: 150, required: true, mark: ring(100, 150, 44, 6) },
  { id: 'seat', label: 'Seat', how: 'Around the fullest part of the seat.', min: 70, max: 160, mark: ring(100, 198, 50, 7) },
  { id: 'shoulder', label: 'Shoulder', how: 'Across the back, from one shoulder point to the other.', min: 34, max: 62, required: true, mark: line('M46 50 Q100 38 154 50') },
  { id: 'neck', label: 'Neck', how: 'Around the base of the neck, one finger under the tape.', min: 30, max: 52, mark: ring(100, 26, 13, 4) },
  { id: 'sleeve', label: 'Sleeve length', how: 'From the shoulder point to the wrist bone.', min: 45, max: 75, mark: line('M45 54 C38 100 34 150 32 200') },
  { id: 'kurta', label: 'Kurta / jacket length', how: 'From the highest point of the shoulder down to where the hem should fall.', min: 60, max: 125, mark: vbar(120, 46, 300) },
  { id: 'trouser', label: 'Trouser length', how: 'From the waist down to the ankle bone.', min: 80, max: 118, mark: vbar(166, 150, 400) },
  { id: 'height', label: 'Height', how: 'Standing straight against a wall, barefoot.', min: 140, max: 215, required: true, mark: vbar(190, 10, 400) },
]
export const FIELDS: Record<BodyKind, FieldDef[]> = { women: WOMEN, men: MEN }

export function Figure({ kind, active }: { kind: BodyKind; active: string }) {
  const fields = FIELDS[kind]
  const body = kind === 'women'
    ? 'M90 18 C90 32 87 39 73 43 C61 46 53 49 51 59 C49 73 53 84 49 96 C46 110 58 128 64 140 C60 160 50 176 50 192 L22 400 L178 400 L150 192 C150 176 140 160 136 140 C142 128 154 110 151 96 C147 84 151 73 149 59 C147 49 139 46 127 43 C113 39 110 32 110 18 Z'
    : 'M89 18 C89 30 86 37 71 41 C56 45 47 48 45 60 C43 80 49 92 48 104 C47 124 57 140 58 152 C57 170 52 186 52 200 L54 300 L60 400 L96 400 L100 312 L104 400 L140 400 L146 300 L148 200 C148 186 143 170 142 152 C143 140 153 124 152 104 C151 92 157 80 155 60 C153 48 144 45 129 41 C114 37 111 30 111 18 Z'
  const arms = kind === 'women'
    ? 'M51 58 C43 88 38 128 34 188 M149 58 C157 88 162 128 166 188'
    : 'M45 58 C36 100 32 150 30 210 M155 58 C164 100 168 150 170 210'
  return (
    <svg viewBox="0 0 200 410" className="mfig" role="img" aria-label={`Measurement guide, ${fields.find((f) => f.id === active)?.label ?? ''} highlighted`}>
      <path d={body} className="mfig-body" />
      <path d={arms} className="mfig-arms" />
      <ellipse cx="100" cy="10" rx="11" ry="9" className="mfig-head" />
      {fields.map((f) => <g key={f.id} className={cx('mfig-mark', f.id === active && 'is-on')}>{f.mark}</g>)}
    </svg>
  )
}

const toUnit = (cm: number, u: Unit) => (u === 'cm' ? cm : Math.round((cm / 2.54) * 4) / 4)
const toCm = (v: number, u: Unit) => (u === 'cm' ? v : Math.round(v * 2.54 * 10) / 10)

export function MeasureGuide({ kind, initial, onSaved, compact }: { kind: BodyKind; initial?: MeasureProfile; onSaved?: (p: MeasureProfile) => void; compact?: boolean }) {
  const fields = FIELDS[kind]
  const upsert = useMeasurements((s) => s.upsert)
  const [unit, setUnit] = useState<Unit>(initial?.unit ?? 'cm')
  const [name, setName] = useState(initial?.name ?? '')
  const [vals, setVals] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.id, initial?.values[f.id] != null ? String(toUnit(initial.values[f.id], initial.unit === 'in' ? 'in' : 'cm')) : ''])))
  const [active, setActive] = useState(fields[0].id)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tried, setTried] = useState(false)
  const act = fields.find((f) => f.id === active)!

  const switchUnit = (u: Unit) => {
    if (u === unit) return
    setVals((v) => Object.fromEntries(Object.entries(v).map(([k, s]) => {
      const n = parseFloat(s)
      if (!s || Number.isNaN(n)) return [k, s]
      return [k, String(u === 'in' ? Math.round((n / 2.54) * 4) / 4 : Math.round(n * 2.54 * 10) / 10)]
    })))
    setUnit(u)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Give this set a name — “Me”, “Mum”, “For the sangeet”.'
    for (const f of fields) {
      const s = vals[f.id]
      if (!s) { if (f.required) e[f.id] = 'We’ll need this to cut it right.'; continue }
      const n = toCm(parseFloat(s), unit)
      if (Number.isNaN(n)) e[f.id] = 'Numbers only, please.'
      else if (n < f.min || n > f.max) e[f.id] = `That looks unusual for ${f.label.toLowerCase()} — ${toUnit(f.min, unit)}–${toUnit(f.max, unit)} ${unit} is typical. Double-check the tape?`
    }
    setErrors(e)
    return e
  }

  const filled = useMemo(() => fields.filter((f) => vals[f.id]).length, [fields, vals])

  return (
    <div className={cx('mguide', compact && 'is-compact')}>
      <div className="mguide-fig">
        <Figure kind={kind} active={active} />
        <div className="mguide-how" aria-live="polite">
          <p className="t-label">{act.label}</p>
          <p>{act.how}</p>
        </div>
      </div>
      <form className="mguide-form" noValidate onSubmit={(e) => {
        e.preventDefault(); setTried(true)
        const errs = validate()
        if (Object.keys(errs).length) { const first = Object.keys(errs)[0]; document.getElementById(`m-${first}`)?.focus(); return }
        const values = Object.fromEntries(fields.filter((f) => vals[f.id]).map((f) => [f.id, toCm(parseFloat(vals[f.id]), unit)]))
        const saved = upsert({ id: initial?.id, name: name.trim(), kind, unit, values })
        onSaved?.(saved)
      }}>
        <div className="mguide-top">
          <Input label="Whose measurements?" id="m-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Me" error={tried ? errors.name : null} maxLength={32} autoComplete="off" />
          <div className="unit-toggle" role="radiogroup" aria-label="Units">
            {(['cm', 'in'] as Unit[]).map((u) => (
              <button type="button" key={u} role="radio" aria-checked={unit === u} className={cx(unit === u && 'is-on')} onClick={() => switchUnit(u)}>{u}</button>
            ))}
          </div>
        </div>
        <p className="t-small t-muted mguide-progress"><span className="t-num">{filled}</span> of {fields.length} · the starred ones are all we need to begin; Archana confirms the rest on your video fitting.</p>
        <div className="mguide-fields">
          {fields.map((f) => (
            <label key={f.id} className={cx('mfield', active === f.id && 'is-active', errors[f.id] && tried && 'has-error')} onFocus={() => setActive(f.id)} onMouseEnter={() => setActive(f.id)}>
              <span className="mfield-label">{f.label}{f.required && <abbr title="needed to begin" aria-label="required">*</abbr>}</span>
              <span className="mfield-in">
                <input id={`m-${f.id}`} inputMode="decimal" value={vals[f.id]} onChange={(e) => setVals({ ...vals, [f.id]: e.target.value.replace(/[^\d.]/g, '') })}
                  aria-invalid={!!(errors[f.id] && tried) || undefined} aria-describedby={errors[f.id] && tried ? `m-${f.id}-e` : undefined} placeholder="—" />
                <span className="mfield-unit">{unit}</span>
              </span>
              {errors[f.id] && tried && <span id={`m-${f.id}-e`} className="mfield-err" role="alert">{errors[f.id]}</span>}
            </label>
          ))}
        </div>
        <Button type="submit" block>{initial ? 'Save changes' : 'Save these measurements'}</Button>
        <p className="t-small t-muted">Saved on this device only. Not sure about a number? Leave it — Archana measures with you on video before cutting.</p>
      </form>
    </div>
  )
}

/** Read-only "how to measure" reference: tap a measurement to see where the tape goes. */
export function MeasureHowTo({ kind }: { kind: BodyKind }) {
  const fields = FIELDS[kind]
  const [active, setActive] = useState(fields[0].id)
  return (
    <div className="howto">
      <div className="howto-fig"><Figure kind={kind} active={active} /></div>
      <ol role="list" className="howto-list">
        {fields.map((f, i) => (
          <li key={f.id}>
            <button type="button" className={cx('howto-item', active === f.id && 'is-on')} aria-pressed={active === f.id}
              onClick={() => setActive(f.id)} onMouseEnter={() => setActive(f.id)} onFocus={() => setActive(f.id)}>
              <span className="howto-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="howto-t">{f.label}{f.required && <abbr title="needed to begin" aria-label="needed to begin">*</abbr>}</span>
              <span className="howto-d">{f.how}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
