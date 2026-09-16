import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { disposeObject3D, disposeRenderer } from '../utils/threeDispose'

const GOLD = '#D4AF37'
const SKIN = 0xf1c27d
const CARDIGAN = 0x3d2a5c
const HAIR = 0x1a1228

function buildMiniMe() {
  const root = new THREE.Group()

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.32, 0.42, 6, 12),
    new THREE.MeshStandardMaterial({
      color: CARDIGAN,
      roughness: 0.78,
      metalness: 0.08,
    })
  )
  body.position.y = 0.15
  root.add(body)

  // Cardigan collar
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.05, 8, 20),
    new THREE.MeshStandardMaterial({ color: 0x2a1b42, roughness: 0.7 })
  )
  collar.rotation.x = Math.PI / 2
  collar.position.y = 0.42
  root.add(collar)

  // Gold chain
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

  const pendant = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffe08a,
      metalness: 1,
      roughness: 0.15,
      emissive: 0xd4af37,
      emissiveIntensity: 0.5,
    })
  )
  pendant.position.set(0, 0.12, 0.18)
  root.add(pendant)

  const head = new THREE.Group()
  head.position.y = 0.72
  root.add(head)

  const skull = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 24, 24),
    new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55 })
  )
  head.add(skull)

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.9 })
  )
  hair.position.y = 0.06
  head.add(hair)

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
      new THREE.MeshStandardMaterial({
        color: 0x2c1810,
        emissive: 0x1a0c08,
        emissiveIntensity: 0.2,
      })
    )
    iris.position.z = 0.04
    eye.add(iris)
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    )
    spark.position.set(0.02, 0.025, 0.08)
    eye.add(spark)
    const lid = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55 })
    )
    lid.rotation.x = Math.PI
    lid.position.y = 0.02
    lid.visible = false
    eye.add(lid)
    eye.userData = { lid, iris }
    return eye
  }

  const leftEye = makeEye(-0.11)
  const rightEye = makeEye(0.11)
  head.add(leftEye)
  head.add(rightEye)

  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xe0a86a, roughness: 0.6 })
  )
  nose.position.set(0, -0.02, 0.33)
  nose.scale.set(0.8, 1, 0.9)
  head.add(nose)

  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xc45c6a, roughness: 0.5 })
  )
  mouth.position.set(0, -0.12, 0.3)
  mouth.rotation.x = Math.PI
  head.add(mouth)

  // Diamond stud earring
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

  root.userData = {
    head,
    mouth,
    leftEye,
    rightEye,
    stud,
    armL,
    armR,
    handL,
    handR,
    body,
  }
  return root
}

export default function MiniMeAvatar3D({
  speech = '',
  showSpeech = false,
  pose = 'idle',
  size = 140,
  peek = false,
  onFaceTap,
  disabled = false,
  ariaLabel = 'Gokul-Mage',
}) {
  const mountRef = useRef(null)
  const bubbleRef = useRef(null)
  const poseRef = useRef(pose)
  const peekRef = useRef(peek)
  poseRef.current = pose
  peekRef.current = peek

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20)
    camera.position.set(0, 0.45, 3.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(size, size + 24)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.65)
    scene.add(ambient)
    const key = new THREE.PointLight(0xffe0a0, 1.6, 10)
    key.position.set(1.2, 1.8, 2.4)
    scene.add(key)
    const fill = new THREE.PointLight(0x88aaff, 0.5, 8)
    fill.position.set(-1.5, 0.4, 1.5)
    scene.add(fill)
    const rim = new THREE.PointLight(0xd4af37, 0.7, 6)
    rim.position.set(0, 0.8, -1.5)
    scene.add(rim)

    const mini = buildMiniMe()
    scene.add(mini)

    const clock = new THREE.Clock()
    let blinkT = 2 + Math.random() * 2
    let blinking = false
    let blinkAge = 0
    let raf = 0
    let disposed = false
    const mouthWorld = new THREE.Vector3()
    const mouthNdc = new THREE.Vector3()

    const tick = () => {
      if (disposed) return
      const t = clock.getElapsedTime()
      const p = poseRef.current

      const floatY = Math.sin(t * 1.6) * 0.06
      const breath = 1 + Math.sin(t * 2.1) * 0.02
      mini.position.y = floatY
      mini.userData.body.scale.set(breath, 1 + Math.sin(t * 2.1) * 0.015, breath)

      mini.rotation.set(0, 0, 0)
      mini.position.x = 0
      if (peekRef.current) {
        mini.position.x = -0.15 + Math.min(1, t * 2) * 0.15
        mini.rotation.z = -0.12
      } else if (p === 'yarn') {
        mini.rotation.z = -0.18
        mini.position.y = floatY + 0.12
        mini.userData.armR.rotation.z = -1.1
        mini.userData.armR.rotation.x = -0.6
      } else if (p === 'scratch') {
        mini.rotation.z = 0.12
        mini.position.x = 0.12
        mini.userData.armR.rotation.z = -0.2
        mini.userData.armR.rotation.x = -0.9
      } else if (p === 'bump') {
        mini.position.x = 0.18
      } else if (p === 'glass') {
        mini.position.y = floatY * 0.3 + 0.04
        mini.scale.setScalar(1.05)
        mini.userData.handL.position.z = 0.28
        mini.userData.handR.position.z = 0.28
        mini.userData.handL.scale.setScalar(1.25)
        mini.userData.handR.scale.setScalar(1.25)
      } else {
        mini.scale.setScalar(1)
        mini.userData.armR.rotation.z = -0.35
        mini.userData.armR.rotation.x = 0
        mini.userData.handL.position.z = 0.05
        mini.userData.handR.position.z = 0.05
        mini.userData.handL.scale.setScalar(1)
        mini.userData.handR.scale.setScalar(1)
      }

      blinkT -= 0.016
      if (blinkT <= 0 && !blinking) {
        blinking = true
        blinkAge = 0
        blinkT = 2.5 + Math.random() * 3
      }
      if (blinking) {
        blinkAge += 0.016
        const closed = blinkAge < 0.08 || (blinkAge > 0.1 && blinkAge < 0.16)
        mini.userData.leftEye.userData.lid.visible = closed
        mini.userData.rightEye.userData.lid.visible = closed
        if (blinkAge > 0.2) blinking = false
      }

      const spark = 0.5 + Math.sin(t * 6) * 0.5
      mini.userData.stud.material.emissiveIntensity = 0.4 + spark * 0.8
      mini.userData.stud.rotation.y = t * 2
      mini.userData.stud.rotation.x = t * 1.4

      // Anchor speech bubble to projected 3D mouth (DOM, no React setState)
      mini.userData.mouth.getWorldPosition(mouthWorld)
      mouthNdc.copy(mouthWorld).project(camera)
      const ax = ((mouthNdc.x + 1) / 2) * size
      const ay = ((1 - mouthNdc.y) / 2) * (size + 24)
      if (bubbleRef.current) {
        bubbleRef.current.style.left = `${ax}px`
        bubbleRef.current.style.top = `${ay}px`
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
    <div
      style={{
        position: 'relative',
        width: size,
        height: size + 24,
        flexShrink: 0,
      }}
    >
      <style>
        {`
          @keyframes mouthBubble3d {
            from { opacity: 0; transform: scale(0); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>

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
          <span
            aria-hidden="true"
            style={{
              display: 'block',
              width: 12,
              height: 12,
              marginLeft: 10,
              marginTop: -7,
              background: 'rgba(255, 251, 247, 0.94)',
              borderRight: `1px solid ${GOLD}`,
              borderBottom: `1px solid ${GOLD}`,
              transform: 'rotate(45deg)',
            }}
          />
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
