import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cx } from '../../lib/format'
import { Icon } from './Icon'
import './ui.css'

interface Base { label: string; hint?: ReactNode; error?: string | null; className?: string; optional?: boolean }

function Wrap({ id, label, hint, error, className, optional, children }: Base & { id: string; children: ReactNode }) {
  return (
    <div className={cx('fld', error && 'has-error', className)}>
      <label htmlFor={id} className="fld-label">
        {label}{optional && <span className="fld-opt"> (optional)</span>}
      </label>
      {children}
      {error ? <p id={`${id}-msg`} className="fld-msg is-error" role="alert">{error}</p>
        : hint ? <p id={`${id}-msg`} className="fld-msg">{hint}</p> : null}
    </div>
  )
}

export function Input({ label, hint, error, className, optional, ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const gen = useId()
  const id = rest.id ?? gen
  return (
    <Wrap id={id} label={label} hint={hint} error={error} className={className} optional={optional}>
      <input className="fld-input" aria-invalid={!!error || undefined} aria-describedby={error || hint ? `${id}-msg` : undefined} {...rest} id={id} />
    </Wrap>
  )
}

export function Textarea({ label, hint, error, className, optional, ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const gen = useId()
  const id = rest.id ?? gen
  return (
    <Wrap id={id} label={label} hint={hint} error={error} className={className} optional={optional}>
      <textarea className="fld-input fld-area" rows={3} aria-invalid={!!error || undefined} aria-describedby={error || hint ? `${id}-msg` : undefined} {...rest} id={id} />
    </Wrap>
  )
}

export function Select({ label, hint, error, className, optional, children, ...rest }: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  const gen = useId()
  const id = rest.id ?? gen
  return (
    <Wrap id={id} label={label} hint={hint} error={error} className={cx('fld-select', className)} optional={optional}>
      <span className="fld-select-wrap">
        <select className="fld-input" aria-invalid={!!error || undefined} aria-describedby={error || hint ? `${id}-msg` : undefined} {...rest} id={id}>
          {children}
        </select>
        <Icon name="chevron" size={16} className="fld-chev" />
      </span>
    </Wrap>
  )
}

/** Tile-style radio group (fit options, stitching choice, quiz answers). */
export function ChoiceGroup<T extends string>({
  legend, options, value, onChange, name, columns, hideLegend,
}: {
  legend: string; name: string; value: T | undefined; onChange: (v: T) => void
  options: { value: T; label: ReactNode; hint?: ReactNode; disabled?: boolean }[]
  columns?: number; hideLegend?: boolean
}) {
  return (
    <fieldset className="choice-group">
      <legend className={hideLegend ? 'sr-only' : 'fld-label'}>{legend}</legend>
      <div className="choice-grid" style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` } : undefined}>
        {options.map((o) => (
          <label key={o.value} className={cx('choice', value === o.value && 'is-on', o.disabled && 'is-disabled')}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} disabled={o.disabled} onChange={() => onChange(o.value)} />
            <span className="choice-dot" aria-hidden="true" />
            <span className="choice-body">
              <span className="choice-label">{o.label}</span>
              {o.hint && <span className="choice-hint">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
