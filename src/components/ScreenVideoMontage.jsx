import { MONTAGE_YOUTUBE_ID } from '../config/media'
import { fonts, theme } from '../theme'
import DeviceFrame from './ui/DeviceFrame'

const GOLD = theme.gold

export default function ScreenVideoMontage({ onContinue }) {
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
        padding: '88px 20px 28px',
        textAlign: 'center',
        fontFamily: fonts.body,
        gap: 18,
      }}
    >
      <header style={{ animation: 'arTitleIn 0.55s ease both' }}>
        <p className="ar-quest-kicker" style={{ margin: 0 }}>
          Memory Reel
        </p>
        <h2 className="ar-quest-title" style={{ margin: '8px 0 0', fontSize: 22 }}>
          A memory stirs in the Floo fire...
        </h2>
      </header>

      <DeviceFrame
        style={{ width: 'min(400px, 100%)', padding: 12 }}
        className=""
      >
        <div
          style={{
            position: 'relative',
            aspectRatio: '9 / 16',
            maxHeight: '58vh',
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
              <p className="ar-quest-sub" style={{ margin: '14px auto 0', maxWidth: 260, fontSize: 14 }}>
                Friends&apos; wishes, romantic moments, and warmth before the hologram.
              </p>
            </div>
          )}
        </div>
      </DeviceFrame>

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
