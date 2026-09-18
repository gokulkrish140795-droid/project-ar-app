/** Magical-device glass frame for HUD panels. */
export default function DeviceFrame({
  children,
  className = '',
  style = {},
  float = false,
  compact = false,
}) {
  return (
    <div
      className={`ar-device-frame ${compact ? 'ar-device-frame--compact' : ''} ${className}`.trim()}
      style={{
        animation: float ? 'arFloatY 5.5s ease-in-out infinite' : undefined,
        ...style,
      }}
    >
      <span className="ar-device-frame__edge tl" aria-hidden="true" />
      <span className="ar-device-frame__edge tr" aria-hidden="true" />
      <span className="ar-device-frame__edge bl" aria-hidden="true" />
      <span className="ar-device-frame__edge br" aria-hidden="true" />
      <div className="ar-device-frame__body">{children}</div>
    </div>
  )
}
