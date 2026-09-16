import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import useCompanionDirector from '../hooks/useCompanionDirector'
import { theme } from '../theme'
import audioEngine from '../utils/audioEngine'
import { disposeObject3D, disposeRenderer } from '../utils/threeDispose'
import DepthFrame from './DepthFrame'
import GingerCat3D from './GingerCat3D'
import MiniMeAvatar3D from './MiniMeAvatar3D'

const GOLD = theme.gold
const INK = theme.ink
const VELVET = theme.velvet

function randomTrapPosition(stage, button, avoid) {
  const pad = 18
  const maxX = Math.max(pad, stage.width - button.width - pad)
  const maxY = Math.max(pad, stage.height - button.height - pad)
  let x = pad
  let y = pad

  for (let i = 0; i < 24; i += 1) {
    x = pad + Math.random() * Math.max(1, maxX - pad)
    y = pad + Math.random() * Math.max(1, maxY - pad)

    const overlapsAvoid =
      avoid &&
      x < avoid.x + avoid.width + 12 &&
      x + button.width + 12 > avoid.x &&
      y < avoid.y + avoid.height + 12 &&
      y + button.height + 12 > avoid.y

    if (!overlapsAvoid) break
  }

  return { x, y }
}

/** Closed 3D ribbon scroll + crimson wax seal "30" */
function ClosedScroll3D({ unrolling, onOpen, width = 320 }) {
  const mountRef = useRef(null)
  const unrollingRef = useRef(unrolling)
  unrollingRef.current = unrolling

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const h = 120
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, width / h, 0.1, 20)
    camera.position.set(0, 0.15, 2.6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, h)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const key = new THREE.PointLight(0xffe0a8, 1.5, 8)
    key.position.set(1, 1.2, 2)
    scene.add(key)
    const rim = new THREE.PointLight(0xd4af37, 0.6, 6)
    rim.position.set(-1, 0.4, 1)
    scene.add(rim)

    const scroll = new THREE.Group()
    scene.add(scroll)

    const roll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 1.7, 32),
      new THREE.MeshStandardMaterial({
        color: 0xc49a56,
        roughness: 0.65,
        metalness: 0.08,
      })
    )
    roll.rotation.z = Math.PI / 2
    scroll.add(roll)

    const endL = new THREE.Mesh(
      new THREE.TorusGeometry(0.29, 0.04, 10, 24),
      new THREE.MeshStandardMaterial({ color: 0x8a6030, roughness: 0.7 })
    )
    endL.rotation.y = Math.PI / 2
    endL.position.x = -0.85
    scroll.add(endL)
    const endR = endL.clone()
    endR.position.x = 0.85
    scroll.add(endR)

    const ribbon = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.035, 8, 32),
      new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.85,
        roughness: 0.3,
        emissive: 0x3a2e08,
        emissiveIntensity: 0.35,
      })
    )
    ribbon.rotation.y = Math.PI / 2
    scroll.add(ribbon)

    const ribbonBand = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.7),
      new THREE.MeshStandardMaterial({
        color: 0xc9a227,
        metalness: 0.7,
        roughness: 0.35,
      })
    )
    ribbonBand.position.z = 0.28
    scroll.add(ribbonBand)

    const seal = new THREE.Group()
    seal.position.set(0, 0.02, 0.42)
    scroll.add(seal)

    const wax = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.24, 0.08, 24),
      new THREE.MeshStandardMaterial({
        color: 0xc41e2a,
        roughness: 0.45,
        metalness: 0.15,
        emissive: 0x5c0b12,
        emissiveIntensity: 0.35,
      })
    )
    wax.rotation.x = Math.PI / 2
    seal.add(wax)

    const digitMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25,
      emissive: 0xd4af37,
      emissiveIntensity: 0.4,
    })
    const d3 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.03), digitMat)
    d3.position.set(-0.06, 0, 0.05)
    seal.add(d3)
    const d0 = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.018, 8, 16), digitMat)
    d0.position.set(0.07, 0, 0.05)
    seal.add(d0)

    const clock = new THREE.Clock()
    let raf = 0
    let disposed = false
    let crackT = -1

    const tick = () => {
      if (disposed) return
      const t = clock.getElapsedTime()
      scroll.rotation.y = Math.sin(t * 0.8) * 0.08
      scroll.position.y = Math.sin(t * 1.4) * 0.03

      if (unrollingRef.current && crackT < 0) crackT = t
      if (crackT >= 0) {
        const u = Math.min(1, (t - crackT) / 0.7)
        seal.rotation.z = -0.15 + u * 1.2
        seal.scale.setScalar(Math.max(0.05, 1 - u * 0.95))
        seal.position.y = 0.02 + u * 0.4
        wax.material.transparent = true
        wax.material.opacity = 1 - u
      } else {
        seal.scale.setScalar(1 + Math.sin(t * 2.2) * 0.04)
        seal.rotation.z = -0.12 + Math.sin(t * 1.5) * 0.04
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
  }, [width])

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Tap the crimson wax seal to open the scroll"
      style={{
        width: '100%',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <div ref={mountRef} style={{ width, height: 120, margin: '0 auto' }} />
      <p
        style={{
          margin: '4px 0 0',
          textAlign: 'center',
          color: GOLD,
          fontSize: 11,
          letterSpacing: 1.2,
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        Tap the wax seal “30”
      </p>
    </button>
  )
}

export default function Screen1Gateway({ onComplete, onEnsureAudio }) {
  const stageRef = useRef(null)
  const yesRef = useRef(null)
  const noRef = useRef(null)
  const trapLockRef = useRef(0)
  const trappingRef = useRef(false)
  const [opened, setOpened] = useState(false)
  const [unrolling, setUnrolling] = useState(false)
  const [noPos, setNoPos] = useState(null)
  const [trapping, setTrapping] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [scrollWidth, setScrollWidth] = useState(320)

  const companions = useCompanionDirector({
    active: opened && !accepted,
    paused: trapping,
    intervalMs: [6500, 11000],
  })

  useEffect(() => {
    const measure = () => setScrollWidth(Math.min(360, window.innerWidth - 32))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const ensureAudio = async () => {
    if (onEnsureAudio) await onEnsureAudio()
    else await audioEngine.unlock()
  }

  const openScroll = async () => {
    if (opened || unrolling) return
    setUnrolling(true)
    await ensureAudio()
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playSfx('sfx_wax_crack')

    window.setTimeout(async () => {
      setOpened(true)
      setUnrolling(false)
      await companions.playIntro()
    }, 720)
  }

  const teleportNo = async () => {
    if (accepted || !opened) return

    const now = Date.now()
    if (now - trapLockRef.current < 280) return
    trapLockRef.current = now

    await ensureAudio()
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playLayered(['sfx_wand_swish', 'sfx_cat_meow'])
    trappingRef.current = true
    setTrapping(true)
    companions.playTrap()

    const stage = stageRef.current?.getBoundingClientRect()
    const noBox = noRef.current?.getBoundingClientRect()
    const yesBox = yesRef.current?.getBoundingClientRect()
    if (!stage || !noBox) return

    const next = randomTrapPosition(
      { width: stage.width, height: stage.height },
      { width: noBox.width, height: noBox.height },
      yesBox
        ? {
            x: yesBox.left - stage.left,
            y: yesBox.top - stage.top,
            width: yesBox.width,
            height: yesBox.height,
          }
        : null
    )
    setNoPos(next)
  }

  const handleAccept = async () => {
    if (accepted || !opened) return
    await ensureAudio()
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playLayered(['sfx_spell_quest', 'voice_tap_yay'])
    setAccepted(true)
    if (onComplete) onComplete()
  }

  useEffect(() => {
    if (!trapping) return undefined
    const timer = window.setTimeout(() => {
      trappingRef.current = false
      setTrapping(false)
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [trapping, noPos])

  const miniPose = trapping ? 'peek' : companions.miniPose
  const gingerPose = trapping ? 'leap' : companions.gingerPose

  const trapButton = (extraStyle = {}) => (
    <button
      ref={noRef}
      type="button"
      aria-label="Disillusionment trap"
      onMouseEnter={teleportNo}
      onFocus={teleportNo}
      onTouchStart={(event) => {
        event.preventDefault()
        teleportNo()
      }}
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
        teleportNo()
      }}
      style={{
        position: extraStyle.position || 'relative',
        minWidth: 140,
        padding: '9px 18px',
        borderRadius: 999,
        border: '1px solid #D4AF37',
        background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.42), rgba(212, 175, 55, 0.2))',
        color: '#FFE5A3',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontWeight: 700,
        letterSpacing: 0.4,
        cursor: 'pointer',
        boxShadow: '0 0 16px rgba(212, 175, 55, 0.35)',
        textShadow: '0 0 8px rgba(255, 229, 163, 0.65)',
        ...extraStyle,
      }}
    >
      No, thanks 😜
      {trapping && extraStyle.position === 'absolute' && (
        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: -78,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          <GingerCat3D pose="leap" size={72} heartsOnTap={false} />
        </span>
      )}
    </button>
  )

  return (
    <section
      ref={stageRef}
      style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'transparent',
        color: INK,
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      <style>
        {`
          @keyframes unroll3d {
            from { max-height: 86px; opacity: 0.6; }
            to { max-height: 720px; opacity: 1; }
          }
          @keyframes yarnArc3d {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(54px, 28px) scale(0.85); opacity: 0.2; }
          }
          @keyframes vanishPop3d {
            0% { filter: blur(0); opacity: 1; }
            40% { filter: blur(6px); opacity: 0.35; }
            100% { filter: blur(0); opacity: 1; }
          }
        `}
      </style>

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '88px 16px 28px',
        }}
      >
        <div style={{ width: 'min(360px, 100%)', maxWidth: 360 }}>
          {!opened && (
            <ClosedScroll3D
              unrolling={unrolling}
              onOpen={openScroll}
              width={scrollWidth}
            />
          )}

          {opened && (
            <DepthFrame
              variant="parchment"
              float
              style={{
                overflow: 'hidden',
                animation: 'unroll3d 0.7s ease',
                maxWidth: 360,
              }}
            >
              <p
                style={{
                  margin: 0,
                  letterSpacing: 1.4,
                  fontSize: 10,
                  color: '#7a4b12',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              >
                ✨ HOGWARTS SECRET PROTOCOL 0510 ✨
              </p>
              <h1
                style={{
                  margin: '8px 0 0',
                  fontSize: 18,
                  lineHeight: 1.25,
                  letterSpacing: 0.6,
                  textAlign: 'center',
                  color: VELVET,
                  fontWeight: 700,
                  textShadow: '0 2px 0 rgba(255,255,255,0.35)',
                }}
              >
                THE SEARCH FOR A STRAY HEART
              </h1>
              <p
                style={{
                  margin: '10px 4px 0',
                  fontSize: 13,
                  lineHeight: 1.5,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #FFF0C2, #D4AF37, #B8922A)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  filter: 'drop-shadow(0 1px 2px rgba(80, 40, 8, 0.35))',
                  fontWeight: 700,
                  animation: 'arShimmer 4s linear infinite',
                }}
              >
                Thirty years of magic, and today begins your greatest quest yet!
              </p>

              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: 4,
                  position: 'relative',
                  minHeight: 140,
                  transform: 'translateZ(24px)',
                }}
              >
                <MiniMeAvatar3D
                  size={110}
                  speech={companions.speech}
                  showSpeech={companions.showSpeech}
                  pose={miniPose}
                  peek={trapping}
                  talking={companions.lipTalking}
                />
                <GingerCat3D pose={gingerPose} size={100} />
                {companions.yarnVisible && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 96,
                      top: 18,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background:
                        'radial-gradient(circle at 30% 30%, #FFF3B0, #D4AF37 60%, #8A6A12)',
                      boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
                      animation: 'yarnArc3d 0.7s ease forwards',
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <button
                  ref={yesRef}
                  type="button"
                  onClick={handleAccept}
                  disabled={accepted}
                  className="ar-btn-3d ar-btn-3d--gold"
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    fontSize: 12,
                    lineHeight: 1.3,
                    cursor: accepted ? 'default' : 'pointer',
                    opacity: accepted ? 0.75 : 1,
                  }}
                >
                  🪄 I ACCEPT THE WIZARDING QUEST ✨
                </button>
                {!noPos && !accepted && trapButton()}
              </div>
            </DepthFrame>
          )}
        </div>
      </div>

      {noPos &&
        !accepted &&
        trapButton({
          position: 'absolute',
          left: noPos.x,
          top: noPos.y,
          zIndex: 5,
          animation: trapping ? 'vanishPop3d 0.35s ease' : 'none',
        })}
    </section>
  )
}
