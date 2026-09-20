import { createStubTracker } from './stubEngine.js'

/**
 * 8th Wall free Image Targets — scaffolding only.
 * Do not upload or train targets in this build.
 */
export async function createEighthWallTracker(options = {}) {
  const appKey = import.meta.env?.VITE_8THWALL_APP_KEY
  if (!appKey) {
    return createStubTracker({
      ...options,
      reason: 'eighthwall: missing VITE_8THWALL_APP_KEY; no trained targets',
    })
  }

  return createStubTracker({
    ...options,
    reason: 'eighthwall: app key present but no trained photo-crop targets in this build',
  })
}
