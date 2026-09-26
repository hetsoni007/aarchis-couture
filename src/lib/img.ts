import { images, type ImageMeta } from './catalog'

export type ImgFolder = 'p' | 'e' | 's'
export interface ImgSource { meta: ImageMeta; avif: string; webp: string; fallback: string }

export function imgSource(folder: ImgFolder, name: string): ImgSource {
  const meta = images[`${folder}/${name}`]
  if (!meta) throw new Error(`unknown image ${folder}/${name}`)
  const set = (ext: string) => meta.widths.map((w) => `/img/${folder}/${name}-${w}.${ext} ${w}w`).join(', ')
  const mid = meta.widths[Math.min(1, meta.widths.length - 1)] // a sensible <img src> for browsers without srcset
  return { meta, avif: set('avif'), webp: set('webp'), fallback: `/img/${folder}/${name}-${mid}.webp` }
}
