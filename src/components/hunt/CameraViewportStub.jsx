import { fonts, theme } from '../../theme'

export default function CameraViewportStub({
  engineLabel = 'standby',
  cameraRef,
  live = false,
  onActivate,
}) {
  const aimStyle = {
    position: 'relative',
    zIndex: 1,
    margin: 0,
    padding: 0,
    border: 0,
    background: 'none',
    fontFamily: fonts.display,
    fontSize: 11,
    letterSpacing: 0.18,
    textTransform: 'uppercase',
    color: theme.goldBright,
    textAlign: 'center',
    cursor: onActivate && !live ? 'pointer' : 'default',
  }

  return (
    <div
      className="ar-scan-stage"
      aria-label={
        live
          ? 'Camera aiming at the photograph'
          : 'Camera standby. Tap to aim at the photograph.'
      }
    >
      <div ref={cameraRef} className="ar-scan-camera" />
      <span className="ar-scan-stage__tick tl" aria-hidden="true" />
      <span className="ar-scan-stage__tick tr" aria-hidden="true" />
      <span className="ar-scan-stage__tick bl" aria-hidden="true" />
      <span className="ar-scan-stage__tick br" aria-hidden="true" />
      <div className="ar-scan-reticle" aria-hidden="true" />
      {onActivate && !live ? (
        <button type="button" className="ar-scan-start" style={aimStyle} onClick={onActivate}>
          Aim at the photograph
        </button>
      ) : (
        <p style={aimStyle}>Aim at the photograph</p>
      )}
      <p
        style={{
          position: 'relative',
          zIndex: 1,
          margin: '6px 0 0',
          fontSize: 11,
          color: 'rgba(232,240,255,0.55)',
          fontFamily: fonts.body,
        }}
      >
        Camera {engineLabel}
      </p>
    </div>
  )
}
