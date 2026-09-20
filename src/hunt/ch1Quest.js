import { CH1_VAULT_ANAGRAM, getPlayableCards } from '../data/cardRegistry.js'

export const CH1_VAULT = CH1_VAULT_ANAGRAM

export function normalizeBypass(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

export function getCurrentCard(state, cards = getPlayableCards()) {
  return cards[state.currentStepIndex] || null
}

export function makeWorkbenchTiles(anagram = CH1_VAULT) {
  if (anagram !== CH1_VAULT) {
    throw new Error('Chapter 1 workbench may only use MICROWAVECUPBOARD')
  }
  return anagram.split('').map((letter, index) => ({
    id: `${index}-${letter}`,
    letter,
  }))
}

export function shuffleTiles(tiles, random = Math.random) {
  const next = tiles.slice()
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function ensureWorkbench(state, random = Math.random) {
  if (state.workbench?.pool && Array.isArray(state.workbench.slots)) {
    return state
  }
  return {
    ...state,
    workbench: {
      pool: shuffleTiles(makeWorkbenchTiles(CH1_VAULT), random),
      slots: Array.from({ length: CH1_VAULT.length }, () => null),
    },
  }
}

export function spelledFromSlots(workbench) {
  if (!workbench?.slots) return ''
  if (workbench.slots.some((slot) => !slot)) return ''
  return workbench.slots.map((tile) => tile.letter).join('')
}

function withStepUnlocked(state, card) {
  if (state.unlockedCards.includes(card.step)) return state
  const collectedLetters =
    card.kind === 'letter'
      ? [...state.collectedLetters, ...card.letters.map((letter) => String(letter).toUpperCase())]
      : state.collectedLetters

  return {
    ...state,
    unlockedCards: [...state.unlockedCards, card.step],
    collectedLetters,
    currentStepIndex:
      card.kind === 'letter'
        ? Math.min(state.currentStepIndex + 1, 9)
        : state.currentStepIndex,
    vaultUnlocked: card.kind === 'workbench' ? true : state.vaultUnlocked,
    huntActive: true,
  }
}

export function applyBypass(state, input, cards = getPlayableCards()) {
  if (state.vaultUnlocked) {
    return { ok: false, reason: 'complete', state }
  }
  const card = getCurrentCard(state, cards)
  if (!card) {
    return { ok: false, reason: 'missing-step', state }
  }
  if (normalizeBypass(input) !== normalizeBypass(card.bypass)) {
    return { ok: false, reason: 'mismatch', state }
  }
  return { ok: true, reason: 'bypass', state: withStepUnlocked(state, card), card }
}

export function applyScanCollect(state, stepNumber, cards = getPlayableCards()) {
  if (state.vaultUnlocked) {
    return { ok: false, reason: 'complete', state }
  }
  const card = getCurrentCard(state, cards)
  if (!card || card.step !== stepNumber) {
    return { ok: false, reason: 'wrong-target', state }
  }
  return { ok: true, reason: 'scan', state: withStepUnlocked(state, card), card }
}

export function applyAnagramUnlock(state, spelled, cards = getPlayableCards()) {
  if (state.vaultUnlocked) {
    return { ok: false, reason: 'complete', state }
  }
  const card = getCurrentCard(state, cards)
  if (!card || card.kind !== 'workbench') {
    return { ok: false, reason: 'not-workbench', state }
  }
  if (spelled !== CH1_VAULT) {
    return { ok: false, reason: 'anagram', state }
  }
  return { ok: true, reason: 'anagram', state: withStepUnlocked(state, card), card }
}

export function moveWorkbenchTile(state, from, to) {
  const next = ensureWorkbench(state)
  const workbench = {
    pool: next.workbench.pool.slice(),
    slots: next.workbench.slots.slice(),
  }

  const take = (origin) => {
    if (origin.type === 'pool') {
      const index = workbench.pool.findIndex((tile) => tile.id === origin.id)
      if (index < 0) return null
      return workbench.pool.splice(index, 1)[0]
    }
    const tile = workbench.slots[origin.index]
    workbench.slots[origin.index] = null
    return tile || null
  }

  const tile = take(from)
  if (!tile) return { ...next, workbench }

  if (to.type === 'slot') {
    const occupant = workbench.slots[to.index]
    workbench.slots[to.index] = tile
    if (occupant) workbench.pool.push(occupant)
  } else {
    workbench.pool.push(tile)
  }

  return { ...next, workbench }
}
