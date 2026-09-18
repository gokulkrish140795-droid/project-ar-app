import { useEffect, useRef, useState } from 'react'
import audioEngine from '../utils/audioEngine'
import { pickBehavior, pickIdleLine } from '../utils/companionBehaviors'

const QUEST_QUOTE =
  '💬 Gokul-Mage: “Aishwarya! Gokul-Mage lost a piece of Gokul\'s heart in our home! Help me find it! 💖”'

/**
 * Random living-companion director for gateway (and reusable elsewhere).
 * @param {{ active: boolean, paused?: boolean, intervalMs?: [number, number] }} options
 */
export default function useCompanionDirector({
  active,
  paused = false,
  intervalMs = [7000, 12000],
} = {}) {
  const [miniPose, setMiniPose] = useState('idle')
  const [gingerPose, setGingerPose] = useState('idle')
  const [speech, setSpeech] = useState(QUEST_QUOTE)
  const [showSpeech, setShowSpeech] = useState(false)
  const [yarnVisible, setYarnVisible] = useState(false)
  const [lipTalking, setLipTalking] = useState(false)
  const lastIdRef = useRef(null)
  const busyRef = useRef(false)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  const runBehavior = async (behavior, { forceSpeech } = {}) => {
    if (!behavior || busyRef.current) return
    busyRef.current = true
    lastIdRef.current = behavior.id

    setMiniPose(behavior.mini)
    setGingerPose(behavior.ginger)
    setYarnVisible(!!behavior.yarn)

    let line = forceSpeech || null
    if (behavior.speech === 'random_idle') {
      const idle = pickIdleLine()
      line = idle.text
      setLipTalking(true)
      setShowSpeech(true)
      setSpeech(line)
      await audioEngine.playVoiceOrChirp(idle.voice)
    } else if (behavior.speech) {
      line = behavior.speech
      setShowSpeech(true)
      setSpeech(line)
      if (behavior.mini === 'talk') {
        setLipTalking(true)
        await audioEngine.playVoiceOrChirp('voice_idle_1')
      }
    }

    if (behavior.audio?.length && behavior.speech !== 'random_idle' && behavior.mini !== 'talk') {
      const clips = behavior.audio.filter((n) => n !== 'voice')
      if (clips.length) {
        audioEngine.stopAllSFXAndVoices()
        audioEngine.playLayered(clips)
      }
    }

    if (behavior.vibrate && navigator.vibrate) {
      navigator.vibrate(behavior.vibrate)
    }

    window.setTimeout(() => {
      setMiniPose('idle')
      setGingerPose('idle')
      setYarnVisible(false)
      setLipTalking(false)
      busyRef.current = false
    }, behavior.duration)
  }

  /** Call once when scroll opens — walk in, then intro line + talk pose */
  const playIntro = async () => {
    setShowSpeech(false)
    setMiniPose('walkIn')
    setGingerPose('walkIn')
    busyRef.current = true
    await new Promise((r) => window.setTimeout(r, 1100))
    setShowSpeech(true)
    setSpeech(QUEST_QUOTE)
    setMiniPose('talk')
    setGingerPose('sit')
    setLipTalking(true)
    await audioEngine.playVoiceOrChirp('voice_quest_intro', { duration: 2.4 })
    window.setTimeout(() => {
      setMiniPose('jump')
      setGingerPose('cheer')
    }, 2400)
    window.setTimeout(() => {
      setMiniPose('wave')
      setGingerPose('stretch')
    }, 3600)
    window.setTimeout(() => {
      setMiniPose('idle')
      setGingerPose('idle')
      setLipTalking(false)
      busyRef.current = false
    }, 5200)
  }

  /** Trap reaction */
  const playTrap = async () => {
    busyRef.current = true
    setMiniPose('peek')
    setGingerPose('leap')
    setSpeech('Nice try, my love! Ginger and I say only YES works! 😜')
    setShowSpeech(true)
    setLipTalking(true)
    await audioEngine.playVoiceOrChirp('voice_no_nice_try')
    window.setTimeout(() => {
      setMiniPose('idle')
      setGingerPose('idle')
      setLipTalking(false)
      busyRef.current = false
    }, 1400)
  }

  useEffect(() => {
    if (!active) return undefined
    let cancelled = false
    let timer = 0

    const schedule = () => {
      const [min, max] = intervalMs
      const wait = min + Math.random() * (max - min)
      return window.setTimeout(() => {
        if (cancelled || pausedRef.current || busyRef.current) {
          timer = schedule()
          return
        }
        const next = pickBehavior(lastIdRef.current)
        runBehavior(next)
        timer = schedule()
      }, wait)
    }

    timer = schedule()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, intervalMs[0], intervalMs[1]])

  return {
    miniPose,
    gingerPose,
    speech,
    showSpeech,
    setShowSpeech,
    setSpeech,
    yarnVisible,
    lipTalking,
    playIntro,
    playTrap,
    runBehavior,
    busyRef,
  }
}
