import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { MINIME_MODEL } from '../config/companionModels'
import audioEngine from '../utils/audioEngine'
import {
  applyRootStaging,
  createGltfCompanion,
  resolveCompanionGltf,
} from '../utils/gltfCharacter'
import { disposeObject3D, disposeRenderer } from '../utils/threeDispose'

const GOLD = '#D4AF37'
const SKIN = 0xf1c27d
const CARDIGAN = 0x3d2a5c
const HAIR = 0x1a1228

function buildProceduralMiniMe() {
  const root = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.32, 0.42, 6, 12),
    new THREE.MeshStandardMaterial({ color: CARDIGAN, roughness: 0.78, metalness: 0.08 })
  )
  body.position.y = 0.15
  root.add(body)

  const head = new THREE.Group()
  head.position.y = 0.72
  root.add(head)

  head.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 24, 24),
      new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55 })
    )
  )

  const makeEye = (x) => {
    const eye = new THREE.Group()
    eye.position.set(x, 0.04, 0.28)
    const white = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.35 })
    )
    white.scale.set(1, 1.15, 0.7)
    eye.add(white)
    const iris = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0x2c1810 })
    )
    iris.position.z = 0.04
    eye.add(iris)
    const lid = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55 })
    )
    lid.rotation.x = Math.PI
    lid.visible = false
    eye.add(lid)
    eye.userData = { lid }
    return eye
  }
  const leftEye = makeEye(-0.11)
  const rightEye = makeEye(0.11)
  head.add(leftEye)
  head.add(rightEye)

  const mouthGroup = new THREE.Group()
  mouthGroup.position.set(0, -0.12, 0.3)
  head.add(mouthGroup)
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.07, 0.012, 8, 20, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xc45c6a, roughness: 0.45 })
  )
  smile.rotation.x = Math.PI
  mouthGroup.add(smile)
  const mouthOpen = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x5a2030, roughness: 0.6 })
  )
  mouthOpen.scale.set(1.1, 0.15, 0.7)
  mouthOpen.position.y = -0.02
  mouthOpen.visible = false
  mouthGroup.add(mouthOpen)

  const stud = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.035, 0),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.05,
      emissive: 0xaadfff,
      emissiveIntensity: 0.8,
    })
  )
  stud.position.set(0.34, -0.02, 0.05)
  head.add(stud)

  const armL = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.07, 0.28, 4, 8),
    new THREE.MeshStandardMaterial({ color: CARDIGAN, roughness: 0.78 })
  )
  armL.position.set(-0.4, 0.2, 0)
  armL.rotation.z = 0.35
  root.add(armL)
  const armR = armL.clone()
  armR.position.set(0.4, 0.2, 0)
  armR.rotation.z = -0.35
  root.add(armR)

  const handL = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 10, 10),
    new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55 })
  )
  handL.position.set(-0.48, -0.02, 0.05)
  root.add(handL)
  const handR = handL.clone()
  handR.position.set(0.48, -0.02, 0.05)
  root.add(handR)

  const chain = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.018, 8, 28),
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.25,
      emissive: 0x3a2e08,
      emissiveIntensity: 0.35,
    })
  )
  chain.rotation.x = Math.PI / 2.2
  chain.position.y = 0.28
  root.add(chain)

  root.userData = {
    head,
    mouth: mouthGroup,
    smile,
    mouthOpen,
    leftEye,
    rightEye,
    stud,
    armL,
    armR,
    handL,
    handR,
    body,
    chain,
    isGltf: false,
  }
  return root
}

function animateProcedural(mini, pose, localT, t, talking) {
  const u = mini.userData
  const floatY = Math.sin(t * 1.6) * 0.05
  const breath = 1 + Math.sin(t * 2.1) * 0.02
  mini.position.set(0, floatY, 0)
  mini.rotation.set(0, 0, 0)
  mini.scale.setScalar(1)
  u.armL.rotation.set(0, 0, 0.35)
  u.armR.rotation.set(0, 0, -0.35)
  u.handL.position.set(-0.48, -0.02, 0.05)
  u.handR.position.set(0.48, -0.02, 0.05)
  u.body.scale.set(breath, 1 + Math.sin(t * 2.1) * 0.015, breath)
  u.smile.scale.set(1, 1, 1)
  u.mouthOpen.visible = false
  u.head.rotation.set(0, 0, 0)
  u.leftEye.scale.y = 1
  u.rightEye.scale.y = 1

  const amp =
    talking || pose === 'talk'
      ? Math.max(audioEngine.getLipAmplitude(), 0.08 + Math.abs(Math.sin(t * 12)) * 0.15)
      : 0
  if (amp > 0.05) {
    u.mouthOpen.visible = true
    u.mouthOpen.scale.set(1.1, 0.15 + amp * 1.8, 0.7)
    u.smile.scale.set(1, 0.4, 1)
  }

  if (pose === 'peek') {
    const k = Math.min(1, localT / 0.45)
    mini.position.x = -1.2 + k * 1.2
    mini.rotation.y = 0.35 * (1 - k)
  } else if (pose === 'walkIn') {
    const k = Math.min(1, localT / 1.1)
    const ease = 1 - (1 - k) ** 3
    mini.position.x = -1.6 + ease * 1.6
    u.armL.rotation.x = Math.sin(k * Math.PI * 4) * 0.4
    u.armR.rotation.x = -Math.sin(k * Math.PI * 4) * 0.4
  } else if (pose === 'smile') {
    u.smile.scale.set(1.25, 1.15, 1)
    u.leftEye.scale.y = 0.82
    u.rightEye.scale.y = 0.82
  } else if (pose === 'lean') {
    mini.rotation.z = 0.18
    mini.position.x = 0.22
    u.armR.rotation.x = -0.85
    u.handR.position.set(0.55, 0.15, 0.25)
  } else if (pose === 'yarn') {
    mini.rotation.z = -0.18
    u.armR.rotation.set(-0.6, 0, -1.1)
  } else if (pose === 'scratch') {
    mini.position.x = 0.12
    u.armR.rotation.set(-0.9, 0, -0.2)
  } else if (pose === 'bump') {
    mini.position.x = 0.18
  } else if (pose === 'glass') {
    mini.scale.setScalar(1.05)
    u.handL.position.z = 0.28
    u.handR.position.z = 0.28
  } else {
    u.head.rotation.y = Math.sin(t * 0.55) * 0.12
  }

  u.stud.material.emissiveIntensity = 0.4 + (0.5 + Math.sin(t * 6) * 0.5) * 0.8
  u.chain.rotation.z = Math.sin(t * 1.8) * 0.04
}

export default function MiniMeAvatar3D({
  speech = '',
  showSpeech = false,
  pose = 'idle',
  size = 140,
  peek = false,
  talking = false,
  onFaceTap,
  disabled = false,
  ariaLabel = 'Gokul-Mage',
}) {
  const mountRef = useRef(null)
  const bubbleRef = useRef(null)
  const poseRef = useRef(pose)
  const peekRef = useRef(peek)
  const talkingRef = useRef(talking)
  poseRef.current = pose
  peekRef.current = peek
  talkingRef.current = talking

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    let disposed = false
    let raf = 0
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20)
    camera.position.set(0, 0.55, 3.4)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(size, size + 24)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const key = new THREE.PointLight(0xffe0a0, 1.7, 12)
    key.position.set(1.2, 1.8, 2.4)
    scene.add(key)
    scene.add(new THREE.PointLight(0x88aaff, 0.5, 8).translateX(-1.5).translateY(0.4))
    scene.add(new THREE.PointLight(0xd4af37, 0.65, 6).translateY(0.8).translateZ(-1.5))

    let companion = null
    let lastPose = ''
    let poseStart = 0
    let blinkT = 2 + Math.random() * 2
    let blinking = false
    let blinkAge = 0
    const clock = new THREE.Clock()
    const mouthWorld = new THREE.Vector3()
    const mouthNdc = new THREE.Vector3()

    const mountCompanion = (node) => {
      if (companion?.root) scene.remove(companion.root)
      companion = node
      scene.add(node.root || node)
      lastPose = ''
    }

    // Instant procedural, upgrade to GLB when ready
    const procedural = buildProceduralMiniMe()
    mountCompanion({ root: procedural, mouth: procedural.userData.mouth, isGltf: false })

    resolveCompanionGltf(MINIME_MODEL).then((resolved) => {
      if (disposed || !resolved) return
      const gltfCompanion = createGltfCompanion(resolved.gltf, resolved.config)
      mountCompanion(gltfCompanion)
      gltfCompanion.playPose('idle')
    })

    const tick = () => {
      if (disposed) return
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime
      const p = peekRef.current ? 'peek' : poseRef.current
      if (p !== lastPose) {
        poseStart = t
        lastPose = p
        if (companion?.playPose) companion.playPose(p)
      }
      const localT = t - poseStart

      if (companion?.mixer) companion.mixer.update(dt)

      if (companion?.isGltf) {
        applyRootStaging(companion.root, p, localT, t)
        // Jaw / mouth flap on GLB
        if (companion.mouth && companion.mouth !== companion.model) {
          const amp =
            talkingRef.current || p === 'talk' ? Math.max(audioEngine.getLipAmplitude(), 0.1) : 0
          companion.mouth.rotation.x = -amp * 0.45
        }
      } else if (companion?.root) {
        animateProcedural(companion.root, p, localT, t, talkingRef.current)
        const u = companion.root.userData
        blinkT -= 0.016
        if (blinkT <= 0 && !blinking) {
          blinking = true
          blinkAge = 0
          blinkT = 2.2 + Math.random() * 3
        }
        if (blinking) {
          blinkAge += 0.016
          const closed = blinkAge < 0.08 || (blinkAge > 0.1 && blinkAge < 0.16)
          u.leftEye.userData.lid.visible = closed
          u.rightEye.userData.lid.visible = closed
          if (blinkAge > 0.2) blinking = false
        }
      }

      const mouthObj = companion?.mouth || companion?.root?.userData?.mouth
      if (mouthObj && bubbleRef.current) {
        mouthObj.getWorldPosition(mouthWorld)
        mouthNdc.copy(mouthWorld).project(camera)
        bubbleRef.current.style.left = `${((mouthNdc.x + 1) / 2) * size}px`
        bubbleRef.current.style.top = `${((1 - mouthNdc.y) / 2) * (size + 24)}px`
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

  return (
    <div style={{ position: 'relative', width: size, height: size + 24, flexShrink: 0 }}>
      <style>{`
        @keyframes mouthBubble3d {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      {showSpeech && speech && (
        <div
          ref={bubbleRef}
          role="status"
          style={{
            position: 'absolute',
            left: size * 0.58,
            top: size * 0.28,
            width: 220,
            transformOrigin: '8px 100%',
            transform: 'translate(4px, -100%)',
            animation: 'mouthBubble3d 0.35s cubic-bezier(0.2, 1.4, 0.3, 1) both',
            zIndex: 4,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 251, 247, 0.94)',
              color: '#3B2414',
              border: `1px solid ${GOLD}`,
              borderRadius: 14,
              padding: '10px 12px',
              fontSize: 12,
              lineHeight: 1.4,
              boxShadow: '0 10px 22px rgba(0,0,0,0.28)',
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {speech}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onFaceTap}
        disabled={disabled || !onFaceTap}
        aria-label={ariaLabel}
        style={{
          position: 'absolute',
          inset: 0,
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: onFaceTap && !disabled ? 'pointer' : 'default',
        }}
      >
        <div ref={mountRef} style={{ width: size, height: size + 24, pointerEvents: 'none' }} />
      </button>
    </div>
  )
}
