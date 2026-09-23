import { useCallback, useEffect, useState } from 'react'
import { getPlayableCards } from '../data/cardRegistry.js'
import {
  applyAnagramUnlock,
  applyBypass,
  applyImageTargetScan,
  ensureWorkbench,
  getCurrentCard,
  moveWorkbenchTile,
  spelledFromSlots,
} from '../hunt/ch1Quest.js'
import { loadHuntState, saveHuntState } from '../hunt/storage.js'

const CARDS = getPlayableCards()

export default function useHuntProgress() {
  const cards = CARDS
  const [state, setState] = useState(() => loadHuntState())

  useEffect(() => {
    saveHuntState({ ...state, huntActive: true })
  }, [state])

  useEffect(() => {
    const current = getCurrentCard(state, cards)
    if (current?.kind === 'workbench' && !state.workbench) {
      setState((prev) => ensureWorkbench(prev))
    }
  }, [cards, state])

  const commit = useCallback((result) => {
    if (result.ok) setState(result.state)
    return result
  }, [])

  const tryBypass = useCallback(
    (input) => commit(applyBypass(state, input, cards)),
    [cards, commit, state],
  )

  const tryScan = useCallback(
    (cardId) => commit(applyImageTargetScan(state, cardId, cards)),
    [cards, commit, state],
  )

  const tryAnagram = useCallback(() => {
    const ready = state.workbench ? state : ensureWorkbench(state)
    return commit(applyAnagramUnlock(ready, spelledFromSlots(ready.workbench), cards))
  }, [cards, commit, state])

  const moveTile = useCallback((from, to) => {
    setState((prev) => moveWorkbenchTile(ensureWorkbench(prev), from, to))
  }, [])

  return {
    state,
    cards,
    card: getCurrentCard(state, cards),
    tryBypass,
    tryScan,
    tryAnagram,
    moveTile,
    spelled: spelledFromSlots(state.workbench),
  }
}
