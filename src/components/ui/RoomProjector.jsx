import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { acquireRoomCamera, bindRoomVideo, releaseRoomCamera } from '../../utils/roomCamera'
import { disposeObject3D, disposeRenderer } from '../../utils/threeDispose'

/**
 * Live camera underlay. When a direct clip is playing, it is a video texture
 * on a floor plane in camera space — no iframe, no plate, no frame.
 */
export default function RoomProjector({
  playing = false,
  videoUrl = '',
  loop = false,
  onDenied,
}) {
  const cameraRef = useRef(null)
  const worldRef = useRef(null)
  const deniedRef = useRef(onDenied)
  deniedRef.current = onDenied

  useEffect(() => {
    const video = cameraRef.current
    bindRoomVideo(video)
    let cancelled = false
    ;(async () => {
      try {
        const stream = await acquireRoomCamera()
        if (cancelled) {
          await releaseRoomCamera()
          return
        }
        if (video) {
          video.srcObject = stream
          await video.play().catch(() => {})
        }
      } catch (error) {
        if (cancelled || error?.code === 'superseded') return
        await releaseRoomCamera()
        deniedRef.current?.()
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
    if (!mount || !playing || !videoUrl) return undefined

    const clip = document.createElement('video')
    clip.muted = true
    clip.defaultMuted = true
    clip.playsInline = true
    clip.setAttribute('playsinline', '')
    clip.setAttribute('webkit-playsinline', '')
    clip.loop = loop
    clip.preload = 'auto'
    clip.crossOrigin = 'anonymous'
    clip.src = videoUrl
    clip.style.cssText = 'position:absolute;width:2px;height:2px;opacity:0;pointer-events:none;'
    mount.appendChild(clip)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 30)
    camera.position.set(0, 1.45, 1.85)
    camera.lookAt(0, 0.02, -0.55)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const texture = new THREE.VideoTexture(clip)
    texture.colorSpace = THREE.SRGBColorSpace
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.28), material)
    plane.rotation.x = -Math.PI / 2
    plane.position.set(0, 0, -0.72)
    plane.visible = false
    scene.add(plane)

    const fit = () => {
      const width = clip.videoWidth || 9
      const height = clip.videoHeight || 16
      const depth = 1.22
      const span = depth * (width / height)
      plane.geometry.dispose()
      plane.geometry = new THREE.PlaneGeometry(span, depth)
    }

    const reveal = () => {
      if (!clip.videoWidth) return
      fit()
      plane.visible = true
      material.opacity = 1
    }

    clip.addEventListener('loadedmetadata', reveal)
    clip.addEventListener('playing', reveal)

    const play = async () => {
      try {
        clip.muted = false
        await clip.play()
      } catch {
        clip.muted = true
        await clip.play().catch(() => {})
      }
    }
    play()

    let raf = 0
    const resize = () => {
      const width = mount.clientWidth || window.innerWidth
      const height = mount.clientHeight || window.innerHeight
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    resize()
    const tick = () => {
      texture.needsUpdate = true
      renderer.render(scene, camera)
      raf = window.requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      clip.pause()
      clip.removeAttribute('src')
      clip.load()
      clip.remove()
      texture.dispose()
      disposeObject3D(scene)
      disposeRenderer(renderer)
    }
  }, [playing, videoUrl, loop])

  return (
    <div className="ar-projector">
      <video ref={cameraRef} className="ar-projector__camera" muted playsInline autoPlay />
      <div ref={worldRef} className="ar-projector__world" />
    </div>
  )
}
