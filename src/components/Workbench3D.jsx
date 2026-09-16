import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { themeHex } from '../theme'
import { disposeObject3D, disposeRenderer } from '../utils/threeDispose'

const LETTERS = 'MICROWAVE'.split('')

function makeBlock(letter, index) {
  const group = new THREE.Group()
  const wood = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.42, 0.42),
    new THREE.MeshStandardMaterial({
      color: index % 2 === 0 ? themeHex.wood : themeHex.woodLite,
      roughness: 0.78,
      metalness: 0.08,
    })
  )
  group.add(wood)

  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.44, 0.06),
    new THREE.MeshStandardMaterial({
      color: themeHex.gold,
      metalness: 0.7,
      roughness: 0.35,
      emissive: 0x2a2208,
      emissiveIntensity: 0.2,
    })
  )
  edge.position.z = 0.2
  group.add(edge)

  // Letter as extruded-looking plane with canvas texture
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#f5e6c8'
  ctx.fillRect(0, 0, 128, 128)
  ctx.fillStyle = '#3b2414'
  ctx.font = 'bold 78px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(letter, 64, 70)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.3),
    new THREE.MeshBasicMaterial({ map: tex })
  )
  face.position.z = 0.24
  group.add(face)

  group.userData = {
    baseY: 0.35 + (index % 3) * 0.08,
    phase: index * 0.7,
    spin: (index % 2 === 0 ? 1 : -1) * (0.3 + (index % 5) * 0.08),
    letter,
  }
  return group
}

function makeTrashBin() {
  const group = new THREE.Group()
  const can = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.28, 0.7, 16, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x3a4550,
      metalness: 0.65,
      roughness: 0.35,
      side: THREE.DoubleSide,
    })
  )
  can.position.y = 0.35
  group.add(can)

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.04, 8, 24),
    new THREE.MeshStandardMaterial({
      color: themeHex.gold,
      metalness: 0.8,
      roughness: 0.3,
    })
  )
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.7
  group.add(rim)

  group.position.set(1.6, 0, 0.4)
  return group
}

/** Floating wooden letter desk for hunt / anagram mood. */
export default function Workbench3D({ height = 220 }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const width = mount.clientWidth || 360
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 40)
    camera.position.set(0, 2.2, 4.2)
    camera.lookAt(0, 0.4, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffe8c8, 0.55))
    const key = new THREE.PointLight(0xffd28a, 1.4, 12)
    key.position.set(-1.5, 3, 2)
    scene.add(key)
    const fill = new THREE.PointLight(themeHex.gold, 0.7, 10)
    fill.position.set(2, 2.2, 1.5)
    scene.add(fill)

    // Wooden desk
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.18, 2.2),
      new THREE.MeshStandardMaterial({
        color: 0x4a2e16,
        roughness: 0.85,
        metalness: 0.05,
      })
    )
    desk.position.y = 0
    scene.add(desk)

    const deskEdge = new THREE.Mesh(
      new THREE.BoxGeometry(4.25, 0.06, 2.25),
      new THREE.MeshStandardMaterial({
        color: themeHex.gold,
        metalness: 0.7,
        roughness: 0.4,
      })
    )
    deskEdge.position.y = 0.1
    scene.add(deskEdge)

    // Soft cloth runner
    const runner = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.02, 0.7),
      new THREE.MeshStandardMaterial({
        color: 0x5c1530,
        roughness: 0.9,
      })
    )
    runner.position.set(0, 0.11, 0)
    scene.add(runner)

    const blocks = LETTERS.map((letter, i) => {
      const b = makeBlock(letter, i)
      const col = i % 5
      const row = Math.floor(i / 5)
      b.position.set(-1.4 + col * 0.55, 0.35, -0.25 + row * 0.55)
      scene.add(b)
      return b
    })

    // A few decoy blocks further back
    ;['B', 'J', 'W'].forEach((letter, i) => {
      const b = makeBlock(letter, 20 + i)
      b.position.set(-0.8 + i * 0.7, 0.35, 0.7)
      b.userData.decoy = true
      scene.add(b)
      blocks.push(b)
    })

    const trash = makeTrashBin()
    scene.add(trash)

    // Candle on desk corner
    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.35, 10),
      new THREE.MeshStandardMaterial({ color: 0xf0d9a8, roughness: 0.7 })
    )
    candle.position.set(-1.7, 0.3, 0.7)
    scene.add(candle)
    const flame = new THREE.PointLight(0xffb347, 0.9, 3)
    flame.position.set(-1.7, 0.55, 0.7)
    scene.add(flame)

    const clock = new THREE.Clock()
    let raf = 0
    let disposed = false

    const tick = () => {
      if (disposed) return
      const t = clock.getElapsedTime()

      for (const b of blocks) {
        const { baseY, phase, spin, decoy } = b.userData
        b.position.y = baseY + Math.sin(t * 1.2 + phase) * 0.06
        b.rotation.y = Math.sin(t * 0.6 + phase) * 0.25 + t * spin * 0.15
        if (decoy) {
          b.rotation.z = Math.sin(t + phase) * 0.15
          b.position.x += Math.sin(t * 0.5 + phase) * 0.0008
        }
      }

      trash.rotation.y = Math.sin(t * 0.5) * 0.08
      flame.intensity = 0.7 + Math.sin(t * 8) * 0.2
      camera.position.x = Math.sin(t * 0.25) * 0.35
      camera.lookAt(0, 0.45, 0)

      renderer.render(scene, camera)
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)

    const onResize = () => {
      const w = mount.clientWidth || 360
      camera.aspect = w / height
      camera.updateProjectionMatrix()
      renderer.setSize(w, height)
    }
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      disposeObject3D(scene)
      disposeRenderer(renderer)
    }
  }, [height])

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height, borderRadius: 12, overflow: 'hidden' }}
      aria-hidden="true"
    />
  )
}
