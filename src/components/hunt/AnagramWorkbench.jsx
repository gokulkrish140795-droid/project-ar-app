import { useEffect, useRef, useState } from 'react'
import { CH1_VAULT } from '../../hunt/ch1Quest.js'
import { fonts, theme } from '../../theme'

export default function AnagramWorkbench({
  workbench,
  decoyNote,
  vaultUnlocked,
  onMoveTile,
  onSolved,
}) {
  const [selected, setSelected] = useState(null)
  const solvedRef = useRef(false)
  const pool = workbench?.pool || []
  const slots = workbench?.slots || []
  const trash = workbench?.trash || []
  const spelled = slots.length > 0 && slots.every(Boolean) ? slots.map((tile) => tile.letter).join('') : ''

  useEffect(() => {
    if (vaultUnlocked) solvedRef.current = true
    if (solvedRef.current || spelled !== CH1_VAULT) return
    solvedRef.current = true
    onSolved()
  }, [onSolved, spelled, vaultUnlocked])

  const selectPool = (tile) => {
    if (selected?.type === 'pool' && selected.id === tile.id) {
      setSelected(null)
      return
    }
    setSelected({ type: 'pool', id: tile.id })
  }

  const selectTrash = (tile) => {
    if (selected?.type === 'trash' && selected.id === tile.id) {
      setSelected(null)
      return
    }
    if (selected && selected.type !== 'trash') {
      onMoveTile(selected, { type: 'trash' })
      setSelected(null)
      return
    }
    setSelected({ type: 'trash', id: tile.id })
  }

  const selectSlot = (index) => {
    if (selected?.type === 'pool' || selected?.type === 'trash') {
      onMoveTile(selected, { type: 'slot', index })
      setSelected(null)
      return
    }
    if (selected?.type === 'slot') {
      if (selected.index === index) {
        setSelected(null)
        return
      }
      onMoveTile(selected, { type: 'slot', index })
      setSelected(null)
      return
    }
    if (slots[index]) setSelected({ type: 'slot', index })
  }

  const sendSelectedTo = (to) => {
    if (!selected) return
    onMoveTile(selected, to)
    setSelected(null)
  }

  return (
    <div>
      <p
        className="ar-quest-title"
        style={{ margin: '6px 0 0', fontSize: 15, textAlign: 'center', letterSpacing: 0.12 }}
      >
        {CH1_VAULT}
      </p>

      <div className="ar-anagram-board" role="list" aria-label="Anagram slots">
        {slots.map((tile, index) => (
          <button
            key={`slot-${index}`}
            type="button"
            role="listitem"
            className={`ar-anagram-slot${tile ? ' ar-anagram-slot--filled' : ''}${
              selected?.type === 'slot' && selected.index === index ? ' is-selected' : ''
            }`}
            onClick={() => selectSlot(index)}
            aria-label={tile ? `Slot ${index + 1} ${tile.letter}` : `Empty slot ${index + 1}`}
          >
            {tile?.letter || ''}
          </button>
        ))}
      </div>

      <p
        style={{
          margin: '12px 0 6px',
          fontSize: 11,
          letterSpacing: 0.14,
          textTransform: 'uppercase',
          color: theme.gold,
          fontFamily: fonts.display,
        }}
      >
        Letter pool
      </p>
      <div className="ar-anagram-pool">
        {pool.map((tile) => (
          <button
            key={tile.id}
            type="button"
            className={`ar-anagram-tile${selected?.type === 'pool' && selected.id === tile.id ? ' is-selected' : ''}`}
            onClick={() => selectPool(tile)}
          >
            {tile.letter}
          </button>
        ))}
      </div>

      <div className="ar-anagram-trash">
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(232,240,255,0.7)' }}>{decoyNote}</p>
        <div className="ar-anagram-pool" style={{ marginTop: 8 }}>
          {trash.map((tile) => (
            <button
              key={tile.id}
              type="button"
              className={`ar-anagram-tile${selected?.type === 'trash' && selected.id === tile.id ? ' is-selected' : ''}`}
              onClick={() => selectTrash(tile)}
            >
              {tile.letter}
            </button>
          ))}
        </div>
        {selected ? (
          <button
            type="button"
            className="ar-btn-3d ar-btn-3d--ghost"
            style={{ marginTop: 8, padding: '8px 12px', fontSize: 11 }}
            onClick={() => sendSelectedTo({ type: 'trash' })}
          >
            Send to trash
          </button>
        ) : null}
        {selected?.type === 'slot' || selected?.type === 'trash' ? (
          <button
            type="button"
            className="ar-btn-3d ar-btn-3d--ghost"
            style={{ marginTop: 8, marginLeft: 8, padding: '8px 12px', fontSize: 11 }}
            onClick={() => sendSelectedTo({ type: 'pool' })}
          >
            Return letter
          </button>
        ) : null}
      </div>
    </div>
  )
}
