import { getCardRegistry, parseRegistryLetters } from '../data/cardRegistry.js'
import { TRAINED_PHOTO_TARGETS } from './trainedTargets.js'

export function normalizeCardId(cardId) {
  const raw = String(cardId ?? '').trim()
  if (!/^\d{1,2}$/.test(raw)) return ''
  return raw.padStart(2, '0')
}

/** Registry letters for a trained photo target. Null when the card was not compiled. */
export function resolveTrainedTarget(cardId) {
  const id = normalizeCardId(cardId)
  const trained = TRAINED_PHOTO_TARGETS.find((target) => target.cardId === id)
  if (!trained) return null
  const raw = getCardRegistry().cards[id]
  if (!raw?.letters) return null
  return {
    cardId: id,
    index: trained.index,
    step: Number(id),
    letters: parseRegistryLetters(raw.letters),
    lettersRaw: raw.letters,
    quote: raw.quote,
  }
}

export function lettersForScannedTargets(scannedTargets = []) {
  const registry = getCardRegistry()
  return scannedTargets.flatMap((cardId) => parseRegistryLetters(registry.cards[cardId]?.letters))
}
