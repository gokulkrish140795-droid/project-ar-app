import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
const gltfCache = new Map()
const urlProbeCache = new Map()

async function urlExists(url) {
  if (!url || url.startsWith('http')) return true
  if (urlProbeCache.has(url)) return urlProbeCache.get(url)
  try {
    const res = await fetch(url, { method: 'HEAD' })
    // Some hosts (incl. StackBlitz) may block HEAD — try GET range-less as fallback
    if (res.ok) {
      urlProbeCache.set(url, true)
      return true
    }
    const get = await fetch(url, { method: 'GET' })
    const ok = get.ok
    urlProbeCache.set(url, ok)
    return ok
  } catch {
    urlProbeCache.set(url, false)
    return false
  }
}

export async function loadGltfCached(url) {
  if (!url) return null
  if (gltfCache.has(url)) return gltfCache.get(url)

  const pending = loader.loadAsync(url).catch((err) => {
    gltfCache.delete(url)
    throw err
  })
  gltfCache.set(url, pending)
  return pending
}

/**
 * Resolve local GLB first, then demo CDN, else null (caller uses procedural).
 */
export async function resolveCompanionGltf(modelConfig) {
  if (!modelConfig) return null

  if (modelConfig.localUrl && (await urlExists(modelConfig.localUrl))) {
    try {
      const gltf = await loadGltfCached(modelConfig.localUrl)
      return { gltf, source: 'local', config: modelConfig }
    } catch {
      // fall through
    }
  }

  if (modelConfig.demoUrl) {
    try {
      const gltf = await loadGltfCached(modelConfig.demoUrl)
      return { gltf, source: 'demo', config: modelConfig }
    } catch {
      return null
    }
  }

  return null
}

function fitModel(model, targetHeight) {
  const box = new THREE.Box3().setFromObject(model)
  const size = new THREE.Vector3()
  box.getSize(size)
  const height = Math.max(size.y, 0.001)
  const scale = targetHeight / height
  model.scale.setScalar(scale)
  box.setFromObject(model)
  const center = new THREE.Vector3()
  box.getCenter(center)
  model.position.x -= center.x
  model.position.z -= center.z
  model.position.y -= box.min.y
}

function findNamedBone(root, patterns) {
  let found = null
  root.traverse((obj) => {
    if (found || !obj.name) return
    const n = obj.name.toLowerCase()
    if (patterns.some((p) => n.includes(p))) found = obj
  })
  return found
}

/**
 * Build a playable companion root from a loaded GLTF.
 */
export function createGltfCompanion(gltf, config) {
  const root = new THREE.Group()
  const model = gltf.scene.clone(true)
  model.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = false
      obj.receiveShadow = false
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m) => {
          if (m) m.side = THREE.FrontSide
        })
      }
    }
  })

  fitModel(model, config.targetHeight || 1.4)
  model.position.y += config.offsetY || 0
  root.add(model)

  const mixer = new THREE.AnimationMixer(model)
  const clipsByName = {}
  for (const clip of gltf.animations || []) {
    clipsByName[clip.name.toLowerCase()] = clip
  }

  const mouth =
    findNamedBone(model, ['mouth', 'jaw', 'chin']) ||
    findNamedBone(model, ['head', 'face', 'neck']) ||
    model

  let currentAction = null

  const playPose = (pose, fade = 0.25) => {
    const aliases = config.clipAliases?.[pose] || [pose]
    let clip = null
    for (const alias of aliases) {
      const key = alias.toLowerCase()
      if (clipsByName[key]) {
        clip = clipsByName[key]
        break
      }
      const hit = Object.entries(clipsByName).find(([name]) => name.includes(key))
      if (hit) {
        clip = hit[1]
        break
      }
    }
    // Default idle if nothing matched
    if (!clip) {
      clip =
        clipsByName.idle ||
        clipsByName.survey ||
        Object.values(clipsByName)[0] ||
        null
    }
    if (!clip) return null

    const next = mixer.clipAction(clip)
    next.enabled = true
    next.setEffectiveWeight(1)
    next.setLoop(THREE.LoopRepeat, Infinity)
    if (pose === 'walkIn' || pose === 'leap' || pose === 'yarn' || pose === 'roll') {
      next.setLoop(THREE.LoopOnce, 1)
      next.clampWhenFinished = true
    }
    if (currentAction && currentAction !== next) {
      currentAction.fadeOut(fade)
    }
    next.reset().fadeIn(fade).play()
    currentAction = next
    return next
  }

  // Soft ground blob
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.01
  root.add(shadow)

  return {
    root,
    model,
    mixer,
    mouth,
    clipsByName,
    playPose,
    isGltf: true,
    source: 'gltf',
  }
}

export function applyRootStaging(root, pose, localT, t) {
  const floatY = Math.sin(t * 1.6) * 0.04
  root.position.set(0, floatY, 0)
  root.rotation.set(0, 0, 0)
  root.scale.setScalar(1)

  if (pose === 'peek') {
    const k = Math.min(1, localT / 0.45)
    root.position.x = -1.15 + k * 1.15
    root.rotation.y = 0.4 * (1 - k)
  } else if (pose === 'walkIn') {
    const k = Math.min(1, localT / 1.1)
    const ease = 1 - (1 - k) ** 3
    root.position.x = -1.55 + ease * 1.55
    root.position.y = floatY + Math.sin(k * Math.PI * 4) * 0.03
  } else if (pose === 'lean') {
    root.rotation.z = 0.16
    root.position.x = 0.2
  } else if (pose === 'bump') {
    root.position.x = 0.16
  } else if (pose === 'glass') {
    root.position.y = floatY * 0.25 + 0.03
    root.scale.setScalar(1.06)
  } else if (pose === 'leap') {
    const k = Math.min(1, localT / 0.55)
    const arc = Math.sin(k * Math.PI)
    root.position.set(-0.55 + k * 0.55, 0.12 + arc * 0.5, 0)
  } else if (pose === 'smile') {
    root.rotation.y = Math.sin(t * 2) * 0.08
  } else if (pose === 'nuzzle') {
    root.position.x = -0.25
    root.position.y = floatY + 0.06
  }
}
