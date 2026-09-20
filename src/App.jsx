import { useCallback, useState } from 'react'
import EnchantedCanvas3D from './components/EnchantedCanvas3D'
import Screen1Gateway from './components/Screen1Gateway'
import Screen2Prank from './components/Screen2Prank'
import ScreenHunt from './components/ScreenHunt'
import ScreenUncleHologram from './components/ScreenUncleHologram'
import ScreenVideoMontage from './components/ScreenVideoMontage'
import { hasSavedHuntProgress } from './hunt/storage'
import { fonts, theme } from './theme'
import audioEngine from './utils/audioEngine'

const SCREENS = ['gateway', 'prank', 'video_montage', 'uncle_hologram', 'scavenger_hunt']

function readInitialScreen() {
  if (typeof window === 'undefined') return 'gateway'
  if (hasSavedHuntProgress()) return 'scavenger_hunt'
  if (import.meta.env.DEV) {
    const phase = new URLSearchParams(window.location.search).get('phase')
    if (SCREENS.includes(phase)) return phase
  }
  return 'gateway'
}

const moodForScreen = {
  gateway: 'gateway',
  prank: 'prank',
  video_montage: 'video',
  uncle_hologram: 'video',
  scavenger_hunt: 'hunt',
}

/**
 * Master production state machine:
 * gateway → floo → prank → video_montage → uncle_hologram → scavenger_hunt
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState(readInitialScreen)
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
    if (flooActive || currentScreen !== 'gateway') return

    setFlooActive(true)
    window.setTimeout(() => {
      setCurrentScreen('prank')
      setFlooActive(false)
    }, 1600)
  }

  const handleKiss = () => {
    if (currentScreen !== 'prank') return
    setCurrentScreen('video_montage')
  }

  const handleContinueToHologram = () => {
    if (currentScreen !== 'video_montage') return
    setCurrentScreen('uncle_hologram')
  }

  const handleContinueHunt = () => {
    if (currentScreen !== 'uncle_hologram') return
    setCurrentScreen('scavenger_hunt')
  }

  const mood = moodForScreen[currentScreen] || 'gateway'
  const hideAtmosphere = currentScreen === 'uncle_hologram'

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.velvet,
        color: theme.parchment,
        position: 'relative',
        fontFamily: fonts.body,
      }}
    >
      {!hideAtmosphere && (
        <EnchantedCanvas3D lumosOn={lumosOn} flooActive={flooActive} mood={mood} />
      )}

      {flooActive && <div className="ar-floo-veil" aria-hidden="true" />}

      <button
        type="button"
        onClick={toggleLumos}
        aria-pressed={lumosOn}
        aria-label={lumosOn ? 'Nox Audio' : 'Lumos Audio'}
        className={lumosOn ? 'ar-btn-3d ar-btn-3d--gold' : 'ar-btn-3d ar-btn-3d--ghost'}
        style={{
          position: 'fixed',
          top: 18,
          right: 18,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          color: lumosOn ? theme.velvet : theme.gold,
          letterSpacing: 1.2,
          fontSize: 11,
          fontFamily: fonts.display,
        }}
      >
        {lumosOn ? 'Lumos Audio' : 'Nox Audio'}
      </button>

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          opacity: flooActive ? 0.25 : 1,
          filter: flooActive ? 'blur(3px) saturate(1.4)' : 'none',
          transition: 'opacity 0.45s ease, filter 0.45s ease',
          transform: flooActive ? 'scale(1.04) rotateZ(1deg)' : 'none',
        }}
      >
        {currentScreen === 'gateway' && (
          <Screen1Gateway onEnsureAudio={ensureAudio} onComplete={handleAcceptQuest} />
        )}

        {currentScreen === 'prank' && (
          <Screen2Prank onEnsureAudio={ensureAudio} onKiss={handleKiss} />
        )}

        {currentScreen === 'video_montage' && (
          <ScreenVideoMontage onContinue={handleContinueToHologram} />
        )}

        {currentScreen === 'uncle_hologram' && (
          <ScreenUncleHologram onEnsureAudio={ensureAudio} onContinue={handleContinueHunt} />
        )}

        {currentScreen === 'scavenger_hunt' && <ScreenHunt onEnsureAudio={ensureAudio} />}
      </div>
    </div>
  )
}
