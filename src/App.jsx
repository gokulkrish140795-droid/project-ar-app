import { useCallback, useState } from 'react'
import EnchantedCanvas from './components/EnchantedCanvas'
import Screen1Gateway from './components/Screen1Gateway'
import ScreenVideoMontage from './components/ScreenVideoMontage'
import audioEngine from './utils/audioEngine'

const GOLD = '#D4AF37'
const PARCHMENT = '#F4E8C1'
const VELVET = '#0F0A1C'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('gateway')
  const [lumosOn, setLumosOn] = useState(false)
  const [flooActive, setFlooActive] = useState(false)

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

  const handleAcceptQuest = () => {
    if (flooActive || currentScreen !== 'gateway') {
      return
    }

    setFlooActive(true)
    window.setTimeout(() => {
      setCurrentScreen('video_montage')
      setFlooActive(false)
    }, 1600)
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
      <EnchantedCanvas lumosOn={lumosOn} flooActive={flooActive} />

      <button
        type="button"
        onClick={toggleLumos}
        aria-pressed={lumosOn}
        aria-label={lumosOn ? 'Nox, mute audio and dim candles' : 'Lumos, unmute audio and brighten candles'}
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

      {currentScreen === 'gateway' && (
        <Screen1Gateway
          onEnsureAudio={ensureAudio}
          onComplete={handleAcceptQuest}
        />
      )}

      {currentScreen === 'video_montage' && <ScreenVideoMontage />}
    </div>
  )
}
