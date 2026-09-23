import { useLayoutEffect, useRef, useState } from 'react'
import { MONTAGE_YOUTUBE_ID } from '../config/media'
import { fonts } from '../theme'
import audioEngine from '../utils/audioEngine'
import CaptionRail from './ui/CaptionRail'
import DeviceFrame from './ui/DeviceFrame'

const LIFT_MS = 1100

/**
 * Gold Horizon Lift: the caption rail's gold rule rises and opens the reel.
 * Same screen as the friends/family montage — no extra phase.
 */
export default function ScreenVideoMontage({ onContinue }) {
  const stageRef = useRef(null)
  const wellRef = useRef(null)
  const railRef = useRef(null)
  const [phase, setPhase] = useState('cover')

  useLayoutEffect(() => {
    const stage = stageRef.current
    const well = wellRef.current
    const rail = railRef.current
    const line = stage?.querySelector('.ar-horizon-line')
    const veil = stage?.querySelector('.ar-horizon-veil')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const playCue = () => {
      audioEngine.playSoftCue('horizon')
    }

    if (!stage || !well || !rail || !line || !veil || reduce) {
      setPhase('settled')
      playCue()
      return undefined
    }

    const stageBox = stage.getBoundingClientRect()
    const wellBox = well.getBoundingClientRect()
    const railBox = rail.getBoundingClientRect()
    const start = railBox.top - stageBox.top
    const end = wellBox.top - stageBox.top + 1
    const span = Math.max(1, wellBox.bottom - stageBox.top - end)
    if (start - end < 12) {
      setPhase('settled')
      playCue()
      return undefined
    }

    // Compositor transforms, same clock. A main-thread hitch (WebGL startup)
    // must not skip the opening.
    const travel = end - start
    const hold = Math.min(0.72, Math.max(0, 1 - span / Math.max(1, start - end)))
    line.style.top = `${start}px`
    line.style.opacity = '1'
    setPhase('lifting')
    playCue()

    const lift = line.animate(
      [
        { transform: 'translateY(0)', opacity: 1 },
        { transform: `translateY(${travel * 0.9}px)`, opacity: 1, offset: 0.9 },
        { transform: `translateY(${travel}px)`, opacity: 0 },
      ],
      { duration: LIFT_MS, easing: 'linear', fill: 'forwards' }
    )
    veil.animate(
      [
        { transform: 'scaleY(1)', offset: 0 },
        { transform: 'scaleY(1)', offset: hold },
        { transform: 'scaleY(0)', offset: 1 },
      ],
      { duration: LIFT_MS, easing: 'linear', fill: 'forwards' }
    )
    lift.onfinish = () => setPhase('settled')

    return () => lift.cancel()
  }, [])

  return (
    <section
      className="ar-letterbox"
      style={{
        position: 'relative',
        zIndex: 2,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '88px 20px calc(7vh + 18px)',
        textAlign: 'center',
        fontFamily: fonts.body,
        gap: 14,
      }}
    >
      <header style={{ animation: 'arTitleIn 0.55s ease both' }}>
        <p className="ar-quest-kicker" style={{ margin: 0 }}>
          Memory Reel
        </p>
      </header>

      <div
        ref={stageRef}
        className={`ar-horizon-stage${phase === 'lifting' ? ' is-lifting' : ''}${
          phase === 'settled' ? ' is-settled' : ''
        }`}
        data-horizon={phase}
      >
        <DeviceFrame style={{ width: '100%', padding: 12 }}>
          <div ref={wellRef} className="ar-reel-well">
            {MONTAGE_YOUTUBE_ID ? (
              <iframe
                title="Birthday memory montage"
                src={`https://www.youtube.com/embed/${MONTAGE_YOUTUBE_ID}?autoplay=1&rel=0`}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div style={{ padding: 28, height: '100%' }}>
                <p className="ar-quest-kicker" style={{ margin: 0 }}>
                  Intro Romantic Video Montage
                </p>
                <p className="ar-quest-sub" style={{ margin: '14px auto 0', maxWidth: 260, fontSize: 14 }}>
                  Friends&apos; wishes, romantic moments, and warmth before the hologram.
                </p>
              </div>
            )}
            <div className="ar-horizon-veil" aria-hidden="true" />
          </div>
        </DeviceFrame>

        <span className="ar-horizon-line" aria-hidden="true" />

        <div ref={railRef}>
          <CaptionRail className="ar-caption-rail--horizon" visible>
            A memory stirs in the Floo fire...
          </CaptionRail>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="ar-btn-3d ar-btn-3d--gold"
        style={{
          width: 'min(400px, 100%)',
          padding: '13px 20px',
          fontSize: 14,
        }}
      >
        Continue — a wish awaits
      </button>
    </section>
  )
}
