import { useEffect, useRef, useState } from 'react'
import audioEngine from '../utils/audioEngine'

const GOLD = '#D4AF37'
const INK = '#3B2414'
const VELVET = '#0F0A1C'

const TRAP_BUBBLE = 'Hey! No skipping your own birthday surprise! Try again! 😜'

const DECKLE =
  'polygon(1% 3%, 4% 0%, 9% 2%, 14% 0%, 19% 3%, 24% 1%, 30% 3%, 36% 0%, 42% 2%, 48% 0%, 54% 3%, 61% 1%, 67% 3%, 73% 0%, 79% 2%, 85% 0%, 91% 3%, 96% 1%, 99% 4%, 100% 10%, 98% 16%, 100% 23%, 98% 31%, 100% 39%, 98% 47%, 100% 56%, 98% 65%, 100% 73%, 98% 81%, 100% 88%, 97% 94%, 99% 98%, 94% 100%, 88% 97%, 81% 100%, 74% 98%, 67% 100%, 60% 97%, 53% 100%, 46% 98%, 39% 100%, 32% 97%, 25% 100%, 18% 98%, 11% 100%, 5% 97%, 0% 99%, 2% 92%, 0% 84%, 2% 76%, 0% 68%, 2% 59%, 0% 51%, 2% 42%, 0% 34%, 2% 25%, 0% 17%, 2% 9%)'

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
        marginTop: 8,
      }}
    >
      <svg
        viewBox="0 0 360 160"
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
          d="M18 132 C50 148, 90 138, 140 144 S230 152, 342 136"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.4"
        />
        <path
          d="M12 40 C6 70, 8 90, 16 130"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.2"
        />
        <path
          d="M348 40 C354 70, 352 90, 344 130"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.2"
        />
        <circle cx="18" cy="28" r="3" fill={GOLD} />
        <circle cx="342" cy="22" r="3" fill={GOLD} />
        <circle cx="18" cy="132" r="3" fill={GOLD} />
        <circle cx="342" cy="136" r="3" fill={GOLD} />
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
  const [noPos, setNoPos] = useState(null)
  const [trapping, setTrapping] = useState(false)
  const [accepted, setAccepted] = useState(false)

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
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playLayered(['sfx_wand_swish', 'voice_no_nice_try'])
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
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playLayered(['sfx_spell_quest', 'voice_tap_yay'])
    setAccepted(true)

    if (onComplete) {
      onComplete()
    }
  }

  useEffect(() => {
    if (!trapping) {
      return undefined
    }
    const timer = window.setTimeout(() => setTrapping(false), 900)
    return () => window.clearTimeout(timer)
  }, [trapping, noPos])

  const trapButton = (
    extraStyle,
    { inFlow = false } = {}
  ) => (
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
        ...trapButtonStyle(trapping),
        ...extraStyle,
      }}
    >
      No, thanks 😜
      {!inFlow && trapping && (
        <span style={fleeBubbleStyle}>{TRAP_BUBBLE}</span>
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
          @keyframes mageGlow {
            0%, 100% { box-shadow: 0 0 12px rgba(212, 175, 55, 0.45); }
            50% { box-shadow: 0 0 28px rgba(212, 175, 55, 0.9); }
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
          @keyframes bubblePop {
            from { opacity: 0; transform: translate(-50%, 6px) scale(0.9); }
            to { opacity: 1; transform: translate(-50%, 0) scale(1); }
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
                padding: '36px 18px 16px',
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
                }}
              >
                THE SEARCH FOR A STRAY HEART
              </h1>

              <div
                style={{
                  width: 78,
                  height: 78,
                  margin: '12px auto 0',
                  borderRadius: '50%',
                  border: `3px solid ${GOLD}`,
                  background: 'linear-gradient(160deg, #2a1d4a 0%, #120c22 70%)',
                  overflow: 'hidden',
                  animation: 'mageGlow 2.8s ease-in-out infinite',
                }}
              >
                <img
                  src="/avatar.png"
                  alt="Gokul-Mage"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 18%',
                  }}
                />
              </div>

              <ScrollworkFrame>
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    background: 'rgba(255, 248, 230, 0.62)',
                    border: `1px solid ${GOLD}`,
                    borderRadius: 10,
                    padding: '12px 12px',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      lineHeight: 1.45,
                      fontSize: 13,
                      color: INK,
                      textAlign: 'center',
                    }}
                  >
                    💬 <strong>Gokul-Mage:</strong> &ldquo;Aishwarya! Gokul-Mage lost a piece of Gokul&apos;s heart in our home! Help me find it! 💖&rdquo;
                  </p>
                </div>
              </ScrollworkFrame>

              <p
                style={{
                  margin: '8px 4px 0',
                  fontSize: 12,
                  lineHeight: 1.5,
                  textAlign: 'center',
                  color: INK,
                }}
              >
                Thirty years of magic, and today begins your greatest quest yet! Follow Gokul-Mage’s clues around our home, find the 27 physical photo cards, and unlock your birthday vault!
              </p>

              <div
                style={{
                  marginTop: 14,
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
                    color: VELVET,
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    fontSize: 12,
                    lineHeight: 1.3,
                    cursor: accepted ? 'default' : 'pointer',
                    boxShadow: '0 0 18px rgba(212, 175, 55, 0.55)',
                  }}
                >
                  I ACCEPT THE WIZARDING QUEST ✨
                </button>

                {!noPos && !accepted && trapButton({}, { inFlow: true })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {noPos && !accepted &&
        trapButton({
          position: 'absolute',
          left: noPos.x,
          top: noPos.y,
          zIndex: 5,
          animation: trapping ? 'vanishPop 0.35s ease' : 'none',
        })}
    </section>
  )
}

function trapButtonStyle(trapping) {
  return {
    position: 'relative',
    minWidth: 128,
    padding: '9px 18px',
    borderRadius: 4,
    border: '1px solid rgba(59, 36, 20, 0.35)',
    background: 'transparent',
    color: INK,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: 700,
    letterSpacing: 0.4,
    cursor: 'pointer',
    opacity: trapping ? 0.85 : 1,
  }
}

const fleeBubbleStyle = {
  position: 'absolute',
  left: '50%',
  bottom: 'calc(100% + 8px)',
  width: 220,
  transform: 'translateX(-50%)',
  background: '#fff8e6',
  color: INK,
  border: `1px solid ${GOLD}`,
  borderRadius: 10,
  padding: '8px 10px',
  fontSize: 12,
  lineHeight: 1.35,
  boxShadow: '0 8px 18px rgba(0,0,0,0.25)',
  animation: 'bubblePop 0.25s ease',
  pointerEvents: 'none',
  zIndex: 6,
}
