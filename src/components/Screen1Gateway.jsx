import { useEffect, useRef, useState } from 'react'
import useCompanionDirector from '../hooks/useCompanionDirector'
import { fonts, theme } from '../theme'
import audioEngine from '../utils/audioEngine'
import CaptionRail from './ui/CaptionRail'
import GingerCat3D from './GingerCat3D'
import MiniMeAvatar3D from './MiniMeAvatar3D'

const CREAM = theme.cream

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

function stripSpeaker(line = '') {
  const cleaned = line.replace(/^💬\s*Gokul-Mage:\s*/i, '').replace(/^["“]|["”]$/g, '')
  return cleaned.trim() || line
}

export default function Screen1Gateway({
  onComplete,
  onEnsureAudio,
  canContinueHunt = false,
  onContinueHunt,
}) {
  const stageRef = useRef(null)
  const yesRef = useRef(null)
  const noRef = useRef(null)
  const trapLockRef = useRef(0)
  const trappingRef = useRef(false)
  const introStarted = useRef(false)
  const [noPos, setNoPos] = useState(null)
  const [trapping, setTrapping] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const companions = useCompanionDirector({
    active: !accepted,
    paused: trapping,
    intervalMs: [4200, 7500],
  })

  const ensureAudio = async () => {
    if (onEnsureAudio) await onEnsureAudio()
    else await audioEngine.unlock()
  }

  useEffect(() => {
    if (introStarted.current) return undefined
    introStarted.current = true
    let cancelled = false
    ;(async () => {
      await ensureAudio()
      if (!cancelled) await companions.playIntro()
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const teleportNo = async () => {
    if (accepted) return

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
    if (accepted) return
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
      className="ar-btn-3d ar-btn-3d--ghost"
      style={{
        position: extraStyle.position || 'relative',
        minWidth: 140,
        padding: '10px 18px',
        fontSize: 13,
        ...extraStyle,
      }}
    >
      No, thanks 😜
      {trapping && extraStyle.position === 'absolute' && (
        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: -92,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          <GingerCat3D pose="leap" size={88} heartsOnTap={false} />
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
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'transparent',
        color: CREAM,
        fontFamily: fonts.body,
      }}
    >
      <style>
        {`
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '72px 16px 28px',
          gap: 12,
        }}
      >
        <header
          style={{
            width: 'min(520px, 100%)',
            textAlign: 'center',
            animation: 'arTitleIn 0.7s ease both',
          }}
        >
          <p className="ar-quest-kicker" style={{ margin: 0 }}>
            Hogwarts Secret Protocol 0510
          </p>
          <h1
            className="ar-quest-title"
            style={{ margin: '10px 0 0', fontSize: 'clamp(22px, 5.5vw, 34px)' }}
          >
            THE SEARCH FOR A STRAY HEART
          </h1>
          <p className="ar-quest-sub" style={{ margin: '12px auto 0', maxWidth: 360, fontSize: 15 }}>
            Thirty years of magic, and today begins your greatest quest yet!
          </p>
        </header>

        <div
          style={{
            position: 'relative',
            width: 'min(420px, 100%)',
            minHeight: 250,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'arStageIn 0.85s cubic-bezier(0.2, 1.1, 0.3, 1) both',
          }}
        >
          <div
            className="ar-stage-glow"
            aria-hidden="true"
            style={{ position: 'absolute', inset: '-10% -20% 0', zIndex: 0 }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '18%',
              right: '18%',
              bottom: 10,
              height: 18,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              filter: 'blur(10px)',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 2,
            }}
          >
            <MiniMeAvatar3D size={220} pose={miniPose} peek={trapping} talking={companions.lipTalking} />
            <div style={{ marginLeft: -36, marginBottom: 8 }}>
              <GingerCat3D pose={gingerPose} size={170} />
            </div>
          </div>
          {companions.yarnVisible && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '42%',
                top: 36,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #FFF3B0, #E8C56A 60%, #8A6A12)',
                boxShadow: '0 0 16px rgba(232, 197, 106, 0.7)',
                animation: 'yarnArc3d 0.7s ease forwards',
                zIndex: 2,
              }}
            />
          )}
        </div>

        <div
          style={{
            width: 'min(400px, 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'center',
            animation: 'arTitleIn 0.75s ease 0.12s both',
          }}
        >
          <CaptionRail
            visible={companions.showSpeech && !!companions.speech}
            speaker="Gokul-Mage"
          >
            {stripSpeaker(companions.speech)}
          </CaptionRail>

          <button
            ref={yesRef}
            type="button"
            onClick={handleAccept}
            disabled={accepted}
            className="ar-btn-3d ar-btn-3d--gold"
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: 14,
              lineHeight: 1.3,
              cursor: accepted ? 'default' : 'pointer',
              opacity: accepted ? 0.75 : 1,
            }}
          >
            I ACCEPT THE WIZARDING QUEST
          </button>
          {!noPos && !accepted && trapButton()}
          {canContinueHunt && !accepted && (
            <button
              type="button"
              onClick={onContinueHunt}
              className="ar-btn-3d ar-btn-3d--ghost"
              style={{ width: '100%', padding: '12px 16px', fontSize: 13 }}
            >
              Continue hunt
            </button>
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
