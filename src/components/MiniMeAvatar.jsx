const GOLD = '#D4AF37'
const PARCHMENT = '#F4E8C1'

export default function MiniMeAvatar({
  speech = '',
  showSpeech = false,
  pose = 'idle',
  size = 92,
  peek = false,
  onFaceTap,
  disabled = false,
  ariaLabel = 'Gokul-Mage',
}) {
  const toss = pose === 'yarn'
  const scratch = pose === 'scratch'
  const bump = pose === 'bump'
  const glass = pose === 'glass'

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size + 18,
        flexShrink: 0,
      }}
    >
      <style>
        {`
          @keyframes miniBob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes miniBreath {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.035); }
          }
          @keyframes studSparkle {
            0%, 100% { opacity: 0.35; transform: scale(0.7); }
            50% { opacity: 1; transform: scale(1.25); }
          }
          @keyframes mouthBubble {
            from { opacity: 0; transform: scale(0); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes peekIn {
            from { transform: translateX(-18px) rotate(-6deg); }
            to { transform: translateX(0) rotate(0deg); }
          }
        `}
      </style>

      {showSpeech && speech && (
        <div
          role="status"
          style={{
            position: 'absolute',
            left: '58%',
            bottom: '72%',
            width: 220,
            transformOrigin: '12px 100%',
            animation: 'mouthBubble 0.35s cubic-bezier(0.2, 1.4, 0.3, 1) both',
            zIndex: 4,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 251, 247, 0.94)',
              color: '#3B2414',
              border: `1px solid ${GOLD}`,
              borderRadius: 14,
              padding: '10px 12px',
              fontSize: 12,
              lineHeight: 1.4,
              boxShadow: '0 10px 22px rgba(0,0,0,0.28)',
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {speech}
          </div>
          <span
            aria-hidden="true"
            style={{
              display: 'block',
              width: 12,
              height: 12,
              marginLeft: 18,
              marginTop: -7,
              background: 'rgba(255, 251, 247, 0.94)',
              borderRight: `1px solid ${GOLD}`,
              borderBottom: `1px solid ${GOLD}`,
              transform: 'rotate(45deg)',
            }}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onFaceTap}
        disabled={disabled || !onFaceTap}
        aria-label={ariaLabel}
        style={{
          position: 'relative',
          width: size,
          height: size,
          marginTop: 12,
          padding: 0,
          border: `3px solid ${GOLD}`,
          borderRadius: '50%',
          overflow: 'visible',
          background: 'linear-gradient(160deg, #2a1d4a 0%, #120c22 70%)',
          cursor: onFaceTap && !disabled ? 'pointer' : 'default',
          animation: `${peek ? 'peekIn 0.4s ease' : 'miniBob 3.4s ease-in-out infinite'}`,
          transform: `${toss ? 'translateY(-10px) rotate(-8deg)' : ''} ${scratch ? 'rotate(8deg) translateX(8px)' : ''} ${bump ? 'translateX(10px)' : ''} ${glass ? 'translateY(4px) scale(1.04)' : ''}`,
          transition: 'transform 0.35s ease',
          boxShadow: '0 0 18px rgba(212, 175, 55, 0.45)',
        }}
      >
        <span
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            animation: 'miniBreath 3.8s ease-in-out infinite',
          }}
        >
          <img
            src="/avatar.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 16%',
            }}
          />
        </span>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 10,
            top: 28,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: PARCHMENT,
            boxShadow: '0 0 8px rgba(255,255,255,0.95)',
            animation: 'studSparkle 1.6s ease-in-out infinite',
          }}
        />
      </button>
    </div>
  )
}
