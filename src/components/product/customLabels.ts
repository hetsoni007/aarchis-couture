import { STUDIO_PALETTE, fitKindFor, type Product } from '../../lib/catalog'
import type { Customisation, FitMode } from '../../store/bag'
import { useMeasurements } from '../../store/measurements'

export const FIT_LABEL: Record<FitMode, string> = {
  video: 'Measured with Archana on video',
  profile: 'Saved measurements',
  standard: 'Standard size',
  none: 'One size — no measurements needed',
  unstitched: 'Unstitched fabric',
  tailored: 'Tailored to my measurements',
}

export const colourName = (id: string) => STUDIO_PALETTE.find((c) => c.id === id)?.name ?? id

export function describeCustom(p: Product, c: Customisation): string[] {
  const out = [c.colour === 'as-photographed' ? 'Colour as photographed' : colourName(c.colour)]
  if (c.fabric && c.fabric !== 'As photographed') out.push(c.fabric)
  if (c.fit === 'standard' && c.size) out.push(`Size ${c.size}`)
  else if (c.fit === 'profile') {
    const prof = useMeasurements.getState().profiles.find((x) => x.id === c.profileId)
    out.push(prof ? `Measurements: ${prof.name}` : 'Saved measurements')
  } else out.push(FIT_LABEL[c.fit])
  if (fitKindFor(p) === 'none' && c.fit !== 'none') out.push('One size')
  return out
}

export function defaultCustom(p: Product): Customisation {
  const kind = fitKindFor(p)
  return {
    colour: 'as-photographed',
    fabric: 'As photographed',
    fit: kind === 'none' ? 'none' : kind === 'unstitched' ? 'unstitched' : 'video',
  }
}

/** Items whose fit still needs a decision at checkout */
export const needsMeasuring = (c: Customisation) => c.fit === 'video' || c.fit === 'profile' || c.fit === 'tailored'
