import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { AR_PHOTO_CROP_1200x1800 } from '../config/ar.js'
import {
  applyAnagramUnlock,
  applyBypass,
  CH1_VAULT,
  ensureWorkbench,
  makeWorkbenchTiles,
  moveWorkbenchTile,
  spelledFromSlots,
} from './ch1Quest.js'
import { loadHuntState, saveHuntState, sanitizeHuntState } from './storage.js'

const registry = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../data/card_registry.json'), 'utf8'),
)

const ch1 = registry.cards.filter((card) => card.chapter === 1).sort((a, b) => a.step - b.step)

test('registry vault and Ch1 bypasses match the content bible', () => {
  assert.equal(registry.meta.vaultAnagrams['1'], 'MICROWAVECUPBOARD')
  assert.equal(CH1_VAULT, 'MICROWAVECUPBOARD')
  assert.equal(ch1[9].vaultAnagram, 'MICROWAVECUPBOARD')
  assert.deepEqual(
    ch1.map((card) => [card.step, card.letters[0] || null, card.bypass]),
    [
      [1, 'M', 'mirror'],
      [2, 'I', 'sofa'],
      [3, 'X', 'computer'],
      [4, 'O', 'curtain'],
      [5, 'W', 'pooja'],
      [6, 'A', 'cutlery'],
      [7, 'V', 'teddy'],
      [8, 'E', 'closet'],
      [9, 'C', 'dining'],
      [10, null, 'microwave'],
    ],
  )
  for (const card of registry.cards) {
    assert.equal(card.quote, null)
  }
})

test('per-step bypass collects letters then unlocks MICROWAVECUPBOARD', () => {
  let state = sanitizeHuntState(null)
  const phrases = [
    'Mirror',
    ' sofa ',
    'COMPUTER',
    'curtain',
    'pooja',
    'cutlery',
    'teddy',
    'closet',
    'dining',
  ]

  phrases.forEach((phrase, index) => {
    const result = applyBypass(state, phrase, ch1)
    assert.equal(result.ok, true)
    state = result.state
    assert.equal(state.currentStepIndex, index + 1)
  })

  assert.deepEqual(state.collectedLetters, ['M', 'I', 'X', 'O', 'W', 'A', 'V', 'E', 'C'])
  assert.equal(state.vaultUnlocked, false)

  const wrong = applyBypass(state, 'mirror', ch1)
  assert.equal(wrong.ok, false)

  const unlock = applyBypass(state, 'microwave', ch1)
  assert.equal(unlock.ok, true)
  assert.equal(unlock.state.vaultUnlocked, true)
})

test('workbench rearrange unlocks only MICROWAVECUPBOARD', () => {
  let state = sanitizeHuntState({ currentStepIndex: 9, unlockedCards: [1, 2, 3, 4, 5, 6, 7, 8, 9] })
  state = ensureWorkbench(state, () => 0)

  const wrong = applyAnagramUnlock(state, 'CUPBOARDMICROWAVE', ch1)
  assert.equal(wrong.ok, false)

  const tiles = makeWorkbenchTiles()
  tiles.forEach((tile, index) => {
    state = moveWorkbenchTile(state, { type: 'pool', id: tile.id }, { type: 'slot', index })
  })
  assert.equal(spelledFromSlots(state.workbench), 'MICROWAVECUPBOARD')

  const unlock = applyAnagramUnlock(state, spelledFromSlots(state.workbench), ch1)
  assert.equal(unlock.ok, true)
  assert.equal(unlock.state.vaultUnlocked, true)
})

test('AR photo crop is 64,64,1072,1260 on 1200×1800 and excludes letter capsules', () => {
  assert.deepEqual(AR_PHOTO_CROP_1200x1800, {
    canvasWidth: 1200,
    canvasHeight: 1800,
    x: 64,
    y: 64,
    w: 1072,
    h: 1260,
    unit: 'px',
    target: 'photograph',
    exclude: 'letter-capsules',
  })
})

test('localStorage persistence round-trip', () => {
  const memory = new Map()
  const storage = {
    getItem: (key) => (memory.has(key) ? memory.get(key) : null),
    setItem: (key, value) => memory.set(key, String(value)),
  }

  const saved = sanitizeHuntState({
    currentStepIndex: 3,
    unlockedCards: [1, 2, 3],
    collectedLetters: ['M', 'I', 'X'],
    huntActive: true,
  })
  assert.equal(saveHuntState(saved, storage), true)
  const loaded = loadHuntState(storage)
  assert.equal(loaded.currentStepIndex, 3)
  assert.deepEqual(loaded.collectedLetters, ['M', 'I', 'X'])
  assert.deepEqual(loaded.unlockedCards, [1, 2, 3])
})
