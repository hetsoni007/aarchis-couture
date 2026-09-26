import { useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import type { Device } from '../../lib/device'

/* ─────────────────────────── cloth ─────────────────────────── */
const clothVert = /* glsl */ `
  uniform float uTime, uProg, uH, uW, uPower;
  uniform vec2 uPointer;
  varying vec2 vUv;
  varying vec3 vWorld;
  varying float vHang;
  void main() {
    vUv = uv;
    vec3 p = position;
    float t = uTime;
    float hang = clamp((0.5 * uH - p.y) / uH, 0.0, 1.0);           // 0 at the rod, 1 at the hem
    float pleat = sin(p.x * 3.2 + t * 0.5) * 0.15 + sin(p.x * 7.6 - t * 0.7 + p.y * 0.9) * 0.05 + sin(p.x * 1.3 - t * 0.3) * 0.08;
    float sway  = sin(p.y * 1.3 + t * 0.62) * 0.07 + sin(t * 0.33 + p.x * 0.4) * 0.05;
    p.z += (pleat + sway) * (0.25 + hang * 1.1);
    // the cloth answers the hand: a travelling ripple around the pointer
    float d = distance(p.xy, uPointer);
    p.z += exp(-d * d * 1.6) * (0.28 + 0.1 * sin(d * 7.0 - t * 4.2)) * uPower;
    // scroll: the hem lifts toward you, then the whole drape falls away
    float lift = smoothstep(0.0, 0.55, uProg);
    float fall = smoothstep(0.45, 1.0, uProg);
    p.z += lift * hang * hang * 1.4;
    p.y -= fall * (0.6 + hang * 2.2);
    p.x += fall * sin(p.y * 1.2 + t) * 0.12 * hang;
    vHang = hang;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`
const clothFrag = /* glsl */ `
  uniform vec3 uBase, uDeep, uZari, uCam;
  uniform float uTime, uWeave, uProg;
  varying vec2 vUv;
  varying vec3 vWorld;
  varying float vHang;

  float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

  // jaal: an ogee lattice — two offset sine rails crossing
  float jaal(vec2 uv) {
    vec2 g = uv * vec2(11.0, 13.0);
    vec2 f = fract(g) - 0.5;
    float a = abs(f.x - 0.3 * sin(f.y * 6.2832));
    float b = abs(f.x + 0.3 * sin(f.y * 6.2832));
    float line = min(a, b);
    float buti = smoothstep(0.075, 0.02, length(f * vec2(1.0, 0.7)));
    return smoothstep(0.022, 0.0, line) * 0.55 + buti * 0.9;
  }
  // bandhani: tied dots in the field
  float dots(vec2 uv) {
    vec2 g = uv * vec2(46.0, 32.0);
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5 + (vec2(hash(id.x + id.y * 57.0), hash(id.y + id.x * 13.0)) - 0.5) * 0.35;
    float r = 0.11 + 0.05 * hash(id.x * 3.0 + id.y);
    return smoothstep(r, r - 0.06, length(f)) * step(0.55, hash(id.x * 7.0 + id.y * 3.0));
  }

  void main() {
    // weave-in: weft rows appear from the hem upward, each thread slightly out of step
    float row = floor(vUv.y * 240.0);
    float j = hash(row) * 0.035;
    float front = uWeave * 1.1 - j;
    if (vUv.y > front) discard;

    // plain-weave microstructure (over / under)
    vec2 w = vUv * vec2(520.0, 360.0);
    float over = step(0.5, fract((floor(w.x) + floor(w.y)) * 0.5));
    float thread = mix(0.5 + 0.5 * sin(w.x * 6.2832), 0.5 + 0.5 * sin(w.y * 6.2832), over);

    vec3 N = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    vec3 V = normalize(uCam - vWorld);
    if (dot(N, V) < 0.0) N = -N;
    vec3 L = normalize(vec3(-0.75, 0.45, 0.6));
    float lambert = max(dot(N, L), 0.0);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);

    vec3 col = mix(uDeep, uBase, 0.15 + 0.85 * lambert);
    col *= 0.88 + 0.12 * thread;
    col += uBase * fres * 0.55;                                     // silk sheen at grazing angles
    col = mix(col, col * 1.18, dots(vUv) * 0.55);                    // tied dots catch a little light

    // zari: jaal in the field, a woven border at the hem, fine rails above it
    float z = jaal(vUv) * smoothstep(0.17, 0.24, vUv.y) * 0.6;
    float band = step(vUv.y, 0.1) * (0.78 + 0.22 * step(0.5, fract(vUv.x * 60.0 + floor(vUv.y * 40.0) * 0.5))) * smoothstep(0.0, 0.01, vUv.y);
    float rails = smoothstep(0.004, 0.0, abs(vUv.y - 0.125)) + smoothstep(0.003, 0.0, abs(vUv.y - 0.14));
    float zari = clamp(z + band + rails, 0.0, 1.0);
    vec3 H = normalize(L + V);
    float glint = pow(max(dot(N, H), 0.0), 48.0) * (0.6 + 0.4 * sin(uTime * 2.0 + vUv.x * 40.0));
    vec3 gold = uZari * (0.45 + 0.7 * lambert) + vec3(1.0, 0.86, 0.62) * glint * 1.6;
    col = mix(col, gold, zari * (0.75 + 0.25 * thread));

    // the live weft: a glowing zari line where the cloth is being woven
    float edge = smoothstep(0.018, 0.0, abs(vUv.y - front)) * (1.0 - step(1.05, uWeave));
    col += uZari * edge * 1.6;

    float alpha = smoothstep(0.0, 0.015, vUv.x) * smoothstep(1.0, 0.985, vUv.x) * (1.0 - smoothstep(0.85, 1.0, uProg));
    gl_FragColor = vec4(col, alpha);
  }
`

/* ─────────────────────────── warp threads ─────────────────────────── */
const warpVert = /* glsl */ `
  uniform float uTime, uPower;
  uniform vec2 uPointer;
  attribute float aSeed;
  varying float vA;
  varying float vY;
  void main() {
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    float d = abs(wp.x - uPointer.x);
    float pull = exp(-d * d * 3.0) * uPower * sign(wp.x - uPointer.x);
    float tense = 1.0 - pow(abs(wp.y) / 4.0, 2.0);                 // fixed at the beams, free in the middle
    wp.x += (pull * 0.22 + sin(uTime * 0.5 + aSeed * 6.0 + wp.y * 0.6) * 0.012) * tense;
    wp.z += sin(uTime * 0.7 + aSeed * 3.0) * 0.03 * tense;
    vA = 0.3 + 0.55 * aSeed;
    vY = wp.y;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`
const warpFrag = /* glsl */ `
  uniform vec3 uZari;
  uniform float uFade;
  varying float vA;
  varying float vY;
  void main() {
    float a = vA * smoothstep(4.2, 2.0, abs(vY)) * uFade;
    gl_FragColor = vec4(uZari, a);
  }
`

/* ─────────────────────────── zari dust ─────────────────────────── */
const dustVert = /* glsl */ `
  uniform float uTime, uPixel;
  attribute float aSeed;
  varying float vTw;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * (0.06 + aSeed * 0.08) + 4.0, 8.0) - 4.0;
    p.x += sin(uTime * 0.3 + aSeed * 20.0) * 0.15;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vTw = 0.5 + 0.5 * sin(uTime * (1.2 + aSeed * 2.0) + aSeed * 40.0);
    gl_PointSize = (1.2 + aSeed * 2.6) * uPixel * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const dustFrag = /* glsl */ `
  uniform vec3 uZari;
  varying float vTw;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d) * (0.25 + 0.75 * vTw);
    gl_FragColor = vec4(uZari * 1.3, a * 0.7);
  }
`

interface SceneProps { device: Device; progress: MutableRefObject<number>; onReady: () => void }

function LoomScene({ device, progress, onReady }: SceneProps) {
  const { viewport, camera, size, gl } = useThree()
  const clothRef = useRef<THREE.Mesh>(null)
  const pointer = useRef(new THREE.Vector2(0, 0))
  const power = useRef(0)
  const weave = useRef(device.reducedMotion ? 1.2 : 0)
  const ready = useRef(false)

  // cloth sized to the viewport: generous on desktop, taller on portrait phones
  const aspect = size.width / size.height
  const visH = 2 * 8 * Math.tan((36 * Math.PI) / 360)
  const visW = visH * aspect
  const landscape = aspect > 1.05
  const W = landscape ? Math.min(visW * 0.56, 6.2) : visW * 0.94
  const H = landscape ? visH * 0.84 : visH * 0.55
  const X = landscape ? visW * 0.16 : 0
  const Y = landscape ? 0.05 : visH * 0.12

  const cloth = useMemo(() => {
    const g = new THREE.PlaneGeometry(W, H, device.budget.clothX, device.budget.clothY)
    const m = new THREE.ShaderMaterial({
      vertexShader: clothVert, fragmentShader: clothFrag, transparent: true, side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 }, uProg: { value: 0 }, uWeave: { value: weave.current }, uPower: { value: 0 },
        uPointer: { value: new THREE.Vector2() }, uH: { value: H }, uW: { value: W },
        uBase: { value: new THREE.Color('#a8321f') }, uDeep: { value: new THREE.Color('#3a0d08') },
        uZari: { value: new THREE.Color('#d9b777') }, uCam: { value: new THREE.Vector3() },
      },
    })
    return { g, m }
  }, [W, H, device.budget.clothX, device.budget.clothY])

  const warp = useMemo(() => {
    const n = device.tier === 'low' ? 18 : 30
    const g = new THREE.PlaneGeometry(0.012, 8.4, 1, 48)
    const seeds = new Float32Array(n)
    for (let i = 0; i < n; i++) seeds[i] = Math.random()
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    const m = new THREE.ShaderMaterial({
      vertexShader: warpVert, fragmentShader: warpFrag, transparent: true, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uPower: { value: 0 }, uPointer: { value: new THREE.Vector2() }, uZari: { value: new THREE.Color('#dcc28e') }, uFade: { value: 1 } },
    })
    const mesh = new THREE.InstancedMesh(g, m, n)
    const o = new THREE.Object3D()
    const span = aspect > 1 ? 2 * 8 * Math.tan((36 * Math.PI) / 360) * aspect * 1.05 : 5.4
    for (let i = 0; i < n; i++) {
      o.position.set(-span / 2 + (span * i) / (n - 1), 0, i % 2 ? 0.55 : -0.5) // alternate in front of / behind the cloth: over, under
      o.updateMatrix()
      mesh.setMatrixAt(i, o.matrix)
    }
    return mesh
  }, [device.tier, aspect])

  const dust = useMemo(() => {
    const n = device.budget.particles
    const pos = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
      seed[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const m = new THREE.ShaderMaterial({
      vertexShader: dustVert, fragmentShader: dustFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixel: { value: gl.getPixelRatio() }, uZari: { value: new THREE.Color('#dcc28e') } },
    })
    return new THREE.Points(g, m)
  }, [device.budget.particles, gl])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const d = Math.min(dt, 1 / 30)
    // pointer → plane coordinates (z = 0), eased
    const tx = (state.pointer.x * viewport.width) / 2
    const ty = (state.pointer.y * viewport.height) / 2
    pointer.current.x += (tx - pointer.current.x) * 0.08
    pointer.current.y += (ty - pointer.current.y) * 0.08
    const moving = Math.abs(tx - pointer.current.x) + Math.abs(ty - pointer.current.y)
    power.current += ((device.finePointer ? Math.min(1, 0.35 + moving * 2) : 0.35) - power.current) * 0.05
    if (!device.reducedMotion) weave.current = Math.min(1.2, weave.current + d * 0.42)
    if (!ready.current && weave.current > 0.05) { ready.current = true; onReady() }

    const p = progress.current
    const cu = cloth.m.uniforms
    cu.uTime.value = t; cu.uProg.value = p; cu.uWeave.value = weave.current; cu.uPower.value = power.current
    cu.uPointer.value.copy(pointer.current); cu.uCam.value.copy(camera.position)
    const wu = (warp.material as THREE.ShaderMaterial).uniforms
    wu.uTime.value = t; wu.uPower.value = power.current; wu.uPointer.value.copy(pointer.current); wu.uFade.value = 1 - p * 0.6
    ;(dust.material as THREE.ShaderMaterial).uniforms.uTime.value = t

    // camera: a slow breath, a little parallax, and a dolly as you scroll
    const cx = device.finePointer ? state.pointer.x * 0.35 : Math.sin(t * 0.2) * 0.2
    const cy = device.finePointer ? state.pointer.y * 0.2 : Math.cos(t * 0.17) * 0.1
    camera.position.x += (cx - camera.position.x) * 0.04
    camera.position.y += (cy - camera.position.y + p * 0.4) * 0.04
    camera.position.z = 8 - p * 1.2
    camera.lookAt(0, -p * 0.6, 0)
    if (clothRef.current) clothRef.current.rotation.x = -0.08 - p * 0.35
  })

  return (
    <>
      <primitive object={warp} />
      <group position={[X, Y, 0]}>
        <mesh ref={clothRef} geometry={cloth.g} material={cloth.m} />
        {/* the rod the cloth hangs from */}
        <mesh position={[0, H / 2 + 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, W + 0.5, 12]} />
          <meshBasicMaterial color="#c9a660" />
        </mesh>
      </group>
      {device.budget.particles > 0 && <primitive object={dust} />}
    </>
  )
}

export default function LoomHero({ device, progress, eventSource, onReady }: {
  device: Device; progress: MutableRefObject<number>; eventSource: RefObject<HTMLElement | null>; onReady: () => void
}) {
  const [dpr, setDpr] = useState(device.budget.dpr[1])
  return (
    <Canvas
      className="loom-canvas"
      dpr={dpr}
      camera={{ position: [0, 0, 8], fov: 36, near: 0.1, far: 50 }}
      gl={{ antialias: device.tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(device.budget.dpr[1])} flipflops={3} onFallback={() => setDpr(1)} />
      <LoomScene device={device} progress={progress} onReady={onReady} />
    </Canvas>
  )
}
