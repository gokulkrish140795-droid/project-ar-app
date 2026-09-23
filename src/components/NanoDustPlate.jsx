import { useEffect, useRef } from 'react'
import { theme } from '../theme'

/** Assemble window. Short starts only after this resolves. */
export const NANO_DUST_MS = 1500
const PARTICLE_CAP = 560

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

/**
 * Cyan/gold mist that densifies into the hologram plate.
 * Canvas 2D, capped particle count. CSS mist underneath if the context is missing.
 */
export default function NanoDustPlate({ onDone, duration = NANO_DUST_MS }) {
  const canvasRef = useRef(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

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
      const id = window.setTimeout(finish, duration)
      return () => window.clearTimeout(id)
    }

    const cyan = hexToRgb(theme.holo)
    const gold = hexToRgb(theme.gold)
    const navy = hexToRgb(theme.velvet)
    const particles = []

    const measure = () => {
      const host = canvas.parentElement
      const rect = host?.getBoundingClientRect()
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
          x0: Math.random() * w,
          y0: Math.random() * h,
          x1: plate.x + Math.random() * plate.w,
          y1: plate.y + Math.random() * plate.h,
          radius: 0.7 + Math.random() * 1.7,
          gold: Math.random() > 0.62,
          delay: Math.random() * 0.22,
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
      const t = Math.min(1, (now - start) / duration)
      const { w, h, plate } = geom
      ctx.clearRect(0, 0, w, h)

      const dens = smoothstep(Math.min(1, t / 0.88))
      tracePlate(ctx, plate)
      ctx.fillStyle = `rgba(${navy.r}, ${navy.g}, ${navy.b}, ${0.08 + dens * 0.78})`
      ctx.fill()
      ctx.strokeStyle = `rgba(${cyan.r}, ${cyan.g}, ${cyan.b}, ${0.12 + dens * 0.8})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i]
        const local = smoothstep(Math.min(1, Math.max(0, (t - p.delay) / (1 - p.delay))))
        const x = p.x0 + (p.x1 - p.x0) * local
        const y = p.y0 + (p.y1 - p.y0) * local
        const rgb = p.gold ? gold : cyan
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.2 + local * 0.75})`
        ctx.beginPath()
        ctx.arc(x, y, p.radius * (1.35 - local * 0.55), 0, Math.PI * 2)
        ctx.fill()
      }

      if (t < 1) {
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
