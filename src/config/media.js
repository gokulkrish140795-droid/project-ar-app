/**
 * Project AR — Media config
 * Montage and uncle play a direct mp4/webm on the floor plane.
 * YouTube ids stay as source notes only. They are not embedded.
 */

/**
 * Friends / romantic montage reel.
 * Direct file only — never a YouTube iframe.
 * Drop an mp4 at public/media/montage.mp4 or set an https mp4/webm URL.
 */
export const MONTAGE_YOUTUBE_ID = 'IeWb1Wlli0w'
export const MONTAGE_VIDEO_URL = '/media/montage.mp4'

/**
 * Uncle birthday wish (hologram screen).
 * Tamil wish via ElevenLabs + CapCut lip sync.
 * Direct file only — never a YouTube iframe.
 */
export const UNCLE_WISH_YOUTUBE_ID = 'ehqNWIrxr60'
export const UNCLE_WISH_URL = '/media/uncle-wish.mp4'

export const UNCLE_WISH_POSTER = ''

export function hasUncleWishMedia() {
  return Boolean(UNCLE_WISH_YOUTUBE_ID || UNCLE_WISH_URL)
}
