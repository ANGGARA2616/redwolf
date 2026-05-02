import { useState, useEffect, useRef } from 'react'

/**
 * Timer component
 * variant="ring"  — SVG ring countdown (default, night phases)
 * variant="bar"   — Bold number + horizontal progress bar (day phases)
 */
export default function Timer({
  duration,
  onComplete,
  paused = false,
  color = 'var(--red-primary)',
  variant = 'ring',
  label = 'detik tersisa',
}) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    setTimeLeft(duration)
    completedRef.current = false
  }, [duration])

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(id); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [paused, duration])

  useEffect(() => {
    if (timeLeft === 0 && !completedRef.current) {
      completedRef.current = true
      onCompleteRef.current?.()
    }
  }, [timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = duration > 0 ? timeLeft / duration : 0
  const isUrgent = timeLeft <= 10 && timeLeft > 0

  // ── Ring variant (SVG circle) ─────────────────────────────────────────
  if (variant === 'ring') {
    const circumference = 2 * Math.PI * 54
    const strokeDashoffset = circumference * (1 - progress)

    return (
      <div className="timer-ring" style={{ width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
          <circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 1s linear',
              filter: `drop-shadow(0 0 ${isUrgent ? 12 : 8}px ${color})`,
            }}
          />
        </svg>
        <div style={{ textAlign: 'center' }}>
          <div
            className="timer-text"
            style={{
              color,
              animation: isUrgent ? 'timerUrgent 0.5s ease-in-out infinite' : 'none',
            }}
          >
            {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : seconds}
          </div>
          <div className="timer-text-sm">detik</div>
        </div>
      </div>
    )
  }

  // ── Bar variant (day phases) ──────────────────────────────────────────
  // Color shifts from amber → orange → red as time runs out
  const barColor = isUrgent
    ? '#e24b4a'
    : progress > 0.5
      ? color
      : '#e8872a'

  const displayTime = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : seconds

  return (
    <div className="timer-bar-wrap">
      {/* Big bold number without aura */}
      <div
        className={`timer-bar-number ${isUrgent ? 'urgent' : ''}`}
        style={{ color: barColor }}
      >
        {displayTime}
      </div>

      {/* Progress bar */}
      <div className="timer-bar-track">
        <div
          className="timer-bar-fill"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
            boxShadow: `0 0 12px ${barColor}66`,
            color: barColor,
          }}
        />
      </div>

      <div className="timer-bar-label" style={{ color: barColor }}>
        {label}
      </div>
    </div>
  )
}
