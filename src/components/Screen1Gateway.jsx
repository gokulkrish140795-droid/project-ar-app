import { useEffect, useRef, useState } from 'react'
import audioEngine from '../utils/audioEngine'

const GOLD = '#D4AF37'
const PARCHMENT = '#F4E8C1'
const VELVET = '#0F0A1C'

const BUBBLE_LINES = {
  intro:
    'Hold, traveler. I am Gokul-Mage. Before the Birthday Vault opens... are you truly ready?',
  trap: 'Nice try. The Disillusionment Charm holds. That "NO" was never really there.',
  idle: 'Hmm... the stars grow impatient. Cast Lumos, then choose wisely.',
  ready: 'Yay! The wand chooses you. The quest begins...',
}

function randomTrapPosition(stage, button, avoid) {
  const pad = 18
  const maxX = Math.max(pad, stage.width - button.width - pad)
  const maxY = Math.max(pad, stage.height - button.height - pad)
  let x = pad
  let y = pad

  for (let i = 0; i < 24; i += 1) {
    x = pad + Math.random() * (maxX - pad)
    y = pad + Math.random() * (maxY - pad)

    const overlapsAvoid =
      avoid &&
      x < avoid.x + avoid.width + 12 &&
      x + button.width + 12 > avoid.x &&
      y < avoid.y + avoid.height + 12 &&
      y + button.height + 12 > avoid.y

    if (!overlapsAvoid) {
      break
    }
  }

  return { x, y }
}

export default function Screen1Gateway({ onComplete, onEnsureAudio }) {
  const stageRef = useRef(null)
  const yesRef = useRef(null)
  const noRef = useRef(null)
  const trapLockRef = useRef(0)
  const [bubble, setBubble] = useState(BUBBLE_LINES.intro)
  const [noPos, setNoPos] = useState(null)
  const [trapping, setTrapping] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const idleTimer = window.setTimeout(() => {
      if (!accepted) {
        setBubble(BUBBLE_LINES.idle)
        audioEngine.playVoice('voice_idle_hmm')
      }
    }, 9000)

    return () => window.clearTimeout(idleTimer)
  }, [accepted, bubble])

  const ensureAudio = async () => {
    if (onEnsureAudio) {
      await onEnsureAudio()
    } else {
      await audioEngine.unlock()
    }
  }

  const teleportNo = async () => {
    if (accepted) {
      return
    }

    const now = Date.now()
    if (now - trapLockRef.current < 280) {
      return
    }
    trapLockRef.current = now

    await ensureAudio()
    audioEngine.playSfx('sfx_wand_swish')
    audioEngine.playVoice('voice_no_nice_try')
    setBubble(BUBBLE_LINES.trap)
    setTrapping(true)

    const stage = stageRef.current?.getBoundingClientRect()
    const noBox = noRef.current?.getBoundingClientRect()
    const yesBox = yesRef.current?.getBoundingClientRect()

    if (!stage || !noBox) {
      return
    }

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
    if (accepted) {
      return
    }

    await ensureAudio()
    audioEngine.playSfx('sfx_spell_quest')
    audioEngine.playVoice('voice_tap_yay')
    setAccepted(true)
    setBubble(BUBBLE_LINES.ready)

    window.setTimeout(() => {
      if (onComplete) {
        onComplete()
      }
    }, 1200)
  }

  return (
    <section
      ref={stageRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background:
          'radial-gradient(ellipse at 50% 20%, #1c1433 0%, #0F0A1C 62%)',
        color: PARCHMENT,
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      <style>
        {`
          @keyframes mageGlow {
            0%, 100% { box-shadow: 0 0 12px rgba(212, 175, 55, 0.45); }
            50% { box-shadow: 0 0 28px rgba(212, 175, 55, 0.9); }
          }
          @keyframes bubbleIn {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes vanishPop {
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
          height: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '72px 20px 40px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: 118,
            height: 118,
            borderRadius: '50%',
            border: `2px solid ${GOLD}`,
            background:
              'linear-gradient(160deg, #2a1d4a 0%, #120c22 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 58,
            animation: 'mageGlow 2.8s ease-in-out infinite',
          }}
          aria-hidden="true"
        >
          🧙
        </div>

        <p
          style={{
            marginTop: 10,
            letterSpacing: 3,
            fontSize: 12,
            color: GOLD,
            textTransform: 'uppercase',
          }}
        >
          Gokul-Mage
        </p>

        <div
          key={bubble}
          style={{
            pointerEvents: 'auto',
            marginTop: 22,
            maxWidth: 420,
            width: '100%',
            background: 'rgba(15, 10, 28, 0.88)',
            border: `1px solid ${GOLD}`,
            borderRadius: 18,
            padding: '18px 22px',
            position: 'relative',
            animation: 'bubbleIn 0.45s ease',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -10,
              left: '50%',
              width: 18,
              height: 18,
              background: VELVET,
              borderTop: `1px solid ${GOLD}`,
              borderLeft: `1px solid ${GOLD}`,
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />
          <p
            style={{
              margin: 0,
              lineHeight: 1.55,
              fontSize: 18,
              color: PARCHMENT,
              textAlign: 'center',
            }}
          >
            {bubble}
          </p>
        </div>

        <div
          style={{
            marginTop: 36,
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            pointerEvents: 'auto',
          }}
        >
          <button
            ref={yesRef}
            type="button"
            onClick={handleAccept}
            disabled={accepted}
            style={{
              minWidth: 132,
              padding: '12px 22px',
              borderRadius: 999,
              border: `1px solid ${GOLD}`,
              background: GOLD,
              color: VELVET,
              fontFamily: 'inherit',
              fontWeight: 700,
              letterSpacing: 1,
              cursor: accepted ? 'default' : 'pointer',
              boxShadow: '0 0 18px rgba(212, 175, 55, 0.4)',
            }}
          >
            YES
          </button>

          {!noPos && !accepted && (
            <button
              ref={noRef}
              type="button"
              onMouseEnter={teleportNo}
              onFocus={teleportNo}
              onPointerDown={(event) => {
                event.preventDefault()
                teleportNo()
              }}
              style={trapButtonStyle(trapping)}
            >
              NO
            </button>
          )}
        </div>
      </div>

      {noPos && !accepted && (
        <button
          ref={noRef}
          type="button"
          aria-label="Disillusionment trap"
          onMouseEnter={teleportNo}
          onFocus={teleportNo}
          onPointerDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
            teleportNo()
          }}
          style={{
            ...trapButtonStyle(trapping),
            position: 'absolute',
            left: noPos.x,
            top: noPos.y,
            zIndex: 5,
            animation: trapping ? 'vanishPop 0.35s ease' : 'none',
          }}
        >
          NO
        </button>
      )}
    </section>
  )
}

function trapButtonStyle(trapping) {
  return {
    minWidth: 132,
    padding: '12px 22px',
    borderRadius: 999,
    border: '1px solid rgba(244, 232, 193, 0.45)',
    background: 'rgba(20, 14, 38, 0.75)',
    color: PARCHMENT,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: 700,
    letterSpacing: 1,
    cursor: 'pointer',
    opacity: trapping ? 0.85 : 1,
  }
}
