import assert from 'node:assert/strict'
import test from 'node:test'
import { popScreen, pushScreen, readInitialScreen, SCREEN_FLOW } from './screenFlow.js'

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

test('back walks the screens the player opened, including a gateway resume', () => {
  let history = ['gateway']
  for (const screen of SCREEN_FLOW.slice(1)) {
    history = pushScreen(history, screen)
  }
  assert.deepEqual(history, SCREEN_FLOW)

  history = popScreen(history)
  assert.equal(history.at(-1), 'uncle_hologram')
  history = popScreen(history)
  assert.equal(history.at(-1), 'video_montage')
  history = popScreen(history)
  assert.equal(history.at(-1), 'prank')
  history = popScreen(history)
  assert.deepEqual(history, ['gateway'])
  assert.deepEqual(popScreen(history), ['gateway'])
})

test('continue hunt from the gateway returns to the gateway, not to uncle', () => {
  const history = pushScreen(['gateway'], 'scavenger_hunt')
  assert.deepEqual(history, ['gateway', 'scavenger_hunt'])
  assert.equal(popScreen(history).at(-1), 'gateway')
})

test('push ignores unknown screens and duplicate tops', () => {
  assert.deepEqual(pushScreen(['gateway'], 'letter'), ['gateway'])
  assert.deepEqual(pushScreen(['gateway'], 'gateway'), ['gateway'])
})
