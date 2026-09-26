import { cx } from '../../lib/format'
import './brand.css'

/** The storefront wordmark: AARCHI'S in tracked Cormorant, "by Archana Soni" set small beneath. */
export function Logo({ className, compact, light }: { className?: string; compact?: boolean; light?: boolean }) {
  return (
    <span className={cx('logo', compact && 'is-compact', light && 'is-light', className)}>
      <span className="sr-only">Aarchi's by Archana Soni</span>
      <span className="logo-name" aria-hidden="true">AARCHI<span className="logo-apos">’</span>S</span>
      {!compact && <span className="logo-by" aria-hidden="true">by Archana Soni</span>}
    </span>
  )
}
