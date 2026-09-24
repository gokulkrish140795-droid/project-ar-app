import { fonts, theme } from '../../theme'

export default function LetterTray({ letters = [], label }) {
  const slots = letters.length > 0 ? letters : ['']

  return (
    <div
      aria-label={label || `Collected letters ${letters.join(' ') || 'none yet'}`}
      className="ar-letter-tray"
    >
      {slots.map((letter, index) => (
        <span
          key={`slot-${index}-${letter || 'empty'}`}
          className={`ar-letter-capsule${letter ? '' : ' ar-letter-capsule--empty'}`}
          style={{ fontFamily: fonts.display, color: letter ? theme.velvet : undefined }}
        >
          {letter || '·'}
        </span>
      ))}
    </div>
  )
}
