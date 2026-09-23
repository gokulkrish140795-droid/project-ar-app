import { useEffect, useRef } from 'react'
import { theme } from '../theme'

/** Floo smoke first, then the same specks densify into the hologram plate. */
export const FLOO_SMOKE_MS = 700
export const NANO_DUST_MS = 1200
export const SUMMON_RESOLVE_MS = FLOO_SMOKE_MS + NANO_DUST_MS
const PARTICLE_CAP = 520
const SMOKE_SHARE = FLOO_SMOKE_MS / SUMMON_RESOLVE_MS

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function smoothstep(t) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

function plateRect(w, h) {
  const cap = Math.min(h, (window.innerHeight || h) * 0.52)
  const plateH = Math.max(1, Math.min(cap, w * (16 / 9)))
  return {
    x: 0,
    y: Math.max(0, (h - plateH) / 2),
    w,
    h: plateH,
  }
}

function tracePlate(ctx, plate) {
  const r = 8
  const { x, y, w, h } = plate
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function smokeAt(p, s) {
  const swirl = Math.sin(p.spin + s * 5.4) * p.swirl * s
  return {
    x: p.x0 + swirl,
    y: p.y0 - p.rise * s,
  }
}

/**
 * Gold Floo ember smoke rises, then those specks turn cyan and pack into the plate.
 * Canvas 2D, capped particle count. CSS mist plays the same two beats if the context is missing.
 */
export default function NanoDustPlate({ onDone, duration = SUMMON_RESOLVE_MS }) {
  const canvasRef = useRef(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const canvas = canvasRef.current
    const layer = canvas?.parentElement
    if (!canvas || !layer) return undefined

    const ctx = canvas.getContext('2d', { alpha: true })
    let raf = 0
    let start = 0
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      doneRef.current?.()
    }

    if (!ctx) {
      layer.classList.add('is-mist-only')
      const id = window.setTimeout(finish, duration)
      return () => {
        window.clearTimeout(id)
        layer.classList.remove('is-mist-only')
      }
    }

    const cyan = hexToRgb(theme.holo)
    const gold = hexToRgb(theme.gold)
    const goldBright = hexToRgb(theme.goldBright)
    const navy = hexToRgb(theme.velvet)
    const particles = []

    const measure = () => {
      const rect = layer.getBoundingClientRect()
      const w = Math.max(1, rect?.width || 0)
      const h = Math.max(1, rect?.height || 0)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      return { w, h, plate: plateRect(w, h) }
    }

    const seed = (w, h, plate) => {
      particles.length = 0
      for (let i = 0; i < PARTICLE_CAP; i += 1) {
        particles.push({
          x0: w * (0.32 + Math.random() * 0.36),
          y0: h * (0.7 + Math.random() * 0.3),
          rise: h * (0.22 + Math.random() * 0.48),
          swirl: (Math.random() - 0.5) * w * 0.62,
          spin: Math.random() * Math.PI * 2,
          x1: plate.x + Math.random() * plate.w,
          y1: plate.y + Math.random() * plate.h,
          radius: 2.1 + Math.random() * 2.4,
          bright: Math.random() > 0.55,
          delay: Math.random() * 0.16,
        })
      }
    }

    let geom = measure()
    if (geom.w > 1 && geom.h > 1) seed(geom.w, geom.h, geom.plate)

    const draw = (now) => {
      if (!start) start = now
      if (particles.length === 0) {
        geom = measure()
        if (geom.w > 1 && geom.h > 1) seed(geom.w, geom.h, geom.plate)
      }
      const u = Math.min(1, (now - start) / duration)
      const { w, h, plate } = geom
      ctx.clearRect(0, 0, w, h)

      const smoking = u < SMOKE_SHARE
      const smokeT = smoking ? smoothstep(u / SMOKE_SHARE) : 1
      const morphT = smoking ? 0 : smoothstep((u - SMOKE_SHARE) / (1 - SMOKE_SHARE))

      if (smoking) {
        const wash = ctx.createRadialGradient(w * 0.5, h * 0.82, 8, w * 0.5, h * 0.42, Math.max(w, h) * 0.62)
        wash.addColorStop(0, `rgba(${gold.r}, ${gold.g}, ${gold.b}, ${0.42 + smokeT * 0.4})`)
        wash.addColorStop(0.4, `rgba(${goldBright.r}, ${goldBright.g}, ${goldBright.b}, ${0.22 + smokeT * 0.28})`)
        wash.addColorStop(1, `rgba(${navy.r}, ${navy.g}, ${navy.b}, 0)`)
        ctx.fillStyle = wash
        ctx.fillRect(0, 0, w, h)
      }

      if (morphT > 0) {
        const tint = morphT * 0.42
        const pr = navy.r + (cyan.r - navy.r) * tint
        const pg = navy.g + (cyan.g - navy.g) * tint
        const pb = navy.b + (cyan.b - navy.b) * tint
        tracePlate(ctx, plate)
        ctx.fillStyle = `rgba(${pr | 0}, ${pg | 0}, ${pb | 0}, ${0.2 + morphT * 0.75})`
        ctx.fill()
        ctx.strokeStyle = `rgba(${cyan.r}, ${cyan.g}, ${cyan.b}, ${0.35 + morphT * 0.65})`
        ctx.lineWidth = 2.5
        ctx.stroke()
      }

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i]
        const from = smokeAt(p, smokeT)
        let x = from.x
        let y = from.y
        let radius = p.radius * (1.6 + smokeT * 0.7)
        const ember = p.bright ? goldBright : gold
        let cr = ember.r
        let cg = ember.g
        let cb = ember.b
        let alpha = 0.5 + smokeT * 0.45

        if (!smoking) {
          const local = smoothstep(Math.min(1, Math.max(0, (morphT - p.delay) / (1 - p.delay))))
          const end = smokeAt(p, 1)
          x = end.x + (p.x1 - end.x) * local
          y = end.y + (p.y1 - end.y) * local
          radius = p.radius * (1.7 - local * 0.45)
          cr = gold.r + (cyan.r - gold.r) * local
          cg = gold.g + (cyan.g - gold.g) * local
          cb = gold.b + (cyan.b - gold.b) * local
          alpha = 0.62 + local * 0.35
        }

        ctx.fillStyle = `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, Math.max(0.6, radius), 0, Math.PI * 2)
        ctx.fill()
      }

      if (u < 1) {
        raf = window.requestAnimationFrame(draw)
      } else {
        finish()
      }
    }

    const onResize = () => {
      const next = measure()
      if (next.w > 1 && next.h > 1 && particles.length === 0) {
        seed(next.w, next.h, next.plate)
      }
      geom = next
    }

    window.addEventListener('resize', onResize)
    raf = window.requestAnimationFrame(draw)
    const fallback = window.setTimeout(finish, duration + 80)

    return () => {
      finished = true
      window.cancelAnimationFrame(raf)
      window.clearTimeout(fallback)
      window.removeEventListener('resize', onResize)
    }
  }, [duration])

  return (
    <div className="ar-nano-dust-layer" aria-hidden="true">
      <div className="ar-nano-mist" />
      <canvas ref={canvasRef} className="ar-nano-dust" />
    </div>
  )
}
