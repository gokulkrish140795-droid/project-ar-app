import { useMemo, useState } from 'react'
import audioEngine from '../utils/audioEngine'

const ORANGE = '#E67A28'
const CREAM = '#FFF4E2'
const STRIPE = '#C45A12'

export default function GingerCatCompanion({
  pose = 'idle',
  size = 88,
  onTap,
  heartsOnTap = true,
}) {
  const [hearts, setHearts] = useState([])

  const burstHearts = () => {
    const next = Array.from({ length: 8 }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      left: 28 + Math.random() * 40,
      delay: Math.random() * 0.12,
    }))
    setHearts(next)
    window.setTimeout(() => setHearts([]), 900)
  }

  const handleTap = async (event) => {
    event.stopPropagation()
    audioEngine.stopAllSFXAndVoices()
    audioEngine.playSfx('sfx_cat_purr')
    if (heartsOnTap) {
      burstHearts()
    }
    if (onTap) {
      onTap()
    }
  }

  const poseClass = useMemo(() => {
    if (pose === 'leap') return 'gingerLeap'
    if (pose === 'sit') return 'gingerSit'
    if (pose === 'yarn') return 'gingerYarn'
    if (pose === 'scratch') return 'gingerScratch'
    if (pose === 'bump') return 'gingerBump'
    if (pose === 'glass') return 'gingerGlass'
    return 'gingerIdle'
  }, [pose])

  return (
    <button
      type="button"
      aria-label="Ginger the cat"
      onClick={handleTap}
      style={{
        position: 'relative',
        width: size,
        height: size,
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        overflow: 'visible',
      }}
    >
      <style>
        {`
          @keyframes gingerTail {
            0%, 100% { transform: rotate(18deg); }
            50% { transform: rotate(-22deg); }
          }
          @keyframes gingerEar {
            0%, 86%, 100% { transform: rotate(0deg); }
            90% { transform: rotate(-16deg); }
            94% { transform: rotate(8deg); }
          }
          @keyframes gingerPaw {
            0%, 70%, 100% { transform: rotate(0deg) translateY(0); }
            78% { transform: rotate(-28deg) translateY(-6px); }
            86% { transform: rotate(10deg) translateY(0); }
          }
          @keyframes gingerFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes gingerLeapMove {
            0% { transform: translate(-40px, 18px) rotate(-18deg); }
            55% { transform: translate(6px, -16px) rotate(12deg); }
            100% { transform: translate(0, 8px) rotate(0deg); }
          }
          @keyframes gingerYarnRoll {
            0% { transform: translateY(0) rotate(0deg); }
            40% { transform: translate(12px, 16px) rotate(80deg); }
            100% { transform: translate(4px, 10px) rotate(120deg); }
          }
          @keyframes gingerScratchGlow {
            0%, 100% { filter: drop-shadow(0 0 0 rgba(255, 182, 193, 0)); }
            50% { filter: drop-shadow(0 0 12px rgba(255, 182, 193, 0.85)); }
          }
          @keyframes gingerBumpMove {
            0%, 100% { transform: translateX(0); }
            45% { transform: translateX(-12px); }
          }
          @keyframes heartRise {
            0% { opacity: 1; transform: translateY(0) scale(0.7); }
            100% { opacity: 0; transform: translateY(-42px) scale(1.15); }
          }
        `}
      </style>

      <div
        className={poseClass}
        style={{
          width: '100%',
          height: '100%',
          animation:
            pose === 'leap'
              ? 'gingerLeapMove 0.55s ease both'
              : pose === 'yarn'
                ? 'gingerYarnRoll 0.8s ease both'
                : pose === 'scratch'
                  ? 'gingerScratchGlow 1.2s ease-in-out infinite'
                  : pose === 'bump'
                    ? 'gingerBumpMove 0.55s ease'
                    : pose === 'glass'
                      ? 'none'
                      : 'gingerFloat 3.2s ease-in-out infinite',
        }}
      >
        <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
          <ellipse cx="62" cy="86" rx="28" ry="18" fill={ORANGE} />
          <path d="M86 78 C112 62, 108 104, 90 96" fill={ORANGE} style={{ transformOrigin: '86px 84px', animation: 'gingerTail 1.6s ease-in-out infinite' }} />
          <path d="M86 78 C108 70, 104 98, 90 94" fill={STRIPE} opacity="0.55" />
          <ellipse cx="58" cy="78" rx="22" ry="20" fill={ORANGE} />
          <ellipse cx="50" cy="82" rx="12" ry="11" fill={CREAM} />
          <circle cx="54" cy="48" r="22" fill={ORANGE} />
          <ellipse cx="54" cy="56" rx="12" ry="10" fill={CREAM} />
          <path d="M36 34 L32 14 L48 30 Z" fill={ORANGE} style={{ transformOrigin: '40px 28px', animation: 'gingerEar 4.8s ease-in-out infinite' }} />
          <path d="M70 34 L76 14 L58 30 Z" fill={ORANGE} style={{ transformOrigin: '66px 28px', animation: 'gingerEar 4.8s ease-in-out infinite 0.2s' }} />
          <path d="M38 30 L36 20 L46 30 Z" fill={CREAM} />
          <path d="M68 30 L72 20 L60 30 Z" fill={CREAM} />
          <path d="M42 40 Q54 46 66 40" stroke={STRIPE} strokeWidth="3" fill="none" />
          <path d="M40 48 Q54 54 68 48" stroke={STRIPE} strokeWidth="2.4" fill="none" opacity="0.7" />
          <circle cx="46" cy="48" r="3.2" fill="#2A1208" />
          <circle cx="62" cy="48" r="3.2" fill="#2A1208" />
          <circle cx="47.2" cy="47" r="1" fill="#fff" />
          <circle cx="63.2" cy="47" r="1" fill="#fff" />
          <ellipse cx="54" cy="56" rx="4" ry="3" fill="#F4A0B5" />
          <path d="M54 58 Q50 64 46 60" stroke="#2A1208" strokeWidth="1.4" fill="none" />
          <path d="M54 58 Q58 64 62 60" stroke="#2A1208" strokeWidth="1.4" fill="none" />
          <path d="M28 86 Q18 70 34 74" stroke={ORANGE} strokeWidth="7" fill="none" strokeLinecap="round" style={{ animation: 'gingerPaw 2.8s ease-in-out infinite' }} />
          <ellipse cx="72" cy="96" rx="8" ry="5" fill={CREAM} />
          <ellipse cx="48" cy="98" rx="8" ry="5" fill={CREAM} />
        </svg>
      </div>

      {hearts.map((heart) => (
        <span
          key={heart.id}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: heart.left,
            bottom: 40,
            fontSize: 14,
            animation: `heartRise 0.85s ease ${heart.delay}s both`,
            pointerEvents: 'none',
          }}
        >
          💕
        </span>
      ))}
    </button>
  )
}
