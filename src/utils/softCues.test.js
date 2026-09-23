import assert from 'node:assert/strict'
import test from 'node:test'
import { BGM_BED_GAIN, SOFT_CUES, dbUnderBed } from './softCues.js'

test('soft transition cues sit about −18..−24 dB under the bed and stay under 300ms', () => {
  assert.equal(BGM_BED_GAIN, 0.32)
  assert.deepEqual(Object.keys(SOFT_CUES).sort(), ['dust', 'ember', 'horizon'])

  for (const [name, cue] of Object.entries(SOFT_CUES)) {
    assert.ok(cue.ms < 300, `${name} duration`)
    assert.ok(cue.ms >= 180, `${name} duration`)
    const db = dbUnderBed(cue.peak)
    assert.ok(db <= -18 && db >= -24, `${name} is ${db.toFixed(2)} dB under the bed`)
  }
})
