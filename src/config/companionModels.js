/**
 * Companion GLB paths.
 * Drop your files at the localUrl paths — they win over demo URLs.
 * Demo URLs keep StackBlitz looking “alive” until your art is ready.
 */
export const MINIME_MODEL = {
  id: 'minime',
  localUrl: '/models/minime.glb',
  /** Animated humanoid stand-in (Three.js RobotExpressive) */
  demoUrl:
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r175/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
  targetHeight: 1.65,
  offsetY: -0.12,
  /** Mixamo faces +Z; camera sits on +Z looking inward — keep yaw 0 to face the lens */
  yaw: 0,
  /** Map our pose ids → likely clip name fragments (case-insensitive) */
  /** Prefer exact Blender Action names from BLENDER_COMPANION_CHECKLIST.md */
  clipAliases: {
    idle: ['idle', 'breathing', 'neutral'],
    walkIn: ['walkin', 'walk', 'running', 'run'],
    talk: ['talk', 'speak', 'storytelling'],
    smile: ['smile', 'agree', 'happy', 'thumbsup'],
    lean: ['lean', 'nuzzle', 'nuzzling', 'sitting'],
    peek: ['peek', 'peeking', 'doorway'],
    // Until Blender Priority-2 clips exist, remap to dramatic Priority-1 clips
    yarn: ['lean', 'smile', 'wave'],
    scratch: ['lean', 'smile'],
    bump: ['jump', 'dance'],
    glass: ['glass', 'pressing', 'phone', 'idle'],
    jump: ['jump', 'celebrate'],
    nuzzle: ['lean', 'nuzzle'],
    cheer: ['jump', 'celebratory', 'cheer', 'bounce'],
    flyKiss: ['smile', 'blowing', 'kiss'],
    winkSmile: ['smile', 'wink'],
    wave: ['smile', 'greet', 'wave', 'yes'],
    magicCast: ['jump', 'cast_a_spell', 'spell'],
    search: ['peek', 'look_around', 'search'],
    clap: ['jump', 'clap'],
    heartHands: ['lean', 'smile'],
    dance: ['jump', 'dance', 'happy'],
    shh: ['peek', 'shh'],
    think: ['lean', 'thinking'],
    surprise: ['jump', 'surprise'],
    bow: ['lean', 'bow'],
    holdHeart: ['lean', 'smile'],
    laugh: ['talk', 'smile', 'laugh'],
    point: ['lean', 'point'],
  },
}

export const GINGER_MODEL = {
  id: 'ginger',
  localUrl: '/models/ginger.glb',
  /** No demo stand-in — procedural Ginger reads clearer than the Fox sample */
  demoUrl: null,
  targetHeight: 1.05,
  offsetY: -0.35,
  /** Prefer exact Blender Action names from BLENDER_COMPANION_CHECKLIST.md */
  clipAliases: {
    idle: ['idle', 'survey', 'wait'],
    walkIn: ['walkin', 'walk', 'run'],
    leap: ['leap', 'jump', 'run', 'walk'],
    sit: ['sit', 'idle', 'survey'],
    yarn: ['yarn', 'run', 'walk'],
    scratch: ['scratch', 'idle'],
    bump: ['bump', 'run'],
    glass: ['glass', 'idle'],
    peek: ['peek', 'survey', 'idle'],
    stretch: ['stretch', 'survey'],
    loaf: ['loaf', 'idle'],
    lick: ['lick', 'idle'],
    bat: ['bat', 'run'],
    roll: ['roll', 'run'],
    sleep: ['sleep', 'idle'],
    nuzzle: ['nuzzle', 'idle', 'survey'],
    cheer: ['cheer', 'jump', 'stretch'],
    flyKiss: ['flykiss', 'kiss', 'idle'],
    winkSmile: ['wink', 'sit', 'idle'],
    wave: ['wave', 'survey', 'idle'],
    magicCast: ['bat', 'leap', 'run'],
    search: ['peek', 'survey', 'idle'],
    clap: ['sit', 'idle'],
    heartHands: ['nuzzle', 'idle'],
    dance: ['run', 'walk', 'survey'],
    boop: ['boop', 'nuzzle', 'idle'],
    loafOnHim: ['loafonhim', 'loaf', 'nuzzle', 'sit'],
    tailWrap: ['tailwrap', 'nuzzle', 'idle'],
    shh: ['sit', 'idle'],
    think: ['survey', 'idle'],
    surprise: ['leap', 'jump'],
    bow: ['sit', 'idle'],
    holdHeart: ['nuzzle', 'idle'],
    laugh: ['idle', 'survey'],
    point: ['survey', 'peek'],
  },
}
