import { useEffect, useRef, useState } from 'react'
import { UNCLE_WISH_POSTER, UNCLE_WISH_URL, UNCLE_WISH_YOUTUBE_ID } from '../config/media'
import { fonts, theme } from '../theme'
import audioEngine from '../utils/audioEngine'
import CaptionRail from './ui/CaptionRail'
import GingerCat3D from './GingerCat3D'

const COACH =
  'Find a clear wall, love. I’ll project uncle’s wish into the air — or tap me to summon it.'

export default function ScreenUncleHologram({ onContinue, onEnsureAudio }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [camReady, setCamReady] = useState(false)
  const [camDenied, setCamDenied] = useState(false)
  const [summoned, setSummoned] = useState(false)
  const [bloom, setBloom] = useState(false)
  const [gingerPose, setGingerPose] = useState('idle')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          if (!cancelled) setCamDenied(true)
          return
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const el = document.getElementById('ar-uncle-cam')
        if (el) {
          el.srcObject = stream
          await el.play().catch(() => {})
        }
        setCamReady(true)
      } catch {
        if (!cancelled) setCamDenied(true)
      }
    })()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const ensureAudio = async () => {
    if (onEnsureAudio) await onEnsureAudio()
    else await audioEngine.unlock()
  }

  const summon = async () => {
    if (summoned) return
    await ensureAudio()
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playLayered(['sfx_spell_quest', 'sfx_soft_chime'])
    setBloom(true)
    setGingerPose('cheer')
    window.setTimeout(() => setBloom(false), 900)
    setSummoned(true)
    setGingerPose('sit')
    window.setTimeout(() => {
      videoRef.current?.play?.().catch(() => {})
    }, 200)
  }

  const handleEnded = () => {
    setGingerPose('cheer')
  }

  return (
    <section
      className="ar-letterbox"
      style={{
        position: 'relative',
        zIndex: 2,
        minHeight: '100vh',
        overflow: 'hidden',
        fontFamily: fonts.body,
        color: theme.cream,
      }}
    >
      <video
        id="ar-uncle-cam"
        muted
        playsInline
        autoPlay
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: camReady ? 1 : 0,
          transition: 'opacity 0.6s ease',
          zIndex: 0,
        }}
      />
      {!camReady && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background:
              'radial-gradient(ellipse at 50% 40%, rgba(30, 50, 70, 0.9), rgba(6, 11, 20, 0.98))',
          }}
        />
      )}

      {bloom && <div className="ar-summon-bloom" aria-hidden="true" style={{ zIndex: 3 }} />}

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '88px 16px 28px',
          gap: 16,
        }}
      >
        <header style={{ textAlign: 'center', animation: 'arTitleIn 0.6s ease both' }}>
          <p className="ar-quest-kicker" style={{ margin: 0 }}>
            Patronus Projection
          </p>
          <h1 className="ar-quest-title" style={{ margin: '8px 0 0', fontSize: 22 }}>
            A wish from beyond the veil
          </h1>
        </header>

        <div
          style={{
            width: 'min(360px, 94vw)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          {summoned ? (
            <div
              className="ar-holo-panel"
              style={{
                width: '100%',
                aspectRatio: '9 / 16',
                maxHeight: '52vh',
                animation: 'arStageIn 0.7s ease both',
              }}
            >
              {UNCLE_WISH_YOUTUBE_ID ? (
                <iframe
                  title="Uncle birthday wish"
                  src={`https://www.youtube.com/embed/${UNCLE_WISH_YOUTUBE_ID}?autoplay=1&rel=0`}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none', minHeight: 280 }}
                />
              ) : UNCLE_WISH_URL ? (
                <video
                  ref={videoRef}
                  src={UNCLE_WISH_URL}
                  poster={UNCLE_WISH_POSTER || undefined}
                  controls
                  playsInline
                  autoPlay
                  onEnded={handleEnded}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="ar-holo-placeholder"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    textAlign: 'center',
                    minHeight: 280,
                  }}
                >
                  <p className="ar-quest-kicker" style={{ margin: 0 }}>
                    Hologram projected
                  </p>
                  <p className="ar-quest-sub" style={{ margin: '12px 0 0', fontSize: 14 }}>
                    Uncle’s wish will appear here. Paste a YouTube ID into{' '}
                    <code style={{ color: theme.gold }}>UNCLE_WISH_YOUTUBE_ID</code> when you have
                    it — no local file needed.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', animation: 'arStageIn 0.75s ease both' }}>
              <GingerCat3D
                pose={gingerPose}
                size={180}
                onTap={summon}
                heartsOnTap={false}
              />
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 12,
                  letterSpacing: 1,
                  color: 'rgba(126, 240, 255, 0.85)',
                  fontFamily: fonts.display,
                }}
              >
                Tap Ginger to summon
              </p>
            </div>
          )}
        </div>

        <div
          style={{
            width: 'min(400px, 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <CaptionRail visible speaker="Ginger">
            {summoned
              ? 'There — hold steady. Let his words find you.'
              : camDenied
                ? 'No camera needed, love. Press play when you’re ready.'
                : COACH}
          </CaptionRail>

          {!summoned && (
            <>
              <button
                type="button"
                className="ar-btn-3d ar-btn-3d--holo"
                onClick={summon}
                style={{ width: '100%', padding: '13px 16px', fontSize: 14 }}
              >
                Summon the wish
              </button>
              <button
                type="button"
                className="ar-btn-3d ar-btn-3d--ghost"
                onClick={summon}
                style={{ width: '100%', padding: '11px 16px', fontSize: 13 }}
              >
                Play uncle’s wish
              </button>
            </>
          )}

          {summoned && (
            <button
              type="button"
              className="ar-btn-3d ar-btn-3d--gold"
              onClick={onContinue}
              style={{ width: '100%', padding: '13px 16px', fontSize: 14 }}
            >
              Continue the quest
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
