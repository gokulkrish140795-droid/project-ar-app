import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js'

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

function skinnedWorldBox(root) {
  root.updateMatrixWorld(true)
  const box = new THREE.Box3()
  const v = new THREE.Vector3()
  root.traverse((obj) => {
    if (!obj.isSkinnedMesh) return
    const position = obj.geometry?.attributes?.position
    if (!position) return
    for (let i = 0; i < position.count; i += 1) {
      obj.getVertexPosition(i, v)
      v.applyMatrix4(obj.matrixWorld)
      box.expandByPoint(v)
    }
  })
  return box
}

function boneWorld(root, boneName) {
  let found = null
  root.traverse((obj) => {
    if (!found && obj.name === boneName) found = obj
  })
  if (!found) return null
  return found.getWorldPosition(new THREE.Vector3())
}

function findClip(clipsByName, aliases) {
  for (const alias of aliases) {
    const key = String(alias).toLowerCase()
    if (clipsByName[key]) return clipsByName[key]
    const hit = Object.entries(clipsByName).find(([name]) => name.includes(key))
    if (hit) return hit[1]
  }
  return null
}

/**
 * Scale and center a skinned rest pose so Sit/Idle fit the companion camera.
 * Yaw must already be applied. Bind-pose Box3 is not used: it underestimates
 * the posed fox and, once yawed, leaves the body left of the lens.
 */
function frameSkinnedPoses(model, mixer, clipsByName, config) {
  const view = config.view
  const box = new THREE.Box3()
  const anchorSamples = []
  for (const name of view.clips || ['idle']) {
    const clip = findClip(clipsByName, config.clipAliases?.[name] || [name])
    if (!clip) continue
    const action = mixer.clipAction(clip)
    action.reset().setLoop(THREE.LoopRepeat, Infinity).play()
    for (const frac of [0.25, 0.55, 0.8]) {
      mixer.setTime(Math.max(clip.duration * frac, 0.001))
      const sample = skinnedWorldBox(model)
      if (!sample.isEmpty()) box.union(sample)
      if (name === 'sit') {
        // Muzzle/eyes, not the sternum. A chest aim leaves the dipped head
        // high in the slot so the paws and belly fill the frame.
        const eyes = boneWorld(model, 'tripoHead_6') || boneWorld(model, 'tripoHead_2')
        if (eyes) anchorSamples.push(eyes.y)
      }
    }
    action.stop()
  }
  mixer.stopAllAction()
  if (box.isEmpty()) return null

  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)
  const cam = new THREE.Vector3().fromArray(view.position)
  const look = new THREE.Vector3().fromArray(view.lookAt)
  const distance = Math.max(cam.distanceTo(look), 0.001)
  const fov = THREE.MathUtils.degToRad(view.fov || 32)
  const visible = 2 * Math.tan(fov / 2) * distance
  const span = Math.max(size.x, size.y, 0.001)
  const scale = (visible * (view.fill ?? 0.72)) / span
  const anchorY = anchorSamples.length
    ? anchorSamples.reduce((sum, y) => sum + y, 0) / anchorSamples.length
    : center.y
  model.scale.setScalar(scale)
  // XZ stays on the posed center. Y parks the Sit muzzle on the level lens.
  model.position.set(
    look.x - center.x * scale,
    look.y - anchorY * scale,
    look.z - center.z * scale,
  )
  return {
    footY: look.y + (box.min.y - anchorY) * scale,
    width: size.x * scale,
  }
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
  // Skinned Mixamo / Blender rigs MUST use SkeletonUtils.clone — scene.clone(true)
  // leaves the mesh bound to the original skeleton, so clips never move the body.
  const model = cloneSkinned(gltf.scene)
  const morphMeshes = []
  model.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = false
      obj.receiveShadow = false
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m) => {
          if (m) {
            // Cardigan holes look black with FrontSide when normals flip under deform
            m.side = THREE.DoubleSide
            if (m.isMeshPhysicalMaterial) {
              // Mobile-friendly: keep sparkle without looking like a flat clay stamp
              m.roughness = Math.min(m.roughness ?? 0.6, 0.72)
              m.metalness = Math.min(m.metalness ?? 0.2, 0.35)
            }
          }
        })
      }
      if (obj.morphTargetDictionary && obj.morphTargetInfluences) {
        morphMeshes.push(obj)
      }
    }
  })

  const mixer = new THREE.AnimationMixer(model)
  const clipsByName = {}
  for (const clip of gltf.animations || []) {
    clipsByName[clip.name.toLowerCase()] = clip
  }

  let framed = null
  if (config.view) {
    // Yaw first, then fit the posed silhouette to the square camera.
    if (config.yaw !== undefined) model.rotation.y = config.yaw
    model.scale.setScalar(1)
    model.position.set(0, 0, 0)
    framed = frameSkinnedPoses(model, mixer, clipsByName, config)
    if (!framed) {
      fitModel(model, config.targetHeight || 1.4)
      model.position.y += config.offsetY || 0
    }
  } else {
    fitModel(model, config.targetHeight || 1.4)
    model.position.y += config.offsetY || 0
    // Face the camera by default (Mixamo often faces +Z; our avatar cams look from +Z)
    if (config.yaw !== undefined) model.rotation.y = config.yaw
  }
  root.add(model)

  const mouth =
    findNamedBone(model, ['mouth', 'jaw', 'chin']) ||
    findNamedBone(model, ['head', 'face', 'neck']) ||
    model

  const morphIndex = (name) => {
    for (const mesh of morphMeshes) {
      const idx = mesh.morphTargetDictionary?.[name]
      if (idx !== undefined) return { mesh, idx }
    }
    return null
  }

  const setMorph = (name, value) => {
    const hit = morphIndex(name)
    if (!hit) return false
    hit.mesh.morphTargetInfluences[hit.idx] = Math.max(0, Math.min(1, value))
    return true
  }

  const getMorph = (name) => {
    const hit = morphIndex(name)
    if (!hit) return 0
    return hit.mesh.morphTargetInfluences[hit.idx] || 0
  }

  /** Pose-driven face overlay (works even when clip morph tracks are missing). */
  const driveFace = (pose, talking, lipAmp, t) => {
    if (!morphMeshes.length) return
    const talk =
      talking || pose === 'talk' || pose === 'laugh'
        ? Math.max(lipAmp || 0, pose === 'talk' ? 0.12 : 0)
        : 0

    let mouthOpen = talk * 0.85
    let smile = 0
    let blinkL = 0
    let blinkR = 0

    if (pose === 'smile' || pose === 'cheer' || pose === 'flyKiss' || pose === 'wave') {
      smile = 0.75
    } else if (pose === 'winkSmile') {
      smile = 0.85
      blinkL = 1
    } else if (pose === 'laugh') {
      mouthOpen = Math.max(mouthOpen, 0.45 + Math.abs(Math.sin(t * 12)) * 0.35)
      smile = 0.55
    } else if (pose === 'surprise') {
      mouthOpen = Math.max(mouthOpen, 0.55)
    } else if (pose === 'shh') {
      smile = 0.2
    } else if (pose === 'jump') {
      mouthOpen = Math.max(mouthOpen, 0.35)
      smile = 0.5
    } else if (pose === 'idle' || !pose) {
      // soft idle blink every ~3s
      const phase = (t % 3.2) / 3.2
      if (phase > 0.92 && phase < 0.97) {
        blinkL = blinkR = 1
      }
    }

    if (pose === 'talk') smile = Math.max(smile, 0.25)

    setMorph('mouthOpen', mouthOpen)
    setMorph('smile', smile)
    setMorph('blink_L', blinkL)
    setMorph('blink_R', blinkR)
  }

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
    next.setEffectiveTimeScale(pose === 'idle' ? 1.35 : 1.15)
    next.setLoop(THREE.LoopRepeat, Infinity)
    const once = new Set([
      'walkIn',
      'leap',
      'yarn',
      'roll',
      'cheer',
      'flyKiss',
      'winkSmile',
      'jump',
      'magicCast',
      'clap',
      'wave',
      'heartHands',
      'search',
      'shh',
      'think',
      'surprise',
      'bow',
      'holdHeart',
      'laugh',
      'point',
    ])
    if (once.has(pose)) {
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
  shadow.position.y = framed ? framed.footY + 0.01 : 0.01
  if (framed) shadow.scale.setScalar(Math.min(1, Math.max(0.45, framed.width / 1.6)))
  root.add(shadow)

  return {
    root,
    model,
    mixer,
    mouth,
    clipsByName,
    playPose,
    setMorph,
    getMorph,
    driveFace,
    morphMeshes,
    isGltf: true,
    source: 'gltf',
  }
}

export function applyRootStaging(root, pose, localT, t) {
  // Keep root motion readable even when Blender Idle is deliberately subtle
  const floatY = Math.sin(t * 1.8) * (pose === 'idle' || !pose ? 0.028 : 0.04)
  const idleSway = pose === 'idle' || !pose ? Math.sin(t * 0.9) * 0.06 : 0
  root.position.set(0, floatY, 0)
  root.rotation.set(0, idleSway, 0)
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
  } else if (pose === 'smile' || pose === 'winkSmile') {
    root.rotation.y = Math.sin(t * 2) * 0.08
  } else if (pose === 'nuzzle' || pose === 'heartHands') {
    root.position.x = -0.25
    root.position.y = floatY + 0.06
  } else if (pose === 'cheer' || pose === 'jump') {
    root.position.y = floatY + Math.abs(Math.sin(localT * 8)) * 0.08
  } else if (pose === 'flyKiss') {
    root.rotation.y = -0.18
    root.position.z = 0.06
  } else if (pose === 'wave') {
    root.rotation.y = -0.12
  } else if (pose === 'magicCast') {
    root.rotation.y = 0.2
  } else if (pose === 'search') {
    root.rotation.y = Math.sin(localT * 3.2) * 0.35
  } else if (pose === 'dance') {
    root.position.x = Math.sin(t * 6) * 0.06
    root.rotation.y = Math.sin(t * 4) * 0.12
  }
}
