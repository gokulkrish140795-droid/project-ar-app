const GOLD = '#D4AF37'
const PARCHMENT = '#F4E8C1'

export default function ScreenHunt() {
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
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      <div
        style={{
          width: 'min(400px, 100%)',
          padding: '28px 22px',
          border: `1px solid ${GOLD}`,
          background: 'rgba(15, 10, 28, 0.78)',
          boxShadow: '0 0 40px rgba(212, 175, 55, 0.18)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            letterSpacing: 2,
            fontSize: 11,
            color: GOLD,
            textTransform: 'uppercase',
          }}
        >
          Phase 2 — WebAR Scavenger Hunt
        </p>
        <h2
          style={{
            margin: '12px 0 0',
            color: PARCHMENT,
            fontSize: 24,
            fontWeight: 500,
          }}
        >
          The Search for a Stray Heart begins.
        </h2>
        <p
          style={{
            margin: '12px 0 0',
            color: PARCHMENT,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Chapter 1 awaits: everyday comforts, then the anagram MICROWAVECUPBOARD.
        </p>
      </div>
    </section>
  )
}
