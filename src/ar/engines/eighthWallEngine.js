import { hasTrainedImageTargets } from '../../config/ar.js'
import { EIGHTH_WALL_CLOUD_TRAINED } from '../trainedTargets.js'
import { createMindArTracker } from './mindArEngine.js'
import { createStubTracker } from './stubEngine.js'

/**
 * 8th Wall is the preferred phone engine once console Image Targets exist.
 * This build has no cloud-trained payload, so a present MindAR .mind file is the backup.
 * The reason string stays explicit either way.
 */
export async function createEighthWallTracker(options = {}) {
  const appKey = import.meta.env?.VITE_8THWALL_APP_KEY
  const blocked = !appKey
    ? 'eighthwall: missing VITE_8THWALL_APP_KEY'
    : !EIGHTH_WALL_CLOUD_TRAINED
      ? 'eighthwall: photo targets are not cloud-trained'
      : ''

  if (blocked) {
    if (hasTrainedImageTargets()) {
      const backup = await createMindArTracker(options)
      return {
        ...backup,
        requestedEngine: 'eighthwall',
        reason: `${blocked}; ${backup.reason}`,
      }
    }
    return createStubTracker({
      ...options,
      reason: `${blocked}; no trained photo-crop targets`,
    })
  }

  return createStubTracker({
    ...options,
    reason: 'eighthwall: cloud target payload is not wired',
  })
}
