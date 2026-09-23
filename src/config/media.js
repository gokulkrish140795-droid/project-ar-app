/**
 * Project AR — Media config
 * No local files required. Prefer YouTube IDs (unlisted OK) or any https URL.
 *
 * YouTube ID = the part after v= or /shorts/
 */

/**
 * Friends / romantic montage reel.
 * Dummy Short until real friends/family clips:
 * https://www.youtube.com/shorts/IeWb1Wlli0w
 */
export const MONTAGE_YOUTUBE_ID = 'IeWb1Wlli0w'

/**
 * Uncle birthday wish (hologram screen).
 * https://youtube.com/shorts/ehqNWIrxr60
 * Tamil wish via ElevenLabs + CapCut lip sync.
 */
export const UNCLE_WISH_YOUTUBE_ID = 'ehqNWIrxr60'

/** Optional direct https link (Drive/Dropbox/CDN) if not using YouTube */
export const UNCLE_WISH_URL = ''

export const UNCLE_WISH_POSTER = ''

export function hasUncleWishMedia() {
  return Boolean(UNCLE_WISH_YOUTUBE_ID || UNCLE_WISH_URL)
}
