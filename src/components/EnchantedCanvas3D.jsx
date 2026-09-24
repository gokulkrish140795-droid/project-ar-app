import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { themeHex } from '../theme'
import { disposeObject3D, disposeRenderer } from '../utils/threeDispose'

const VELVET = themeHex.velvet
const GOLD = themeHex.gold
const MAX_LUMOS = 96

const FLAME_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
    gl_FragColor = vec4(1.0, 0.91, 0.66, a);
  }
`

/** Soft radial disc so Points/Sprites bloom instead of drawing square quads. */
function softDiscTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 30)
  glow.addColorStop(0, 'rgba(255,255,255,1)')
  glow.addColorStop(0.22, 'rgba(255,255,255,0.85)')
  glow.addColorStop(0.55, 'rgba(255,255,255,0.22)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function createBloomOrb(x, y, z, color, disc) {
  const group = new THREE.Group()
  group.position.set(x, y, z)

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 18, 18),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })
  )
  group.add(core)

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: disc,
      color,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.8,
    })
  )
  halo.scale.set(1.15, 1.15, 1)
  group.add(halo)

  const light = new THREE.PointLight(color, 0.35, 4.5, 2)
  group.add(light)
  group.userData = { baseY: y, phase: Math.random() * Math.PI * 2, light }
  return group
}

function createGodRay(x, rotZ) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uAlpha: { value: 0.1 } },
    vertexShader: FLAME_VERT,
    fragmentShader: GODRAY_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 6.2), mat)
  mesh.position.set(x, 1.4, -3.2)
  mesh.rotation.z = rotZ
  mesh.userData.mat = mat
  return mesh
}

function createLumosTrail(disc) {
  const positions = new Float32Array(MAX_LUMOS * 3)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    map: disc,
    color: 0xfff3c8,
    size: 0.28,
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
    })),
    cursor: 0,
  }
  return points
}

/**
 * Velvet stage behind the magical-phone chrome.
 * Soft bloom only — no hall clutter, wax, or square point dust.
 * @param {'gateway'|'prank'|'video'|'hunt'} mood
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
    scene.fog = new THREE.FogExp2(VELVET, 0.045)
    scene.background = new THREE.Color(VELVET)

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      40
    )
    camera.position.set(0, 1.05, 5.2)

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

    const disc = softDiscTexture()

    const ambient = new THREE.AmbientLight(0x243044, 0.55)
    scene.add(ambient)
    const key = new THREE.PointLight(GOLD, 1.15, 16, 2)
    key.position.set(-1.6, 2.8, 2.4)
    scene.add(key)
    const holo = new THREE.PointLight(themeHex.holo, 0.35, 12, 2)
    holo.position.set(2.4, 1.8, 1.2)
    scene.add(holo)
    const rim = new THREE.PointLight(themeHex.coral, 0.22, 10, 2)
    rim.position.set(0, 0.2, 3.4)
    scene.add(rim)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7.5, 64),
      new THREE.MeshStandardMaterial({
        color: 0x080e18,
        roughness: 0.92,
        metalness: 0.16,
      })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.35
    scene.add(floor)

    const inlay = new THREE.Mesh(
      new THREE.RingGeometry(1.55, 1.72, 64),
      new THREE.MeshStandardMaterial({
        color: GOLD,
        metalness: 0.85,
        roughness: 0.28,
        emissive: 0x3a2e08,
        emissiveIntensity: 0.45,
      })
    )
    inlay.rotation.x = -Math.PI / 2
    inlay.position.y = -1.33
    scene.add(inlay)

    const wash = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 9),
      new THREE.MeshBasicMaterial({
        color: 0x142033,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      })
    )
    wash.position.set(0, 1.6, -6)
    scene.add(wash)

    const godRays = [createGodRay(-1.4, 0.12), createGodRay(1.35, -0.1)]
    godRays.forEach((ray) => scene.add(ray))

    const orbs = [
      createBloomOrb(-2.2, 1.7, -1.6, GOLD, disc),
      createBloomOrb(2.3, 2.1, -2.2, themeHex.holo, disc),
      createBloomOrb(0.2, 2.6, -3.4, themeHex.floo, disc),
      createBloomOrb(-0.8, 0.9, -0.8, themeHex.goldBright, disc),
    ]
    orbs.forEach((orb) => scene.add(orb))

    const lumos = createLumosTrail(disc)
    scene.add(lumos)

    const flooCount = 180
    const flooPos = new Float32Array(flooCount * 3)
    const flooGeo = new THREE.BufferGeometry()
    flooGeo.setAttribute('position', new THREE.BufferAttribute(flooPos, 3))
    const flooMat = new THREE.PointsMaterial({
      map: disc,
      color: GOLD,
      size: 0.34,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
    const flooPoints = new THREE.Points(flooGeo, flooMat)
    flooPoints.visible = false
    flooPoints.userData = {
      particles: Array.from({ length: flooCount }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 0.4 + Math.random() * 2.6,
        speed: 0.045 + Math.random() * 0.06,
        y: (Math.random() - 0.5) * 2.2,
      })),
    }
    scene.add(flooPoints)

    const flooRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.045, 12, 48),
      new THREE.MeshBasicMaterial({
        color: GOLD,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      })
    )
    flooRing.position.set(0, 0.85, 0)
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
      gateway: { fog: 0.04, exposure: 1.08, ambient: 0.55, rim: 0.22, bg: new THREE.Color(VELVET) },
      prank: { fog: 0.048, exposure: 1.06, ambient: 0.48, rim: 0.4, bg: new THREE.Color(0x0b1220) },
      video: { fog: 0.055, exposure: 0.92, ambient: 0.32, rim: 0.16, bg: new THREE.Color(0x060b14) },
      hunt: { fog: 0.046, exposure: 1.02, ambient: 0.46, rim: 0.2, bg: new THREE.Color(0x0b1220) },
    }
    const flooFogColor = new THREE.Color(0x1c2418)
    const baseFogColor = new THREE.Color(VELVET)

    const spawnLumos = (x, y, z, burst = 3) => {
      const sparks = lumos.userData.sparks
      for (let i = 0; i < burst; i += 1) {
        const idx = lumos.userData.cursor % MAX_LUMOS
        lumos.userData.cursor += 1
        const spark = sparks[idx]
        spark.alive = true
        spark.life = 1
        spark.x = x + (Math.random() - 0.5) * 0.06
        spark.y = y + (Math.random() - 0.5) * 0.06
        spark.z = z + (Math.random() - 0.5) * 0.06
        spark.vx = (Math.random() - 0.5) * 0.012
        spark.vy = 0.008 + Math.random() * 0.018
        spark.vz = (Math.random() - 0.5) * 0.012
      }
    }

    const onPointer = (event) => {
      const touch = event.touches ? event.touches[0] : event
      if (!touch) return
      pointerNDC.x = (touch.clientX / window.innerWidth) * 2 - 1
      pointerNDC.y = -(touch.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(pointerNDC, camera)
      if (raycaster.ray.intersectPlane(trailPlane, hit)) {
        spawnLumos(hit.x, hit.y, hit.z, lumosRef.current ? 5 : 2)
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
      ambient.intensity += (mt.ambient + intensity * 0.2 - ambient.intensity) * 0.05
      rim.intensity += (mt.rim - rim.intensity) * 0.05
      scene.background.lerp(mt.bg, 0.04)
      key.intensity = 0.7 + intensity * 0.7

      for (const orb of orbs) {
        const { baseY, phase, light } = orb.userData
        orb.position.y = baseY + Math.sin(t * 0.7 + phase) * 0.12
        light.intensity = 0.28 + Math.sin(t * 1.6 + phase) * 0.08
      }

      for (const ray of godRays) {
        ray.userData.mat.uniforms.uTime.value = t
        ray.userData.mat.uniforms.uAlpha.value = 0.06 + intensity * 0.08
      }

      inlay.rotation.z = t * 0.03

      const sparks = lumos.userData.sparks
      const lPos = lumos.geometry.attributes.position.array
      for (let i = 0; i < MAX_LUMOS; i += 1) {
        const spark = sparks[i]
        if (!spark.alive) {
          lPos[i * 3 + 1] = -99
          continue
        }
        spark.life -= 0.02
        spark.x += spark.vx
        spark.y += spark.vy
        spark.z += spark.vz
        if (spark.life <= 0) {
          spark.alive = false
          lPos[i * 3 + 1] = -99
        } else {
          lPos[i * 3] = spark.x
          lPos[i * 3 + 1] = spark.y
          lPos[i * 3 + 2] = spark.z
        }
      }
      lumos.geometry.attributes.position.needsUpdate = true

      const flooTarget = flooRef.current ? 1 : 0
      flooBlend += (flooTarget - flooBlend) * 0.08
      flooPoints.visible = flooBlend > 0.05
      flooRing.material.opacity = flooBlend * 0.7
      flooRing.rotation.x = t * 1.4
      flooRing.rotation.z = t * 0.7
      flooRing.scale.setScalar(1 + flooBlend * 0.35)

      if (flooBlend > 0.05) {
        const fp = flooPoints.userData.particles
        const arr = flooPoints.geometry.attributes.position.array
        for (let i = 0; i < flooCount; i += 1) {
          const p = fp[i]
          p.angle += p.speed * (1 + flooBlend)
          p.radius *= 0.992
          if (p.radius < 0.25) p.radius = 0.6 + Math.random() * 2.4
          arr[i * 3] = Math.cos(p.angle) * p.radius
          arr[i * 3 + 1] = p.y + Math.sin(p.angle * 2) * 0.2
          arr[i * 3 + 2] = Math.sin(p.angle) * p.radius * 0.5 - flooBlend * 1.2
        }
        flooPoints.geometry.attributes.position.needsUpdate = true
        flooMat.color.setHex(Math.sin(t * 6) > 0 ? themeHex.goldBright : GOLD)
        scene.fog.color.copy(baseFogColor).lerp(flooFogColor, flooBlend * 0.45)
      } else {
        scene.fog.color.copy(baseFogColor)
      }

      camera.position.x = Math.sin(t * 0.1) * 0.08
      camera.position.y = 1.05 + flooBlend * 0.2
      camera.position.z = 5.2 - flooBlend * 1.8
      camera.lookAt(0, 0.55, -flooBlend)

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
      className="ar-stage-canvas"
    />
  )
}
