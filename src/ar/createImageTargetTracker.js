import {
  AR_ENGINE_BACKUP,
  AR_ENGINE_PRIMARY,
  getActiveArEngine,
  hasTrainedImageTargets,
} from '../config/ar.js'
import { createEighthWallTracker } from './engines/eighthWallEngine.js'
import { createMindArTracker } from './engines/mindArEngine.js'
import { createStubTracker } from './engines/stubEngine.js'

/**
 * Factory for photo Image Targets.
 * onTargetFound receives a registry card id ("01", "11").
 * Stub stays available when VITE_AR_ENGINE=stub or nothing is trained.
 */
export async function createImageTargetTracker(options = {}) {
  const engine = getActiveArEngine()

  if (engine === AR_ENGINE_PRIMARY) {
    return createEighthWallTracker(options)
  }
  if (engine === AR_ENGINE_BACKUP) {
    return createMindArTracker(options)
  }
  return createStubTracker({
    ...options,
    reason: hasTrainedImageTargets()
      ? 'stub: VITE_AR_ENGINE=stub; trained photo targets are not started'
      : 'stub: no trained photo-crop targets',
  })
}
