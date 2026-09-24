import assert from 'node:assert/strict'
import test from 'node:test'
import { previousScreen, readInitialScreen, SCREEN_FLOW } from './screenFlow.js'

test('cold start is the gateway even when a dev phase is absent', () => {
  assert.equal(readInitialScreen(), 'gateway')
  assert.equal(readInitialScreen({ isDev: false, search: '?phase=scavenger_hunt' }), 'gateway')
  assert.equal(readInitialScreen({ isDev: true, search: '' }), 'gateway')
  assert.equal(readInitialScreen({ isDev: true, search: '?phase=not-a-screen' }), 'gateway')
})

test('dev phase can preview a locked screen without becoming the production boot', () => {
  assert.equal(
    readInitialScreen({ isDev: true, search: '?phase=scavenger_hunt' }),
    'scavenger_hunt',
  )
  assert.equal(readInitialScreen({ isDev: true, search: '?phase=prank' }), 'prank')
})

test('back walks the locked flow even after continue jumps to the hunt', () => {
  assert.deepEqual(SCREEN_FLOW, [
    'gateway',
    'prank',
    'video_montage',
    'uncle_hologram',
    'scavenger_hunt',
  ])
  assert.equal(previousScreen('scavenger_hunt'), 'uncle_hologram')
  assert.equal(previousScreen('uncle_hologram'), 'video_montage')
  assert.equal(previousScreen('video_montage'), 'prank')
  assert.equal(previousScreen('prank'), 'gateway')
  assert.equal(previousScreen('gateway'), null)
  assert.equal(previousScreen('letter'), null)
})
