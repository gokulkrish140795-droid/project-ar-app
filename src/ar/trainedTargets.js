/**
 * Photo-only Image Targets compiled from B+D+E 6×4 fronts.
 * Order matches public/ar/targets/photo-crop.mind (MindAR backup).
 * 8th Wall cloud training is separate and is not done in this build.
 */
export const TRAINED_PHOTO_TARGETS = Object.freeze([
  { index: 0, cardId: '01', image: '/ar/targets/card_01_photo.png' },
  { index: 1, cardId: '11', image: '/ar/targets/card_11_photo.png' },
])

export const MIND_TARGET_SRC = '/ar/targets/photo-crop.mind'

/** True only after an 8th Wall console Image Target payload exists. */
export const EIGHTH_WALL_CLOUD_TRAINED = false

export function cardIdForTargetIndex(index) {
  return TRAINED_PHOTO_TARGETS.find((target) => target.index === index)?.cardId || null
}
