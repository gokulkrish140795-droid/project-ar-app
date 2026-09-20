import { AR_PHOTO_CROP_1200x1800 } from '../../config/ar.js'

export function createStubTracker({ reason = 'stub', onTargetFound: _onTargetFound } = {}) {
  let running = false

  return {
    engine: 'stub',
    status: 'standby',
    reason,
    crop: AR_PHOTO_CROP_1200x1800,
    start() {
      running = true
      return this
    },
    stop() {
      running = false
    },
    isRunning() {
      return running
    },
  }
}
