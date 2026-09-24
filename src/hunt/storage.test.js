import assert from 'node:assert/strict'
import test from 'node:test'
import {
  HUNT_REACHED_KEY,
  HUNT_STORAGE_KEY,
  HUNT_STORAGE_VERSION,
  canContinueSavedHunt,
  createInitialHuntState,
  hasSavedHuntProgress,
  markHuntReached,
  saveHuntState,
} from './storage.js'

function memoryStorage(initial = {}) {
  const data = { ...initial }
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null
    },
    setItem(key, value) {
      data[key] = String(value)
    },
    removeItem(key) {
      delete data[key]
    },
  }
}

test('a blank hunt blob is saved progress but not a legitimate continue', () => {
  const storage = memoryStorage()
  assert.equal(saveHuntState(createInitialHuntState(), storage), true)
  assert.equal(hasSavedHuntProgress(storage), true)
  assert.equal(canContinueSavedHunt(storage), false)
})

test('reaching the hunt makes a blank save continuable', () => {
  const storage = memoryStorage()
  saveHuntState(createInitialHuntState(), storage)
  assert.equal(markHuntReached(storage), true)
  assert.equal(storage.getItem(HUNT_REACHED_KEY), '1')
  assert.equal(canContinueSavedHunt(storage), true)
})

test('real step progress can continue without the reached flag', () => {
  const storage = memoryStorage()
  saveHuntState(
    {
      ...createInitialHuntState(),
      currentStepIndex: 2,
      collectedLetters: ['M'],
    },
    storage,
  )
  assert.equal(canContinueSavedHunt(storage), true)
})

test('a stale or inactive record cannot continue', () => {
  const storage = memoryStorage({
    [HUNT_STORAGE_KEY]: JSON.stringify({
      version: HUNT_STORAGE_VERSION - 1,
      huntActive: true,
      currentStepIndex: 4,
      collectedLetters: ['M'],
    }),
  })
  assert.equal(canContinueSavedHunt(storage), false)

  storage.setItem(
    HUNT_STORAGE_KEY,
    JSON.stringify({
      version: HUNT_STORAGE_VERSION,
      huntActive: false,
      currentStepIndex: 4,
      collectedLetters: ['M'],
    }),
  )
  assert.equal(canContinueSavedHunt(storage), false)
})

test('empty storage cannot continue', () => {
  assert.equal(canContinueSavedHunt(memoryStorage()), false)
  assert.equal(canContinueSavedHunt(null), false)
})
