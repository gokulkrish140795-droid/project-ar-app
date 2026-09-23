import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { AR_PHOTO_CROP_1200x1800 } from '../config/ar.js'
import { getPlayableCards, parseRegistryLetters } from '../data/cardRegistry.js'
import { CH1_CONTENT_BIBLE } from '../data/ch1ContentBible.js'
import {
  applyAnagramUnlock,
  applyBypass,
  applyImageTargetScan,
  CH1_VAULT,
  ensureWorkbench,
  moveWorkbenchTile,
  spelledFromSlots,
} from './ch1Quest.js'
import { loadHuntState, saveHuntState, sanitizeHuntState } from './storage.js'

const ROOT = dirname(fileURLToPath(import.meta.url))
const registryPath = join(ROOT, '../data/card_registry.json')
const registryBuf = readFileSync(registryPath)
const registry = JSON.parse(registryBuf.toString('utf8'))
const ch1 = getPlayableCards()

const DESKTOP_REGISTRY_MD5 = '5eec25c910a66ed3224dc4303cce4966'

test('card_registry.json matches Desktop SoT byte-for-byte (MD5)', () => {
  assert.equal(createHash('md5').update(registryBuf).digest('hex'), DESKTOP_REGISTRY_MD5)
  assert.equal(registry.cards['01'].letters, 'M - I - X')
  assert.equal(registry.cards['02'].letters, 'C - R - Y')
  assert.equal(registry.cards['03'].letters, 'O - W')
  assert.equal(registry.cards['04'].letters, 'A - V - Z')
  assert.equal(registry.cards['05'].letters, 'E - C')
  assert.equal(registry.cards['06'].letters, 'U - P')
  assert.equal(registry.cards['07'].letters, 'B - O')
  assert.equal(registry.cards['08'].letters, 'A - R')
  assert.equal(registry.cards['09'].letters, 'D - Q')
  assert.match(registry.cards['01'].quote, /morning smile/)
  assert.equal(registry.cards['10'], undefined)
})

test('Ch1 payloads and full bypass phrases come from registry + content bible', () => {
  assert.equal(CH1_VAULT, 'MICROWAVECUPBOARD')
  assert.deepEqual(
    ch1.map((card) => [card.step, card.lettersRaw || null, card.bypass]),
    [
      [1, 'M - I - X', 'mirror'],
      [2, 'C - R - Y', 'sofa'],
      [3, 'O - W', 'computer table'],
      [4, 'A - V - Z', 'curtain'],
      [5, 'E - C', 'pooja drawer'],
      [6, 'U - P', 'cutlery drawer'],
      [7, 'B - O', 'teddy bear'],
      [8, 'A - R', 'wardrobe'],
      [9, 'D - Q', 'chair'],
      [10, null, 'microwave cupboard'],
    ],
  )
  assert.deepEqual(parseRegistryLetters('M - I - X'), ['M', 'I', 'X'])
  assert.equal(CH1_CONTENT_BIBLE[10].vaultAnagram, 'MICROWAVECUPBOARD')
})

test('shortened bypass phrases are rejected; whitespace-only normalize still matches', () => {
  let state = sanitizeHuntState({ version: 2 })
  assert.equal(applyBypass(state, 'computer', ch1).ok, false)
  const step1 = applyBypass(state, '  Mirror  ', ch1)
  assert.equal(step1.ok, true)
  state = step1.state
  state = applyBypass(state, 'sofa', ch1).state
  assert.equal(applyBypass(state, 'computer', ch1).ok, false)
  const step3 = applyBypass(state, '  computer   table ', ch1)
  assert.equal(step3.ok, true)
  assert.deepEqual(step3.state.collectedLetters, ['M', 'I', 'X', 'C', 'R', 'Y', 'O', 'W'])
})

test('per-step bypass collects multi-letter payloads then unlocks MICROWAVECUPBOARD', () => {
  let state = sanitizeHuntState({ version: 2 })
  const phrases = [
    'mirror',
    'sofa',
    'computer table',
    'curtain',
    'pooja drawer',
    'cutlery drawer',
    'teddy bear',
    'wardrobe',
    'chair',
  ]

  phrases.forEach((phrase, index) => {
    const result = applyBypass(state, phrase, ch1)
    assert.equal(result.ok, true, phrase)
    state = result.state
    assert.equal(state.currentStepIndex, index + 1)
  })

  assert.deepEqual(state.collectedLetters.join(''), 'MIXCRYOWAVZECUPBOARDQ')
  assert.equal(state.vaultUnlocked, false)
  assert.equal(applyBypass(state, 'microwave', ch1).ok, false)
  const unlock = applyBypass(state, 'microwave cupboard', ch1)
  assert.equal(unlock.ok, true)
  assert.equal(unlock.state.vaultUnlocked, true)
})

test('workbench rearrange unlocks only MICROWAVECUPBOARD', () => {
  let state = sanitizeHuntState({ version: 2 })
  for (const phrase of [
    'mirror',
    'sofa',
    'computer table',
    'curtain',
    'pooja drawer',
    'cutlery drawer',
    'teddy bear',
    'wardrobe',
    'chair',
  ]) {
    state = applyBypass(state, phrase, ch1).state
  }
  state = ensureWorkbench(state, () => 0)

  const wrong = applyAnagramUnlock(state, 'CUPBOARDMICROWAVE', ch1)
  assert.equal(wrong.ok, false)

  for (const letter of CH1_VAULT.split('')) {
    const tile = state.workbench.pool.find((item) => item.letter === letter)
    const slot = state.workbench.slots.findIndex((item) => item == null)
    state = moveWorkbenchTile(state, { type: 'pool', id: tile.id }, { type: 'slot', index: slot })
  }
  assert.equal(spelledFromSlots(state.workbench), 'MICROWAVECUPBOARD')

  const leftovers = state.workbench.pool.map((tile) => tile.letter).sort().join('')
  assert.equal(leftovers, 'QXYZ')

  const unlock = applyAnagramUnlock(state, spelledFromSlots(state.workbench), ch1)
  assert.equal(unlock.ok, true)
  assert.equal(unlock.state.vaultUnlocked, true)
})

test('trained photo targets unlock registry letters without inventing card 11 into the Ch1 workbench', () => {
  let state = sanitizeHuntState({ version: 2 })
  const sideFirst = applyImageTargetScan(state, '11', ch1)
  assert.equal(sideFirst.ok, true)
  assert.equal(sideFirst.lettersRaw, registry.cards['11'].letters)
  assert.deepEqual(sideFirst.letters, ['G', 'O', 'F'])
  assert.deepEqual(sideFirst.state.collectedLetters, [])
  assert.deepEqual(sideFirst.state.scannedTargets, ['11'])
  assert.equal(sideFirst.state.currentStepIndex, 0)

  const card01 = applyImageTargetScan(sideFirst.state, '01', ch1)
  assert.equal(card01.ok, true)
  assert.equal(card01.lettersRaw, 'M - I - X')
  assert.deepEqual(card01.state.collectedLetters, ['M', 'I', 'X'])
  assert.equal(card01.state.currentStepIndex, 1)
  assert.deepEqual(card01.state.scannedTargets, ['11'])
  state = card01.state

  assert.equal(applyImageTargetScan(state, '01', ch1).ok, false)
  assert.equal(applyImageTargetScan(state, '02', ch1).reason, 'untrained')
  const repeat = applyImageTargetScan(state, '11', ch1)
  assert.equal(repeat.ok, false)
  assert.equal(repeat.reason, 'already')

  const workbench = ensureWorkbench(state, () => 0)
  assert.deepEqual(
    workbench.workbench.pool.map((tile) => tile.letter).sort(),
    ['I', 'M', 'X'],
  )
})

test('scanned card 11 persists and Chapter 1 step ids are not stored as side targets', () => {
  const memory = new Map()
  const storage = {
    getItem: (key) => (memory.has(key) ? memory.get(key) : null),
    setItem: (key, value) => memory.set(key, String(value)),
  }
  const scanned = applyImageTargetScan(sanitizeHuntState({ version: 2 }), 11, ch1)
  assert.equal(saveHuntState(scanned.state, storage), true)
  const loaded = loadHuntState(storage)
  assert.deepEqual(loaded.scannedTargets, ['11'])

  const dirty = sanitizeHuntState({
    version: 2,
    scannedTargets: ['01', '11', '99', '11'],
    collectedLetters: ['M', 'I', 'X'],
    unlockedCards: [1],
    currentStepIndex: 1,
  })
  assert.deepEqual(dirty.scannedTargets, ['11'])
  assert.deepEqual(dirty.collectedLetters, ['M', 'I', 'X'])
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
    version: 2,
    currentStepIndex: 3,
    unlockedCards: [1, 2, 3],
    collectedLetters: ['M', 'I', 'X', 'C', 'R', 'Y', 'O', 'W'],
    huntActive: true,
  })
  assert.equal(saveHuntState(saved, storage), true)
  const loaded = loadHuntState(storage)
  assert.equal(loaded.currentStepIndex, 3)
  assert.deepEqual(loaded.collectedLetters, ['M', 'I', 'X', 'C', 'R', 'Y', 'O', 'W'])
  assert.deepEqual(loaded.unlockedCards, [1, 2, 3])
})
