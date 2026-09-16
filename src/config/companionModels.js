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
  targetHeight: 1.55,
  offsetY: -0.55,
  /** Map our pose ids → likely clip name fragments (case-insensitive) */
  clipAliases: {
    idle: ['idle', 'stand', 'breathing', 'neutral'],
    walkIn: ['walk', 'running', 'run'],
    talk: ['talk', 'speak', 'yes', 'wave'],
    smile: ['happy', 'dance', 'thumbsup', 'wave'],
    lean: ['punch', 'sitting', 'crouch'],
    peek: ['idle', 'wave'],
    yarn: ['wave', 'punch', 'throw'],
    scratch: ['punch', 'wave'],
    bump: ['punch', 'dance'],
    glass: ['idle', 'stand'],
    jump: ['jump', 'dance'],
  },
}

export const GINGER_MODEL = {
  id: 'ginger',
  localUrl: '/models/ginger.glb',
  /** Animated quad stand-in until a tabby GLB is added */
  demoUrl:
    'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Fox/glTF-Binary/Fox.glb',
  targetHeight: 1.05,
  offsetY: -0.35,
  clipAliases: {
    idle: ['idle', 'survey', 'wait'],
    walkIn: ['walk', 'run'],
    leap: ['run', 'walk'],
    sit: ['idle', 'survey'],
    yarn: ['run', 'walk'],
    scratch: ['idle'],
    bump: ['run'],
    glass: ['idle'],
    peek: ['survey', 'idle'],
    stretch: ['survey'],
    loaf: ['idle'],
    lick: ['idle'],
    bat: ['run'],
    roll: ['run'],
    sleep: ['idle'],
    nuzzle: ['idle', 'survey'],
  },
}
