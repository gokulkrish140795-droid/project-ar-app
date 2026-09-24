/** One environment camera at a time. Hunt must not inherit a live projector stream. */
let current = null

export function releaseRoomCamera() {
  const stream = current
  current = null
  stream?.getTracks?.().forEach((track) => {
    try {
      track.stop()
    } catch {
      /* track already ended */
    }
  })
}

export async function acquireRoomCamera() {
  releaseRoomCamera()
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('camera API missing')
  }
  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: 'environment' } },
    })
  } catch {
    stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true })
  }
  current = stream
  return stream
}
