/**
 * Production order after the prank was removed:
 * gateway → video_montage → uncle_hologram → scavenger_hunt
 * Back always steps to the previous screen in this list.
 */
export const SCREEN_FLOW = [
  'gateway',
  'video_montage',
  'uncle_hologram',
  'scavenger_hunt',
]

/**
 * Cold start is always the gateway.
 * Saved hunt progress must not choose the boot screen.
 * `?phase=` remains a dev-only preview hook.
 */
export function readInitialScreen({ isDev = false, search = '' } = {}) {
  if (isDev && search) {
    const phase = new URLSearchParams(search).get('phase')
    if (phase && SCREEN_FLOW.includes(phase)) return phase
  }
  return 'gateway'
}

/** Previous beat in the locked flow. Gateway has none. */
export function previousScreen(screen) {
  const index = SCREEN_FLOW.indexOf(screen)
  if (index <= 0) return null
  return SCREEN_FLOW[index - 1]
}
