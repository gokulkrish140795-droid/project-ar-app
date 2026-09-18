import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GINGER_MODEL } from '../config/companionModels'
import audioEngine from '../utils/audioEngine'
import {
  applyRootStaging,
  createGltfCompanion,
  resolveCompanionGltf,
} from '../utils/gltfCharacter'
import { disposeObject3D, disposeRenderer } from '../utils/threeDispose'

const ORANGE = 0xe67a28
const CREAM = 0xfff4e2
const STRIPE = 0xc45a12

const FUR_VERT = /* glsl */ `
  varying vec3 vNormal; varying vec3 vPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPos = position;
    vec3 displaced = position + normal * (0.018 * sin(position.x * 18.0 + position.y * 14.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`
const FUR_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform vec3 uStripe;
  varying vec3 vNormal; varying vec3 vPos;
  void main() {
    float stripes = smoothstep(0.35, 0.65, sin(vPos.y * 12.0 + vPos.x * 4.0) * 0.5 + 0.5);
    vec3 col = mix(uColor, uStripe, stripes * 0.45);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 1.6);
    col += fresnel * 0.12;
    gl_FragColor = vec4(col, 1.0);
  }
`

function buildProceduralGinger() {
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

  const head = new THREE.Group()
  head.position.set(0, 0.48, 0.12)
  root.add(head)
  head.add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 22, 22), furMat.clone()))

  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 8), orangeMat)
  earL.position.set(-0.14, 0.22, 0)
  head.add(earL)
  const earR = earL.clone()
  earR.position.x = 0.14
  head.add(earR)

  const eyeL = new THREE.Group()
  eyeL.position.set(-0.09, 0.04, 0.24)
  eyeL.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0xfff8e8 })
    )
  )
  const lidL = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    orangeMat
  )
  lidL.rotation.x = Math.PI
  lidL.visible = false
  eyeL.add(lidL)
  eyeL.userData = { lid: lidL }
  head.add(eyeL)
  const eyeR = eyeL.clone()
  eyeR.position.x = 0.09
  head.add(eyeR)

  const tongue = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xff7a9a })
  )
  tongue.scale.set(0.7, 0.35, 1.2)
  tongue.position.set(0, -0.1, 0.34)
  tongue.visible = false
  head.add(tongue)

  const tail = new THREE.Group()
  tail.position.set(0.32, 0.2, -0.15)
  root.add(tail)
  const tailSegs = []
  for (let i = 0; i < 5; i += 1) {
    const seg = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 - i * 0.008, 10, 10),
      i % 2 === 0 ? orangeMat : new THREE.MeshStandardMaterial({ color: STRIPE })
    )
    seg.position.set(i * 0.1, 0, -i * 0.04)
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
    pawBL,
    pawBR,
    body,
    tongue,
    eyeL,
    eyeR,
    isGltf: false,
  }
  return root
}

function animateProceduralGinger(ginger, pose, localT, t) {
  const u = ginger.userData
  u.tail.rotation.z = Math.sin(t * 3.2) * 0.55
  u.earL.rotation.z = 0.15
  u.earR.rotation.z = -0.15
  u.tongue.visible = false
  u.body.scale.set(1.15, 0.85, 0.95)
  u.pawFL.position.set(-0.18, -0.12, 0.22)
  u.pawFR.position.set(0.18, -0.12, 0.22)
  u.pawBL.visible = true
  u.pawBR.visible = true
  u.head.rotation.set(0, 0, 0)
  if (u.eyeL?.userData?.lid) u.eyeL.userData.lid.visible = false
  if (u.eyeR?.userData?.lid) u.eyeR.userData.lid.visible = false
  ginger.position.set(0, Math.sin(t * 1.8) * 0.03, 0)
  ginger.rotation.set(0, 0.15, 0)
  ginger.scale.setScalar(1)

  if (pose === 'peek') {
    const k = Math.min(1, localT / 0.5)
    ginger.position.x = 1.1 - k * 1.1
  } else if (pose === 'walkIn') {
    const k = Math.min(1, localT / 1.2)
    ginger.position.x = 1.5 - (1 - (1 - k) ** 3) * 1.5
  } else if (pose === 'leap') {
    const k = Math.min(1, localT / 0.55)
    ginger.position.set(-0.6 + k * 0.6, 0.15 + Math.sin(k * Math.PI) * 0.55, 0)
  } else if (pose === 'stretch') {
    u.body.scale.set(1.35, 0.65, 0.9)
    ginger.position.y = -0.08
  } else if (pose === 'loaf') {
    u.body.scale.set(1.25, 0.55, 1.05)
    ginger.position.y = -0.12
    u.pawBL.visible = false
    u.pawBR.visible = false
  } else if (pose === 'lick') {
    u.head.rotation.x = 0.35
    u.tongue.visible = true
  } else if (pose === 'bat') {
    u.pawFL.position.set(-0.25, 0.15 + Math.sin(t * 9) * 0.12, 0.35)
  } else if (pose === 'roll') {
    ginger.rotation.z = Math.min(1, localT / 1.2) * Math.PI * 2
  } else if (pose === 'sleep') {
    ginger.rotation.z = 0.55
    u.eyeL.userData.lid.visible = true
    u.eyeR.userData.lid.visible = true
  } else if (pose === 'nuzzle') {
    ginger.position.x = -0.28
  } else if (pose === 'yarn') {
    ginger.rotation.z = Math.min(1, localT / 0.8) * 1.8
  } else if (pose === 'glass') {
    u.pawFL.position.set(-0.12, 0.2, 0.38)
    u.pawFR.position.set(0.12, 0.2, 0.38)
  } else if (pose === 'cheer' || pose === 'jump') {
    ginger.position.y = 0.08 + Math.abs(Math.sin(localT * 8)) * 0.1
    u.tail.rotation.z = Math.sin(t * 8) * 0.8
  } else if (pose === 'flyKiss' || pose === 'heartHands') {
    ginger.position.x = -0.22
    u.head.rotation.z = -0.15
  } else if (pose === 'winkSmile') {
    if (u.eyeL?.userData?.lid) u.eyeL.userData.lid.visible = true
    u.head.rotation.z = 0.12
  } else if (pose === 'search') {
    u.head.rotation.y = Math.sin(localT * 3) * 0.4
    ginger.position.x = Math.sin(localT * 2) * 0.12
  } else if (pose === 'magicCast') {
    u.pawFL.position.set(-0.22, 0.18 + Math.sin(t * 10) * 0.08, 0.32)
  } else if (pose === 'dance') {
    ginger.position.x = Math.sin(t * 6) * 0.1
    ginger.rotation.y = 0.15 + Math.sin(t * 5) * 0.2
  } else if (pose === 'boop') {
    ginger.position.set(-0.15, 0.08, 0.12)
    u.head.rotation.x = 0.25
    u.pawFL.position.set(-0.05, 0.22, 0.38)
  } else if (pose === 'loafOnHim') {
    u.body.scale.set(1.3, 0.5, 1.1)
    ginger.position.set(-0.35, 0.18, 0.05)
    u.pawBL.visible = false
    u.pawBR.visible = false
  } else if (pose === 'tailWrap') {
    ginger.position.x = -0.22
    u.tail.rotation.z = 1.1 + Math.sin(t * 2) * 0.2
  } else {
    u.pawFL.position.y = -0.12 + Math.max(0, Math.sin(t * 2.2)) * 0.08
  }
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

    let disposed = false
    let raf = 0
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20)
    camera.position.set(0, 0.45, 2.85)
    camera.lookAt(0, 0.25, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(size, size)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xfff0dd, 0.6))
    scene.add(new THREE.PointLight(0xffd090, 1.6, 10).translateX(1).translateY(1.5).translateZ(2))
    scene.add(new THREE.PointLight(0x6a90ff, 0.4, 8).translateX(-1.2).translateY(0.5))

    let companion = null
    let lastPose = ''
    let poseStart = 0
    const clock = new THREE.Clock()

    const mountCompanion = (node) => {
      if (companion?.root) scene.remove(companion.root)
      companion = node
      scene.add(node.root || node)
      lastPose = ''
    }

    const procedural = buildProceduralGinger()
    mountCompanion({ root: procedural, isGltf: false })

    resolveCompanionGltf(GINGER_MODEL).then((resolved) => {
      if (disposed || !resolved) return
      const gltfCompanion = createGltfCompanion(resolved.gltf, resolved.config)
      mountCompanion(gltfCompanion)
      gltfCompanion.playPose('idle')
    })

    const tick = () => {
      if (disposed) return
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime
      const p = poseRef.current
      if (p !== lastPose) {
        poseStart = t
        lastPose = p
        if (companion?.playPose) companion.playPose(p)
      }
      const localT = t - poseStart
      if (companion?.mixer) companion.mixer.update(dt)

      if (companion?.isGltf) {
        applyRootStaging(companion.root, p, localT, t)
        // Fox model faces +Z oddly — nudge yaw for cuteness
        companion.model.rotation.y = p === 'walkIn' || p === 'leap' ? Math.PI : Math.PI * 0.15
      } else if (companion?.root) {
        animateProceduralGinger(companion.root, p, localT, t)
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

  const handleTap = async (event) => {
    event.stopPropagation()
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playSfx('sfx_cat_purr')
    if (heartsOnTap) {
      const next = Array.from({ length: 8 }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        left: 28 + Math.random() * 40,
        delay: Math.random() * 0.12,
      }))
      setHearts(next)
      window.setTimeout(() => setHearts([]), 900)
    }
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
      <style>{`
        @keyframes heartRise3d {
          0% { opacity: 1; transform: translateY(0) scale(0.7); }
          100% { opacity: 0; transform: translateY(-42px) scale(1.15); }
        }
      `}</style>
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
