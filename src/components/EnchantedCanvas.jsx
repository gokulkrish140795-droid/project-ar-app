import { useEffect, useRef } from 'react'

const CANDLE_COUNT = 3
const ENVELOPE_COUNT = 2
const FIREFLY_COUNT = 28
const MAX_SPARKS = 140
const TRAIL_LENGTH = 22

function createCandles(width, height) {
  const spots = [
    [0.16, 0.22],
    [0.84, 0.18],
    [0.72, 0.78],
  ]
  return spots.slice(0, CANDLE_COUNT).map(([nx, ny], index) => ({
    x: width * nx,
    y: height * ny,
    z: 0.55 + index * 0.12,
    phase: Math.random() * Math.PI * 2,
    drift: 0.35 + Math.random() * 0.4,
    amp: 6 + Math.random() * 8,
    waxH: 20 + Math.random() * 8,
    waxW: 5,
    flicker: Math.random(),
  }))
}

function createEnvelopes(width, height) {
  return Array.from({ length: ENVELOPE_COUNT }, (_, index) => ({
    x: width * (index === 0 ? 0.22 : 0.78),
    y: height * (index === 0 ? 0.68 : 0.34),
    z: 0.55 + index * 0.2,
    yaw: Math.random() * Math.PI * 2,
    spin: 0.00045 * (index % 2 === 0 ? 1 : -1),
    phase: Math.random() * Math.PI * 2,
    drift: 0.3,
    amp: 10,
    vx: 0.08 + index * 0.04,
    vy: -0.08 - index * 0.03,
  }))
}

function createFireflies(width, height) {
  return Array.from({ length: FIREFLY_COUNT }, () => ({
    x: width * Math.random(),
    y: height * Math.random(),
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.28,
    pulse: Math.random() * Math.PI * 2,
    size: 1.4 + Math.random() * 1.8,
  }))
}

function createFliers(width, height) {
  return [
    { kind: 'owl', x: -80, y: height * 0.16, vx: 0.55, scale: 1, flap: 0 },
    { kind: 'bat', x: width + 60, y: height * 0.12, vx: -0.85, scale: 0.7, flap: 1.2 },
    { kind: 'bat', x: width * 0.4, y: height * 0.08, vx: -0.62, scale: 0.55, flap: 2.4 },
  ]
}

function createBubbles(width, height) {
  return Array.from({ length: 8 }, () => ({
    x: width * (Math.random() > 0.5 ? 0.08 + Math.random() * 0.12 : 0.8 + Math.random() * 0.12),
    y: height * (0.55 + Math.random() * 0.4),
    r: 3 + Math.random() * 6,
    vy: -0.18 - Math.random() * 0.22,
    wobble: Math.random() * Math.PI * 2,
  }))
}

function drawSparkle(ctx, x, y, size, alpha, diamond) {
  ctx.save()
  ctx.translate(x, y)
  ctx.globalAlpha = alpha
  ctx.strokeStyle = diamond ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 214, 110, 0.95)'
  ctx.lineWidth = diamond ? 1.35 : 1
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(0, size)
  ctx.moveTo(-size, 0)
  ctx.lineTo(size, 0)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-size * 0.62, -size * 0.62)
  ctx.lineTo(size * 0.62, size * 0.62)
  ctx.moveTo(size * 0.62, -size * 0.62)
  ctx.lineTo(-size * 0.62, size * 0.62)
  ctx.stroke()
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.45)
  core.addColorStop(0, 'rgba(255, 255, 255, 1)')
  core.addColorStop(0.45, 'rgba(212, 175, 55, 0.9)')
  core.addColorStop(1, 'rgba(212, 175, 55, 0)')
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.42, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export default function EnchantedCanvas({ lumosOn = false, flooActive = false }) {
  const canvasRef = useRef(null)
  const lumosRef = useRef(lumosOn)
  const flooRef = useRef(flooActive)
  lumosRef.current = lumosOn
  flooRef.current = flooActive

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return undefined
    }

    const ctx = canvas.getContext('2d', { alpha: false })
    const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.4 }
    const trail = []
    const sparks = []
    const floo = []
    let candles = []
    let envelopes = []
    let fireflies = []
    let fliers = []
    let bubbles = []
    const broom = { x: -120, y: 120, vx: 1.15, vy: 0.32, spin: 0 }
    let intensity = lumosRef.current ? 1 : 0.22
    let frame = 0
    let raf = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      candles = createCandles(window.innerWidth, window.innerHeight)
      envelopes = createEnvelopes(window.innerWidth, window.innerHeight)
      fireflies = createFireflies(window.innerWidth, window.innerHeight)
      fliers = createFliers(window.innerWidth, window.innerHeight)
      bubbles = createBubbles(window.innerWidth, window.innerHeight)
      broom.y = window.innerHeight * 0.28
    }

    const addSparks = (x, y, burst = 4) => {
      for (let i = 0; i < burst; i += 1) {
        sparks.push({
          x: x + (Math.random() - 0.5) * 14,
          y: y + (Math.random() - 0.5) * 14,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -0.5 - Math.random() * 2.1,
          life: 1,
          size: 3.2 + Math.random() * 5.4,
          diamond: Math.random() > 0.35,
        })
      }
      if (sparks.length > MAX_SPARKS) {
        sparks.splice(0, sparks.length - MAX_SPARKS)
      }
    }

    const onPointer = (event) => {
      const touch = event.touches ? event.touches[0] : event
      if (!touch) {
        return
      }
      pointer.x = touch.clientX
      pointer.y = touch.clientY
      trail.push({ x: pointer.x, y: pointer.y })
      if (trail.length > TRAIL_LENGTH) {
        trail.shift()
      }
      addSparks(pointer.x, pointer.y, lumosRef.current ? 8 : 4)
    }

    const drawHall = (width, height) => {
      const night = ctx.createLinearGradient(0, 0, 0, height)
      night.addColorStop(0, '#1a1230')
      night.addColorStop(0.45, '#0F0A1C')
      night.addColorStop(1, '#07040f')
      ctx.fillStyle = night
      ctx.fillRect(0, 0, width, height)

      const glow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.18,
        20,
        width * 0.5,
        height * 0.2,
        width * 0.55
      )
      glow.addColorStop(0, `rgba(212, 175, 55, ${0.07 + intensity * 0.12})`)
      glow.addColorStop(1, 'rgba(15, 10, 28, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)
    }

    const drawCandle = (candle, time) => {
      candle.flicker += 0.18 + Math.random() * 0.08
      const floatY = candle.y + Math.sin(time * 0.001 * candle.drift + candle.phase) * candle.amp
      const flame = 0.55 + Math.sin(candle.flicker) * 0.25 + Math.random() * 0.08
      const light = (0.18 + intensity * 0.82) * candle.z

      ctx.save()
      ctx.translate(candle.x, floatY)

      const halo = 34 + candle.z * 18
      const aura = ctx.createRadialGradient(0, -candle.waxH - 8, 2, 0, -candle.waxH, halo)
      aura.addColorStop(0, `rgba(255, 215, 0, ${0.75 * light * flame})`)
      aura.addColorStop(0.45, `rgba(255, 140, 40, ${0.1 * light})`)
      aura.addColorStop(1, 'rgba(255, 160, 40, 0)')
      ctx.fillStyle = aura
      ctx.beginPath()
      ctx.arc(0, -candle.waxH, halo, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `rgba(236, 214, 168, ${0.55 + light * 0.4})`
      ctx.fillRect(-candle.waxW / 2, -candle.waxH, candle.waxW, candle.waxH)
      ctx.fillStyle = 'rgba(90, 58, 28, 0.55)'
      ctx.fillRect(-candle.waxW / 2, -4, candle.waxW, 4)

      const flameH = 11 * flame * (0.7 + light * 0.5)
      const flameGrad = ctx.createRadialGradient(0, -candle.waxH - 4, 1, 0, -candle.waxH - 4, 12)
      flameGrad.addColorStop(0, `rgba(255, 250, 220, ${0.95 * light})`)
      flameGrad.addColorStop(0.4, `rgba(255, 170, 50, ${0.85 * light})`)
      flameGrad.addColorStop(1, 'rgba(255, 90, 20, 0)')
      ctx.fillStyle = flameGrad
      ctx.beginPath()
      ctx.moveTo(0, -candle.waxH - flameH)
      ctx.quadraticCurveTo(5, -candle.waxH - 4, 0, -candle.waxH + 2)
      ctx.quadraticCurveTo(-5, -candle.waxH - 4, 0, -candle.waxH - flameH)
      ctx.fill()
      ctx.restore()
    }

    const drawEnvelope = (env, time) => {
      env.yaw += env.spin
      env.x += env.vx * env.z
      env.y += env.vy * env.z
      if (env.y < -40) {
        env.y = window.innerHeight + 30
        env.x = window.innerWidth * (0.15 + Math.random() * 0.7)
      }
      if (env.x > window.innerWidth + 40) {
        env.x = -30
      }

      const floatY = env.y + Math.sin(time * 0.0009 * env.drift + env.phase) * env.amp
      const scale = 0.5 + env.z * 0.45
      const skew = Math.sin(env.yaw) * 0.38
      const w = 42 * scale
      const h = 28 * scale
      const alpha = 0.42 + env.z * 0.35

      ctx.save()
      ctx.translate(env.x, floatY)
      ctx.transform(1, 0.08 * Math.cos(env.yaw), skew, 1, 0, 0)
      ctx.fillStyle = `rgba(245, 230, 200, ${alpha})`
      ctx.strokeStyle = `rgba(122, 78, 32, ${alpha})`
      ctx.lineWidth = 1
      ctx.fillRect(-w / 2, -h / 2, w, h)
      ctx.strokeRect(-w / 2, -h / 2, w, h)
      ctx.beginPath()
      ctx.moveTo(-w / 2, -h / 2)
      ctx.lineTo(0, -h / 2 + h * 0.46)
      ctx.lineTo(w / 2, -h / 2)
      ctx.closePath()
      ctx.fillStyle = `rgba(214, 180, 118, ${alpha})`
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, -1, 5 * scale, 0, Math.PI * 2)
      ctx.fillStyle = '#9b1520'
      ctx.fill()
      ctx.restore()
    }

    const drawFireflies = (width, height) => {
      for (const bug of fireflies) {
        bug.x += bug.vx
        bug.y += bug.vy
        bug.pulse += 0.06
        if (bug.x < -10) bug.x = width + 10
        if (bug.x > width + 10) bug.x = -10
        if (bug.y < -10) bug.y = height + 10
        if (bug.y > height + 10) bug.y = -10
        const glow = 0.25 + Math.sin(bug.pulse) * 0.25
        const halo = ctx.createRadialGradient(bug.x, bug.y, 0, bug.x, bug.y, 10)
        halo.addColorStop(0, `rgba(210, 255, 120, ${0.55 * glow})`)
        halo.addColorStop(1, 'rgba(180, 255, 90, 0)')
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(bug.x, bug.y, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(230, 255, 150, ${0.7 + glow})`
        ctx.beginPath()
        ctx.arc(bug.x, bug.y, bug.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawFlier = (flier, width) => {
      flier.x += flier.vx
      flier.flap += 0.18
      if (flier.vx > 0 && flier.x > width + 80) {
        flier.x = -80
      }
      if (flier.vx < 0 && flier.x < -80) {
        flier.x = width + 80
      }

      const wing = Math.sin(flier.flap) * (flier.kind === 'owl' ? 8 : 12)
      ctx.save()
      ctx.translate(flier.x, flier.y + Math.sin(flier.flap * 0.4) * 4)
      ctx.scale(flier.scale * (flier.vx > 0 ? 1 : -1), flier.scale)
      ctx.fillStyle = 'rgba(6, 4, 12, 0.72)'
      if (flier.kind === 'owl') {
        ctx.beginPath()
        ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(-8, -2, 14, 5 + wing * 0.15, -0.4, 0, Math.PI * 2)
        ctx.ellipse(8, -2, 14, 5 + wing * 0.15, 0.4, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(-18, -2, 7, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.quadraticCurveTo(-10, -10 - wing, -22, -2)
        ctx.quadraticCurveTo(-8, 2, 0, 0)
        ctx.moveTo(0, 0)
        ctx.quadraticCurveTo(10, -10 - wing, 22, -2)
        ctx.quadraticCurveTo(8, 2, 0, 0)
        ctx.fill()
      }
      ctx.restore()
    }

    const drawBroom = (width, height) => {
      broom.x += broom.vx
      broom.y += broom.vy
      broom.spin += 0.01
      if (broom.x > width + 140 || broom.y > height + 80) {
        broom.x = -140
        broom.y = height * (0.18 + Math.random() * 0.3)
      }

      ctx.save()
      ctx.translate(broom.x, broom.y)
      ctx.rotate(0.35 + Math.sin(broom.spin) * 0.05)
      ctx.fillStyle = 'rgba(8, 5, 16, 0.7)'
      ctx.fillRect(-36, -2, 48, 4)
      ctx.beginPath()
      ctx.moveTo(12, -8)
      ctx.lineTo(34, -12)
      ctx.lineTo(36, 12)
      ctx.lineTo(12, 8)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const drawBubbles = (width, height) => {
      for (const bubble of bubbles) {
        bubble.y += bubble.vy
        bubble.wobble += 0.04
        bubble.x += Math.sin(bubble.wobble) * 0.25
        if (bubble.y < height * 0.35) {
          bubble.y = height * 0.92
        }
        ctx.strokeStyle = `rgba(180, 255, 210, ${0.35 + intensity * 0.3})`
        ctx.fillStyle = `rgba(120, 255, 200, ${0.08 + intensity * 0.08})`
        ctx.beginPath()
        ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
    }

    const drawTrail = () => {
      const sparkLight = 0.35 + intensity * 0.75
      trail.forEach((point, index) => {
        const t = (index + 1) / trail.length
        drawSparkle(ctx, point.x, point.y, 2.2 + t * 5.5, t * 0.55 * sparkLight, index % 2 === 0)
      })
    }

    const drawSparks = () => {
      const sparkLight = 0.3 + intensity * 0.8
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i]
        spark.x += spark.vx
        spark.y += spark.vy
        spark.life -= 0.022
        if (spark.life <= 0) {
          sparks.splice(i, 1)
        } else {
          drawSparkle(ctx, spark.x, spark.y, spark.size * spark.life, spark.life * sparkLight, spark.diamond)
        }
      }
    }

    const emitFloo = (width, height) => {
      for (let i = 0; i < 14; i += 1) {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.min(width, height) * (0.35 + Math.random() * 0.4)
        floo.push({
          angle,
          radius,
          speed: 0.04 + Math.random() * 0.05,
          life: 1,
          size: 2 + Math.random() * 4,
        })
      }
    }

    const drawFloo = (width, height) => {
      const cx = width * 0.5
      const cy = height * 0.5
      for (let i = floo.length - 1; i >= 0; i -= 1) {
        const ember = floo[i]
        ember.angle += ember.speed
        ember.radius *= 0.975
        ember.life -= 0.012
        if (ember.life <= 0 || ember.radius < 8) {
          floo.splice(i, 1)
        } else {
          const x = cx + Math.cos(ember.angle) * ember.radius
          const y = cy + Math.sin(ember.angle) * ember.radius * 0.38
          ctx.fillStyle = `rgba(${ember.size > 4 ? 212 : 80}, ${ember.size > 4 ? 175 : 220}, ${ember.size > 4 ? 55 : 120}, ${ember.life * 0.85})`
          ctx.beginPath()
          ctx.arc(x, y, ember.size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      const vortex = ctx.createRadialGradient(cx, cy, 8, cx, cy, 220)
      vortex.addColorStop(0, 'rgba(180, 255, 210, 0.38)')
      vortex.addColorStop(0.28, 'rgba(212, 175, 55, 0.22)')
      vortex.addColorStop(0.55, 'rgba(40, 140, 90, 0.16)')
      vortex.addColorStop(1, 'rgba(15, 10, 28, 0)')
      ctx.fillStyle = vortex
      ctx.beginPath()
      ctx.arc(cx, cy, 220, 0, Math.PI * 2)
      ctx.fill()
    }

    const tick = (time) => {
      const width = window.innerWidth
      const height = window.innerHeight
      const target = lumosRef.current ? 1 : 0.22
      intensity += (target - intensity) * 0.045

      drawHall(width, height)
      fliers.forEach((flier) => drawFlier(flier, width))
      drawBroom(width, height)
      envelopes.forEach((env) => drawEnvelope(env, time))
      candles.forEach((candle) => drawCandle(candle, time))
      drawBubbles(width, height)
      drawFireflies(width, height)

      if (frame % 2 === 0) {
        addSparks(pointer.x, pointer.y, lumosRef.current ? 3 : 1)
      }
      drawTrail()
      drawSparks()

      if (flooRef.current) {
        if (floo.length < 180) {
          emitFloo(width, height)
        }
        drawFloo(width, height)
      }

      frame += 1
      raf = window.requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('touchmove', onPointer, { passive: true })
    raf = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('touchmove', onPointer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}
