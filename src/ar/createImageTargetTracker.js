import { AR_ENGINE_BACKUP, AR_ENGINE_PRIMARY, getActiveArEngine } from '../config/ar.js'
import { createEighthWallTracker } from './engines/eighthWallEngine.js'
import { createMindArTracker } from './engines/mindArEngine.js'
import { createStubTracker } from './engines/stubEngine.js'

/**
 * Factory for Chapter 1 photo Image Targets.
 * Always safe without trained assets: engines fall back to the no-camera stub.
 */
export async function createImageTargetTracker(options = {}) {
  const engine = getActiveArEngine()

  if (engine === AR_ENGINE_PRIMARY) {
    return createEighthWallTracker(options)
  }
  if (engine === AR_ENGINE_BACKUP) {
    return createMindArTracker(options)
  }
  return createStubTracker({ ...options, reason: 'stub: camera training out of scope' })
}
