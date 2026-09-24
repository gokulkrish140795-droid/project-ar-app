import { useCallback, useEffect, useState } from 'react'
import EnchantedCanvas3D from './components/EnchantedCanvas3D'
import Screen1Gateway from './components/Screen1Gateway'
import Screen2Prank from './components/Screen2Prank'
import ScreenHunt from './components/ScreenHunt'
import ScreenUncleHologram from './components/ScreenUncleHologram'
import ScreenVideoMontage from './components/ScreenVideoMontage'
import { previousScreen, readInitialScreen, SCREEN_FLOW } from './flow/screenFlow'
import { canContinueSavedHunt } from './hunt/storage'
import { fonts, theme } from './theme'
import audioEngine from './utils/audioEngine'

function readBootScreen() {
  if (typeof window === 'undefined') return 'gateway'
  return readInitialScreen({
    isDev: import.meta.env.DEV,
    search: window.location.search,
  })
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
  const [currentScreen, setCurrentScreen] = useState(readBootScreen)
  const [lumosOn, setLumosOn] = useState(false)
  const [flooActive, setFlooActive] = useState(false)
  const [resumeHunt, setResumeHunt] = useState(() => canContinueSavedHunt())
  const canGoBack = SCREEN_FLOW.indexOf(currentScreen) > 0 && !flooActive

  useEffect(() => {
    if (currentScreen === 'gateway') setResumeHunt(canContinueSavedHunt())
  }, [currentScreen])

  const goTo = (screen) => {
    if (!SCREEN_FLOW.includes(screen)) return
    setCurrentScreen(screen)
  }

  const goBack = () => {
    if (flooActive) return
    const prev = previousScreen(currentScreen)
    if (prev) setCurrentScreen(prev)
  }

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
      goTo('prank')
      setFlooActive(false)
    }, 1600)
  }

  const handleKiss = () => {
    if (currentScreen !== 'prank') return
    goTo('video_montage')
  }

  const handleContinueToHologram = () => {
    if (currentScreen !== 'video_montage') return
    goTo('uncle_hologram')
  }

  const handleContinueHunt = () => {
    if (currentScreen !== 'uncle_hologram') return
    goTo('scavenger_hunt')
  }

  const handleResumeHunt = () => {
    if (currentScreen !== 'gateway' || !canContinueSavedHunt()) return
    goTo('scavenger_hunt')
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

      {flooActive && <div className="ar-floo-veil ar-floo-ember-wipe" aria-hidden="true" />}

      <div className="ar-phone-bezel" aria-hidden="true">
        <span className="ar-phone-bezel__tick tl" />
        <span className="ar-phone-bezel__tick tr" />
        <span className="ar-phone-bezel__tick bl" />
        <span className="ar-phone-bezel__tick br" />
      </div>

      {canGoBack && (
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="ar-btn-3d ar-btn-3d--ghost ar-nav-back"
        >
          Back
        </button>
      )}

      <button
        type="button"
        onClick={toggleLumos}
        aria-pressed={lumosOn}
        aria-label={lumosOn ? 'Nox Audio' : 'Lumos Audio'}
        className={`${lumosOn ? 'ar-btn-3d ar-btn-3d--gold' : 'ar-btn-3d ar-btn-3d--ghost'} ar-nav-lumos`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: lumosOn ? theme.velvet : theme.gold,
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
          <Screen1Gateway
            onEnsureAudio={ensureAudio}
            onComplete={handleAcceptQuest}
            canContinueHunt={resumeHunt}
            onContinueHunt={handleResumeHunt}
          />
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
