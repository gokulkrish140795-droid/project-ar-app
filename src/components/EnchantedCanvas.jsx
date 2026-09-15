import { useEffect, useRef } from 'react'

const CANDLE_COUNT = 20
const DUST_COUNT = 110
const MAX_SPARKS = 90

function createCandles(width, height) {
  return Array.from({ length: CANDLE_COUNT }, (_, index) => {
    const column = index % 10
    const row = Math.floor(index / 10)
    return {
      x: ((column + 0.35) / 10) * width + (Math.random() - 0.5) * 36,
      y: height * (0.08 + row * 0.22) + Math.random() * height * 0.18,
      phase: Math.random() * Math.PI * 2,
      drift: 0.35 + Math.random() * 0.7,
      amp: 10 + Math.random() * 16,
      waxH: 26 + Math.random() * 20,
      waxW: 5 + Math.random() * 3.5,
      flicker: Math.random(),
    }
  })
}

function createDust(width, height) {
  return Array.from({ length: DUST_COUNT }, () => ({
    radius: 40 + Math.random() * Math.min(width, height) * 0.42,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
    size: 0.6 + Math.random() * 1.8,
    twinkle: Math.random() * Math.PI * 2,
    lift: (Math.random() - 0.5) * height * 0.18,
  }))
}

export default function EnchantedCanvas({ lumosOn = false }) {
  const canvasRef = useRef(null)
  const lumosRef = useRef(lumosOn)
  lumosRef.current = lumosOn

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return undefined
    }

    const ctx = canvas.getContext('2d', { alpha: false })
    const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.4 }
    const sparks = []
    let candles = []
    let dust = []
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
      dust = createDust(window.innerWidth, window.innerHeight)
    }

    const addSparks = (x, y, burst = 3) => {
      for (let i = 0; i < burst; i += 1) {
        sparks.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 1.4,
          vy: -0.4 - Math.random() * 1.6,
          life: 1,
          size: 1.2 + Math.random() * 2.2,
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
      addSparks(pointer.x, pointer.y, lumosRef.current ? 5 : 2)
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
      ctx.save()
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
      ctx.restore()
    }

    const drawCandle = (candle, time) => {
      candle.flicker += 0.18 + Math.random() * 0.08
      const floatY = candle.y + Math.sin(time * 0.001 * candle.drift + candle.phase) * candle.amp
      const flame = 0.55 + Math.sin(candle.flicker) * 0.25 + Math.random() * 0.08
      const light = 0.18 + intensity * 0.82

      ctx.save()
      ctx.translate(candle.x, floatY)

      const aura = ctx.createRadialGradient(0, -candle.waxH - 8, 2, 0, -candle.waxH, 46)
      aura.addColorStop(0, `rgba(255, 186, 80, ${0.22 * light * flame})`)
      aura.addColorStop(1, 'rgba(255, 160, 40, 0)')
      ctx.fillStyle = aura
      ctx.beginPath()
      ctx.arc(0, -candle.waxH, 46, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `rgba(236, 214, 168, ${0.55 + light * 0.4})`
      ctx.fillRect(-candle.waxW / 2, -candle.waxH, candle.waxW, candle.waxH)
      ctx.fillStyle = 'rgba(90, 58, 28, 0.55)'
      ctx.fillRect(-candle.waxW / 2, -4, candle.waxW, 4)

      const flameH = 11 * flame * (0.7 + light * 0.5)
      const flameGrad = ctx.createRadialGradient(0, -candle.waxH - 4, 1, 0, -candle.waxH - 4, 12)
      flameGrad.addColorStop(0, `rgba(255, 250, 220, ${0.9 * light})`)
      flameGrad.addColorStop(0.4, `rgba(255, 170, 50, ${0.8 * light})`)
      flameGrad.addColorStop(1, 'rgba(255, 90, 20, 0)')
      ctx.fillStyle = flameGrad
      ctx.beginPath()
      ctx.moveTo(0, -candle.waxH - flameH)
      ctx.quadraticCurveTo(5, -candle.waxH - 4, 0, -candle.waxH + 2)
      ctx.quadraticCurveTo(-5, -candle.waxH - 4, 0, -candle.waxH - flameH)
      ctx.fill()

      ctx.restore()
    }

    const drawSparks = () => {
      const sparkLight = 0.25 + intensity * 0.75
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i]
        spark.x += spark.vx
        spark.y += spark.vy
        spark.life -= 0.025
        if (spark.life <= 0) {
          sparks.splice(i, 1)
        } else {
          ctx.fillStyle = `rgba(255, 230, 150, ${spark.life * sparkLight})`
          ctx.beginPath()
          ctx.arc(spark.x, spark.y, spark.size * spark.life, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const tick = (time) => {
      const width = window.innerWidth
      const height = window.innerHeight
      const target = lumosRef.current ? 1 : 0.22
      intensity += (target - intensity) * 0.045

      drawHall(width, height)
      drawDust(width, height, time)
      for (const candle of candles) {
        drawCandle(candle, time)
      }

      if (frame % 2 === 0) {
        addSparks(pointer.x, pointer.y, lumosRef.current ? 2 : 1)
      }
      drawSparks()

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
