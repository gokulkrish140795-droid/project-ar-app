import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { theme } from '../theme'
import audioEngine from '../utils/audioEngine'
import DepthFrame from './DepthFrame'
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
      particleCount: 90,
      spread: 80,
      origin,
      colors: [GOLD, CORAL, '#FFFFFF', PARCHMENT, '#FF4D6D'],
      shapes: ['heart', 'star'],
      scalar: 1.05,
    })
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.2, y: 0.7 },
      colors: [CORAL, GOLD, '#FFFFFF'],
      shapes: ['heart'],
    })
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 0.8, y: 0.7 },
      colors: [CORAL, GOLD, '#FFFFFF'],
      shapes: ['heart'],
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
    <section
      style={{
        position: 'relative',
        zIndex: 2,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '88px 16px 28px',
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: PARCHMENT,
      }}
    >
      <style>
        {`
          @keyframes glassPress3d {
            0% { transform: translateY(18px) scale(0.92) rotateX(12deg); filter: blur(2px); }
            70% { transform: translateY(0) scale(1.04) rotateX(0deg); }
            100% { transform: translateY(2px) scale(1) rotateX(4deg); }
          }
          @keyframes meterGlow3d {
            0%, 100% { box-shadow: 0 0 12px rgba(212, 175, 55, 0.35), 0 12px 28px rgba(0,0,0,0.4); }
            50% { box-shadow: 0 0 28px rgba(255, 111, 145, 0.65), 0 12px 28px rgba(0,0,0,0.4); }
          }
          @keyframes popupIn3d {
            from { opacity: 0; transform: translateY(22px) scale(0.92) rotateX(10deg); }
            to { opacity: 1; transform: translateY(0) scale(1) rotateX(0deg); }
          }
          @keyframes freezeBlink3d {
            0%, 100% { opacity: 1; text-shadow: 0 0 12px rgba(255,111,145,0.6); }
            50% { opacity: 0.45; text-shadow: none; }
          }
        `}
      </style>

      <DepthFrame style={{ width: 'min(400px, 100%)', textAlign: 'center' }} float>
        <p
          style={{
            margin: 0,
            letterSpacing: 2,
            fontSize: 11,
            color: GOLD,
            textTransform: 'uppercase',
          }}
        >
          Heart-Meter Calibration
        </p>

        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 999,
            border: `1px solid ${GOLD}`,
            background:
              'linear-gradient(180deg, rgba(40, 20, 50, 0.9), rgba(15, 10, 28, 0.85))',
            animation: 'meterGlow3d 1.8s ease-in-out infinite',
            transform: 'perspective(600px) rotateX(8deg)',
            boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              height: 18,
              borderRadius: 999,
              overflow: 'hidden',
              background: 'rgba(244, 232, 193, 0.1)',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.45)',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: 999,
                background: frozen
                  ? 'linear-gradient(90deg, #D4AF37, #FF6F91, #FFB4C4)'
                  : 'linear-gradient(90deg, #8A6A12, #D4AF37, #FFF0C2)',
                backgroundSize: '200% 100%',
                animation: frozen ? 'none' : 'arShimmer 2.4s linear infinite',
                transition: 'width 0.35s ease',
                boxShadow: '0 0 16px rgba(212, 175, 55, 0.55)',
              }}
            />
          </div>
        </div>
        <p
          style={{
            margin: '10px 0 0',
            fontSize: 22,
            fontWeight: 700,
            color: frozen ? CORAL : GOLD,
            animation: frozen ? 'freezeBlink3d 0.9s ease-in-out infinite' : 'none',
          }}
        >
          {progress}%{frozen ? ' — FROZEN' : ''}
        </p>
      </DepthFrame>

      <div
        style={{
          marginTop: 22,
          position: 'relative',
          width: 300,
          height: 250,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          perspective: 800,
          animation: frozen ? 'glassPress3d 0.85s ease forwards' : 'none',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 28,
            border: '2px solid rgba(212, 175, 55, 0.5)',
            background:
              'linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 38%, rgba(15,10,28,0.35) 100%)',
            boxShadow:
              'inset 0 0 36px rgba(255,255,255,0.18), 0 24px 40px rgba(0,0,0,0.45), 0 0 30px rgba(212,175,55,0.15)',
            transform: 'rotateX(12deg)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '12%',
            right: '12%',
            bottom: 18,
            height: 10,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.45)',
            filter: 'blur(8px)',
            transform: 'rotateX(70deg)',
          }}
        />
        <MiniMeAvatar3D
          size={150}
          pose="glass"
          onFaceTap={handleKiss}
          disabled={!frozen || kissed}
          ariaLabel="Tap Gokul-Mage's face to give a kiss"
        />
        <div style={{ marginLeft: -12, marginBottom: 4 }}>
          <GingerCat3D pose="glass" size={120} />
        </div>
      </div>

      {frozen && (
        <DepthFrame
          style={{
            width: 'min(400px, 100%)',
            marginTop: 18,
            background:
              'linear-gradient(180deg, #FF8FAB 0%, #FF6F91 55%, #E85A7a 100%)',
            color: '#3B1020',
            border: '1px solid rgba(255, 229, 163, 0.45)',
            animation: 'popupIn3d 0.45s ease',
            textAlign: 'center',
            transform: 'perspective(800px) rotateX(2deg)',
          }}
        >
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, fontWeight: 600 }}>
            ✨ OH NO! SWEETNESS OVERLOAD! ✨ The Wellington wind must have blown away our
            connection! 💨 But wait... my heart-meters show this phone is being held by a girl
            with TWO university degrees! 🎓🎓 Your brilliant brain and breathtaking beauty have
            completely melted my little birthday servers! 💘 Quick, tap my face to give me a kiss
            and fix the system!
          </p>
        </DepthFrame>
      )}
    </section>
  )
}
