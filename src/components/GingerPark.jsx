import audioEngine from '../utils/audioEngine'

const PARK_MAX = 56

/**
 * W1 stand-in for Ginger. No GLB, no yaw, no WebGL.
 * Small enough to sit under the caption rail without covering it.
 */
export default function GingerPark({ size = PARK_MAX, onTap }) {
  const box = Math.max(40, Math.min(Number(size) || PARK_MAX, PARK_MAX))

  const handleTap = (event) => {
    event.stopPropagation()
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playSfx('sfx_cat_purr')
    if (onTap) onTap()
  }

  return (
    <button
      type="button"
      className="ar-ginger-park"
      aria-label="Ginger the cat"
      data-ginger-parked="true"
      onClick={handleTap}
      style={{ width: box, height: box }}
    >
      <svg viewBox="0 0 64 64" width={box} height={box} aria-hidden="true">
        <ellipse cx="32" cy="40" rx="18" ry="14" fill="#e67a28" />
        <circle cx="32" cy="28" r="14" fill="#e67a28" />
        <path d="M20 20 L16 8 L28 16 Z" fill="#c45a12" />
        <path d="M44 20 L48 8 L36 16 Z" fill="#c45a12" />
        <ellipse cx="32" cy="32" rx="6" ry="4" fill="#fff4e2" />
        <circle cx="26" cy="26" r="2" fill="#2a160c" />
        <circle cx="38" cy="26" r="2" fill="#2a160c" />
      </svg>
    </button>
  )
}
