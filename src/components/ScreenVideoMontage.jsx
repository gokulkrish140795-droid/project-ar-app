import { theme } from '../theme'
import DepthFrame from './DepthFrame'

const GOLD = theme.gold
const PARCHMENT = theme.parchmentSoft
const YOUTUBE_ID = ''

export default function ScreenVideoMontage({ onContinue }) {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 2,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        fontFamily: 'Georgia, "Times New Roman", serif',
        perspective: 1200,
      }}
    >
      <style>
        {`
          @keyframes frameBob {
            0%, 100% { transform: rotateY(-4deg) rotateX(3deg) translateY(0); }
            50% { transform: rotateY(4deg) rotateX(2deg) translateY(-8px); }
          }
        `}
      </style>

      <DepthFrame
        style={{
          width: 'min(420px, 100%)',
          padding: 14,
          animation: 'frameBob 7s ease-in-out infinite',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          style={{
            position: 'relative',
            aspectRatio: '9 / 16',
            maxHeight: '68vh',
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid rgba(212, 175, 55, 0.55)`,
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(80, 40, 90, 0.55), rgba(15, 10, 28, 0.95))',
            boxShadow:
              'inset 0 0 40px rgba(0,0,0,0.45), 0 20px 40px rgba(0,0,0,0.4), 0 0 28px rgba(212,175,55,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Ornate top crest */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 56,
              height: 18,
              borderRadius: 999,
              background: `linear-gradient(180deg, ${theme.goldBright}, ${GOLD})`,
              boxShadow: '0 0 16px rgba(212,175,55,0.55)',
              zIndex: 2,
            }}
          />

          {YOUTUBE_ID ? (
            <iframe
              title="Birthday memory montage"
              src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
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
                }}
              >
                Intro Romantic Video Montage
              </p>
              <h2
                style={{
                  margin: '14px 0 0',
                  color: PARCHMENT,
                  fontSize: 26,
                  fontWeight: 500,
                  textShadow: '0 4px 24px rgba(212,175,55,0.35)',
                }}
              >
                A memory stirs in the Floo fire...
              </h2>
              <p
                style={{
                  margin: '12px auto 0',
                  maxWidth: 260,
                  color: 'rgba(244,232,193,0.75)',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Friends&apos; wishes, romantic moments, and a warm greeting from beyond the veil.
              </p>
            </div>
          )}
        </div>
      </DepthFrame>

      <button
        type="button"
        onClick={onContinue}
        className="ar-btn-3d ar-btn-3d--gold"
        style={{
          marginTop: 22,
          padding: '12px 20px',
          fontSize: 14,
        }}
      >
        ✨ Continue to Scavenger Hunt ➔
      </button>
    </section>
  )
}
