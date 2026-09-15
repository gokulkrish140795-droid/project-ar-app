import { useEffect, useRef, useState } from 'react'
import audioEngine from '../utils/audioEngine'

const GOLD = '#D4AF37'
const INK = '#3B2414'

const BUBBLE_LINES = {
  intro:
    'Hold, traveler. I am Gokul-Mage. Before the Birthday Vault opens... are you truly ready?',
  trap: 'Nice try. The Disillusionment Charm holds. That "NO" was never really there.',
  idle: 'Hmm... the stars grow impatient. Cast Lumos, then choose wisely.',
  ready: 'The Floo Network stirs. Hold fast...',
}

const DECKLE = 'polygon(1% 3%, 4% 0%, 9% 2%, 14% 0%, 19% 3%, 24% 1%, 30% 3%, 36% 0%, 42% 2%, 48% 0%, 54% 3%, 61% 1%, 67% 3%, 73% 0%, 79% 2%, 85% 0%, 91% 3%, 96% 1%, 99% 4%, 100% 10%, 98% 16%, 100% 23%, 98% 31%, 100% 39%, 98% 47%, 100% 56%, 98% 65%, 100% 73%, 98% 81%, 100% 88%, 97% 94%, 99% 98%, 94% 100%, 88% 97%, 81% 100%, 74% 98%, 67% 100%, 60% 97%, 53% 100%, 46% 98%, 39% 100%, 32% 97%, 25% 100%, 18% 98%, 11% 100%, 5% 97%, 0% 99%, 2% 92%, 0% 84%, 2% 76%, 0% 68%, 2% 59%, 0% 51%, 2% 42%, 0% 34%, 2% 25%, 0% 17%, 2% 9%)'

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
        padding: '14px 14px 12px',
        marginTop: 10,
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
    audioEngine.stopAllSFXAndVoices()
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

    audioEngine.stopAllSFXAndVoices()
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
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playSfx('sfx_spell_quest')
    voiceDelayRef.current = window.setTimeout(() => {
      audioEngine.playVoice('voice_tap_yay')
    }, 240)
    setAccepted(true)
    setBubble(BUBBLE_LINES.ready)

    if (onComplete) {
      onComplete()
    }
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
          padding: '88px 16px 28px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            position: 'relative',
            width: 'min(400px, 100%)',
            maxWidth: 400,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '50%',
              top: -18,
              zIndex: 4,
              width: 68,
              height: 68,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 32% 28%, #f07a7a 0%, #c41e2a 38%, #9b1520 62%, #5c0b12 100%)',
              boxShadow:
                '0 10px 18px rgba(0, 0, 0, 0.45), inset 0 3px 6px rgba(255, 180, 180, 0.35), inset 0 0 0 3px rgba(140, 18, 24, 0.85)',
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
                fontSize: 21,
                letterSpacing: 1,
                textShadow: '0 2px 0 #5c0b12, 0 0 8px rgba(212, 175, 55, 0.45)',
              }}
            >
              30
            </span>
          </div>

          <div
            style={{
              padding: 11,
              background:
                'linear-gradient(160deg, #5a341d 0%, #2b160c 42%, #1a0c08 100%)',
              boxShadow:
                '0 24px 60px rgba(0, 0, 0, 0.55), inset 0 0 0 2px #8a5a32, inset 0 0 28px rgba(0, 0, 0, 0.55)',
              clipPath: DECKLE,
            }}
          >
          <div
            style={{
              clipPath: DECKLE,
              padding: '36px 18px 18px',
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
                width: 72,
                height: 72,
                margin: '0 auto',
                borderRadius: '50%',
                border: `2px solid ${GOLD}`,
                background: 'linear-gradient(160deg, #2a1d4a 0%, #120c22 70%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                animation: 'mageGlow 2.8s ease-in-out infinite',
              }}
              aria-hidden="true"
            >
              🧙
            </div>

            <p
              style={{
                marginTop: 8,
                letterSpacing: 3,
                fontSize: 10,
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
                  padding: '12px 12px',
                  animation: 'bubbleIn 0.45s ease',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    lineHeight: 1.5,
                    fontSize: 15,
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
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: 4,
                  border: `1px solid ${GOLD}`,
                  background: GOLD,
                  color: '#1a0c08',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  fontSize: 12,
                  lineHeight: 1.3,
                  cursor: accepted ? 'default' : 'pointer',
                  boxShadow: '0 0 16px rgba(212, 175, 55, 0.35)',
                }}
              >
                I ACCEPT THE WIZARDING QUEST
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
    minWidth: 108,
    padding: '9px 18px',
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
