/**
 * Locked production order. There is no separate letter screen in this build;
 * Back walks the screens the player actually opened.
 */
export const SCREEN_FLOW = [
  'gateway',
  'prank',
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

export function pushScreen(history, screen) {
  const prev = Array.isArray(history) && history.length > 0 ? history : ['gateway']
  if (!SCREEN_FLOW.includes(screen)) return prev
  if (prev[prev.length - 1] === screen) return prev
  return [...prev, screen]
}

export function popScreen(history) {
  const prev = Array.isArray(history) && history.length > 0 ? history : ['gateway']
  if (prev.length <= 1) return prev
  return prev.slice(0, -1)
}
