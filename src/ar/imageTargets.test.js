import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { decode } from '@msgpack/msgpack'
import { createEighthWallTracker } from './engines/eighthWallEngine.js'
import { resolveTrainedTarget } from './resolveImageTarget.js'
import { EIGHTH_WALL_CLOUD_TRAINED, MIND_TARGET_SRC, TRAINED_PHOTO_TARGETS } from './trainedTargets.js'
import { AR_PHOTO_CROP_1200x1800, getActiveArEngine, hasTrainedImageTargets } from '../config/ar.js'
import registry from '../data/card_registry.json' with { type: 'json' }

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')

function pngSize(buffer) {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG')
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

test('trained targets exist and 8th Wall cloud training stays false', () => {
  assert.equal(hasTrainedImageTargets(), true)
  assert.equal(EIGHTH_WALL_CLOUD_TRAINED, false)
  assert.equal(getActiveArEngine(), 'mindar')
  assert.deepEqual(
    TRAINED_PHOTO_TARGETS.map((target) => target.cardId),
    ['01', '11'],
  )
  assert.equal(MIND_TARGET_SRC, '/ar/targets/photo-crop.mind')
})

test('photo crops are 1072×1260 and the mind file matches that crop', () => {
  for (const target of TRAINED_PHOTO_TARGETS) {
    const file = join(ROOT, 'public', target.image)
    const size = pngSize(readFileSync(file))
    assert.deepEqual(size, { width: AR_PHOTO_CROP_1200x1800.w, height: AR_PHOTO_CROP_1200x1800.h })
  }

  const packed = decode(readFileSync(join(ROOT, 'public', MIND_TARGET_SRC)))
  assert.equal(packed.v, 2)
  assert.equal(packed.dataList.length, TRAINED_PHOTO_TARGETS.length)
  packed.dataList.forEach((entry, index) => {
    assert.equal(entry.targetImage.width, 1072)
    assert.equal(entry.targetImage.height, 1260)
    assert.equal(TRAINED_PHOTO_TARGETS[index].cardId, index === 0 ? '01' : '11')
    assert.ok(entry.matchingData)
    assert.ok(entry.trackingData)
  })
})

test('card 01 and 11 unlock payloads come from the registry only', () => {
  const card01 = resolveTrainedTarget('01')
  const card11 = resolveTrainedTarget('11')
  assert.equal(card01.lettersRaw, registry.cards['01'].letters)
  assert.deepEqual(card01.letters, ['M', 'I', 'X'])
  assert.equal(card11.lettersRaw, registry.cards['11'].letters)
  assert.deepEqual(card11.letters, ['G', 'O', 'F'])
  assert.equal(card11.quote, registry.cards['11'].quote)
  assert.equal(resolveTrainedTarget('02'), null)
  assert.notEqual(AR_PHOTO_CROP_1200x1800.w, registry.canvas.arSafeZone.width)
  assert.notEqual(AR_PHOTO_CROP_1200x1800.h, registry.canvas.arSafeZone.height)
})

test('8th Wall without a cloud payload falls back to MindAR and says so', async () => {
  const tracker = await createEighthWallTracker({ container: {} })
  assert.equal(tracker.engine, 'mindar')
  assert.equal(tracker.requestedEngine, 'eighthwall')
  assert.match(tracker.reason, /eighthwall: missing VITE_8THWALL_APP_KEY/)
  assert.match(tracker.reason, /mindar: photo-crop targets 01, 11/)
})
