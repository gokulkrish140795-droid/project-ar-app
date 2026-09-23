import {
  EIGHTH_WALL_CLOUD_TRAINED,
  MIND_TARGET_SRC,
  TRAINED_PHOTO_TARGETS,
} from '../ar/trainedTargets.js'

/**
 * Image-target crop for current B+D+E 6×4 fronts (1200×1800).
 * Train on the photograph rectangle only — never letter capsules.
 * card_registry.json `canvas.arSafeZone` is frozen Desktop metadata. Do not train from it.
 */
export const AR_PHOTO_CROP_1200x1800 = Object.freeze({
  canvasWidth: 1200,
  canvasHeight: 1800,
  x: 64,
  y: 64,
  w: 1072,
  h: 1260,
  unit: 'px',
  target: 'photograph',
  exclude: 'letter-capsules',
})

export const AR_ENGINE_PRIMARY = 'eighthwall'
export const AR_ENGINE_BACKUP = 'mindar'
export const AR_ENGINE_STUB = 'stub'

export function hasTrainedImageTargets() {
  return TRAINED_PHOTO_TARGETS.length > 0 && Boolean(MIND_TARGET_SRC)
}

export function getActiveArEngine() {
  const flag = String(import.meta.env?.VITE_AR_ENGINE || '').toLowerCase()
  if (flag === AR_ENGINE_STUB || flag === AR_ENGINE_PRIMARY || flag === AR_ENGINE_BACKUP) {
    return flag
  }
  if (!hasTrainedImageTargets()) return AR_ENGINE_STUB
  if (EIGHTH_WALL_CLOUD_TRAINED && import.meta.env?.VITE_8THWALL_APP_KEY) return AR_ENGINE_PRIMARY
  return AR_ENGINE_BACKUP
}
