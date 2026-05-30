import { useEffect, useState } from 'react'

const STEPS = [
  { key: 'garment', label: 'Reading garment type…' },
  { key: 'neckline', label: 'Detecting neckline…' },
  { key: 'back', label: 'Analysing back style…' },
  { key: 'fabric', label: 'Checking fabric opacity…' },
  { key: 'match', label: 'Finding your perfect match…' },
]

export default function Analyzing({ imageData, imagePreview, onDone, onError }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)

  // Tick through display steps every 900ms for visual effect
  useEffect(() => {
    if (done) return
    if (stepIndex >= STEPS.length - 1) return
    const t = setTimeout(() => setStepIndex(i => i + 1), 900)
    return () => clearTimeout(t)
  }, [stepIndex, done])

  // Actual API call
  useEffect(() => {
    let cancelled = false

    async function analyse() {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: imageData.base64,
            mediaType: imageData.mediaType,
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const result = await res.json()
        if (cancelled) return
        if (result.error) throw new Error(result.error)
        setDone(true)
        // Brief pause so last step is visible
        setTimeout(() => onDone(result), 400)
      } catch (err) {
        if (!cancelled) {
          console.error('Analysis error:', err)
          onError(err)
        }
      }
    }

    analyse()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={styles.container}>
      {/* Nav */}
      <div style={styles.nav}>
        <span style={styles.logo}>UNSEEN</span>
      </div>

      <div style={styles.content}>
        {/* Outfit thumbnail */}
        {imagePreview && (
          <div style={styles.thumbWrap}>
            <img src={imagePreview} alt="Your outfit" style={styles.thumb} />
            <div style={styles.thumbOverlay} />
            <div style={styles.scanLine} />
          </div>
        )}

        <div style={styles.statusArea}>
          <p style={styles.headline}>Analysing your outfit</p>

          <div style={styles.stepsList}>
            {STEPS.map((step, i) => {
              const isActive = i === stepIndex && !done
              const isComplete = i < stepIndex || done
              return (
                <div
                  key={step.key}
                  style={{
                    ...styles.step,
                    opacity: i <= stepIndex || done ? 1 : 0,
                    transform: i <= stepIndex || done ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                  }}
                >
                  <span style={{
                    ...styles.dot,
                    background: isComplete ? 'var(--accent)' : isActive ? 'var(--accent-light)' : 'var(--border)',
                    boxShadow: isActive ? '0 0 8px var(--accent-light)' : 'none',
                  }} />
                  <span style={{
                    ...styles.stepLabel,
                    color: isComplete ? 'var(--text)' : isActive ? 'var(--accent-light)' : 'var(--text-3)',
                  }}>
                    {step.label}
                  </span>
                  {isComplete && <span style={styles.check}>✓</span>}
                  {isActive && <span style={styles.spinner} />}
                </div>
              )
            })}
          </div>
        </div>

        <p style={styles.footnote}>This takes about 5–10 seconds</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
  },
  logo: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '5px',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 24px 40px',
    gap: '32px',
  },
  thumbWrap: {
    position: 'relative',
    width: '100%',
    maxWidth: '280px',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    aspectRatio: '3/4',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
  },
  thumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, transparent 60%, rgba(10,10,15,0.7))',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(to right, transparent, var(--accent-light), transparent)',
    animation: 'scan 2s ease-in-out infinite',
    top: '30%',
  },
  statusArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  headline: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    fontWeight: '400',
    color: 'var(--text)',
    textAlign: 'center',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background 0.3s ease, box-shadow 0.3s ease',
  },
  stepLabel: {
    fontSize: '14px',
    flex: 1,
    transition: 'color 0.3s ease',
  },
  check: {
    fontSize: '12px',
    color: 'var(--accent)',
    fontWeight: '600',
  },
  spinner: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid var(--accent-dim)',
    borderTopColor: 'var(--accent-light)',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  },
  footnote: {
    fontSize: '12px',
    color: 'var(--text-3)',
    textAlign: 'center',
  },
}
