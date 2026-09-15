import { useEffect, useRef } from 'react'

const CANDLE_COUNT = 22
const ENVELOPE_COUNT = 16
const DUST_COUNT = 120
const RUNE_COUNT = 18
const MAX_SPARKS = 170
const TRAIL_LENGTH = 22
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᛉ', 'ᛟ', '✧', '☽', '⚡']

function createCandles(width, height) {
  return Array.from({ length: CANDLE_COUNT }, (_, index) => {
    const column = index % 11
    const row = Math.floor(index / 11)
    return {
      x: ((column + 0.3) / 11) * width + (Math.random() - 0.5) * 42,
      y: height * (0.06 + row * 0.28) + Math.random() * height * 0.2,
      z: 0.35 + Math.random() * 0.85,
      phase: Math.random() * Math.PI * 2,
      drift: 0.3 + Math.random() * 0.75,
      amp: 8 + Math.random() * 18,
      waxH: 22 + Math.random() * 22,
      waxW: 4.5 + Math.random() * 3.8,
      flicker: Math.random(),
    }
  })
}

function createEnvelopes(width, height) {
  return Array.from({ length: ENVELOPE_COUNT }, () => ({
    x: width * (0.08 + Math.random() * 0.84),
    y: height * (0.08 + Math.random() * 0.78),
    z: 0.4 + Math.random() * 0.9,
    yaw: Math.random() * Math.PI * 2,
    spin: (Math.random() * 0.0012 + 0.0004) * (Math.random() > 0.5 ? 1 : -1),
    phase: Math.random() * Math.PI * 2,
    drift: 0.25 + Math.random() * 0.55,
    amp: 10 + Math.random() * 16,
    vx: 0.18 + Math.random() * 0.32,
    vy: -0.14 - Math.random() * 0.28,
  }))
}

function createDust(width, height) {
  return Array.from({ length: DUST_COUNT }, () => ({
    radius: 36 + Math.random() * Math.min(width, height) * 0.46,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() * 0.0045 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
    size: 0.55 + Math.random() * 1.9,
    twinkle: Math.random() * Math.PI * 2,
    lift: (Math.random() - 0.5) * height * 0.2,
  }))
}

function createRunes(width, height) {
  return Array.from({ length: RUNE_COUNT }, () => ({
    glyph: RUNES[Math.floor(Math.random() * RUNES.length)],
    x: width * (0.06 + Math.random() * 0.88),
    y: height * (0.08 + Math.random() * 0.84),
    z: 0.3 + Math.random() * 0.7,
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.008,
    pulse: Math.random() * Math.PI * 2,
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
    let dust = []
    let runes = []
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
      dust = createDust(window.innerWidth, window.innerHeight)
      runes = createRunes(window.innerWidth, window.innerHeight)
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

    const drawDust = (width, height, time) => {
      const cx = width * 0.5
      const cy = height * 0.42
      for (const mote of dust) {
        mote.angle += mote.spin
        mote.twinkle += 0.04
        const swirl = Math.sin(time * 0.0003 + mote.angle) * 18
        const x = cx + Math.cos(mote.angle) * (mote.radius + swirl)
        const y = cy + Math.sin(mote.angle * 0.85) * (mote.radius * 0.42) + mote.lift
        const alpha = (0.25 + Math.sin(mote.twinkle) * 0.25) * (0.35 + intensity * 0.65)
        ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, mote.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawRunes = (time, far) => {
      ctx.save()
      ctx.font = '18px Georgia, serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const rune of runes) {
        const isFar = rune.z < 0.65
        if (isFar !== far) {
          continue
        }
        rune.rot += rune.spin
        rune.pulse += 0.03
        const alpha = (0.18 + Math.sin(rune.pulse) * 0.14) * (0.4 + intensity * 0.6) * rune.z
        ctx.save()
        ctx.translate(rune.x, rune.y + Math.sin(time * 0.0008 + rune.pulse) * 6)
        ctx.rotate(rune.rot)
        ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`
        ctx.shadowColor = 'rgba(212, 175, 55, 0.45)'
        ctx.shadowBlur = 8
        ctx.fillText(rune.glyph, 0, 0)
        ctx.restore()
      }
      ctx.restore()
    }

    const drawCandle = (candle, time) => {
      candle.flicker += 0.18 + Math.random() * 0.08
      const floatY = candle.y + Math.sin(time * 0.001 * candle.drift + candle.phase) * candle.amp
      const flame = 0.55 + Math.sin(candle.flicker) * 0.25 + Math.random() * 0.08
      const light = (0.18 + intensity * 0.82) * candle.z
      const scale = 0.55 + candle.z * 0.7

      ctx.save()
      ctx.translate(candle.x, floatY)
      ctx.scale(scale, scale)

      const halo = 38 + candle.z * 28
      const aura = ctx.createRadialGradient(0, -candle.waxH - 8, 2, 0, -candle.waxH, halo)
      aura.addColorStop(0, `rgba(255, 215, 0, ${0.8 * light * flame})`)
      aura.addColorStop(0.45, `rgba(255, 140, 40, ${0.12 * light})`)
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
        env.x = window.innerWidth * Math.random()
      }
      if (env.x > window.innerWidth + 40) {
        env.x = -30
      }

      const floatY = env.y + Math.sin(time * 0.0009 * env.drift + env.phase) * env.amp
      const scale = 0.5 + env.z * 0.7
      const skew = Math.sin(env.yaw) * 0.38
      const w = 50 * scale
      const h = 34 * scale
      const alpha = 0.45 + env.z * 0.5

      ctx.save()
      ctx.translate(env.x, floatY)
      ctx.transform(1, 0.08 * Math.cos(env.yaw), skew, 1, 0, 0)

      ctx.fillStyle = `rgba(0, 0, 0, ${0.18 * env.z})`
      ctx.fillRect(-w / 2 + 5, -h / 2 + 7, w, h)

      const parchment = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2)
      parchment.addColorStop(0, `rgba(245, 230, 200, ${alpha})`)
      parchment.addColorStop(0.5, `rgba(236, 214, 164, ${alpha})`)
      parchment.addColorStop(1, `rgba(214, 180, 118, ${alpha})`)
      ctx.fillStyle = parchment
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

      const sealR = 6.8 * scale
      const seal = ctx.createRadialGradient(-1.5, -1.5, 1, 0, 0, sealR)
      seal.addColorStop(0, '#e45d5d')
      seal.addColorStop(0.55, '#9b1520')
      seal.addColorStop(1, '#5c0b12')
      ctx.beginPath()
      ctx.arc(0, -1, sealR, 0, Math.PI * 2)
      ctx.fillStyle = seal
      ctx.fill()
      ctx.strokeStyle = '#D4AF37'
      ctx.lineWidth = 0.9
      ctx.stroke()
      ctx.fillStyle = '#D4AF37'
      ctx.font = `${Math.max(6, 7 * scale)}px Georgia, serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('30', 0, -1)
      ctx.restore()
    }

    const drawTrail = () => {
      const sparkLight = 0.35 + intensity * 0.75
      trail.forEach((point, index) => {
        const t = (index + 1) / trail.length
        drawSparkle(
          ctx,
          point.x,
          point.y,
          2.2 + t * 5.5,
          t * 0.55 * sparkLight,
          index % 2 === 0
        )
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
          drawSparkle(
            ctx,
            spark.x,
            spark.y,
            spark.size * spark.life,
            spark.life * sparkLight,
            spark.diamond
          )
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
          y: height * 0.5 + (Math.random() - 0.5) * 40,
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
      drawRunes(time, true)
      envelopes
        .slice()
        .sort((a, b) => a.z - b.z)
        .forEach((env) => {
          if (env.z < 0.75) {
            drawEnvelope(env, time)
          }
        })
      candles
        .slice()
        .sort((a, b) => a.z - b.z)
        .forEach((candle) => {
          if (candle.z < 0.75) {
            drawCandle(candle, time)
          }
        })
      drawDust(width, height, time)
      drawRunes(time, false)
      envelopes.forEach((env) => {
        if (env.z >= 0.75) {
          drawEnvelope(env, time)
        }
      })
      candles.forEach((candle) => {
        if (candle.z >= 0.75) {
          drawCandle(candle, time)
        }
      })

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
