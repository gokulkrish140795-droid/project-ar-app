/**
 * Soft transition one-shots. Web Audio placeholders Gokul can swap
 * inside playSoftCue — no stingers, clanks, or beeps.
 *
 * Level is peak gain into master, relative to the BGM bed (bgmGain).
 * −18 dB is the loudest allowed; −24 dB is the quietest. Each cue is under 300ms.
 */

export const BGM_BED_GAIN = 0.32

export const SOFT_CUES = {
  ember: { ms: 240, peak: 0.034 },
  dust: { ms: 220, peak: 0.021 },
  horizon: { ms: 270, peak: 0.026 },
}

export function dbUnderBed(peak, bed = BGM_BED_GAIN) {
  return 20 * Math.log10(peak / bed)
}
