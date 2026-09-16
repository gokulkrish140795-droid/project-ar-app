import { useEffect, useRef, useState } from 'react'
import audioEngine from '../utils/audioEngine'
import GingerCatCompanion from './GingerCatCompanion'
import MiniMeAvatar from './MiniMeAvatar'

const GOLD = '#D4AF37'
const INK = '#3B2414'
const VELVET = '#0F0A1C'
const QUEST_QUOTE =
  '💬 Gokul-Mage: “Aishwarya! Gokul-Mage lost a piece of Gokul\'s heart in our home! Help me find it! 💖”'
const TRAP_QUOTE = 'Nice try, my love! Ginger and I say only YES works! 😜'
const PLAY_POSES = ['yarn', 'scratch', 'bump']

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
  const [speech, setSpeech] = useState(QUEST_QUOTE)
  const [showSpeech, setShowSpeech] = useState(false)
  const [playPose, setPlayPose] = useState('idle')
  const [yarnVisible, setYarnVisible] = useState(false)

  const ensureAudio = async () => {
    if (onEnsureAudio) {
      await onEnsureAudio()
    } else {
      await audioEngine.unlock()
    }
  }

  const openScroll = async () => {
    if (opened || unrolling) {
      return
    }

    setUnrolling(true)
    await ensureAudio()
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playSfx('sfx_wax_crack')

    window.setTimeout(() => {
      setOpened(true)
      setUnrolling(false)
      setShowSpeech(true)
      setSpeech(QUEST_QUOTE)
    }, 720)
  }

  const teleportNo = async () => {
    if (accepted || !opened) {
      return
    }

    const now = Date.now()
    if (now - trapLockRef.current < 280) {
      return
    }
    trapLockRef.current = now

    await ensureAudio()
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playLayered(['sfx_wand_swish', 'sfx_cat_meow', 'voice_no_nice_try'])
    trappingRef.current = true
    setTrapping(true)
    setSpeech(TRAP_QUOTE)
    setShowSpeech(true)

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
    if (accepted || !opened) {
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
    const timer = window.setTimeout(() => {
      trappingRef.current = false
      setTrapping(false)
    }, 1100)
    return () => window.clearTimeout(timer)
  }, [trapping, noPos])

  useEffect(() => {
    if (!opened || accepted) {
      return undefined
    }

    let cancelled = false
    const schedule = () => {
      const wait = 12000 + Math.random() * 3000
      return window.setTimeout(() => {
        if (cancelled || trappingRef.current) {
          return
        }
        const next = PLAY_POSES[Math.floor(Math.random() * PLAY_POSES.length)]
        setPlayPose(next)
        setYarnVisible(next === 'yarn')
        if (next === 'scratch') {
          audioEngine.stopAllSFXAndVoices()
          audioEngine.playSfx('sfx_cat_purr')
          if (navigator.vibrate) {
            navigator.vibrate(80)
          }
        } else if (next === 'bump') {
          audioEngine.stopAllSFXAndVoices()
          audioEngine.playSfx('sfx_revelio_bell')
        }
        window.setTimeout(() => {
          if (!cancelled) {
            setPlayPose('idle')
            setYarnVisible(false)
          }
        }, 1400)
        timer = schedule()
      }, wait)
    }

    let timer = schedule()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [opened, accepted])

  const miniPose = trapping ? 'idle' : playPose

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
            top: -58,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          <GingerCatCompanion pose="sit" size={64} />
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
          @keyframes sealPulse {
            0%, 100% { transform: rotate(-8deg) scale(1); }
            50% { transform: rotate(-6deg) scale(1.05); }
          }
          @keyframes sealCrack {
            0% { transform: rotate(-8deg) scale(1); }
            40% { transform: rotate(12deg) scale(1.12); }
            100% { transform: rotate(18deg) scale(0.2); opacity: 0; }
          }
          @keyframes unroll {
            from { max-height: 86px; }
            to { max-height: 640px; }
          }
          @keyframes yarnArc {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(54px, 28px) scale(0.85); opacity: 0.2; }
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
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '88px 16px 28px',
        }}
      >
        <div style={{ width: 'min(360px, 100%)', maxWidth: 360 }}>
          {!opened && (
            <button
              type="button"
              onClick={openScroll}
              aria-label="Tap the crimson wax seal to open the scroll"
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                position: 'relative',
                padding: 0,
              }}
            >
              <div
                style={{
                  height: 86,
                  borderRadius: 42,
                  background:
                    'linear-gradient(180deg, rgba(214, 180, 118, 0.88), rgba(196, 154, 86, 0.82))',
                  boxShadow: '0 18px 36px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(122, 78, 32, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    width: '86%',
                    height: 10,
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #C9A227, #F4E08A, #C9A227)',
                    boxShadow: '0 0 12px rgba(212, 175, 55, 0.55)',
                  }}
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  marginLeft: -34,
                  marginTop: -34,
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 32% 28%, #f07a7a 0%, #c41e2a 38%, #9b1520 62%, #5c0b12 100%)',
                  boxShadow:
                    '0 10px 18px rgba(0, 0, 0, 0.45), inset 0 3px 6px rgba(255, 180, 180, 0.35), inset 0 0 0 3px rgba(140, 18, 24, 0.85)',
                  animation: unrolling ? 'sealCrack 0.7s ease forwards' : 'sealPulse 4.5s ease-in-out infinite',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: GOLD,
                  fontWeight: 700,
                  fontSize: 21,
                  textShadow: '0 2px 0 #5c0b12, 0 0 8px rgba(212, 175, 55, 0.45)',
                }}
              >
                30
              </div>
            </button>
          )}

          {opened && (
            <div
              style={{
                overflow: 'hidden',
                animation: 'unroll 0.7s ease',
                maxWidth: 360,
                borderRadius: 18,
                background: 'rgba(245, 230, 200, 0.82)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 18px 40px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(212, 175, 55, 0.45)',
                padding: '18px 16px 16px',
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
              <p
                style={{
                  margin: '10px 4px 0',
                  fontSize: 13,
                  lineHeight: 1.5,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #FFF0C2, #D4AF37)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  filter: 'drop-shadow(0 1px 2px rgba(80, 40, 8, 0.35))',
                  fontWeight: 700,
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
                  minHeight: 120,
                }}
              >
                <MiniMeAvatar
                  size={88}
                  speech={speech}
                  showSpeech={showSpeech}
                  pose={miniPose}
                  peek={trapping}
                />
                <GingerCatCompanion pose={trapping ? 'leap' : playPose} size={86} />
                {yarnVisible && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 86,
                      top: 18,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background:
                        'radial-gradient(circle at 30% 30%, #FFF3B0, #D4AF37 60%, #8A6A12)',
                      boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
                      animation: 'yarnArc 0.7s ease forwards',
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
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: 999,
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
                  🪄 I ACCEPT THE WIZARDING QUEST ✨
                </button>
                {!noPos && !accepted && trapButton()}
              </div>
            </div>
          )}
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
