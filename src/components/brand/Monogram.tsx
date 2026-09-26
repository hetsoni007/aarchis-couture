/**
 * The Arch-A. A pointed mehrab (ogee) arch holding a Bodoni-contrast "A"; the A's
 * crossbar is a single zari thread that runs out past the right leg and ends in a
 * knot; a bindu crowns the arch like a kalash finial.
 */
export const ARCH_PATH = 'M6 64 V31 C6 21 13.5 15.2 18.6 11.4 C21.6 9.1 23.2 7.1 24 4.6 C24.8 7.1 26.4 9.1 29.4 11.4 C34.5 15.2 42 21 42 31 V64'

interface Props {
  size?: number | string
  className?: string
  title?: string
  /** colours: ink for arch + letter, thread for zari parts */
  ink?: string
  thread?: string
  /** draw-on animation (used by the loader and 404) */
  animated?: boolean
}

export function Monogram({ size = 40, className, title, ink = 'currentColor', thread = 'var(--zari)', animated }: Props) {
  return (
    <svg
      viewBox="0 -2 48 68"
      width={size}
      height={typeof size === 'number' ? (size * 68) / 48 : undefined}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      data-animated={animated || undefined}
    >
      <path className="mg-arch" d={ARCH_PATH} fill="none" stroke={ink} strokeWidth="1.4" strokeLinecap="round" />
      {/* bindu finial */}
      <rect className="mg-bindu" x="22.3" y="-1.1" width="3.4" height="3.4" transform="rotate(45 24 0.6)" fill={thread} />
      {/* the A: hairline left leg, heavy right leg, bracketed serifs */}
      <path className="mg-a" d="M24 17.2 L13.4 55.4" stroke={ink} strokeWidth="1.15" strokeLinecap="square" fill="none" />
      <path className="mg-a" d="M24 17.2 L34.6 55.4" stroke={ink} strokeWidth="3.3" strokeLinecap="butt" fill="none" />
      <path className="mg-a" d="M10.6 55.9 H16.4 M31.6 55.9 H38.4" stroke={ink} strokeWidth="1.1" fill="none" />
      {/* crossbar thread → knot */}
      <path className="mg-thread" d="M11.2 45.2 C16.8 42.2 21.2 46.8 26.2 44.1 S34.2 40.6 38.2 42.6" fill="none" stroke={thread} strokeWidth="1.15" strokeLinecap="round" />
      <circle className="mg-knot" cx="39.7" cy="43.5" r="1.35" fill="none" stroke={thread} strokeWidth="0.95" />
    </svg>
  )
}

/** Hidden SVG defs: the mehrab clip-path in objectBoundingBox units, usable by any element. */
export function BrandDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="mehrab" clipPathUnits="objectBoundingBox">
          <path d="M0 1 V0.43 C0 0.28 0.19 0.19 0.33 0.12 C0.42 0.075 0.475 0.04 0.5 0 C0.525 0.04 0.58 0.075 0.67 0.12 C0.81 0.19 1 0.28 1 0.43 V1 Z" />
        </clipPath>
        <clipPath id="mehrab-soft" clipPathUnits="objectBoundingBox">
          <path d="M0 1 V0.5 C0 0.22 0.22 0.02 0.5 0 C0.78 0.02 1 0.22 1 0.5 V1 Z" />
        </clipPath>
      </defs>
    </svg>
  )
}
