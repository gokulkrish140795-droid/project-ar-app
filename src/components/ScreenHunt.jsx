import { theme } from '../theme'
import DepthFrame from './DepthFrame'
import Workbench3D from './Workbench3D'

const GOLD = theme.gold
const PARCHMENT = theme.parchmentSoft

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
        padding: '88px 16px 28px',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      <DepthFrame style={{ width: 'min(420px, 100%)', textAlign: 'center' }} float>
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
            margin: '10px 0 0',
            color: PARCHMENT,
            fontSize: 24,
            fontWeight: 500,
            textShadow: '0 4px 20px rgba(212,175,55,0.25)',
          }}
        >
          The Search for a Stray Heart begins.
        </h2>

        <div style={{ marginTop: 14 }}>
          <Workbench3D height={210} />
        </div>

        <p
          style={{
            margin: '12px 0 0',
            color: PARCHMENT,
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          Chapter 1 awaits: everyday comforts, then the wooden anagram{' '}
          <span style={{ color: GOLD, fontWeight: 700 }}>MICROWAVECUPBOARD</span>.
        </p>
        <p
          style={{
            margin: '10px 0 0',
            color: 'rgba(244,232,193,0.7)',
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          Drag decoy letters into the bin. Arrange the true ones on the desk. Camera
          tracking arrives next.
        </p>
      </DepthFrame>
    </section>
  )
}
