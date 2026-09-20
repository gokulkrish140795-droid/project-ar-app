import { fonts, theme } from '../../theme'

export default function CameraViewportStub({ engineLabel = 'standby' }) {
  return (
    <div className="ar-scan-stage" aria-label="Camera standby. Photograph targets are not trained yet.">
      <span className="ar-scan-stage__tick tl" aria-hidden="true" />
      <span className="ar-scan-stage__tick tr" aria-hidden="true" />
      <span className="ar-scan-stage__tick bl" aria-hidden="true" />
      <span className="ar-scan-stage__tick br" aria-hidden="true" />
      <div className="ar-scan-reticle" aria-hidden="true" />
      <p
        style={{
          position: 'relative',
          zIndex: 1,
          margin: 0,
          fontFamily: fonts.display,
          fontSize: 11,
          letterSpacing: 0.18,
          textTransform: 'uppercase',
          color: theme.goldBright,
          textAlign: 'center',
        }}
      >
        Aim at the photograph
      </p>
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
