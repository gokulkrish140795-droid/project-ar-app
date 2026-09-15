import { useCallback, useState } from 'react'
import Screen1Gateway from './components/Screen1Gateway'
import audioEngine from './utils/audioEngine'

const GOLD = '#D4AF37'
const PARCHMENT = '#F4E8C1'
const VELVET = '#0F0A1C'

export default function App() {
  const [screen, setScreen] = useState('gateway')
  const [lumosOn, setLumosOn] = useState(false)

  const ensureAudio = useCallback(async () => {
    await audioEngine.unlock()
    if (audioEngine.isMuted()) {
      audioEngine.setMuted(false)
      setLumosOn(true)
      audioEngine.playBgm('bgm_intro')
    }
  }, [])

  const toggleLumos = async () => {
    await audioEngine.unlock()

    if (audioEngine.isMuted()) {
      audioEngine.setMuted(false)
      setLumosOn(true)
      audioEngine.playBgm('bgm_intro')
      return
    }

    audioEngine.setMuted(true)
    setLumosOn(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: VELVET,
        color: PARCHMENT,
        position: 'relative',
      }}
    >
      <button
        type="button"
        onClick={toggleLumos}
        aria-pressed={lumosOn}
        aria-label={lumosOn ? 'Nox, mute audio' : 'Lumos, unmute audio'}
        style={{
          position: 'fixed',
          top: 18,
          right: 18,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          borderRadius: 999,
          border: `1px solid ${GOLD}`,
          background: lumosOn ? 'rgba(212, 175, 55, 0.18)' : 'rgba(15, 10, 28, 0.82)',
          color: GOLD,
          fontFamily: 'Georgia, "Times New Roman", serif',
          letterSpacing: 2,
          fontSize: 12,
          cursor: 'pointer',
          boxShadow: lumosOn ? '0 0 18px rgba(212, 175, 55, 0.55)' : 'none',
        }}
      >
        <span aria-hidden="true">{lumosOn ? '✨' : '🕯️'}</span>
        {lumosOn ? 'LUMOS' : 'NOX'}
      </button>

      {screen === 'gateway' && (
        <Screen1Gateway
          onEnsureAudio={ensureAudio}
          onComplete={() => setScreen('prank')}
        />
      )}

      {screen !== 'gateway' && (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 24,
          }}
        >
          <p style={{ color: GOLD, fontSize: 22, fontFamily: 'Georgia, serif' }}>
            The Marauder&apos;s Map awaits...
          </p>
        </div>
      )}
    </div>
  )
}
