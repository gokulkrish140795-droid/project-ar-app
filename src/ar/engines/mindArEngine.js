import { AR_PHOTO_CROP_1200x1800, hasTrainedImageTargets } from '../../config/ar.js'
import { releaseRoomCamera } from '../../utils/roomCamera.js'
import { cardIdForTargetIndex, MIND_TARGET_SRC, TRAINED_PHOTO_TARGETS } from '../trainedTargets.js'
import { createStubTracker } from './stubEngine.js'

const MIND_MODULE_URL = '/ar/vendor/mind-ar/mindar-image.prod.js'

function cameraConstraints() {
  return {
    audio: false,
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  }
}

async function openCamera() {
  await releaseRoomCamera()
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('camera API missing')
  }
  try {
    return await navigator.mediaDevices.getUserMedia(cameraConstraints())
  } catch {
    return navigator.mediaDevices.getUserMedia({ audio: false, video: true })
  }
}

/**
 * MindAR backup. Tracks the compiled photo crop only.
 * Fires onTargetFound with the registry card id (01, 11, …).
 */
export async function createMindArTracker({ onTargetFound, container } = {}) {
  if (!hasTrainedImageTargets()) {
    return createStubTracker({ reason: 'mindar: no trained photo-crop targets' })
  }
  if (!container) {
    return createStubTracker({ reason: 'mindar: camera container missing' })
  }

  let controller = null
  let video = null
  let running = false
  const showing = new Set()
  const cardIds = TRAINED_PHOTO_TARGETS.map((target) => target.cardId).join(', ')

  const tracker = {
    engine: 'mindar',
    status: 'ready',
    reason: `mindar: photo-crop targets ${cardIds}`,
    crop: AR_PHOTO_CROP_1200x1800,
    async start() {
      if (running) return this
      await releaseRoomCamera()
      try {
        video = document.createElement('video')
        video.setAttribute('autoplay', '')
        video.setAttribute('muted', '')
        video.setAttribute('playsinline', '')
        video.setAttribute('webkit-playsinline', '')
        video.muted = true
        video.playsInline = true
        video.style.position = 'absolute'
        video.style.inset = '0'
        video.style.width = '100%'
        video.style.height = '100%'
        video.style.objectFit = 'cover'
        container.appendChild(video)

        const stream = await openCamera()
        video.srcObject = stream
        await video.play()
        if (!video.videoWidth) {
          await new Promise((resolve, reject) => {
            const timer = window.setTimeout(() => reject(new Error('video metadata timeout')), 5000)
            video.addEventListener(
              'loadedmetadata',
              () => {
                window.clearTimeout(timer)
                resolve()
              },
              { once: true },
            )
          })
        }

        const moduleUrl = new URL(MIND_MODULE_URL, window.location.href).href
        const mind = await import(/* @vite-ignore */ moduleUrl)
        const Controller = mind.Controller
        if (!Controller) throw new Error('MindAR Controller missing')

        video.width = video.videoWidth
        video.height = video.videoHeight
        controller = new Controller({
          inputWidth: video.videoWidth,
          inputHeight: video.videoHeight,
          maxTrack: 1,
          onUpdate: (data) => {
            if (data?.type !== 'updateMatrix') return
            const { targetIndex, worldMatrix } = data
            if (worldMatrix && !showing.has(targetIndex)) {
              showing.add(targetIndex)
              const cardId = cardIdForTargetIndex(targetIndex)
              if (cardId) onTargetFound?.(cardId)
            } else if (!worldMatrix) {
              showing.delete(targetIndex)
            }
          },
        })

        await controller.addImageTargets(MIND_TARGET_SRC)
        controller.dummyRun(video)
        controller.processVideo(video)
        running = true
        tracker.status = 'live'
        return this
      } catch (error) {
        tracker.status = 'error'
        tracker.reason = `mindar: camera unavailable (${error?.name || error?.message || 'error'})`
        console.warn(tracker.reason)
        this.stop()
        return this
      }
    },
    stop() {
      running = false
      showing.clear()
      try {
        controller?.stopProcessVideo()
      } catch {
        /* already stopped */
      }
      try {
        controller?.dispose()
      } catch {
        /* worker already closed */
      }
      controller = null
      const stream = video?.srcObject
      stream?.getTracks?.().forEach((track) => track.stop())
      video?.remove()
      video = null
    },
    isRunning() {
      return running
    },
  }

  return tracker
}
