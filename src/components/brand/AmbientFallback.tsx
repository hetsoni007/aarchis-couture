import type { AmbientMode } from '../three/Ambient'
import { BandhaniField, JaalPattern } from './Motifs'

/** Static, art-directed stand-ins for each category loom — no WebGL needed. */
export function AmbientFallback({ mode }: { mode: AmbientMode }) {
  return (
    <div className={`ambient-fb ambient-fb--${mode}`} aria-hidden="true">
      {mode === 'bandhani-bloom' && <BandhaniField color="#f4e6c6" opacity={0.55} cell={26} />}
      {mode === 'geometric' && <JaalPattern color="#b9c0d4" opacity={0.25} size={60} />}
      {mode === 'gold-drape' && <BandhaniField color="#dcc28e" opacity={0.28} cell={34} />}
      {mode === 'pastel-bloom' && <BandhaniField color="#c9788a" opacity={0.14} cell={30} />}
    </div>
  )
}
