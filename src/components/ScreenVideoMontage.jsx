import { MONTAGE_YOUTUBE_ID } from '../config/media'
import { fonts, theme } from '../theme'
import CaptionRail from './ui/CaptionRail'
import DeviceFrame from './ui/DeviceFrame'

const GOLD = theme.gold

export default function ScreenVideoMontage({ onContinue }) {
  return (
    <section className="ar-beat ar-letterbox">
      <DeviceFrame compact className="ar-beat__mast" style={{ animation: 'arTitleIn 0.55s ease both' }}>
        <p className="ar-quest-kicker" style={{ margin: 0 }}>
          Memory Reel
        </p>
        <h2 className="ar-quest-title" style={{ margin: '8px 0 0', fontSize: 22 }}>
          A memory stirs in the Floo fire...
        </h2>
      </DeviceFrame>

      <DeviceFrame
        className="ar-beat__stage"
        style={{ width: 'min(400px, 100%)', padding: 12, alignItems: 'stretch' }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '9 / 16',
            maxHeight: '46vh',
            borderRadius: 10,
            overflow: 'hidden',
            border: `1px solid rgba(232, 197, 106, 0.4)`,
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(40, 60, 90, 0.55), rgba(8, 12, 22, 0.95))',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {MONTAGE_YOUTUBE_ID ? (
            <iframe
              title="Birthday memory montage"
              src={`https://www.youtube.com/embed/${MONTAGE_YOUTUBE_ID}?autoplay=1&rel=0`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <div style={{ padding: 28 }}>
              <p
                style={{
                  margin: 0,
                  letterSpacing: 3,
                  fontSize: 11,
                  color: GOLD,
                  textTransform: 'uppercase',
                  fontFamily: fonts.display,
                }}
              >
                Intro Romantic Video Montage
              </p>
            </div>
          )}
        </div>
      </DeviceFrame>

      <div className="ar-beat__dock">
        <CaptionRail visible speaker="Memory Reel">
          Friends&apos; wishes, romantic moments, and warmth before the hologram.
        </CaptionRail>
        <button
          type="button"
          onClick={onContinue}
          className="ar-btn-3d ar-btn-3d--gold"
          style={{
            width: '100%',
            padding: '13px 20px',
            fontSize: 14,
          }}
        >
          Continue — a wish awaits
        </button>
      </div>
    </section>
  )
}
