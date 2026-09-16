import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import audioEngine from '../utils/audioEngine'
import GingerCatCompanion from './GingerCatCompanion'
import MiniMeAvatar from './MiniMeAvatar'

const GOLD = '#D4AF37'
const PARCHMENT = '#F4E8C1'
const CORAL = '#FF6F91'
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
      if (cancelled) {
        return
      }
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
    if (kissed || !frozen) {
      return
    }

    setKissed(true)
    if (onEnsureAudio) {
      await onEnsureAudio()
    } else {
      await audioEngine.unlock()
    }

    audioEngine.stopAllSFXAndVoices()
    audioEngine.playChipmunkGiggle()
    audioEngine.play('voice_tap_yay', { stack: true })
    audioEngine.play('sfx_cat_purr', { stack: true })
    audioEngine.play('sfx_chipmunk_giggle', { stack: true })
    fireHearts()

    window.setTimeout(() => {
      if (onKiss) {
        onKiss()
      }
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
          @keyframes glassPress {
            0% { transform: translateY(18px) scale(0.92); filter: blur(2px); }
            70% { transform: translateY(0) scale(1.04); }
            100% { transform: translateY(2px) scale(1); }
          }
          @keyframes meterGlow {
            0%, 100% { box-shadow: 0 0 12px rgba(212, 175, 55, 0.35); }
            50% { box-shadow: 0 0 22px rgba(255, 111, 145, 0.55); }
          }
          @keyframes popupIn {
            from { opacity: 0; transform: translateY(16px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes freezeBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.45; }
          }
        `}
      </style>

      <div style={{ width: 'min(400px, 100%)', textAlign: 'center' }}>
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
            marginTop: 12,
            padding: 10,
            border: `1px solid ${GOLD}`,
            borderRadius: 999,
            background: 'rgba(15, 10, 28, 0.72)',
            animation: 'meterGlow 1.8s ease-in-out infinite',
          }}
        >
          <div
            style={{
              height: 16,
              borderRadius: 999,
              overflow: 'hidden',
              background: 'rgba(244, 232, 193, 0.12)',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: 999,
                background: frozen
                  ? 'linear-gradient(90deg, #D4AF37, #FF6F91)'
                  : 'linear-gradient(90deg, #D4AF37, #F4E8C1)',
                transition: 'width 0.35s ease',
              }}
            />
          </div>
        </div>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 20,
            color: frozen ? CORAL : GOLD,
            animation: frozen ? 'freezeBlink 0.9s ease-in-out infinite' : 'none',
          }}
        >
          {progress}%{frozen ? ' — FROZEN' : ''}
        </p>
      </div>

      <div
        style={{
          marginTop: 18,
          position: 'relative',
          width: 280,
          height: 220,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          animation: frozen ? 'glassPress 0.85s ease forwards' : 'none',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 28,
            border: '2px solid rgba(212, 175, 55, 0.45)',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 40%, rgba(15,10,28,0.2) 100%)',
            boxShadow: 'inset 0 0 24px rgba(255,255,255,0.16)',
            pointerEvents: 'none',
          }}
        />
        <MiniMeAvatar
          size={128}
          pose="glass"
          onFaceTap={handleKiss}
          disabled={!frozen || kissed}
          ariaLabel="Tap Gokul-Mage's face to give a kiss"
        />
        <div style={{ marginLeft: -8, marginBottom: 8 }}>
          <GingerCatCompanion pose="glass" size={96} />
        </div>
      </div>

      {frozen && (
        <div
          style={{
            width: 'min(400px, 100%)',
            marginTop: 18,
            padding: '16px 16px 14px',
            borderRadius: 18,
            background: 'linear-gradient(180deg, #FF8FAB 0%, #FF6F91 55%, #E85A7a 100%)',
            color: '#3B1020',
            boxShadow: '0 16px 40px rgba(255, 111, 145, 0.35)',
            animation: 'popupIn 0.45s ease',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.5,
              fontWeight: 600,
            }}
          >
            ✨ OH NO! SWEETNESS OVERLOAD! ✨ The Wellington wind must have blown away our connection! 💨 But wait... my heart-meters show this phone is being held by a girl with TWO university degrees! 🎓🎓 Your brilliant brain and breathtaking beauty have completely melted my little birthday servers! 💘 Quick, tap my face to give me a kiss and fix the system!
          </p>
        </div>
      )}
    </section>
  )
}
