const AUDIO_BASE = '/audio'

class AudioEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.bgmGain = null
    this.sfxGain = null
    this.buffers = new Map()
    this.bgmSource = null
    this.bgmName = null
    this.sfxSources = new Set()
    this.muted = true
    this.unlocked = false
  }

  async unlock() {
    if (typeof window === 'undefined') {
      return
    }

    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) {
        return
      }

      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.bgmGain = this.ctx.createGain()
      this.sfxGain = this.ctx.createGain()

      this.bgmGain.gain.value = 0.32
      this.sfxGain.gain.value = 0.9
      this.master.gain.value = this.muted ? 0 : 1

      this.bgmGain.connect(this.master)
      this.sfxGain.connect(this.master)
      this.master.connect(this.ctx.destination)
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }

    this.unlocked = true
  }

  async load(name) {
    if (!this.ctx) {
      await this.unlock()
    }

    if (!this.ctx) {
      return null
    }

    if (this.buffers.has(name)) {
      return this.buffers.get(name)
    }

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
  }

  trackSfx(source) {
    this.sfxSources.add(source)
    source.onended = () => {
      this.sfxSources.delete(source)
    }
  }

  async play(name, { loop = false, bus = 'sfx', stack = false, playbackRate = 1 } = {}) {
    if (!this.unlocked) {
      await this.unlock()
    }

    if (bus !== 'bgm' && !stack) {
      this.stopAllSFXAndVoices()
    }

    const buffer = await this.load(name)
    if (!buffer || !this.ctx) {
      return null
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = loop
    source.playbackRate.value = playbackRate
    source.connect(bus === 'bgm' ? this.bgmGain : this.sfxGain)

    if (bus !== 'bgm') {
      this.trackSfx(source)
    }

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

  playSfx(name) {
    return this.play(name, { bus: 'sfx', stack: false })
  }

  playVoice(name, options = {}) {
    return this.play(name, { bus: 'sfx', stack: false, ...options })
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
    if (!this.ctx) {
      return
    }

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
      this.master.gain.setTargetAtTime(
        muted ? 0 : 1,
        this.ctx.currentTime,
        0.04
      )
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
