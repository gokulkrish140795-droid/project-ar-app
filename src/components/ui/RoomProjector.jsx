import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { acquireRoomCamera, releaseRoomCamera } from '../../utils/roomCamera'
import { disposeObject3D, disposeRenderer } from '../../utils/threeDispose'

/**
 * Phone as a projector: live camera fills the room, and the clip sits in
 * camera space. The HUD around it stays DeviceFrame / CaptionRail.
 */
export default function RoomProjector({
  playing = false,
  youtubeId = '',
  videoUrl = '',
  title = '',
  onDenied,
}) {
  const cameraRef = useRef(null)
  const worldRef = useRef(null)
  const deniedRef = useRef(onDenied)
  deniedRef.current = onDenied

  useEffect(() => {
    const video = cameraRef.current
    let cancelled = false
    ;(async () => {
      try {
        const stream = await acquireRoomCamera()
        if (cancelled) {
          releaseRoomCamera()
          return
        }
        if (video) {
          video.srcObject = stream
          await video.play().catch(() => {})
        }
      } catch {
        if (!cancelled) {
          releaseRoomCamera()
          deniedRef.current?.()
        }
      }
    })()
    return () => {
      cancelled = true
      if (video) video.srcObject = null
      releaseRoomCamera()
    }
  }, [])

  useEffect(() => {
    const mount = worldRef.current
    if (!mount || !playing) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20)
    camera.position.set(0, 0, 3.2)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const frame = new THREE.Mesh(
      new THREE.RingGeometry(0.72, 0.78, 48),
      new THREE.MeshBasicMaterial({
        color: 0x7ef0ff,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      })
    )
    frame.position.set(0, 0.05, 0)
    scene.add(frame)
    const glow = new THREE.PointLight(0xe8c56a, 0.8, 6, 2)
    glow.position.set(0, 0.2, 1.2)
    scene.add(glow)

    let raf = 0
    const resize = () => {
      const width = mount.clientWidth || window.innerWidth
      const height = mount.clientHeight || window.innerHeight
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    resize()
    const clock = new THREE.Clock()
    const tick = () => {
      const t = clock.getElapsedTime()
      frame.rotation.z = t * 0.15
      frame.position.y = 0.05 + Math.sin(t * 0.8) * 0.03
      renderer.render(scene, camera)
      raf = window.requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener('resize', resize)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      disposeObject3D(scene)
      disposeRenderer(renderer)
    }
  }, [playing])

  return (
    <div className="ar-projector">
      <video ref={cameraRef} className="ar-projector__camera" muted playsInline autoPlay />
      <div ref={worldRef} className="ar-projector__world" />
      {playing ? (
        <div className="ar-projector__plate">
          {youtubeId ? (
            <iframe
              title={title || 'Projection'}
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          ) : videoUrl ? (
            <video src={videoUrl} autoPlay playsInline controls />
          ) : (
            <p className="ar-quest-sub">{title}</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
