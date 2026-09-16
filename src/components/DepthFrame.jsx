/** Ornate gold-filigree depth frame wrapping phase UI. */
export default function DepthFrame({
  children,
  variant = 'velvet',
  className = '',
  style = {},
  float = false,
}) {
  const panelClass =
    variant === 'parchment' ? 'ar-depth-panel ar-depth-panel--parchment' : 'ar-depth-panel'

  return (
    <div
      className={`${panelClass} ${className}`.trim()}
      style={{
        position: 'relative',
        padding: '22px 18px 18px',
        animation: float ? 'arFloatY 5.5s ease-in-out infinite' : undefined,
        ...style,
      }}
    >
      <span className="ar-filigree-corner tl" aria-hidden="true" />
      <span className="ar-filigree-corner tr" aria-hidden="true" />
      <span className="ar-filigree-corner bl" aria-hidden="true" />
      <span className="ar-filigree-corner br" aria-hidden="true" />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}
