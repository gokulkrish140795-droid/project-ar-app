import { fonts, theme } from '../../theme'

const EMPTY_SLOTS = 9

export default function LetterTray({ letters = [] }) {
  const slots = Array.from({ length: EMPTY_SLOTS }, (_, index) => letters[index] || '')

  return (
    <div
      aria-label={`Collected letters ${letters.join(' ') || 'none yet'}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
      }}
    >
      {slots.map((letter, index) => (
        <span
          key={`slot-${index}`}
          className={`ar-letter-capsule${letter ? '' : ' ar-letter-capsule--empty'}`}
          style={{ fontFamily: fonts.display, color: letter ? theme.velvet : undefined }}
        >
          {letter || '·'}
        </span>
      ))}
    </div>
  )
}
