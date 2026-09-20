import { createVaultObjectArStub } from '../../ar/objectArStub.js'
import { fonts, theme } from '../../theme'

export default function VaultObjectArStub({ location }) {
  const stub = createVaultObjectArStub({ vault: location })

  return (
    <div
      className="ar-holo-panel"
      style={{
        marginTop: 12,
        padding: 14,
        textAlign: 'center',
        transform: 'none',
      }}
    >
      <p className="ar-quest-kicker" style={{ margin: 0 }}>
        Object AR placeholder
      </p>
      <p
        className="ar-quest-title"
        style={{ margin: '8px 0 0', fontSize: 16, fontFamily: fonts.display, color: theme.cream }}
      >
        {stub.vault}
      </p>
      <p className="ar-quest-sub" style={{ margin: '8px 0 0', fontSize: 12 }}>
        Vault target not trained in this build.
      </p>
    </div>
  )
}
