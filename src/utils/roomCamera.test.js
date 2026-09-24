import assert from 'node:assert/strict'
import test from 'node:test'
import { createRoomCamera } from './roomCamera.js'

function liveTrack() {
  let state = 'live'
  const listeners = []
  return {
    get readyState() {
      return state
    },
    stop() {
      if (state === 'ended') return
      state = 'ended'
      listeners.splice(0).forEach((fn) => fn())
    },
    addEventListener(name, fn) {
      if (name === 'ended') listeners.push(fn)
    },
  }
}

test('MindAR barrier waits until an in-flight projector camera is stopped', async () => {
  let resolveOpen
  const gate = createRoomCamera(
    () =>
      new Promise((resolve) => {
        resolveOpen = resolve
      }),
  )
  const track = liveTrack()
  const pending = gate.acquire()
  let mindReady = false

  const mind = (async () => {
    await gate.release()
    assert.equal(track.readyState, 'ended')
    mindReady = true
  })()

  await Promise.resolve()
  assert.equal(mindReady, false)

  resolveOpen({ getTracks: () => [track] })
  await mind
  assert.equal(mindReady, true)
  await assert.rejects(pending, (error) => error.code === 'superseded')
})

test('release clears the video and ends tracks before the next session', async () => {
  const track = liveTrack()
  const stream = { getTracks: () => [track] }
  const gate = createRoomCamera(async () => stream)
  const video = { srcObject: null }
  gate.bindVideo(video)
  await gate.acquire()
  video.srcObject = stream

  await gate.release()

  assert.equal(video.srcObject, null)
  assert.equal(track.readyState, 'ended')
})
