import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { gsap } from 'gsap'
import type { Product, Silhouette } from '../../lib/catalog'
import type { Device } from '../../lib/device'
import { paintFabric, paintWeaveBump, specOf } from '../../lib/fabric'

export interface ViewerApi { rotate(dir: 1 | -1): void; zoom(dir: 1 | -1): void; detail(): void; reset(): void; setAuto(on: boolean): void }

/* ───────────────────────────── geometry ───────────────────────────── */
const V2 = (r: number, y: number) => new THREE.Vector2(r, y)
const DEPTH = 0.78 // cloth over a body is oval, not round

function lathe(profile: [number, number][], opts: { segs?: number; pleats?: number; amp?: number; top?: number; front?: boolean } = {}) {
  const { segs = 96, pleats = 0, amp = 0, top = 1.1, front = false } = opts
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => V2(r, y)), segs)
  const pos = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), z = pos.getZ(i)
    const y = pos.getY(i)
    const r = Math.hypot(x, z)
    if (pleats && r > 1e-4) {
      const a = Math.atan2(x, z) // 0 = facing the camera
      const hang = THREE.MathUtils.clamp((top - y) / top, 0, 1)
      const focus = front ? Math.pow(Math.max(0, Math.cos(a)), 3) : 1
      const k = 1 + (amp * Math.sin(a * pleats) * hang * focus) / r
      x *= k; z *= k
    }
    pos.setXYZ(i, x, y, z * DEPTH)
  }
  g.computeVertexNormals()
  return g
}

/** a flat strip that follows a curve — dupattas and pallus */
function ribbon(points: [number, number, number][], width: number, opts: { segs?: number; across?: number; ripple?: number; repeat?: number } = {}) {
  const { segs = 90, across = 10, ripple = 0.018, repeat = 3 } = opts
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)))
  const verts: number[] = [], uvs: number[] = [], idx: number[] = []
  const side = new THREE.Vector3(), normal = new THREE.Vector3(), up = new THREE.Vector3(0, 0, 1)
  for (let i = 0; i <= segs; i++) {
    const u = i / segs
    const p = curve.getPointAt(u)
    const t = curve.getTangentAt(u)
    side.crossVectors(t, up)
    if (side.lengthSq() < 1e-4) side.set(1, 0, 0)
    side.normalize()
    normal.crossVectors(side, t).normalize()
    const taper = THREE.MathUtils.clamp((1.56 - p.y) / 0.42, 0.38, 1) // gathered over the shoulder
    for (let j = 0; j <= across; j++) {
      const v = j / across
      const w = (v - 0.5) * width * taper
      const rip = Math.sin(u * 40 + v * 3) * ripple * (0.4 + v)
      verts.push(p.x + side.x * w + normal.x * rip, p.y + side.y * w + normal.y * rip, p.z + side.z * w + normal.z * rip)
      uvs.push(v, u * repeat)
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < across; j++) {
    const a = i * (across + 1) + j, b = a + across + 1
    idx.push(a, b, a + 1, b, b + 1, a + 1)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function hangingCloth() {
  const g = new THREE.PlaneGeometry(1.0, 1.42, 80, 100)
  const pos = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i)
    const hang = (0.71 - y) / 1.42
    const fold = Math.sin(x * 19) * 0.025 * (0.35 + hang) + Math.sin(x * 6 + 1) * 0.03 * hang
    pos.setXYZ(i, x * (1 - hang * 0.06), y, fold)
  }
  g.computeVertexNormals()
  return g
}

type Part = { geo: THREE.BufferGeometry; mat: 'main' | 'second' | 'form' | 'brass'; pos?: [number, number, number]; sheer?: boolean }
interface Build { parts: Part[]; target: [number, number, number]; detail: { pos: [number, number, number]; target: [number, number, number] } }

const WOMAN_FORM: [number, number][] = [[0.13, 1.02], [0.12, 1.08], [0.145, 1.2], [0.17, 1.3], [0.16, 1.38], [0.15, 1.44], [0.12, 1.5], [0.05, 1.53], [0.042, 1.6], [0.05, 1.62], [0.001, 1.63]]
const MAN_FORM: [number, number][] = [[0.15, 1.0], [0.15, 1.1], [0.17, 1.25], [0.18, 1.35], [0.19, 1.44], [0.15, 1.5], [0.06, 1.54], [0.05, 1.62], [0.055, 1.64], [0.001, 1.65]]
const stand = (poleTop = 1.0): Part[] => [
  { geo: new THREE.CylinderGeometry(0.2, 0.22, 0.03, 48), mat: 'brass', pos: [0, 0.015, 0] },
  { geo: new THREE.CylinderGeometry(0.014, 0.014, poleTop, 12), mat: 'brass', pos: [0, poleTop / 2, 0] },
]
const legs = (): Part[] => [-0.075, 0.075].map((x) => ({ geo: new THREE.CylinderGeometry(0.058, 0.05, 0.62, 24), mat: 'second' as const, pos: [x, 0.33, 0] as [number, number, number] }))

function build(s: Silhouette): Build {
  const floor = { pos: [0.35, 0.3, 1.05] as [number, number, number], target: [0, 0.18, 0] as [number, number, number] }
  const dupatta = (w = 0.32): Part => ({ geo: ribbon([[0.16, 0.5, 0.2], [0.15, 1.0, 0.19], [0.13, 1.42, 0.12], [0.12, 1.53, 0], [0.13, 1.42, -0.13], [0.16, 0.9, -0.19], [0.2, 0.3, -0.21]], w), mat: 'second', sheer: true })
  switch (s) {
    case 'lehenga':
      return {
        parts: [
          { geo: lathe(WOMAN_FORM), mat: 'form' },
          { geo: lathe([[0.62, 0.02], [0.585, 0.12], [0.49, 0.35], [0.37, 0.6], [0.25, 0.85], [0.158, 1.02], [0.142, 1.07]], { pleats: 30, amp: 0.035, top: 1.05 }), mat: 'main' },
          { geo: lathe([[0.155, 1.16], [0.172, 1.24], [0.182, 1.3], [0.168, 1.38], [0.152, 1.44], [0.122, 1.5], [0.08, 1.52]]), mat: 'second' },
          dupatta(),
        ],
        target: [0, 0.82, 0], detail: floor,
      }
    case 'maternity':
      return {
        parts: [
          { geo: lathe(WOMAN_FORM), mat: 'form' },
          { geo: lathe([[0.58, 0.02], [0.52, 0.2], [0.42, 0.5], [0.3, 0.8], [0.2, 1.0], [0.18, 1.06]], { pleats: 26, amp: 0.03, top: 1.0 }), mat: 'main' },
          { geo: lathe([[0.25, 1.02], [0.225, 1.12], [0.2, 1.22], [0.19, 1.32], [0.162, 1.42], [0.122, 1.5], [0.08, 1.52]], { pleats: 14, amp: 0.012, top: 1.2 }), mat: 'second' },
        ],
        target: [0, 0.82, 0], detail: floor,
      }
    case 'saree':
      return {
        parts: [
          { geo: lathe(WOMAN_FORM), mat: 'form' },
          { geo: lathe([[0.3, 0.02], [0.28, 0.3], [0.225, 0.7], [0.16, 1.0], [0.146, 1.06]], { pleats: 44, amp: 0.02, top: 1.0, front: true }), mat: 'main' },
          { geo: lathe([[0.16, 1.2], [0.175, 1.26], [0.182, 1.31], [0.168, 1.38], [0.152, 1.44], [0.122, 1.5], [0.08, 1.52]]), mat: 'second' },
          { geo: ribbon([[-0.14, 1.02, 0.15], [-0.03, 1.2, 0.17], [0.08, 1.38, 0.13], [0.12, 1.5, 0.02], [0.14, 1.4, -0.13], [0.2, 0.95, -0.2], [0.25, 0.45, -0.23]], 0.4, { repeat: 2 }), mat: 'main' },
        ],
        target: [0, 0.82, 0], detail: { pos: [0.4, 0.35, 0.9], target: [0, 0.25, 0] },
      }
    case 'anarkali':
    case 'gown': {
      const hem = s === 'anarkali' ? 0.58 : 0.42
      return {
        parts: [
          { geo: lathe(WOMAN_FORM), mat: 'form' },
          { geo: lathe([[hem, 0.04], [hem * 0.87, 0.3], [hem * 0.62, 0.7], [0.22, 1.05], [0.155, 1.28]], { pleats: s === 'anarkali' ? 24 : 12, amp: s === 'anarkali' ? 0.04 : 0.022, top: 1.25 }), mat: 'main' },
          { geo: lathe([[0.152, 1.27], [0.176, 1.32], [0.168, 1.4], [0.152, 1.45], [0.122, 1.5], [0.08, 1.52]]), mat: 'main' },
          ...(s === 'anarkali' ? [dupatta(0.3)] : []),
        ],
        target: [0, 0.82, 0], detail: floor,
      }
    }
    case 'kurta':
      return {
        parts: [
          { geo: lathe(WOMAN_FORM), mat: 'form' },
          { geo: lathe([[0.27, 0.56], [0.25, 0.8], [0.185, 1.05], [0.168, 1.2], [0.182, 1.3], [0.168, 1.4], [0.152, 1.45], [0.122, 1.5], [0.08, 1.52]], { pleats: 10, amp: 0.012, top: 1.0 }), mat: 'main' },
          ...legs(), ...stand(0.05),
        ],
        target: [0, 0.9, 0], detail: { pos: [0.35, 0.65, 0.95], target: [0, 0.62, 0] },
      }
    case 'menswear':
      return {
        parts: [
          { geo: lathe(MAN_FORM), mat: 'form' },
          { geo: lathe([[0.215, 0.5], [0.212, 0.66]]), mat: 'second' },
          { geo: lathe([[0.25, 0.62], [0.232, 0.9], [0.205, 1.05], [0.205, 1.2], [0.215, 1.32], [0.205, 1.43], [0.172, 1.49], [0.12, 1.54], [0.062, 1.56]], { pleats: 6, amp: 0.008, top: 1.0 }), mat: 'main' },
          { geo: lathe([[0.066, 1.555], [0.064, 1.6]]), mat: 'main' },
          ...legs(), ...stand(0.05),
        ],
        target: [0, 0.9, 0], detail: { pos: [0.3, 1.35, 0.8], target: [0, 1.35, 0] },
      }
    case 'dupatta':
      return {
        parts: [
          { geo: hangingCloth(), mat: 'main', pos: [0, 0.88, 0] },
          { geo: new THREE.CylinderGeometry(0.014, 0.014, 1.24, 16).rotateZ(Math.PI / 2), mat: 'brass', pos: [0, 1.6, 0] },
          { geo: new THREE.CylinderGeometry(0.012, 0.012, 1.6, 12), mat: 'brass', pos: [-0.6, 0.8, 0] },
          { geo: new THREE.CylinderGeometry(0.012, 0.012, 1.6, 12), mat: 'brass', pos: [0.6, 0.8, 0] },
          { geo: new THREE.CylinderGeometry(0.1, 0.1, 0.02, 32), mat: 'brass', pos: [-0.6, 0.01, 0] },
          { geo: new THREE.CylinderGeometry(0.1, 0.1, 0.02, 32), mat: 'brass', pos: [0.6, 0.01, 0] },
        ],
        target: [0, 0.9, 0], detail: { pos: [0.2, 0.4, 0.75], target: [0, 0.3, 0] },
      }
    case 'suit':
    default:
      return {
        parts: [
          { geo: lathe(WOMAN_FORM), mat: 'form' },
          { geo: lathe([[0.23, 0.36], [0.205, 0.7], [0.172, 1.0], [0.162, 1.2], [0.178, 1.3], [0.162, 1.4], [0.142, 1.46], [0.1, 1.5]], { pleats: 9, amp: 0.02, top: 1.2 }), mat: 'main' },
          dupatta(0.34), ...stand(0.4),
        ],
        target: [0, 0.9, 0], detail: { pos: [0.35, 0.45, 0.85], target: [0, 0.42, 0] },
      }
  }
}

/* ───────────────────────────── scene ───────────────────────────── */
function useMaterials(p: Product) {
  const { gl } = useThree()
  return useMemo(() => {
    const spec = specOf(p)
    const tex = (canvas: HTMLCanvasElement, srgb = true) => {
      const t = new THREE.CanvasTexture(canvas)
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
      if (srgb) t.colorSpace = THREE.SRGBColorSpace
      return t
    }
    const main = paintFabric(spec)
    const secondSpec = { ...spec, base: spec.second, pattern: spec.pattern === 'plain' ? spec.pattern : spec.second === spec.base ? spec.pattern : ('butis' as const) }
    const second = paintFabric(secondSpec, 512)
    const bump = tex(paintWeaveBump(), false)
    bump.repeat.set(28, 28)
    const rep = (t: THREE.Texture, u: number) => { t.repeat.set(u, 1); return t }
    const U = p.derived.silhouette === 'dupatta' ? 1 : 4
    const cloth = (c: { colour: HTMLCanvasElement; mr: HTMLCanvasElement }, base: string, sheer = false) => new THREE.MeshPhysicalMaterial({
      map: rep(tex(c.colour), U), roughnessMap: rep(tex(c.mr, false), U), metalnessMap: rep(tex(c.mr, false), U), roughness: 1, metalness: 1,
      sheen: 0.35, sheenRoughness: 0.55, sheenColor: new THREE.Color(base).lerp(new THREE.Color('#ffffff'), 0.12),
      bumpMap: bump, bumpScale: 0.25, side: THREE.DoubleSide, envMapIntensity: 0.4,
      transparent: sheer, opacity: sheer ? 0.9 : 1,
    })
    return {
      main: cloth(main, spec.base),
      second: cloth(second, spec.second),
      secondSheer: cloth(second, spec.second, true),
      form: new THREE.MeshStandardMaterial({ color: '#e7dcc9', roughness: 0.92 }),
      brass: new THREE.MeshStandardMaterial({ color: '#b8955a', roughness: 0.32, metalness: 0.85 }),
    }
  }, [p, gl])
}

function Environment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    return () => { env.dispose(); pmrem.dispose(); scene.environment = null }
  }, [gl, scene])
  return null
}

const Rig = forwardRef<ViewerApi, { b: Build; auto: boolean; reduced: boolean }>(function Rig({ b, auto, reduced }, ref) {
  const { camera, controls } = useThree() as unknown as { camera: THREE.PerspectiveCamera; controls: OrbitControlsImpl | null }
  const home = useMemo(() => ({ pos: new THREE.Vector3(1.05, 1.1, 3.35), target: new THREE.Vector3(...b.target) }), [b])
  const fly = (pos: THREE.Vector3, target: THREE.Vector3, d = 1.1) => {
    if (!controls) return
    gsap.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: reduced ? 0 : d, ease: 'power3.inOut', onUpdate: () => controls.update() })
    gsap.to(controls.target, { x: target.x, y: target.y, z: target.z, duration: reduced ? 0 : d, ease: 'power3.inOut', onUpdate: () => controls.update() })
  }
  useImperativeHandle(ref, () => ({
    rotate(dir) {
      if (!controls) return
      const t = controls.target
      const off = camera.position.clone().sub(t)
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (dir * Math.PI) / 4)
      fly(off.applyQuaternion(q).add(t), t.clone(), 0.8)
    },
    zoom(dir) {
      if (!controls) return
      const t = controls.target
      const off = camera.position.clone().sub(t)
      const len = THREE.MathUtils.clamp(off.length() * (dir > 0 ? 0.72 : 1.35), 0.55, 4.2)
      fly(off.setLength(len).add(t), t.clone(), 0.6)
    },
    detail() { fly(new THREE.Vector3(...b.detail.pos), new THREE.Vector3(...b.detail.target), 1.3) },
    reset() { fly(home.pos.clone(), home.target.clone(), 1.1) },
    setAuto() {},
  }), [controls, camera, b, home, reduced])
  useEffect(() => { camera.position.copy(home.pos); if (controls) { controls.target.copy(home.target); controls.update() } }, [home, controls, camera])
  useFrame(() => { if (controls) controls.autoRotate = auto && !reduced })
  return null
})

function Garment({ p }: { p: Product }) {
  const b = useMemo(() => build(p.derived.silhouette), [p.derived.silhouette])
  const m = useMaterials(p)
  const group = useRef<THREE.Group>(null)
  useEffect(() => () => { b.parts.forEach((x) => x.geo.dispose()) }, [b])
  return (
    <group ref={group}>
      {b.parts.map((part, i) => (
        <mesh key={i} geometry={part.geo} material={part.sheer ? m.secondSheer : m[part.mat]} position={part.pos} castShadow receiveShadow />
      ))}
      {/* floor: a khadi disc with a soft contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[1.4, 64]} />
        <meshBasicMaterial color="#000" transparent opacity={0.16} alphaMap={shadowTex()} depthWrite={false} />
      </mesh>
    </group>
  )
}

let _shadow: THREE.Texture | null = null
function shadowTex() {
  if (_shadow) return _shadow
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(64, 64, 4, 64, 64, 64)
  r.addColorStop(0, '#fff'); r.addColorStop(0.45, '#888'); r.addColorStop(1, '#000')
  g.fillStyle = r; g.fillRect(0, 0, 128, 128)
  _shadow = new THREE.CanvasTexture(c)
  return _shadow
}

export default forwardRef<ViewerApi, { p: Product; device: Device; auto: boolean; onReady?: () => void; apiRef?: MutableRefObject<ViewerApi | null> }>(
  function GarmentViewer({ p, device, auto, onReady }, ref) {
    const [dpr, setDpr] = useState(device.budget.dpr[1])
    const b = useMemo(() => build(p.derived.silhouette), [p.derived.silhouette])
    return (
      <Canvas
        className="viewer-canvas"
        dpr={dpr}
        camera={{ position: [1.05, 1.1, 3.35], fov: 32, near: 0.05, far: 30 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 0.86 }}
        onCreated={() => onReady?.()}
        frameloop={device.reducedMotion ? 'demand' : 'always'}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[2.2, 3.2, 2.4]} intensity={1.35} color="#fff2dd" />
        <directionalLight position={[-2.4, 2.0, -2.2]} intensity={0.9} color="#cfd8ff" />
        <directionalLight position={[0, 1, 3]} intensity={0.35} />
        <Environment />
        <Garment p={p} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} autoRotateSpeed={0.9} minDistance={0.55} maxDistance={4.2}
          minPolarAngle={0.35} maxPolarAngle={Math.PI / 2 + 0.05} enablePan={false} target={b.target} />
        <Rig ref={ref} b={b} auto={auto} reduced={device.reducedMotion} />
      </Canvas>
    )
  },
)
