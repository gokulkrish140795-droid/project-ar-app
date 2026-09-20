import { useEffect, useId, useRef, useState } from 'react'
import { fonts, theme } from '../../theme'
import DeviceFrame from '../ui/DeviceFrame'

export default function HelpDrawer({ open, onClose, onSubmit, error, stepLabel }) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [code, setCode] = useState('')

  useEffect(() => {
    if (open) {
      setCode('')
      window.setTimeout(() => inputRef.current?.focus(), 180)
    }
  }, [open])

  if (!open) return null

  const submit = (event) => {
    event.preventDefault()
    onSubmit(code)
  }

  return (
    <div className="ar-help-overlay" role="dialog" aria-modal="true" aria-labelledby="ar-help-title">
      <button type="button" className="ar-help-overlay__scrim" aria-label="Close help" onClick={onClose} />
      <DeviceFrame className="ar-help-sheet" style={{ width: 'min(400px, 100%)' }}>
        <p id="ar-help-title" className="ar-quest-kicker" style={{ margin: 0 }}>
          Can&apos;t Scan?
        </p>
        <h2
          className="ar-quest-title"
          style={{ margin: '8px 0 0', fontSize: 20, fontFamily: fonts.display }}
        >
          Unlock with Code
        </h2>
        <p className="ar-quest-sub" style={{ margin: '10px 0 0', fontSize: 13 }}>
          {stepLabel}
        </p>
        <form onSubmit={submit} style={{ marginTop: 14 }}>
          <label
            htmlFor={inputId}
            style={{
              display: 'block',
              fontSize: 11,
              letterSpacing: 0.14,
              textTransform: 'uppercase',
              color: theme.gold,
              fontFamily: fonts.display,
              marginBottom: 6,
            }}
          >
            Bypass phrase
          </label>
          <input
            ref={inputRef}
            id={inputId}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
            className="ar-help-input"
            placeholder="Enter this step’s code"
          />
          {error ? (
            <p role="alert" style={{ margin: '8px 0 0', color: theme.coral, fontSize: 13 }}>
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="ar-btn-3d ar-btn-3d--gold"
            style={{ width: '100%', marginTop: 14, padding: '12px 16px', fontSize: 14 }}
          >
            Unlock with Code
          </button>
          <button
            type="button"
            className="ar-btn-3d ar-btn-3d--ghost"
            style={{ width: '100%', marginTop: 10, padding: '11px 16px', fontSize: 13 }}
            onClick={onClose}
          >
            Close
          </button>
        </form>
      </DeviceFrame>
    </div>
  )
}
