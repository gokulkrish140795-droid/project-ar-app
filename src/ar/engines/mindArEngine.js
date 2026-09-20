import { createStubTracker } from './stubEngine.js'

/**
 * MindAR image-target backup — scaffolding only.
 * Expected later (not in this PR): /public/ar/targets trained on AR_PHOTO_CROP_1200x1800.
 * Never point a .mind file at letter capsules.
 */
export async function createMindArTracker(options = {}) {
  return createStubTracker({
    ...options,
    reason: 'mindar: no .mind image-target file in this build',
  })
}
