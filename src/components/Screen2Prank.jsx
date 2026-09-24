import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { fonts, theme } from '../theme'
import audioEngine from '../utils/audioEngine'
import CaptionRail from './ui/CaptionRail'
import DeviceFrame from './ui/DeviceFrame'
import GingerCat3D from './GingerCat3D'
import MiniMeAvatar3D from './MiniMeAvatar3D'

const GOLD = theme.gold
const PARCHMENT = theme.parchmentSoft
const CORAL = theme.coral
const STEPS = [10, 45, 72, 88, 99]

export default function Screen2Prank({ onKiss, onEnsureAudio }) {
  const [progress, setProgress] = useState(0)
  const [frozen, setFrozen] = useState(false)
  const [kissed, setKissed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timer = 0
    let step = 0

    const tick = () => {
      if (cancelled) return
      setProgress(STEPS[step])
      step += 1
      if (step >= STEPS.length) {
        setFrozen(true)
        return
      }
      timer = window.setTimeout(tick, 420)
    }

    timer = window.setTimeout(tick, 180)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  const fireHearts = () => {
    const origin = { x: 0.5, y: 0.58 }
    confetti({
      particleCount: 70,
      spread: 70,
      origin,
      colors: [GOLD, CORAL, '#FFFFFF', PARCHMENT],
      shapes: ['heart'],
      scalar: 1.05,
    })
  }

  const handleKiss = async () => {
    if (kissed || !frozen) return

    setKissed(true)
    if (onEnsureAudio) await onEnsureAudio()
    else await audioEngine.unlock()

    audioEngine.stopAllSFXAndVoices()
    audioEngine.playChipmunkGiggle()
    audioEngine.play('voice_tap_yay', { stack: true })
    audioEngine.play('sfx_cat_purr', { stack: true })
    audioEngine.play('sfx_chipmunk_giggle', { stack: true })
    fireHearts()

    window.setTimeout(() => {
      if (onKiss) onKiss()
    }, 1200)
  }

  return (
    <section className="ar-beat">
      <style>
        {`
          @keyframes glassPress3d {
            0% { transform: translateY(18px) scale(0.92); filter: blur(2px); }
            70% { transform: translateY(0) scale(1.04); }
            100% { transform: translateY(2px) scale(1); }
          }
          @keyframes meterGlow3d {
            0%, 100% { box-shadow: 0 0 12px rgba(232, 197, 106, 0.3); }
            50% { box-shadow: 0 0 28px rgba(255, 107, 138, 0.55); }
          }
          @keyframes popupIn3d {
            from { opacity: 0; transform: translateY(18px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes freezeBlink3d {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.55; }
          }
        `}
      </style>

      <DeviceFrame compact className="ar-beat__mast">
        <p className="ar-quest-kicker" style={{ margin: 0 }}>
          Heart-Meter Calibration
        </p>

        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: `1px solid ${GOLD}`,
            background: 'rgba(8, 14, 26, 0.55)',
            animation: 'meterGlow3d 1.8s ease-in-out infinite',
          }}
        >
          <div
            style={{
              height: 14,
              borderRadius: 8,
              overflow: 'hidden',
                background: 'rgba(232, 240, 255, 0.08)',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.45)',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: 8,
                background: frozen
                  ? 'linear-gradient(90deg, #E8C56A, #FF6B8A, #FFB4C4)'
                  : 'linear-gradient(90deg, #8A6A12, #E8C56A, #FFF0C2)',
                backgroundSize: '200% 100%',
                animation: frozen ? 'none' : 'arShimmer 2.4s linear infinite',
                transition: 'width 0.35s ease',
                boxShadow: '0 0 16px rgba(232, 197, 106, 0.45)',
              }}
            />
          </div>
        </div>
        <p
          style={{
            margin: '10px 0 0',
            fontSize: 22,
            fontWeight: 700,
            fontFamily: fonts.display,
            color: frozen ? CORAL : GOLD,
            animation: frozen ? 'freezeBlink3d 0.9s ease-in-out infinite' : 'none',
          }}
        >
          {progress}%{frozen ? ' — FROZEN' : ''}
        </p>
      </DeviceFrame>

      <div
        className="ar-beat__stage"
        style={{
          width: 320,
          animation: frozen ? 'glassPress3d 0.85s ease forwards' : 'none',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 20,
            border: '1px solid rgba(232, 197, 106, 0.4)',
            background:
              'linear-gradient(160deg, rgba(232,240,255,0.16) 0%, rgba(126,240,255,0.04) 38%, rgba(8,14,26,0.28) 100%)',
            boxShadow: 'inset 0 0 36px rgba(255,255,255,0.12), 0 20px 40px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }}
        />
        <MiniMeAvatar3D
          size={190}
          pose="glass"
          onFaceTap={handleKiss}
          disabled={!frozen || kissed}
          ariaLabel="Tap Gokul-Mage's face to give a kiss"
        />
        <div style={{ marginLeft: -18, marginBottom: 4 }}>
          <GingerCat3D pose="glass" size={150} />
        </div>
      </div>

      <div className="ar-beat__dock">
        <CaptionRail visible={frozen} speaker="Heart-Meter" className="ar-caption-rail--alert">
          OH NO! SWEETNESS OVERLOAD! The Wellington wind must have blown away our connection! But
          wait... my heart-meters show this phone is being held by a girl with TWO university
          degrees! Your brilliant brain and breathtaking beauty have completely melted my little
          birthday servers! Quick, tap my face to give me a kiss and fix the system!
        </CaptionRail>
      </div>
    </section>
  )
}
