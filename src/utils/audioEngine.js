import { BGM_BED_GAIN, SOFT_CUES } from './softCues.js'

const AUDIO_BASE = '/audio'

class AudioEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.bgmGain = null
    this.sfxGain = null
    this.voiceGain = null
    this.analyser = null
    this.buffers = new Map()
    this.bgmSource = null
    this.bgmName = null
    this.sfxSources = new Set()
    this.muted = true
    this.unlocked = false
    this.lipAmp = 0
    this._raf = 0
  }

  async unlock() {
    if (typeof window === 'undefined') return

    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return

      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.bgmGain = this.ctx.createGain()
      this.sfxGain = this.ctx.createGain()
      this.voiceGain = this.ctx.createGain()
      this.analyser = this.ctx.createAnalyser()
      this.analyser.fftSize = 256
      this.analyser.smoothingTimeConstant = 0.72

      this.bgmGain.gain.value = BGM_BED_GAIN
      this.sfxGain.gain.value = 0.9
      this.voiceGain.gain.value = 1
      this.master.gain.value = this.muted ? 0 : 1

      this.bgmGain.connect(this.master)
      this.sfxGain.connect(this.master)
      this.voiceGain.connect(this.analyser)
      this.analyser.connect(this.master)
      this.master.connect(this.ctx.destination)
      this._startLipMeter()
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }

    this.unlocked = true
  }

  _startLipMeter() {
    if (!this.analyser || this._raf) return
    const data = new Uint8Array(this.analyser.frequencyBinCount)
    const tick = () => {
      this.analyser.getByteFrequencyData(data)
      let sum = 0
      for (let i = 2; i < 28; i += 1) sum += data[i]
      const avg = sum / 26 / 255
      this.lipAmp += (avg - this.lipAmp) * 0.35
      this._raf = window.requestAnimationFrame(tick)
    }
    this._raf = window.requestAnimationFrame(tick)
  }

  getLipAmplitude() {
    return this.lipAmp
  }

  async load(name) {
    if (!this.ctx) await this.unlock()
    if (!this.ctx) return null
    if (this.buffers.has(name)) return this.buffers.get(name)

    try {
      const response = await fetch(`${AUDIO_BASE}/${name}.mp3`)
      if (!response.ok) {
        this.buffers.set(name, null)
        return null
      }
      const data = await response.arrayBuffer()
      const buffer = await this.ctx.decodeAudioData(data.slice(0))
      this.buffers.set(name, buffer)
      return buffer
    } catch {
      this.buffers.set(name, null)
      return null
    }
  }

  stopAllSFXAndVoices() {
    for (const source of this.sfxSources) {
      try {
        source.stop()
      } catch {
        // already stopped
      }
    }
    this.sfxSources.clear()
    this.lipAmp = 0
    this._unduckBgm()
  }

  trackSfx(source) {
    this.sfxSources.add(source)
    source.onended = () => {
      this.sfxSources.delete(source)
      if (this.sfxSources.size === 0) {
        this.lipAmp = 0
        this._unduckBgm()
      }
    }
  }

  _duckBgm(amount = 0.12) {
    if (!this.bgmGain || !this.ctx) return
    this.bgmGain.gain.setTargetAtTime(amount, this.ctx.currentTime, 0.08)
  }

  _unduckBgm() {
    if (!this.bgmGain || !this.ctx) return
    this.bgmGain.gain.setTargetAtTime(BGM_BED_GAIN, this.ctx.currentTime, 0.2)
  }

  /**
   * Quiet transition breath. Does not stop voices, does not duck the theme.
   * Filtered noise only — swap the body of this method if a tiny file replaces it.
   */
  playSoftCue(kind) {
    const spec = SOFT_CUES[kind]
    if (!spec || !this.unlocked || !this.ctx || !this.master) return null

    const ctx = this.ctx
    const now = ctx.currentTime
    const dur = spec.ms / 1000
    const source = ctx.createBufferSource()
    source.buffer = this._softNoise(dur, kind)

    const filter = ctx.createBiquadFilter()
    filter.Q.value = 0.45
    if (kind === 'dust') {
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(2200, now)
      filter.frequency.exponentialRampToValueAtTime(900, now + dur)
    } else if (kind === 'horizon') {
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(240, now)
      filter.frequency.exponentialRampToValueAtTime(880, now + dur * 0.75)
    } else {
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(480, now)
      filter.frequency.exponentialRampToValueAtTime(160, now + dur)
    }

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(spec.peak, now + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.master)
    source.start(now)
    source.stop(now + dur)
    return source
  }

  _softNoise(seconds, kind) {
    const rate = this.ctx.sampleRate
    const length = Math.max(1, Math.floor(rate * seconds))
    const buffer = this.ctx.createBuffer(1, length, rate)
    const data = buffer.getChannelData(0)
    const state = { brown: 0, pink: 0 }
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1
      if (kind === 'dust') {
        state.pink = state.pink * 0.86 + white * 0.14
        data[i] = state.pink
      } else {
        state.brown = (state.brown + white * 0.02) / 1.02
        data[i] = state.brown * 3.4
      }
    }
    let peak = 0
    for (let i = 0; i < length; i += 1) peak = Math.max(peak, Math.abs(data[i]))
    const scale = peak > 0 ? 1 / peak : 1
    const fade = Math.min(48, Math.floor(length / 6))
    for (let i = 0; i < length; i += 1) {
      let edge = 1
      if (i < fade) edge = i / fade
      else if (i > length - fade) edge = (length - i) / fade
      data[i] *= scale * edge
    }
    return buffer
  }

  async play(name, {
    loop = false,
    bus = 'sfx',
    stack = false,
    playbackRate = 1,
    duck = false,
  } = {}) {
    if (!this.unlocked) await this.unlock()

    if (bus !== 'bgm' && !stack) {
      this.stopAllSFXAndVoices()
    }

    const buffer = await this.load(name)
    if (!buffer || !this.ctx) return null

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = loop
    source.playbackRate.value = playbackRate

    const dest =
      bus === 'bgm' ? this.bgmGain : bus === 'voice' ? this.voiceGain : this.sfxGain
    source.connect(dest)

    if (bus !== 'bgm') this.trackSfx(source)
    if (duck || bus === 'voice') this._duckBgm()

    source.start()
    return source
  }

  async playBgm(name) {
    this.stopBgm()
    this.bgmName = name
    this.bgmSource = await this.play(name, { loop: true, bus: 'bgm' })
  }

  stopBgm() {
    if (this.bgmSource) {
      try {
        this.bgmSource.stop()
      } catch {
        // already stopped
      }
      this.bgmSource = null
    }
  }

  async playSfx(name) {
    await this.unlock()
    return this.play(name, { bus: 'sfx', stack: false })
  }

  async playVoice(name, options = {}) {
    await this.unlock()
    return this.play(name, { bus: 'voice', stack: false, duck: true, ...options })
  }

  /**
   * Prefer real MP3; if missing, synthesize a short friendly chirp so lips still move.
   * Returns { source, usedFallback }.
   */
  async playVoiceOrChirp(name, { duration = 1.4 } = {}) {
    await this.unlock()
    if (!this.ctx) return { source: null, usedFallback: true }

    this.stopAllSFXAndVoices()
    const buffer = await this.load(name)
    if (buffer) {
      const source = this.ctx.createBufferSource()
      source.buffer = buffer
      source.connect(this.voiceGain)
      this.trackSfx(source)
      this._duckBgm()
      source.start()
      return { source, usedFallback: false }
    }

    // Procedural “talking” chirp so mouth flap still demos without assets
    const now = this.ctx.currentTime
    const notes = [392, 440, 494, 523, 587, 659]
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + index * 0.12
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14)
      osc.connect(gain)
      gain.connect(this.voiceGain)
      osc.start(start)
      osc.stop(start + 0.16)
      this.trackSfx(osc)
    })
    this._duckBgm()
    // Fake lip energy while chirp plays
    const end = now + Math.min(duration, notes.length * 0.12 + 0.2)
    const pulse = () => {
      if (!this.ctx || this.ctx.currentTime > end) {
        this.lipAmp *= 0.8
        return
      }
      this.lipAmp = 0.35 + Math.random() * 0.45
      window.setTimeout(pulse, 70)
    }
    pulse()
    return { source: null, usedFallback: true }
  }

  playLayered(names) {
    this.stopAllSFXAndVoices()
    return Promise.all(
      names.map((entry) => {
        const clip = typeof entry === 'string' ? { name: entry } : entry
        return this.play(clip.name, {
          bus: 'sfx',
          stack: true,
          playbackRate: clip.playbackRate || 1,
        })
      })
    )
  }

  playChipmunkGiggle() {
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const notes = [880, 988, 1175, 1319, 1568]
    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02 + index * 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18 + index * 0.05)
      osc.connect(gain)
      gain.connect(this.sfxGain)
      osc.start(now + index * 0.05)
      osc.stop(now + 0.22 + index * 0.05)
      this.trackSfx(osc)
    })
  }

  setMuted(muted) {
    this.muted = muted
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.04)
    }
  }

  toggleMute() {
    this.setMuted(!this.muted)
    return this.muted
  }

  isMuted() {
    return this.muted
  }

  isUnlocked() {
    return this.unlocked
  }
}

const audioEngine = new AudioEngine()

export default audioEngine
