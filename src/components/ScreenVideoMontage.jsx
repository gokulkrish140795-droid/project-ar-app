const GOLD = '#D4AF37'
const PARCHMENT = '#F4E8C1'
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
      }}
    >
      <div
        style={{
          width: 'min(420px, 100%)',
          aspectRatio: '9 / 16',
          maxHeight: '72vh',
          border: `1px solid ${GOLD}`,
          background: 'rgba(15, 10, 28, 0.72)',
          boxShadow: '0 0 40px rgba(212, 175, 55, 0.18)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {YOUTUBE_ID ? (
          <iframe
            title="Birthday memory montage"
            src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <div style={{ padding: 24 }}>
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
                margin: '12px 0 0',
                color: PARCHMENT,
                fontSize: 26,
                fontWeight: 500,
              }}
            >
              A memory stirs in the Floo fire...
            </h2>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onContinue}
        style={{
          marginTop: 18,
          padding: '11px 18px',
          borderRadius: 999,
          border: `1px solid ${GOLD}`,
          background: 'rgba(212, 175, 55, 0.18)',
          color: GOLD,
          fontFamily: 'inherit',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 0 18px rgba(212, 175, 55, 0.35)',
        }}
      >
        ✨ Continue to Scavenger Hunt ➔
      </button>
    </section>
  )
}
