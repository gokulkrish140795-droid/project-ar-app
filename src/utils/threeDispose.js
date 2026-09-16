/** Recursively dispose Three.js geometries, materials, and textures. */
export function disposeObject3D(root) {
  if (!root) return

  root.traverse((obj) => {
    if (obj.geometry) {
      obj.geometry.dispose()
    }

    if (obj.material) {
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
      for (const mat of materials) {
        if (!mat) continue
        for (const key of Object.keys(mat)) {
          const value = mat[key]
          if (value && typeof value === 'object' && value.isTexture) {
            value.dispose()
          }
        }
        mat.dispose()
      }
    }
  })
}

export function disposeRenderer(renderer) {
  if (!renderer) return
  renderer.dispose()
  const canvas = renderer.domElement
  if (canvas?.parentNode) {
    canvas.parentNode.removeChild(canvas)
  }
}
