import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { themeHex } from '../theme'
import { disposeObject3D, disposeRenderer } from '../utils/threeDispose'

const VELVET = themeHex.velvet
const GOLD = themeHex.gold
const FIREFLY = themeHex.firefly
const MAX_LUMOS = 160

const FLAME_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FLAME_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    float flicker = sin(uTime * 14.0 + uv.x * 8.0) * 0.08
      + sin(uTime * 23.0 + uv.y * 12.0) * 0.05;
    float shape = 1.0 - smoothstep(0.15, 0.92, length((uv - vec2(0.5, 0.18)) * vec2(1.8, 1.05)));
    float core = 1.0 - smoothstep(0.0, 0.35, length((uv - vec2(0.5, 0.28)) * vec2(2.4, 1.4)));
    vec3 col = mix(vec3(1.0, 0.35, 0.05), vec3(1.0, 0.92, 0.45), core + flicker);
    float alpha = shape * (0.55 + uIntensity * 0.45);
    gl_FragColor = vec4(col, alpha);
  }
`

const GODRAY_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uAlpha;
  varying vec2 vUv;
  void main() {
    float beam = smoothstep(0.55, 0.0, abs(vUv.x - 0.5));
    float fall = pow(1.0 - vUv.y, 1.4);
    float shimmer = 0.85 + 0.15 * sin(uTime * 1.8 + vUv.y * 10.0);
    float a = beam * fall * uAlpha * shimmer;
    gl_FragColor = vec4(1.0, 0.92, 0.65, a);
  }
`

function createCandle(x, y, z) {
  const group = new THREE.Group()
  group.position.set(x, y, z)

  const wax = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 0.55, 12),
    new THREE.MeshStandardMaterial({
      color: 0xf0d9a8,
      roughness: 0.75,
      metalness: 0.05,
      emissive: 0x3a2a10,
      emissiveIntensity: 0.15,
    })
  )
  wax.position.y = 0.1
  group.add(wax)

  const drip = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xe8c98a, roughness: 0.8 })
  )
  drip.position.y = 0.36
  drip.scale.set(1, 0.45, 1)
  group.add(drip)

  const flameMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0.7 },
    },
    vertexShader: FLAME_VERT,
    fragmentShader: FLAME_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  const flame = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.42), flameMat)
  flame.position.y = 0.58
  group.add(flame)

  const light = new THREE.PointLight(0xffb347, 1.2, 6, 2)
  light.position.y = 0.55
  group.add(light)

  group.userData = {
    flameMat,
    light,
    phase: Math.random() * Math.PI * 2,
    drift: 0.4 + Math.random() * 0.5,
    amp: 0.08 + Math.random() * 0.06,
    baseY: y,
  }
  return group
}

function createEnvelope(x, y, z) {
  const group = new THREE.Group()
  group.position.set(x, y, z)

  const paper = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.36, 0.04),
    new THREE.MeshStandardMaterial({
      color: 0xf5e6c8,
      roughness: 0.85,
      transparent: true,
      opacity: 0.82,
    })
  )
  group.add(paper)

  const flap = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.28, 3),
    new THREE.MeshStandardMaterial({ color: 0xd6b476, roughness: 0.8 })
  )
  flap.rotation.z = Math.PI
  flap.rotation.x = Math.PI / 2
  flap.position.set(0, 0.08, 0.03)
  flap.scale.set(1.1, 0.7, 0.2)
  group.add(flap)

  const seal = new THREE.Mesh(
    new THREE.CircleGeometry(0.07, 16),
    new THREE.MeshStandardMaterial({
      color: 0x9b1520,
      emissive: 0x4a0a10,
      emissiveIntensity: 0.4,
      metalness: 0.2,
      roughness: 0.5,
    })
  )
  seal.position.z = 0.03
  group.add(seal)

  group.userData = {
    spin: (Math.random() > 0.5 ? 1 : -1) * (0.25 + Math.random() * 0.35),
    phase: Math.random() * Math.PI * 2,
    drift: 0.3 + Math.random() * 0.4,
    amp: 0.12 + Math.random() * 0.1,
    baseY: y,
    vx: 0.05 + Math.random() * 0.08,
  }
  return group
}

function createSilhouette(kind) {
  const shape = new THREE.Shape()
  if (kind === 'owl') {
    shape.moveTo(0, 0)
    shape.ellipse(0, 0, 0.22, 0.12, 0, Math.PI * 2, false, 0)
  } else {
    shape.moveTo(0, 0)
    shape.quadraticCurveTo(-0.18, 0.16, -0.36, 0.02)
    shape.quadraticCurveTo(-0.12, -0.04, 0, 0)
    shape.quadraticCurveTo(0.18, 0.16, 0.36, 0.02)
    shape.quadraticCurveTo(0.12, -0.04, 0, 0)
  }

  const geo = new THREE.ShapeGeometry(shape)
  const mat = new THREE.MeshBasicMaterial({
    color: 0x06040c,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.userData = {
    kind,
    speed: kind === 'owl' ? 0.55 : 0.9 + Math.random() * 0.4,
    flap: Math.random() * Math.PI * 2,
    dir: Math.random() > 0.5 ? 1 : -1,
    baseY: 1.6 + Math.random() * 1.4,
  }
  mesh.position.set(mesh.userData.dir > 0 ? -8 : 8, mesh.userData.baseY, -4 - Math.random() * 3)
  mesh.scale.setScalar(kind === 'owl' ? 1.4 : 0.9)
  return mesh
}

function createBroom() {
  const group = new THREE.Group()
  const stick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.035, 1.1, 8),
    new THREE.MeshStandardMaterial({ color: 0x3b2414, roughness: 0.9 })
  )
  stick.rotation.z = Math.PI / 2
  group.add(stick)

  const bristles = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.45, 10),
    new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 1 })
  )
  bristles.rotation.z = -Math.PI / 2
  bristles.position.x = 0.65
  group.add(bristles)

  group.userData = { t: 0 }
  group.position.set(-10, 1.2, -3)
  group.rotation.z = -0.35
  return group
}

function createParticleSystem(count, color, size, spread = 10) {
  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * spread
    positions[i * 3 + 1] = Math.random() * 4.5 - 0.5
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.7
    phases[i] = Math.random() * Math.PI * 2
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
  const mat = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
  const points = new THREE.Points(geo, mat)
  points.userData = { phases, count, kind: 'firefly' }
  return points
}

function createLumosTrail() {
  const positions = new Float32Array(MAX_LUMOS * 3)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    color: 0xfff8e0,
    size: 0.12,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  points.userData = {
    sparks: Array.from({ length: MAX_LUMOS }, () => ({
      alive: false,
      life: 0,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      diamond: false,
    })),
    cursor: 0,
  }
  return points
}

/** Stone pillar with gold capital — builds Great Hall depth. */
function createPillar(x, z, side = 1) {
  const group = new THREE.Group()
  group.position.set(x, -1.6, z)

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.5, 0.28, 10),
    new THREE.MeshStandardMaterial({
      color: themeHex.stone,
      roughness: 0.92,
      metalness: 0.08,
    })
  )
  base.position.y = 0.14
  group.add(base)

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 3.4, 12),
    new THREE.MeshStandardMaterial({
      color: themeHex.stoneLite,
      roughness: 0.88,
      metalness: 0.05,
    })
  )
  shaft.position.y = 1.95
  group.add(shaft)

  const capital = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.18, 0.72),
    new THREE.MeshStandardMaterial({
      color: GOLD,
      metalness: 0.75,
      roughness: 0.35,
      emissive: 0x3a2e08,
      emissiveIntensity: 0.25,
    })
  )
  capital.position.y = 3.75
  group.add(capital)

  const archHint = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.06, 8, 16, Math.PI),
    new THREE.MeshStandardMaterial({
      color: GOLD,
      metalness: 0.7,
      roughness: 0.4,
      emissive: 0x2a2208,
      emissiveIntensity: 0.2,
    })
  )
  archHint.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2
  archHint.rotation.y = side > 0 ? 0.2 : -0.2
  archHint.position.set(side * 0.35, 3.55, 0)
  group.add(archHint)

  return group
}

function createGodRay(x, rotZ) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uAlpha: { value: 0.12 } },
    vertexShader: FLAME_VERT,
    fragmentShader: GODRAY_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 5.5), mat)
  mesh.position.set(x, 1.2, -2.5)
  mesh.rotation.z = rotZ
  mesh.userData.mat = mat
  return mesh
}

function createFloatingOrb(x, y, z, color) {
  const group = new THREE.Group()
  group.position.set(x, y, z)
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    })
  )
  group.add(core)
  const glow = new THREE.PointLight(color, 0.6, 4, 2)
  group.add(glow)
  group.userData = {
    baseY: y,
    phase: Math.random() * Math.PI * 2,
    light: glow,
  }
  return group
}

/**
 * Full-screen Great Hall atmosphere.
 * @param {'gateway'|'prank'|'video'|'hunt'} mood — phase-tinted lighting
 */
export default function EnchantedCanvas3D({
  lumosOn = false,
  flooActive = false,
  mood = 'gateway',
}) {
  const mountRef = useRef(null)
  const lumosRef = useRef(lumosOn)
  const flooRef = useRef(flooActive)
  const moodRef = useRef(mood)
  lumosRef.current = lumosOn
  flooRef.current = flooActive
  moodRef.current = mood

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(VELVET, 0.038)
    scene.background = new THREE.Color(VELVET)

    const camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      80
    )
    camera.position.set(0, 1.1, 5.2)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0x3a2a55, 0.5)
    scene.add(ambient)
    const studioA = new THREE.PointLight(GOLD, 1.4, 18, 2)
    studioA.position.set(-3.5, 3.2, 2)
    scene.add(studioA)
    const studioB = new THREE.PointLight(0x88aaff, 0.55, 16, 2)
    studioB.position.set(3.8, 2.4, 1.5)
    scene.add(studioB)
    const rim = new THREE.PointLight(0xff6f91, 0.35, 12, 2)
    rim.position.set(0, 0.2, 4)
    scene.add(rim)
    const hemi = new THREE.HemisphereLight(0x4a3a6a, 0x1a0e28, 0.45)
    scene.add(hemi)

    // Hall floor with gold inlay ring
    const hallFloor = new THREE.Mesh(
      new THREE.CircleGeometry(14, 64),
      new THREE.MeshStandardMaterial({
        color: 0x120a1c,
        roughness: 0.92,
        metalness: 0.08,
      })
    )
    hallFloor.rotation.x = -Math.PI / 2
    hallFloor.position.y = -1.6
    scene.add(hallFloor)

    const inlay = new THREE.Mesh(
      new THREE.RingGeometry(3.2, 3.45, 64),
      new THREE.MeshStandardMaterial({
        color: GOLD,
        metalness: 0.85,
        roughness: 0.3,
        emissive: 0x3a2e08,
        emissiveIntensity: 0.35,
      })
    )
    inlay.rotation.x = -Math.PI / 2
    inlay.position.y = -1.58
    scene.add(inlay)

    const inlayInner = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 1.55, 48),
      new THREE.MeshStandardMaterial({
        color: 0xffe5a3,
        metalness: 0.8,
        roughness: 0.35,
        emissive: 0x4a3a10,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.75,
      })
    )
    inlayInner.rotation.x = -Math.PI / 2
    inlayInner.position.y = -1.57
    scene.add(inlayInner)

    // Distant back wall for depth
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 12),
      new THREE.MeshStandardMaterial({
        color: themeHex.velvetDeep,
        roughness: 1,
        metalness: 0,
      })
    )
    backWall.position.set(0, 2.5, -8)
    scene.add(backWall)

    const pillars = [
      createPillar(-4.2, -1.5, -1),
      createPillar(4.2, -1.5, 1),
      createPillar(-5.2, -4.2, -1),
      createPillar(5.2, -4.2, 1),
    ]
    pillars.forEach((p) => scene.add(p))

    const godRays = [createGodRay(-1.8, 0.18), createGodRay(1.6, -0.15), createGodRay(0.2, 0.04)]
    godRays.forEach((g) => scene.add(g))

    const orbs = [
      createFloatingOrb(-3.2, 2.4, -2.2, GOLD),
      createFloatingOrb(3.4, 2.8, -2.8, 0xff6f91),
      createFloatingOrb(0.8, 3.2, -3.5, FIREFLY),
    ]
    orbs.forEach((o) => scene.add(o))

    const candles = [
      createCandle(-2.4, 0.9, -1.2),
      createCandle(2.6, 1.15, -1.8),
      createCandle(1.4, -0.2, 0.4),
      createCandle(-1.6, 1.8, -3.2),
    ]
    candles.forEach((c) => scene.add(c))

    const envelopes = [
      createEnvelope(-2.8, 0.2, -0.6),
      createEnvelope(2.2, 1.6, -2.2),
      createEnvelope(-1.2, 2.2, -3.5),
    ]
    envelopes.forEach((e) => scene.add(e))

    const fireflies = createParticleSystem(56, FIREFLY, 0.08, 12)
    scene.add(fireflies)
    const stardust = createParticleSystem(110, GOLD, 0.04, 16)
    stardust.userData.kind = 'stardust'
    scene.add(stardust)

    const fliers = [createSilhouette('owl'), createSilhouette('bat'), createSilhouette('bat')]
    fliers.forEach((f) => scene.add(f))

    const broom = createBroom()
    scene.add(broom)

    const lumos = createLumosTrail()
    scene.add(lumos)

    // Floo vortex
    const flooCount = 260
    const flooPos = new Float32Array(flooCount * 3)
    const flooGeo = new THREE.BufferGeometry()
    flooGeo.setAttribute('position', new THREE.BufferAttribute(flooPos, 3))
    const flooMat = new THREE.PointsMaterial({
      color: 0x50dc78,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const flooPoints = new THREE.Points(flooGeo, flooMat)
    flooPoints.visible = false
    flooPoints.userData = {
      particles: Array.from({ length: flooCount }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 0.4 + Math.random() * 3.2,
        speed: 0.05 + Math.random() * 0.07,
        y: (Math.random() - 0.5) * 2.8,
        gold: Math.random() > 0.55,
      })),
    }
    scene.add(flooPoints)

    // Floo tunnel ring
    const flooRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.08, 12, 48),
      new THREE.MeshBasicMaterial({
        color: 0x50dc78,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      })
    )
    flooRing.position.set(0, 0.8, 0)
    scene.add(flooRing)

    const pointerNDC = new THREE.Vector2(0, 0.2)
    const raycaster = new THREE.Raycaster()
    const trailPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.2)
    const hit = new THREE.Vector3()
    let intensity = lumosRef.current ? 1 : 0.28
    let flooBlend = 0
    let raf = 0
    let disposed = false

    const moodTargets = {
      gateway: { fog: 0.038, exposure: 1.05, ambient: 0.5, rim: 0.35, bg: VELVET },
      prank: { fog: 0.042, exposure: 1.12, ambient: 0.55, rim: 0.7, bg: 0x1a0a18 },
      video: { fog: 0.05, exposure: 0.92, ambient: 0.4, rim: 0.25, bg: 0x0a0814 },
      hunt: { fog: 0.034, exposure: 1.08, ambient: 0.58, rim: 0.3, bg: 0x120a1c },
    }

    const spawnLumos = (x, y, z, burst = 4) => {
      const sparks = lumos.userData.sparks
      for (let i = 0; i < burst; i += 1) {
        const idx = lumos.userData.cursor % MAX_LUMOS
        lumos.userData.cursor += 1
        const s = sparks[idx]
        s.alive = true
        s.life = 1
        s.x = x + (Math.random() - 0.5) * 0.08
        s.y = y + (Math.random() - 0.5) * 0.08
        s.z = z + (Math.random() - 0.5) * 0.08
        s.vx = (Math.random() - 0.5) * 0.02
        s.vy = 0.01 + Math.random() * 0.03
        s.vz = (Math.random() - 0.5) * 0.02
        s.diamond = Math.random() > 0.4
      }
    }

    const onPointer = (event) => {
      const touch = event.touches ? event.touches[0] : event
      if (!touch) return
      pointerNDC.x = (touch.clientX / window.innerWidth) * 2 - 1
      pointerNDC.y = -(touch.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(pointerNDC, camera)
      if (raycaster.ray.intersectPlane(trailPlane, hit)) {
        spawnLumos(hit.x, hit.y, hit.z, lumosRef.current ? 8 : 4)
      }
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    const clock = new THREE.Clock()

    const tick = () => {
      if (disposed) return
      const t = clock.getElapsedTime()
      const target = lumosRef.current ? 1 : 0.28
      intensity += (target - intensity) * 0.05

      const mt = moodTargets[moodRef.current] || moodTargets.gateway
      scene.fog.density += (mt.fog - scene.fog.density) * 0.04
      renderer.toneMappingExposure += (mt.exposure - renderer.toneMappingExposure) * 0.04
      ambient.intensity += (mt.ambient + intensity * 0.25 - ambient.intensity) * 0.05
      rim.intensity += (mt.rim - rim.intensity) * 0.05
      scene.background.lerp(new THREE.Color(mt.bg), 0.04)

      studioA.intensity = 0.7 + intensity * 1.1

      for (const candle of candles) {
        const { phase, drift, amp, baseY, flameMat, light } = candle.userData
        candle.position.y = baseY + Math.sin(t * drift + phase) * amp
        flameMat.uniforms.uTime.value = t
        flameMat.uniforms.uIntensity.value = intensity
        light.intensity = 0.55 + intensity * 1.1 + Math.sin(t * 12 + phase) * 0.15
        candle.children[2].lookAt(camera.position)
      }

      for (const env of envelopes) {
        const { spin, phase, drift, amp, baseY, vx } = env.userData
        env.rotation.y += spin * 0.016
        env.position.y = baseY + Math.sin(t * drift + phase) * amp
        env.position.x += vx * 0.016
        if (env.position.x > 5) env.position.x = -5
      }

      for (const orb of orbs) {
        const { baseY, phase, light } = orb.userData
        orb.position.y = baseY + Math.sin(t * 0.9 + phase) * 0.18
        orb.rotation.y = t * 0.4
        light.intensity = 0.4 + Math.sin(t * 2 + phase) * 0.2
      }

      for (const ray of godRays) {
        ray.userData.mat.uniforms.uTime.value = t
        ray.userData.mat.uniforms.uAlpha.value = 0.08 + intensity * 0.1
      }

      inlay.rotation.z = t * 0.04
      inlayInner.rotation.z = -t * 0.06

      const ffPos = fireflies.geometry.attributes.position.array
      const ffPhases = fireflies.userData.phases
      for (let i = 0; i < fireflies.userData.count; i += 1) {
        const i3 = i * 3
        ffPos[i3] += Math.sin(t * 0.7 + ffPhases[i]) * 0.004
        ffPos[i3 + 1] += Math.cos(t * 0.9 + ffPhases[i] * 1.3) * 0.003
        ffPos[i3 + 2] += Math.sin(t * 0.5 + ffPhases[i]) * 0.002
      }
      fireflies.geometry.attributes.position.needsUpdate = true
      fireflies.material.opacity = 0.45 + intensity * 0.45

      const sdPos = stardust.geometry.attributes.position.array
      for (let i = 0; i < stardust.userData.count; i += 1) {
        sdPos[i * 3 + 1] += 0.004
        if (sdPos[i * 3 + 1] > 4.2) sdPos[i * 3 + 1] = -1
      }
      stardust.geometry.attributes.position.needsUpdate = true

      for (const flier of fliers) {
        const d = flier.userData
        d.flap += 0.18
        flier.position.x += d.dir * d.speed * 0.028
        flier.position.y = d.baseY + Math.sin(d.flap * 0.5) * 0.15
        flier.scale.y = (d.kind === 'owl' ? 1.4 : 0.9) * (1 + Math.sin(d.flap) * 0.12)
        if (d.dir > 0 && flier.position.x > 9) flier.position.x = -9
        if (d.dir < 0 && flier.position.x < -9) flier.position.x = 9
      }

      broom.userData.t += 0.016
      broom.position.x += 0.055
      broom.position.y = 1.0 + Math.sin(broom.userData.t * 1.4) * 0.35 + broom.userData.t * 0.08
      broom.position.z = -3 + Math.sin(broom.userData.t * 0.6) * 0.4
      if (broom.position.x > 10) {
        broom.position.x = -10
        broom.userData.t = 0
      }

      const sparks = lumos.userData.sparks
      const lPos = lumos.geometry.attributes.position.array
      for (let i = 0; i < MAX_LUMOS; i += 1) {
        const s = sparks[i]
        if (!s.alive) {
          lPos[i * 3 + 1] = -99
          continue
        }
        s.life -= 0.025
        s.x += s.vx
        s.y += s.vy
        s.z += s.vz
        if (s.life <= 0) {
          s.alive = false
          lPos[i * 3 + 1] = -99
        } else {
          lPos[i * 3] = s.x
          lPos[i * 3 + 1] = s.y
          lPos[i * 3 + 2] = s.z
        }
      }
      lumos.geometry.attributes.position.needsUpdate = true
      lumos.material.size = 0.08 + intensity * 0.1
      lumos.material.color.setHex(intensity > 0.6 ? 0xfff8e0 : GOLD)

      // Floo swirl + camera dolly
      const flooTarget = flooRef.current ? 1 : 0
      flooBlend += (flooTarget - flooBlend) * 0.08
      flooPoints.visible = flooBlend > 0.05
      flooRing.material.opacity = flooBlend * 0.75
      flooRing.rotation.x = t * 1.8
      flooRing.rotation.z = t * 0.9
      flooRing.scale.setScalar(1 + flooBlend * 0.4 + Math.sin(t * 6) * 0.05)

      if (flooBlend > 0.05) {
        const fp = flooPoints.userData.particles
        const arr = flooPoints.geometry.attributes.position.array
        for (let i = 0; i < flooCount; i += 1) {
          const p = fp[i]
          p.angle += p.speed * (1 + flooBlend)
          p.radius *= 0.99
          if (p.radius < 0.2) p.radius = 0.5 + Math.random() * 3
          arr[i * 3] = Math.cos(p.angle) * p.radius
          arr[i * 3 + 1] = p.y + Math.sin(p.angle * 2) * 0.25
          arr[i * 3 + 2] = Math.sin(p.angle) * p.radius * 0.55 - flooBlend * 1.5
        }
        flooPoints.geometry.attributes.position.needsUpdate = true
        flooMat.color.setHex(Math.sin(t * 8) > 0 ? 0x50dc78 : GOLD)
        flooMat.size = 0.1 + flooBlend * 0.08
        scene.fog.color.lerp(new THREE.Color(0x0a2a18), flooBlend * 0.5)
      }

      const camZ = 5.2 - flooBlend * 2.8
      const camY = 1.1 + flooBlend * 0.35
      camera.position.x = Math.sin(t * 0.12) * 0.15 + Math.sin(t * 2.2) * flooBlend * 0.12
      camera.position.y = camY
      camera.position.z = camZ
      camera.rotation.z = Math.sin(t * 3) * flooBlend * 0.08
      camera.lookAt(0, 0.6 + flooBlend * 0.2, -flooBlend * 2)

      renderer.render(scene, camera)
      raf = window.requestAnimationFrame(tick)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('touchmove', onPointer, { passive: true })
    raf = window.requestAnimationFrame(tick)

    return () => {
      disposed = true
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('touchmove', onPointer)
      disposeObject3D(scene)
      disposeRenderer(renderer)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: '#0F0A1C',
      }}
    />
  )
}
