import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import audioEngine from '../utils/audioEngine'
import { disposeObject3D, disposeRenderer } from '../utils/threeDispose'

const ORANGE = 0xe67a28
const CREAM = 0xfff4e2
const STRIPE = 0xc45a12

const FUR_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPos = position;
    vec3 displaced = position + normal * (0.018 * sin(position.x * 18.0 + position.y * 14.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`

const FUR_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uStripe;
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    float stripes = smoothstep(0.35, 0.65, sin(vPos.y * 12.0 + vPos.x * 4.0) * 0.5 + 0.5);
    vec3 col = mix(uColor, uStripe, stripes * 0.45);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 1.6);
    col += fresnel * 0.12;
    gl_FragColor = vec4(col, 1.0);
  }
`

function buildGinger() {
  const root = new THREE.Group()

  const furMat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(ORANGE) },
      uStripe: { value: new THREE.Color(STRIPE) },
    },
    vertexShader: FUR_VERT,
    fragmentShader: FUR_FRAG,
  })

  const creamMat = new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.7 })
  const orangeMat = new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.65 })

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 24), furMat)
  body.scale.set(1.15, 0.85, 0.95)
  body.position.y = 0.15
  root.add(body)

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), creamMat)
  belly.position.set(0, 0.05, 0.22)
  belly.scale.set(1, 1.1, 0.6)
  root.add(belly)

  const head = new THREE.Group()
  head.position.set(0, 0.48, 0.12)
  root.add(head)

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.28, 22, 22), furMat.clone())
  head.add(skull)

  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), creamMat)
  muzzle.position.set(0, -0.06, 0.2)
  muzzle.scale.set(1.1, 0.85, 0.9)
  head.add(muzzle)

  const makeEar = (x) => {
    const ear = new THREE.Group()
    ear.position.set(x, 0.22, 0)
    const outer = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.2, 8),
      orangeMat
    )
    ear.add(outer)
    const inner = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.12, 8),
      creamMat
    )
    inner.position.y = -0.02
    inner.position.z = 0.02
    ear.add(inner)
    return ear
  }
  const earL = makeEar(-0.14)
  const earR = makeEar(0.14)
  head.add(earL)
  head.add(earR)

  const makeEye = (x) => {
    const eye = new THREE.Group()
    eye.position.set(x, 0.04, 0.24)
    const white = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0xfff8e8, roughness: 0.3 })
    )
    white.scale.set(1, 1.2, 0.65)
    eye.add(white)
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x1a0c06 })
    )
    pupil.position.z = 0.035
    pupil.scale.set(0.7, 1.3, 1)
    eye.add(pupil)
    const shine = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    )
    shine.position.set(0.015, 0.02, 0.06)
    eye.add(shine)
    return eye
  }
  head.add(makeEye(-0.09))
  head.add(makeEye(0.09))

  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xf4a0b5, roughness: 0.45 })
  )
  nose.position.set(0, -0.02, 0.32)
  nose.scale.set(1.1, 0.7, 0.8)
  head.add(nose)

  const tail = new THREE.Group()
  tail.position.set(0.32, 0.2, -0.15)
  root.add(tail)
  const tailSegs = []
  for (let i = 0; i < 5; i += 1) {
    const seg = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 - i * 0.008, 10, 10),
      i % 2 === 0 ? orangeMat : new THREE.MeshStandardMaterial({ color: STRIPE, roughness: 0.7 })
    )
    seg.position.set(i * 0.1, Math.sin(i * 0.4) * 0.05, -i * 0.04)
    tail.add(seg)
    tailSegs.push(seg)
  }

  const pawFL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), creamMat)
  pawFL.position.set(-0.18, -0.12, 0.22)
  root.add(pawFL)
  const pawFR = pawFL.clone()
  pawFR.position.set(0.18, -0.12, 0.22)
  root.add(pawFR)
  const pawBL = pawFL.clone()
  pawBL.position.set(-0.2, -0.15, -0.15)
  root.add(pawBL)
  const pawBR = pawFL.clone()
  pawBR.position.set(0.2, -0.15, -0.15)
  root.add(pawBR)

  root.userData = {
    head,
    earL,
    earR,
    tail,
    tailSegs,
    pawFL,
    pawFR,
    body,
  }
  return root
}

export default function GingerCat3D({
  pose = 'idle',
  size = 120,
  onTap,
  heartsOnTap = true,
}) {
  const mountRef = useRef(null)
  const poseRef = useRef(pose)
  const [hearts, setHearts] = useState([])
  poseRef.current = pose

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20)
    camera.position.set(0, 0.35, 2.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(size, size)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const key = new THREE.PointLight(0xffd090, 1.4, 8)
    key.position.set(1, 1.5, 2)
    scene.add(key)
    const fill = new THREE.PointLight(0xa0c4ff, 0.4, 6)
    fill.position.set(-1.2, 0.5, 1.2)
    scene.add(fill)

    const ginger = buildGinger()
    scene.add(ginger)

    // Yarn ball for yarn pose
    const yarn = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 14, 14),
      new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        emissive: 0xd4af37,
        emissiveIntensity: 0.45,
        metalness: 0.4,
        roughness: 0.4,
      })
    )
    yarn.visible = false
    scene.add(yarn)

    const clock = new THREE.Clock()
    let raf = 0
    let disposed = false
    let poseStart = 0
    let lastPose = pose

    const tick = () => {
      if (disposed) return
      const t = clock.getElapsedTime()
      const p = poseRef.current
      if (p !== lastPose) {
        poseStart = t
        lastPose = p
      }
      const localT = t - poseStart

      // Tail swish
      ginger.userData.tail.rotation.z = Math.sin(t * 3.2) * 0.55
      ginger.userData.tail.rotation.y = Math.sin(t * 2.1) * 0.25
      ginger.userData.tailSegs.forEach((seg, i) => {
        seg.position.y = Math.sin(t * 3.2 + i * 0.5) * 0.04
      })

      // Ear twitch
      const twitch = t % 4.8
      const earKick = twitch > 4.2 && twitch < 4.55 ? Math.sin((twitch - 4.2) * 20) * 0.35 : 0
      ginger.userData.earL.rotation.z = 0.15 + earKick
      ginger.userData.earR.rotation.z = -0.15 - earKick * 0.7

      // Paw bat at fireflies
      ginger.userData.pawFL.position.y = -0.12 + Math.max(0, Math.sin(t * 2.2)) * 0.08
      ginger.userData.pawFL.rotation.z = Math.sin(t * 2.2) * 0.4

      ginger.position.set(0, Math.sin(t * 1.8) * 0.04, 0)
      ginger.rotation.set(0, 0.15, 0)
      ginger.scale.setScalar(1)
      yarn.visible = false

      if (p === 'leap') {
        const u = Math.min(1, localT / 0.55)
        const arc = Math.sin(u * Math.PI)
        ginger.position.set(-0.6 + u * 0.6, 0.15 + arc * 0.55, 0)
        ginger.rotation.z = -0.3 + u * 0.3
        ginger.rotation.x = -0.2 * arc
      } else if (p === 'sit') {
        ginger.position.y = -0.05
        ginger.rotation.x = 0.15
        ginger.userData.head.rotation.x = -0.1
      } else if (p === 'yarn') {
        const u = Math.min(1, localT / 0.8)
        ginger.position.set(0.1 * u, -0.05 + Math.sin(u * Math.PI) * 0.2, 0)
        ginger.rotation.z = u * 1.8
        yarn.visible = true
        yarn.position.set(-0.35 + u * 0.5, 0.4 - u * 0.35, 0.2)
        yarn.rotation.y = t * 8
      } else if (p === 'scratch') {
        ginger.userData.head.rotation.z = Math.sin(t * 8) * 0.08
        const glow = 0.5 + Math.sin(t * 6) * 0.5
        key.intensity = 1.4 + glow * 0.6
      } else if (p === 'bump') {
        const u = Math.min(1, localT / 0.55)
        ginger.position.x = -0.22 * Math.sin(u * Math.PI)
      } else if (p === 'glass') {
        ginger.position.y = 0.02
        ginger.scale.setScalar(1.08)
        ginger.userData.pawFL.position.set(-0.12, 0.2, 0.38)
        ginger.userData.pawFR.position.set(0.12, 0.2, 0.38)
        ginger.userData.pawFL.scale.setScalar(1.3)
        ginger.userData.pawFR.scale.setScalar(1.3)
      } else {
        ginger.userData.head.rotation.set(0, 0, 0)
        ginger.userData.pawFL.position.set(-0.18, -0.12, 0.22)
        ginger.userData.pawFR.position.set(0.18, -0.12, 0.22)
        ginger.userData.pawFL.scale.setScalar(1)
        ginger.userData.pawFR.scale.setScalar(1)
        key.intensity = 1.4
      }

      renderer.render(scene, camera)
      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)

    return () => {
      disposed = true
      window.cancelAnimationFrame(raf)
      disposeObject3D(scene)
      disposeRenderer(renderer)
    }
  }, [size])

  const burstHearts = () => {
    const next = Array.from({ length: 8 }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      left: 28 + Math.random() * 40,
      delay: Math.random() * 0.12,
    }))
    setHearts(next)
    window.setTimeout(() => setHearts([]), 900)
  }

  const handleTap = async (event) => {
    event.stopPropagation()
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playSfx('sfx_cat_purr')
    if (heartsOnTap) burstHearts()
    if (onTap) onTap()
  }

  return (
    <button
      type="button"
      aria-label="Ginger the cat"
      onClick={handleTap}
      style={{
        position: 'relative',
        width: size,
        height: size,
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        overflow: 'visible',
      }}
    >
      <style>
        {`
          @keyframes heartRise3d {
            0% { opacity: 1; transform: translateY(0) scale(0.7); }
            100% { opacity: 0; transform: translateY(-42px) scale(1.15); }
          }
        `}
      </style>
      <div ref={mountRef} style={{ width: size, height: size, pointerEvents: 'none' }} />
      {hearts.map((heart) => (
        <span
          key={heart.id}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: heart.left,
            bottom: 40,
            fontSize: 14,
            animation: `heartRise3d 0.85s ease ${heart.delay}s both`,
            pointerEvents: 'none',
          }}
        >
          💕
        </span>
      ))}
    </button>
  )
}
