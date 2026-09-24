/** Cinematic caption rail — never covers companions. */
export default function CaptionRail({
  children,
  visible = true,
  speaker = '',
  className = '',
  style = {},
}) {
  if (!visible || !children) return null

  return (
    <div
      className={`ar-caption-rail ${className}`.trim()}
      role="status"
      aria-live="polite"
      style={style}
    >
      {speaker ? <span className="ar-caption-rail__speaker">{speaker}</span> : null}
      <p className="ar-caption-rail__text">{children}</p>
    </div>
  )
}
