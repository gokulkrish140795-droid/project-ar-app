/** One environment camera. MindAR must not open until this gate has released. */

function stopTracks(stream) {
  stream?.getTracks?.().forEach((track) => {
    try {
      track.stop()
    } catch {
      /* track already ended */
    }
  })
}

function tracksEnded(stream) {
  const tracks = stream?.getTracks?.() ?? []
  return Promise.all(
    tracks.map(
      (track) =>
        new Promise((resolve) => {
          if (!track || track.readyState === 'ended') {
            resolve()
            return
          }
          const finish = () => resolve()
          track.addEventListener?.('ended', finish, { once: true })
          stopTracks({ getTracks: () => [track] })
          if (track.readyState === 'ended') finish()
        }),
    ),
  )
}

async function openEnvironmentCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('camera API missing')
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: 'environment' } },
    })
  } catch {
    return navigator.mediaDevices.getUserMedia({ audio: false, video: true })
  }
}

/**
 * Serialized projector camera.
 * `release()` does not resolve until any in-flight getUserMedia has settled,
 * its tracks have been stop()'d, and those tracks report `ended`.
 */
export function createRoomCamera(open = openEnvironmentCamera) {
  let current = null
  let boundVideo = null
  let epoch = 0
  let chain = Promise.resolve()

  function run(task) {
    const next = chain.then(task, task)
    chain = next.then(
      () => undefined,
      () => undefined,
    )
    return next
  }

  return {
    bindVideo(video) {
      boundVideo = video || null
    },
    acquire() {
      const ticket = ++epoch
      return run(async () => {
        const previous = current
        current = null
        stopTracks(previous)
        await tracksEnded(previous)
        const stream = await open()
        if (ticket !== epoch) {
          stopTracks(stream)
          await tracksEnded(stream)
          const error = new Error('camera superseded')
          error.code = 'superseded'
          throw error
        }
        current = stream
        return stream
      })
    },
    release() {
      epoch += 1
      return run(async () => {
        const stream = current
        current = null
        const video = boundVideo
        boundVideo = null
        if (video) {
          try {
            video.srcObject = null
          } catch {
            /* element already gone */
          }
        }
        stopTracks(stream)
        await tracksEnded(stream)
      })
    },
  }
}

const roomCamera = createRoomCamera()

export function bindRoomVideo(video) {
  roomCamera.bindVideo(video)
}

export function acquireRoomCamera() {
  return roomCamera.acquire()
}

/** stopTracks + detach the projector video. Resolves only after the session is ended. */
export function releaseRoomCamera() {
  return roomCamera.release()
}
