import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from './Icon'
import { cx } from '../../lib/format'
import './ui.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'night'
type Size = 'sm' | 'md' | 'lg'

interface Common {
  variant?: Variant
  size?: Size
  icon?: IconName
  iconRight?: IconName
  busy?: boolean
  block?: boolean
  cursor?: string
  className?: string
  children?: ReactNode
  label?: string // required for icon-only
}
type AsButton = Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { to?: undefined; href?: undefined }
type AsLink = Common & { to: string; href?: undefined; onClick?: () => void; disabled?: boolean; state?: unknown }
type AsAnchor = Common & { href: string; to?: undefined; onClick?: () => void; disabled?: boolean; external?: boolean }
export type ButtonProps = AsButton | AsLink | AsAnchor

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(props, ref) {
  const { variant = 'primary', size = 'md', icon, iconRight, busy, block, cursor, className, children, label, ...rest } = props
  const cls = cx('btn', `btn-${variant}`, `btn-${size}`, block && 'btn-block', busy && 'is-busy', className)
  const inner = (
    <>
      {icon && <Icon name={icon} size={size === 'sm' ? 18 : 20} className="btn-ic" />}
      {variant !== 'icon' && <span className="btn-label">{children}</span>}
      {variant === 'icon' && <span className="sr-only">{label}</span>}
      {iconRight && <Icon name={iconRight} size={18} className="btn-ic btn-ic-r" />}
      {busy && <span className="btn-busy" aria-hidden="true"><i /></span>}
    </>
  )
  const common = { className: cls, 'data-cursor': cursor, 'aria-busy': busy || undefined, title: variant === 'icon' ? label : undefined }

  if ('to' in rest && rest.to !== undefined) {
    const { to, onClick, disabled, state } = rest as AsLink
    return (
      <Link ref={ref as React.Ref<HTMLAnchorElement>} to={to} state={state} onClick={onClick} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : undefined} {...common}>
        {inner}
      </Link>
    )
  }
  if ('href' in rest && rest.href !== undefined) {
    const { href, onClick, disabled, external = true } = rest as AsAnchor
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} onClick={onClick} aria-disabled={disabled || undefined}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...common}>
        {inner}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    )
  }
  const { type = 'button', disabled, ...btn } = rest as AsButton
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type={type} disabled={disabled || busy} aria-disabled={disabled || undefined} {...btn} {...common}>
      {inner}
    </button>
  )
})
