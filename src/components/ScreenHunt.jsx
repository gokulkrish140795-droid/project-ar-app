import { useEffect, useState } from 'react'
import { fonts, theme } from '../theme'
import audioEngine from '../utils/audioEngine'
import CaptionRail from './ui/CaptionRail'
import DeviceFrame from './ui/DeviceFrame'
import GingerCat3D from './GingerCat3D'
import Workbench3D from './Workbench3D'

const GOLD = theme.gold
const HINTS = [
  'Soft places first… Ginger says check what warms your mornings.',
  'Letters hide in plain sight. Trust the wooden anagram.',
  'When you’re ready, the cupboard will speak.',
]

export default function ScreenHunt() {
  const [hintIdx, setHintIdx] = useState(0)
  const [pose, setPose] = useState('idle')

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHintIdx((i) => (i + 1) % HINTS.length)
      setPose((p) => (p === 'idle' ? 'search' : 'idle'))
    }, 7000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        zIndex: 2,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '72px 16px 24px',
        fontFamily: fonts.body,
        gap: 12,
      }}
    >
      <header style={{ textAlign: 'center', width: 'min(420px, 100%)' }}>
        <p className="ar-quest-kicker" style={{ margin: 0 }}>
          Phase 2 — WebAR Scavenger Hunt
        </p>
        <h2 className="ar-quest-title" style={{ margin: '10px 0 0', fontSize: 24 }}>
          The Search for a Stray Heart begins.
        </h2>
      </header>

      <DeviceFrame style={{ width: 'min(420px, 100%)', textAlign: 'center' }} float>
        <div
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            border: `1px solid rgba(232, 197, 106, 0.35)`,
            background: 'rgba(0,0,0,0.25)',
          }}
        >
          <Workbench3D height={200} />
        </div>
        <p className="ar-quest-sub" style={{ margin: '14px 0 0', fontSize: 14 }}>
          Chapter 1 awaits: everyday comforts, then the wooden anagram{' '}
          <span style={{ color: GOLD, fontWeight: 700 }}>MICROWAVECUPBOARD</span>.
        </p>
        <p
          style={{
            margin: '10px 0 0',
            color: 'rgba(232,240,255,0.65)',
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          Drag decoy letters into the bin. Arrange the true ones on the desk. Camera tracking
          arrives next.
        </p>
      </DeviceFrame>

      <div
        style={{
          width: 'min(400px, 100%)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <GingerCat3D
            pose={pose}
            size={110}
            onTap={() => {
              audioEngine.playSfx('sfx_cat_purr')
              setPose('cheer')
              window.setTimeout(() => setPose('idle'), 1200)
            }}
          />
        </div>
        <div style={{ flex: 1, marginBottom: 8 }}>
          <CaptionRail visible speaker="Ginger">
            {HINTS[hintIdx]}
          </CaptionRail>
        </div>
      </div>
    </section>
  )
}
