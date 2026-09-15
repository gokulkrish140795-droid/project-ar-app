export default function ScreenVideoMontage() {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 2,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      <div
        style={{
          maxWidth: 420,
          padding: '28px 24px',
          border: '1px solid #D4AF37',
          background: 'rgba(15, 10, 28, 0.72)',
          boxShadow: '0 0 40px rgba(212, 175, 55, 0.18)',
        }}
      >
        <p
          style={{
            margin: 0,
            letterSpacing: 3,
            fontSize: 11,
            color: '#D4AF37',
            textTransform: 'uppercase',
          }}
        >
          Intro Romantic Video Teaser
        </p>
        <h2
          style={{
            margin: '12px 0 0',
            color: '#F4E8C1',
            fontSize: 26,
            fontWeight: 500,
          }}
        >
          A memory stirs in the Floo fire...
        </h2>
      </div>
    </section>
  )
}
