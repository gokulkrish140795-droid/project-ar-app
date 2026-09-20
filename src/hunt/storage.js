export const HUNT_STORAGE_KEY = 'project-ar-hunt-v1'
export const HUNT_STORAGE_VERSION = 1

function defaultStorage() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function createInitialHuntState() {
  return {
    version: HUNT_STORAGE_VERSION,
    chapter: 1,
    currentStepIndex: 0,
    unlockedCards: [],
    collectedLetters: [],
    vaultUnlocked: false,
    huntActive: true,
    workbench: null,
  }
}

function isLetter(value) {
  return typeof value === 'string' && value.length === 1
}

export function sanitizeHuntState(raw) {
  const base = createInitialHuntState()
  if (!raw || typeof raw !== 'object') return base

  const currentStepIndex = Number(raw.currentStepIndex)
  const unlockedCards = Array.isArray(raw.unlockedCards)
    ? raw.unlockedCards.map(Number).filter((n) => n >= 1 && n <= 10)
    : []
  const collectedLetters = Array.isArray(raw.collectedLetters)
    ? raw.collectedLetters.filter(isLetter).map((letter) => letter.toUpperCase())
    : []

  return {
    ...base,
    currentStepIndex:
      Number.isInteger(currentStepIndex) && currentStepIndex >= 0 && currentStepIndex <= 9
        ? currentStepIndex
        : 0,
    unlockedCards,
    collectedLetters,
    vaultUnlocked: Boolean(raw.vaultUnlocked),
    huntActive: raw.huntActive !== false,
    workbench: raw.workbench && typeof raw.workbench === 'object' ? raw.workbench : null,
  }
}

export function loadHuntState(storage = defaultStorage()) {
  if (!storage) return createInitialHuntState()
  try {
    const raw = storage.getItem(HUNT_STORAGE_KEY)
    if (!raw) return createInitialHuntState()
    return sanitizeHuntState(JSON.parse(raw))
  } catch {
    return createInitialHuntState()
  }
}

export function saveHuntState(state, storage = defaultStorage()) {
  if (!storage) return false
  try {
    storage.setItem(HUNT_STORAGE_KEY, JSON.stringify(sanitizeHuntState(state)))
    return true
  } catch {
    return false
  }
}

export function hasSavedHuntProgress(storage = defaultStorage()) {
  if (!storage) return false
  try {
    const raw = storage.getItem(HUNT_STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return parsed?.huntActive === true
  } catch {
    return false
  }
}
