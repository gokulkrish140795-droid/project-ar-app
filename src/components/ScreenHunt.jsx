import { useEffect, useRef, useState } from 'react'
import { createImageTargetTracker } from '../ar/createImageTargetTracker.js'
import { lettersForScannedTargets } from '../ar/resolveImageTarget.js'
import { getActiveArEngine, hasTrainedImageTargets } from '../config/ar.js'
import { formatRegistryQuote } from '../data/cardRegistry.js'
import useHuntProgress from '../hooks/useHuntProgress.js'
import { CH1_VAULT } from '../hunt/ch1Quest.js'
import { markHuntReached } from '../hunt/storage.js'
import { fonts, theme } from '../theme'
import audioEngine from '../utils/audioEngine'
import CaptionRail from './ui/CaptionRail'
import DeviceFrame from './ui/DeviceFrame'
import GingerCat3D from './GingerCat3D'
import AnagramWorkbench from './hunt/AnagramWorkbench'
import CameraViewportStub from './hunt/CameraViewportStub'
import HelpDrawer from './hunt/HelpDrawer'
import LetterTray from './hunt/LetterTray'
import VaultObjectArStub from './hunt/VaultObjectArStub'

export default function ScreenHunt({ onEnsureAudio }) {
  const hunt = useHuntProgress()
  const { card, state } = hunt
  const tryScanRef = useRef(hunt.tryScan)
  const [helpOpen, setHelpOpen] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [pose, setPose] = useState('sit')
  const cameraReady = hasTrainedImageTargets() && getActiveArEngine() !== 'stub'
  const [engineLabel, setEngineLabel] = useState(cameraReady ? 'tap to start' : 'standby')
  const [flashLetter, setFlashLetter] = useState('')
  const [emberOn, setEmberOn] = useState(false)
  const [cameraLive, setCameraLive] = useState(false)
  const cameraRef = useRef(null)
  const trackerRef = useRef(null)
  const celebrateRef = useRef(null)
  const emberTimer = useRef(null)

  tryScanRef.current = hunt.tryScan

  useEffect(() => {
    markHuntReached()
    return () => {
      trackerRef.current?.stop()
      trackerRef.current = null
      window.clearTimeout(emberTimer.current)
    }
  }, [])

  useEffect(() => {
    if (card?.kind === 'workbench' || state.vaultUnlocked) {
      trackerRef.current?.stop()
      trackerRef.current = null
      setCameraLive(false)
    }
  }, [card?.kind, state.vaultUnlocked])

  const ensureAudio = async () => {
    if (onEnsureAudio) await onEnsureAudio()
    else await audioEngine.unlock()
  }

  const celebrate = async (letter) => {
    setEmberOn(true)
    window.clearTimeout(emberTimer.current)
    emberTimer.current = window.setTimeout(() => setEmberOn(false), 520)
    await ensureAudio()
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playSfx(letter ? 'sfx_revelio_bell' : 'sfx_vault_alohomora')
    if (letter) {
      setFlashLetter(letter)
      window.setTimeout(() => setFlashLetter(''), 1200)
    }
    setPose('cheer')
    window.setTimeout(() => setPose('sit'), 1200)
  }

  const handleBypass = async (code) => {
    const result = hunt.tryBypass(code)
    if (!result.ok) {
      setCodeError("That code isn't for this step.")
      return
    }
    setCodeError('')
    setHelpOpen(false)
    const letter = result.card?.kind === 'letter' ? result.card.letters.join('') : ''
    await celebrate(letter)
  }

  const handleSolved = async () => {
    const result = hunt.tryAnagram()
    if (result.ok) await celebrate('')
  }

  const handleTargetFound = async (cardId) => {
    const result = tryScanRef.current(cardId)
    if (!result?.ok) return
    const letters = (result.letters || result.card?.letters || []).join('')
    await celebrateRef.current?.(letters)
  }

  const startCamera = async () => {
    if (trackerRef.current || !cameraRef.current) return
    const tracker = await createImageTargetTracker({
      container: cameraRef.current,
      onTargetFound: (cardId) => {
        handleTargetFound(cardId)
      },
    })
    trackerRef.current = tracker
    await tracker.start()
    const live = tracker.status === 'live'
    if (!live) trackerRef.current = null
    setCameraLive(live)
    setEngineLabel(live ? tracker.engine : 'blocked')
  }

  const handleGingerTap = async () => {
    await ensureAudio()
    audioEngine.playSfx('sfx_cat_purr')
    setPose('cheer')
    window.setTimeout(() => setPose('sit'), 1200)
  }

  celebrateRef.current = celebrate

  const isWorkbench = card?.kind === 'workbench'
  const quote = formatRegistryQuote(card?.quote)
  const sideLetters = lettersForScannedTargets(state.scannedTargets)
  const caption = state.vaultUnlocked
    ? card?.location
    : isWorkbench
      ? `Unscramble: ${CH1_VAULT}`
      : quote || card?.location

  return (
    <section className="ar-hunt-screen">
      <header style={{ textAlign: 'center', width: 'min(420px, 100%)' }}>
        <p className="ar-quest-kicker" style={{ margin: 0 }}>
          Chapter 1 — Everyday Comforts
        </p>
        <h2 className="ar-quest-title" style={{ margin: '8px 0 0', fontSize: 22 }}>
          {`Step ${card?.step || 1} of 10`}
        </h2>
      </header>

      <div className="ar-hunt-frame-swap">
      <DeviceFrame compact style={{ width: '100%', textAlign: 'center' }}>
        {state.vaultUnlocked ? (
          <VaultObjectArStub location={card?.location} />
        ) : isWorkbench ? (
          <>
            <div style={{ marginTop: 10 }}>
              <AnagramWorkbench
                workbench={state.workbench}
                decoyNote={card.decoyNote}
                vaultUnlocked={state.vaultUnlocked}
                onMoveTile={(from, to) => {
                  hunt.moveTile(from, to)
                  audioEngine.play('sfx_tile_clack', { stack: true })
                }}
                onSolved={handleSolved}
              />
            </div>
          </>
        ) : (
          <>
            <CameraViewportStub
              engineLabel={engineLabel}
              cameraRef={cameraRef}
              live={cameraLive}
              onActivate={cameraReady ? startCamera : undefined}
            />
            {flashLetter ? (
              <p
                className="ar-quest-title"
                style={{ margin: '8px 0 0', fontSize: 28, color: theme.goldBright }}
              >
                {flashLetter}
              </p>
            ) : null}
          </>
        )}

        <LetterTray letters={state.collectedLetters} />
        {sideLetters.length > 0 ? (
          <LetterTray letters={sideLetters} label={`Scanned card letters ${sideLetters.join(' ')}`} />
        ) : null}

        {!state.vaultUnlocked ? (
          <button
            type="button"
            className="ar-btn-3d ar-btn-3d--ghost"
            onClick={() => {
              setCodeError('')
              setHelpOpen(true)
            }}
            style={{ width: '100%', marginTop: 14, padding: '11px 14px', fontSize: 13 }}
          >
            Can&apos;t Scan? [{' '}
            <span style={{ fontFamily: fonts.body, fontWeight: 700 }}>❓</span> Help ]

          </button>
        ) : (
          <p className="ar-quest-sub" style={{ margin: '12px 0 0', fontSize: 13 }}>
            {CH1_VAULT}
          </p>
        )}
      </DeviceFrame>
      {emberOn && <div className="ar-floo-ember" aria-hidden="true" />}
      </div>

      <div className="ar-hunt-companion-dock">
        <div className="ar-companion-slot">
          <GingerCat3D pose={pose} size={104} onTap={handleGingerTap} />
        </div>
        <CaptionRail visible speaker="Ginger">
          {caption}
        </CaptionRail>
      </div>

      <HelpDrawer
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        onSubmit={handleBypass}
        error={codeError}
        stepLabel={isWorkbench ? `Unscramble: ${CH1_VAULT}` : card?.location}
      />
    </section>
  )
}
