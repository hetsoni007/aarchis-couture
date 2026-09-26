import { useState, type CSSProperties } from 'react'
import { imgSource, type ImgFolder } from '../../lib/img'
import { cx } from '../../lib/format'
import './ui.css'

interface Props {
  folder: ImgFolder
  name: string
  alt: string
  /** responsive `sizes` — tells the browser which width to fetch per breakpoint */
  sizes: string
  /** frame aspect ratio (w/h). Defaults to the image's own ratio, so the box is reserved before load. */
  ratio?: number
  fit?: 'cover' | 'contain'
  focus?: string
  priority?: boolean
  className?: string
  style?: CSSProperties
  imgClassName?: string
}

/** <picture> with AVIF + WebP srcsets, a reserved aspect-ratio box and a tone skeleton. */
export function Img({ folder, name, alt, sizes, ratio, fit = 'cover', focus = '50% 50%', priority, className, style, imgClassName }: Props) {
  const src = imgSource(folder, name)
  const [loaded, setLoaded] = useState(false)
  const r = ratio ?? src.meta.ratio
  return (
    <span
      className={cx('img', loaded && 'is-loaded', fit === 'contain' && 'is-contain', className)}
      style={{ aspectRatio: String(r), ['--tone' as string]: src.meta.tone, ...style }}
    >
      <picture>
        <source type="image/avif" srcSet={src.avif} sizes={sizes} />
        <source type="image/webp" srcSet={src.webp} sizes={sizes} />
        <img
          src={src.fallback}
          alt={alt}
          width={src.meta.w}
          height={src.meta.h}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onLoad={() => setLoaded(true)}
          ref={(el) => { if (el?.complete && el.naturalWidth) setLoaded(true) }}
          className={imgClassName}
          style={{ objectFit: fit, objectPosition: focus }}
        />
      </picture>
    </span>
  )
}
