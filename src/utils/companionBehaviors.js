/**
 * Living companion behavior catalog + random director.
 * Visual poses drive MiniMeAvatar3D / GingerCat3D.
 * Optional audio keys play when files exist in /public/audio.
 */

export const IDLE_LINES = [
  {
    text: '💬 Gokul-Mage: “Still with me, love? The heart’s hiding somewhere cozy… 💖”',
    voice: 'voice_idle_1',
  },
  {
    text: '💬 Gokul-Mage: “Ginger says we should check the soft places first. 🐱”',
    voice: 'voice_idle_2',
  },
  {
    text: '💬 Gokul-Mage: “Thirty years of magic… and you’re still my favorite spell. ✨”',
    voice: 'voice_idle_3',
  },
]

/** @typedef {{ id: string, mini: string, ginger: string, duration: number, speech?: string|null, audio?: string[], vibrate?: number, yarn?: boolean, weight?: number }} Behavior */

/** @type {Behavior[]} */
export const BEHAVIORS = [
  {
    id: 'peek',
    mini: 'peek',
    ginger: 'peek',
    duration: 2200,
    speech: '💬 Gokul-Mage: “Boo~ still here 👀”',
    audio: ['sfx_peek_whoosh'],
    weight: 1.2,
  },
  {
    id: 'walk_in',
    mini: 'walkIn',
    ginger: 'walkIn',
    duration: 2800,
    speech: null,
    audio: ['sfx_footstep_soft'],
    weight: 1.1,
  },
  {
    id: 'smile',
    mini: 'smile',
    ginger: 'sit',
    duration: 2400,
    speech: null,
    audio: ['sfx_soft_chime'],
    weight: 1.3,
  },
  {
    id: 'lean_touch',
    mini: 'lean',
    ginger: 'nuzzle',
    duration: 2600,
    speech: '💬 Gokul-Mage: “Come here, Ginger… 💕”',
    audio: ['sfx_cat_purr'],
    vibrate: 70,
    weight: 1.4,
  },
  {
    id: 'yarn',
    mini: 'yarn',
    ginger: 'yarn',
    duration: 1600,
    yarn: true,
    audio: ['sfx_cat_meow'],
    weight: 1,
  },
  {
    id: 'scratch',
    mini: 'scratch',
    ginger: 'scratch',
    duration: 1600,
    audio: ['sfx_cat_purr'],
    vibrate: 80,
    weight: 1,
  },
  {
    id: 'bump',
    mini: 'bump',
    ginger: 'bump',
    duration: 1200,
    audio: ['sfx_revelio_bell'],
    weight: 0.9,
  },
  {
    id: 'ginger_stretch',
    mini: 'smile',
    ginger: 'stretch',
    duration: 2200,
    audio: ['sfx_cat_meow'],
    weight: 1.2,
  },
  {
    id: 'ginger_loaf',
    mini: 'idle',
    ginger: 'loaf',
    duration: 2800,
    audio: ['sfx_cat_purr'],
    weight: 1.1,
  },
  {
    id: 'ginger_lick',
    mini: 'smile',
    ginger: 'lick',
    duration: 1800,
    weight: 1,
  },
  {
    id: 'ginger_bat',
    mini: 'idle',
    ginger: 'bat',
    duration: 1800,
    audio: ['sfx_cat_meow'],
    weight: 1.1,
  },
  {
    id: 'ginger_roll',
    mini: 'smile',
    ginger: 'roll',
    duration: 2000,
    audio: ['sfx_cat_purr'],
    weight: 1,
  },
  {
    id: 'ginger_sleep',
    mini: 'smile',
    ginger: 'sleep',
    duration: 3200,
    audio: ['sfx_cat_purr'],
    weight: 0.8,
  },
  {
    id: 'talk',
    mini: 'talk',
    ginger: 'sit',
    duration: 2200,
    speech: 'random_idle',
    audio: ['voice'],
    weight: 1.15,
  },
]

export function pickBehavior(excludeId = null) {
  const pool = BEHAVIORS.filter((b) => b.id !== excludeId)
  const total = pool.reduce((sum, b) => sum + (b.weight || 1), 0)
  let roll = Math.random() * total
  for (const behavior of pool) {
    roll -= behavior.weight || 1
    if (roll <= 0) return behavior
  }
  return pool[pool.length - 1]
}

export function pickIdleLine() {
  return IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)]
}
