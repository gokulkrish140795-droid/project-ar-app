/**
 * Image-target crop for current B+D+E 6×4 fronts (1200×1800).
 * Train on the photograph rectangle only — never letter capsules.
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

/** Legacy AAA hybrid compiler canvas (630×1020). Do not use for current 6×4 fronts. */
export const AR_PHOTO_CROP_LEGACY_630x1020 = Object.freeze({
  canvasWidth: 630,
  canvasHeight: 1020,
  x: 36,
  y: 36,
  w: 558,
  h: 744,
})

export const AR_ENGINE_PRIMARY = 'eighthwall'
export const AR_ENGINE_BACKUP = 'mindar'
export const AR_ENGINE_STUB = 'stub'

export function getActiveArEngine() {
  const flag = String(import.meta.env?.VITE_AR_ENGINE || AR_ENGINE_STUB).toLowerCase()
  if (flag === AR_ENGINE_PRIMARY || flag === AR_ENGINE_BACKUP) return flag
  return AR_ENGINE_STUB
}

export function hasTrainedImageTargets() {
  return false
}
