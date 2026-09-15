import { useEffect, useRef, useState } from 'react'
import audioEngine from '../utils/audioEngine'

const GOLD = '#D4AF37'
const INK = '#3B2414'

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

function ScrollworkFrame({ children }) {
  return (
    <div
      style={{
        position: 'relative',
        padding: '18px 20px 16px',
        marginTop: 16,
      }}
    >
      <svg
        viewBox="0 0 360 140"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <path
          d="M18 28 C40 8, 80 12, 110 22 S170 6, 180 10 S250 28, 342 22"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.4"
        />
        <path
          d="M18 112 C50 128, 90 118, 140 124 S230 132, 342 116"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.4"
        />
        <path
          d="M12 40 C6 70, 8 90, 16 110"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.2"
        />
        <path
          d="M348 40 C354 70, 352 90, 344 110"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.2"
        />
        <circle cx="18" cy="28" r="3" fill={GOLD} />
        <circle cx="342" cy="22" r="3" fill={GOLD} />
        <circle cx="18" cy="112" r="3" fill={GOLD} />
        <circle cx="342" cy="116" r="3" fill={GOLD} />
      </svg>
      {children}
    </div>
  )
}

export default function Screen1Gateway({ onComplete, onEnsureAudio }) {
  const stageRef = useRef(null)
  const yesRef = useRef(null)
  const noRef = useRef(null)
  const trapLockRef = useRef(0)
  const voiceDelayRef = useRef(0)
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

  useEffect(() => {
    return () => window.clearTimeout(voiceDelayRef.current)
  }, [])

  const ensureAudio = async () => {
    if (onEnsureAudio) {
      await onEnsureAudio()
    } else {
      await audioEngine.unlock()
    }
  }

  const playSwishThenVoice = (voiceName) => {
    window.clearTimeout(voiceDelayRef.current)
    audioEngine.playSfx('sfx_wand_swish')
    voiceDelayRef.current = window.setTimeout(() => {
      audioEngine.playVoice(voiceName)
    }, 240)
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
    playSwishThenVoice('voice_no_nice_try')
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
    window.clearTimeout(voiceDelayRef.current)
    audioEngine.playSfx('sfx_spell_quest')
    voiceDelayRef.current = window.setTimeout(() => {
      audioEngine.playVoice('voice_tap_yay')
    }, 240)
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
          @keyframes sealPulse {
            0%, 100% { transform: translateX(-50%) rotate(-8deg) scale(1); }
            50% { transform: translateX(-50%) rotate(-6deg) scale(1.04); }
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
          alignItems: 'center',
          justifyContent: 'center',
          padding: '72px 16px 36px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            position: 'relative',
            width: 'min(520px, 100%)',
            padding: 14,
            borderRadius: 8,
            background:
              'linear-gradient(160deg, #5a341d 0%, #2b160c 42%, #1a0c08 100%)',
            boxShadow:
              '0 24px 60px rgba(0, 0, 0, 0.55), inset 0 0 0 2px #8a5a32, inset 0 0 28px rgba(0, 0, 0, 0.55)',
          }}
        >
          <div
            style={{
              borderRadius: 4,
              padding: '28px 26px 54px',
              background: `
                radial-gradient(ellipse at 18% 12%, rgba(255, 248, 220, 0.35), transparent 46%),
                repeating-linear-gradient(
                  0deg,
                  rgba(90, 50, 20, 0.05) 0px,
                  rgba(90, 50, 20, 0.05) 1px,
                  transparent 1px,
                  transparent 7px
                ),
                linear-gradient(180deg, #f6e6c2 0%, #e4c892 48%, #c9a66a 100%)
              `,
              boxShadow:
                'inset 0 0 40px rgba(70, 30, 8, 0.35), inset 0 0 0 1px rgba(90, 48, 16, 0.45)',
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                margin: '0 auto',
                borderRadius: '50%',
                border: `2px solid ${GOLD}`,
                background: 'linear-gradient(160deg, #2a1d4a 0%, #120c22 70%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
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
                fontSize: 11,
                color: '#7a4b12',
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
            >
              Gokul-Mage
            </p>

            <ScrollworkFrame>
              <div
                key={bubble}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  background: 'rgba(255, 248, 230, 0.55)',
                  border: `1px solid ${GOLD}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  animation: 'bubbleIn 0.45s ease',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    lineHeight: 1.55,
                    fontSize: 17,
                    color: INK,
                    textAlign: 'center',
                  }}
                >
                  {bubble}
                </p>
              </div>
            </ScrollworkFrame>

            <div
              style={{
                marginTop: 22,
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <button
                ref={yesRef}
                type="button"
                onClick={handleAccept}
                disabled={accepted}
                style={{
                  minWidth: 124,
                  padding: '11px 20px',
                  borderRadius: 4,
                  border: `1px solid ${GOLD}`,
                  background: GOLD,
                  color: '#1a0c08',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  cursor: accepted ? 'default' : 'pointer',
                  boxShadow: '0 0 16px rgba(212, 175, 55, 0.35)',
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

          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '50%',
              bottom: -18,
              width: 72,
              height: 72,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 35% 30%, #e45a5a 0%, #9b1520 46%, #5c0b12 100%)',
              boxShadow:
                '0 8px 16px rgba(0, 0, 0, 0.4), inset 0 0 0 3px rgba(160, 20, 28, 0.8)',
              animation: 'sealPulse 4.5s ease-in-out infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: GOLD,
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: 1,
                textShadow: '0 1px 0 #5c0b12',
              }}
            >
              30
            </span>
          </div>
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
    minWidth: 124,
    padding: '11px 20px',
    borderRadius: 4,
    border: '1px solid rgba(59, 36, 20, 0.45)',
    background: 'rgba(248, 236, 208, 0.78)',
    color: INK,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: 700,
    letterSpacing: 1.4,
    cursor: 'pointer',
    opacity: trapping ? 0.85 : 1,
  }
}
