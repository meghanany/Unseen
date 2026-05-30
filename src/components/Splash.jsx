import { useState, useEffect } from 'react'

export default function Splash({ onDone }) {
  const [phase, setPhase] = useState(1) // 1 = wordmark, 2 = tagline

  // Auto-advance from phase 1 to phase 2
  useEffect(() => {
    if (phase === 1) {
      const t = setTimeout(() => setPhase(2), 1800)
      return () => clearTimeout(t)
    }
  }, [phase])

  if (phase === 1) {
    return (
      <div style={styles.splash}>
        <div style={styles.wordmarkWrap}>
          <div style={styles.wordmark}>Unseen.</div>
          <div style={styles.taglineSmall}>The layer nobody sees.</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...styles.splash, ...styles.phase2 }}>
      <div style={styles.phase2Content}>
        <div style={styles.logoSmall}>Unseen.</div>
        <p style={styles.taglineLarge}>
          Seen beautifully.<br />
          Styled intelligently.<br />
          Supported invisibly.
        </p>
        <p style={styles.sub}>
          Upload any outfit. Get AI-matched innerwear recommendations — real products, your region.
        </p>
        <button style={styles.ctaBtn} onClick={onDone}>
          Get Started →
        </button>
        <p style={styles.privacyNote}>🔒 No account needed · Photo never stored</p>
      </div>

      {/* Decorative circles */}
      <div style={styles.deco1} />
      <div style={styles.deco2} />
    </div>
  )
}

const styles = {
  splash: {
    minHeight: '100dvh',
    background: 'var(--splash-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
    position: 'relative',
    overflow: 'hidden',
    animation: 'fadeIn 0.5s ease',
  },
  phase2: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: '0',
  },
  wordmarkWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    animation: 'fadeUp 0.6s ease',
  },
  wordmark: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(56px, 16vw, 80px)',
    fontWeight: '300',
    color: 'var(--text)',
    letterSpacing: '-2px',
    lineHeight: '1',
  },
  taglineSmall: {
    fontSize: '13px',
    color: 'var(--text-3)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  phase2Content: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    padding: '60px 32px 56px',
    gap: '0',
    width: '100%',
    animation: 'fadeUp 0.5s ease',
  },
  logoSmall: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: '400',
    color: 'var(--text-3)',
    marginBottom: '36px',
    letterSpacing: '-0.5px',
  },
  taglineLarge: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(32px, 9vw, 44px)',
    fontWeight: '300',
    color: 'var(--text)',
    lineHeight: '1.15',
    marginBottom: '20px',
    letterSpacing: '-0.5px',
  },
  sub: {
    fontSize: '14px',
    color: 'var(--text-2)',
    lineHeight: '1.7',
    marginBottom: '40px',
    maxWidth: '320px',
  },
  ctaBtn: {
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    padding: '18px 36px',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '1px',
    cursor: 'pointer',
    borderRadius: '0',
    marginBottom: '20px',
    alignSelf: 'flex-start',
    fontFamily: 'var(--font-sans)',
  },
  privacyNote: {
    fontSize: '11px',
    color: 'var(--text-3)',
  },
  deco1: {
    position: 'absolute',
    right: '-60px',
    top: '60px',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    border: '1px solid rgba(233,30,140,0.12)',
    pointerEvents: 'none',
  },
  deco2: {
    position: 'absolute',
    right: '-20px',
    top: '120px',
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    border: '1px solid rgba(233,30,140,0.08)',
    pointerEvents: 'none',
  },
}
