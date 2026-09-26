import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Device } from '../../lib/device'

export const AMBIENT_MODES = ['gold-drape', 'ribbon', 'bandhani-bloom', 'woven-grid', 'colour-burst', 'geometric', 'pastel-bloom'] as const
export type AmbientMode = (typeof AMBIENT_MODES)[number]

/* One full-screen fragment shader, seven looms. Cheap by design: no geometry, no
   post-processing, DPR capped at 1 — the header is atmosphere, not the product. */
const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`
const frag = /* glsl */ `
  precision highp float;
  uniform float uTime, uAspect;
  uniform int uMode;
  uniform vec2 uPointer;
  varying vec2 vUv;

  float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  vec2 h22(vec2 p) { float n = h21(p); return vec2(n, h21(p + n)); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
  }

  const vec3 KAJAL = vec3(0.082, 0.067, 0.059);
  const vec3 ZARI = vec3(0.863, 0.761, 0.557);
  const vec3 SINDOOR = vec3(0.631, 0.184, 0.114);

  // 0 — bridal: zari dust settling in a curtain, with soft drape folds behind
  vec3 goldDrape(vec2 uv, vec2 p) {
    float folds = 0.5 + 0.5 * sin(uv.x * 22.0 + sin(uv.y * 3.0 + uTime * 0.2) * 1.8);
    float light = smoothstep(0.9, 0.0, abs(uv.x - 0.62)) * smoothstep(1.1, 0.2, uv.y);
    vec3 cloth = mix(vec3(0.2, 0.05, 0.03), vec3(0.52, 0.13, 0.07), folds * (0.45 + 0.55 * light));
    vec3 col = mix(KAJAL, cloth, 0.35 + 0.5 * light);
    col += ZARI * pow(folds, 8.0) * light * 0.12;
    for (int L = 0; L < 3; L++) {
      float fl = float(L);
      vec2 g = uv * vec2(18.0 + fl * 10.0, 10.0 + fl * 6.0);
      g.y += uTime * (0.35 + fl * 0.25);
      vec2 id = floor(g);
      vec2 r = h22(id);
      vec2 f = fract(g) - 0.5 - (r - 0.5) * 0.7;
      f.x += sin(uTime * 0.8 + r.x * 6.28) * 0.12;
      float d = length(f * vec2(1.0, 0.6));
      float tw = 0.5 + 0.5 * sin(uTime * (1.5 + r.y * 3.0) + r.x * 30.0);
      float glow = smoothstep(0.08 - fl * 0.015, 0.0, d) * step(0.45, r.y) * tw;
      col += ZARI * glow * (1.0 - fl * 0.25);
    }
    float near = exp(-dot(p - uPointer, p - uPointer) * 6.0);
    return col + ZARI * near * 0.12;
  }

  // 1 — sarees: six-yard ribbons of light in slow travel
  vec3 ribbons(vec2 uv, vec2 p) {
    vec3 col = mix(KAJAL, vec3(0.13, 0.06, 0.08), uv.y);
    vec3 pal[4];
    pal[0] = vec3(0.83, 0.16, 0.42); pal[1] = vec3(0.89, 0.41, 0.12); pal[2] = ZARI; pal[3] = vec3(0.36, 0.23, 0.55);
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float y = 0.2 + fi * 0.15 + 0.08 * sin(uv.x * (2.2 + fi * 0.4) + uTime * (0.25 + fi * 0.05) + fi * 1.7)
              + 0.04 * sin(uv.x * 7.0 - uTime * 0.4 + fi) + (uPointer.y - 0.0) * 0.03;
      float w = 0.03 + 0.015 * sin(uv.x * 3.0 + fi + uTime * 0.3);
      float d = abs(uv.y - y);
      float band = smoothstep(w, w * 0.2, d);
      float sheen = 0.5 + 0.5 * cos((uv.y - y) / w * 3.1416 + uv.x * 4.0 - uTime);
      vec3 c = pal[i - (i / 4) * 4];
      col = mix(col, c * (0.55 + 0.6 * sheen), band * 0.9);
      col += ZARI * smoothstep(w * 0.08, 0.0, abs(d - w * 0.85)) * 0.35;         // zari edge
    }
    return col;
  }

  // 2 — dupattas: tied dots opening like flowers
  vec3 bandhani(vec2 uv, vec2 p) {
    vec3 col = mix(vec3(0.32, 0.05, 0.05), vec3(0.55, 0.1, 0.16), uv.y);
    vec2 g = p * 16.0;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5 + (h22(id) - 0.5) * 0.25;
    float r = h21(id);
    float near = exp(-dot(id / 16.0 - uPointer, id / 16.0 - uPointer) * 12.0);
    float bloom = 0.5 + 0.5 * sin(uTime * 0.9 + r * 6.28);
    bloom = clamp(bloom + near * 0.8, 0.0, 1.4);
    float d = length(f);
    float core = smoothstep(0.07 + bloom * 0.05, 0.03, d);
    float ring = smoothstep(0.02, 0.0, abs(d - (0.14 + bloom * 0.14))) * bloom;
    vec3 dotc = mix(vec3(0.97, 0.9, 0.78), vec3(0.93, 0.72, 0.24), step(0.7, r));
    col = mix(col, dotc, core * 0.95);
    col += dotc * ring * 0.35;
    return col;
  }

  // 3 — dress material: calm plain weave that ripples under the hand
  vec3 woven(vec2 uv, vec2 p) {
    vec2 q = p;
    float dp = distance(q, uPointer);
    q += normalize(q - uPointer + 1e-4) * sin(dp * 40.0 - uTime * 3.0) * 0.006 * exp(-dp * 5.0);
    vec2 g = q * vec2(110.0, 110.0);
    vec2 id = floor(g); vec2 f = fract(g);
    float over = mod(id.x + id.y, 2.0);
    float warp = smoothstep(0.5, 0.25, abs(f.x - 0.5));
    float weft = smoothstep(0.5, 0.25, abs(f.y - 0.5));
    vec3 warpC = vec3(0.2, 0.14, 0.11), weftC = vec3(0.4, 0.42, 0.2);
    float bandw = smoothstep(0.35, 0.65, 0.5 + 0.5 * sin(p.x * 3.0 + 0.6));
    weftC = mix(weftC, vec3(0.5, 0.58, 0.64), bandw * 0.7);
    vec3 c = over > 0.5 ? mix(weftC * 0.7, warpC, warp) : mix(warpC * 0.7, weftC, weft);
    float shade = over > 0.5 ? warp : weft;
    vec3 col = c * (0.55 + 0.45 * shade);
    col += ZARI * smoothstep(0.004, 0.0, abs(fract(p.y * 3.0 + 0.1) - 0.5) - 0.18) * 0.06;
    return mix(col, KAJAL, 0.5);
  }

  // 4 — ethnic & festive: garba-night pops of haldi, rani and teal
  vec3 bursts(vec2 uv, vec2 p) {
    vec3 col = KAJAL * 1.2;
    vec3 pal[4];
    pal[0] = vec3(0.85, 0.6, 0.16); pal[1] = vec3(0.8, 0.12, 0.42); pal[2] = vec3(0.12, 0.6, 0.6); pal[3] = vec3(0.75, 0.2, 0.12);
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float period = 3.2 + fi * 0.45;
      float t = mod(uTime + fi * 1.3, period) / period;
      float cycle = floor((uTime + fi * 1.3) / period);
      vec2 c = vec2(0.15 + 0.7 * h21(vec2(fi, cycle)), 0.15 + 0.7 * h21(vec2(cycle, fi + 3.0)));
      c.x *= uAspect;
      vec2 d = p - c;
      float r = length(d);
      float ang = atan(d.y, d.x);
      float petals = 0.5 + 0.5 * cos(ang * 12.0 + fi);
      float radius = t * (0.28 + 0.1 * petals);
      float ring = smoothstep(0.012, 0.0, abs(r - radius)) * (1.0 - t);
      float spark = smoothstep(0.02, 0.0, abs(r - radius * 0.7)) * step(0.8, petals) * (1.0 - t);
      col += pal[i - (i / 4) * 4] * (ring * 1.1 + spark * 0.8);
    }
    float twirl = 0.5 + 0.5 * sin(atan(p.y - 0.5, p.x - uAspect * 0.5) * 16.0 + uTime * 0.6);
    col += vec3(0.85, 0.6, 0.16) * twirl * 0.03;
    return col;
  }

  // 5 — men's ethnic: an indigo jaali lattice that slowly turns
  vec3 jaali(vec2 uv, vec2 p) {
    vec3 col = mix(vec3(0.07, 0.09, 0.15), vec3(0.12, 0.16, 0.25), uv.y);
    vec2 c = p - vec2(uAspect * 0.5, 0.5);
    float a = uTime * 0.03;
    c = mat2(cos(a), -sin(a), sin(a), cos(a)) * c;
    vec2 g = c * 9.0;
    vec2 f = fract(g) - 0.5;
    float d1 = abs(abs(f.x) + abs(f.y) - 0.5);               // diamonds
    float d2 = abs(length(f) - 0.28);                          // rosettes
    float d3 = min(abs(f.x), abs(f.y));                        // cross rails
    float line = smoothstep(0.03, 0.0, d1) + smoothstep(0.02, 0.0, d2) * 0.7 + smoothstep(0.012, 0.0, d3) * 0.35;
    float near = exp(-dot(p - uPointer, p - uPointer) * 5.0);
    vec3 silver = vec3(0.72, 0.76, 0.84);
    col += mix(silver, ZARI, near) * line * (0.18 + 0.5 * near);
    return col;
  }

  // 6 — baby shower & maternity: rose and mint breathing
  vec3 pastel(vec2 uv, vec2 p) {
    vec3 rose = vec3(0.93, 0.74, 0.76), mint = vec3(0.76, 0.88, 0.82), cream = vec3(0.97, 0.94, 0.9), lilac = vec3(0.84, 0.8, 0.92);
    vec3 col = cream;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      vec2 c = vec2(uAspect * (0.15 + 0.18 * fi) + 0.08 * sin(uTime * 0.2 + fi), 0.5 + 0.3 * sin(uTime * 0.17 + fi * 2.1));
      float r = 0.22 + 0.06 * sin(uTime * 0.5 + fi * 1.3);
      float m = smoothstep(r, 0.0, distance(p, c));
      vec3 tint = i == 0 ? rose : i == 1 ? mint : i == 2 ? lilac : i == 3 ? rose : mint;
      col = mix(col, tint, m * 0.75);
    }
    float petal = noise(p * 6.0 + uTime * 0.05);
    col = mix(col, col * 1.04, petal);
    float near = exp(-dot(p - uPointer, p - uPointer) * 8.0);
    return mix(col, rose, near * 0.25);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * uAspect, uv.y);
    vec3 col;
    if (uMode == 0) col = goldDrape(uv, p);
    else if (uMode == 1) col = ribbons(uv, p);
    else if (uMode == 2) col = bandhani(uv, p);
    else if (uMode == 3) col = woven(uv, p);
    else if (uMode == 4) col = bursts(uv, p);
    else if (uMode == 5) col = jaali(uv, p);
    else col = pastel(uv, p);
    // film of warp threads over every mode — the house signature
    float warp = smoothstep(0.0015, 0.0, abs(fract(uv.x * 24.0) - 0.5) - 0.497);
    col += ZARI * warp * 0.05;
    gl_FragColor = vec4(col, 1.0);
  }
`

function Quad({ mode, device }: { mode: AmbientMode; device: Device }) {
  const { size } = useThree()
  const pointer = useRef(new THREE.Vector2(0.5, 0.5))
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, depthTest: false, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uAspect: { value: 1 }, uMode: { value: AMBIENT_MODES.indexOf(mode) }, uPointer: { value: new THREE.Vector2(0.5, 0.5) } },
  }), [mode])
  useFrame((state) => {
    const u = mat.uniforms
    u.uTime.value = device.reducedMotion ? 4 : state.clock.elapsedTime
    u.uAspect.value = size.width / size.height
    const tx = ((state.pointer.x + 1) / 2) * (size.width / size.height)
    const ty = (state.pointer.y + 1) / 2
    pointer.current.x += (tx - pointer.current.x) * 0.06
    pointer.current.y += (ty - pointer.current.y) * 0.06
    u.uPointer.value.copy(pointer.current)
  })
  return (
    <mesh frustumCulled={false} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}

export default function Ambient({ mode, device, eventSource }: { mode: AmbientMode; device: Device; eventSource?: React.RefObject<HTMLElement | null> }) {
  const holder = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '80px' })
    if (holder.current) io.observe(holder.current)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={holder} className="ambient-canvas">
      <Canvas
        dpr={1}
        frameloop={visible && !device.reducedMotion ? 'always' : 'demand'}
        gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
        eventSource={eventSource as React.RefObject<HTMLElement>}
        eventPrefix="client"
        aria-hidden="true"
      >
        <Quad mode={mode} device={device} />
      </Canvas>
    </div>
  )
}
