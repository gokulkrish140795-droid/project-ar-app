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

  async play(name, { loop = false, bus = 'sfx' } = {}) {
    if (!this.unlocked) {
      await this.unlock()
    }

    const buffer = await this.load(name)
    if (!buffer || !this.ctx) {
      return null
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = loop
    source.connect(bus === 'bgm' ? this.bgmGain : this.sfxGain)
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
    return this.play(name, { bus: 'sfx' })
  }

  playVoice(name) {
    return this.play(name, { bus: 'sfx' })
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
