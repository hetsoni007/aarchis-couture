import { Monogram } from './Monogram'
import './brand.css'

interface Props { compact?: boolean; className?: string; withMark?: boolean }

/** AARCHI◆S — the apostrophe is a zari bindu. Text stays real text (accessible, crisp). */
export function Wordmark({ compact, className, withMark = true }: Props) {
  return (
    <span className={`wordmark ${compact ? 'is-compact' : ''} ${className ?? ''}`}>
      {withMark && <Monogram className="wordmark-mark" size={compact ? 22 : 30} />}
      <span className="sr-only">Aarchi's by Archana Soni</span>
      <span className="wordmark-text" aria-hidden="true">
        <span className="wordmark-name">
          AARCHI<i className="wordmark-bindu" />S
        </span>
        {!compact && <span className="wordmark-by">by Archana Soni</span>}
      </span>
    </span>
  )
}
