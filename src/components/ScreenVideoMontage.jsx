import { MONTAGE_YOUTUBE_ID } from '../config/media'
import { releaseRoomCamera } from '../utils/roomCamera'
import CaptionRail from './ui/CaptionRail'
import DeviceFrame from './ui/DeviceFrame'
import RoomProjector from './ui/RoomProjector'

export default function ScreenVideoMontage({ onContinue }) {
  const leave = async () => {
    await releaseRoomCamera()
    onContinue?.()
  }

  return (
    <section className="ar-beat ar-projector-screen">
      <RoomProjector
        playing
        youtubeId={MONTAGE_YOUTUBE_ID}
        title="Intro Romantic Video Montage"
      />

      <DeviceFrame compact className="ar-beat__mast">
        <p className="ar-quest-kicker" style={{ margin: 0 }}>
          Memory Reel
        </p>
        <h2 className="ar-quest-title" style={{ margin: '8px 0 0', fontSize: 22 }}>
          A memory stirs in the Floo fire...
        </h2>
      </DeviceFrame>

      <div className="ar-beat__dock">
        <CaptionRail visible speaker="Memory Reel">
          Friends&apos; wishes, romantic moments, and warmth before the hologram.
        </CaptionRail>
        <button
          type="button"
          onClick={leave}
          className="ar-btn-3d ar-btn-3d--gold"
          style={{ width: '100%', padding: '13px 20px', fontSize: 14 }}
        >
          Continue — a wish awaits
        </button>
      </div>
    </section>
  )
}
