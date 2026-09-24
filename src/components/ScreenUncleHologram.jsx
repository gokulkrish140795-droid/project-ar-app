import { useState } from 'react'
import { UNCLE_WISH_YOUTUBE_ID } from '../config/media'
import audioEngine from '../utils/audioEngine'
import { releaseRoomCamera } from '../utils/roomCamera'
import CaptionRail from './ui/CaptionRail'
import DeviceFrame from './ui/DeviceFrame'
import RoomProjector from './ui/RoomProjector'

const COACH =
  'Find a clear wall, love. I’ll project uncle’s wish into the air — or tap me to summon it.'

export default function ScreenUncleHologram({ onContinue, onEnsureAudio }) {
  const [summoned, setSummoned] = useState(false)
  const [camDenied, setCamDenied] = useState(false)

  const ensureAudio = async () => {
    if (onEnsureAudio) await onEnsureAudio()
    else await audioEngine.unlock()
  }

  const summon = async () => {
    if (summoned) return
    await ensureAudio()
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playLayered(['sfx_spell_quest', 'sfx_soft_chime'])
    setSummoned(true)
  }

  const leave = () => {
    releaseRoomCamera()
    onContinue?.()
  }

  return (
    <section className="ar-beat ar-projector-screen">
      <RoomProjector
        playing={summoned}
        youtubeId={UNCLE_WISH_YOUTUBE_ID}
        title="Uncle’s wish"
        onDenied={() => setCamDenied(true)}
      />

      <DeviceFrame compact className="ar-beat__mast">
        <p className="ar-quest-kicker" style={{ margin: 0 }}>
          Patronus Projection
        </p>
        <h1 className="ar-quest-title" style={{ margin: '8px 0 0', fontSize: 22 }}>
          A wish from beyond the veil
        </h1>
      </DeviceFrame>

      <div className="ar-beat__dock">
        <CaptionRail visible speaker="Ginger">
          {summoned
            ? 'There — hold steady. Let his words find you.'
            : camDenied
              ? 'No camera needed, love. Press play when you’re ready.'
              : COACH}
        </CaptionRail>

        {!summoned && (
          <>
            <button
              type="button"
              className="ar-btn-3d ar-btn-3d--gold"
              onClick={summon}
              style={{ width: '100%', padding: '13px 16px', fontSize: 14 }}
            >
              Summon the wish
            </button>
            <button
              type="button"
              className="ar-btn-3d ar-btn-3d--ghost"
              onClick={summon}
              style={{ width: '100%', padding: '11px 16px', fontSize: 13 }}
            >
              Play uncle’s wish
            </button>
          </>
        )}

        {summoned && (
          <button
            type="button"
            className="ar-btn-3d ar-btn-3d--gold"
            onClick={leave}
            style={{ width: '100%', padding: '13px 16px', fontSize: 14 }}
          >
            Continue the quest
          </button>
        )}
      </div>
    </section>
  )
}
