import { useState, useEffect } from 'react'

export default function Splash({ onDone }) {
  const [phase, setPhase] = useState(1)

  useEffect(() => {
    if (phase === 1) {
      const t = setTimeout(() => setPhase(2), 2000)
      return () => clearTimeout(t)
    }
  }, [phase])

  if (phase === 1) {
    return (
      <div style={s.splash1}>
        <span style={s.wordmark}>Unseen.</span>
      </div>
    )
  }

  return (
    <div style={s.splash2}>
      <div style={s.splash2Inner}>
        <p style={s.logoSmall}>Unseen.</p>
        <h1 style={s.tagline}>
          Seen beautifully.<br />
          Styled intelligently.<br />
          Supported invisibly.
        </h1>
        <p style={s.sub}>
          Upload any outfit. Get AI-matched innerwear recommendations — real products, your region.
        </p>
        <button style={s.cta} onClick={onDone}>
          Get Started →
        </button>
        <p style={s.privacy}>🔒 No account needed · Photo never stored</p>
      </div>
    </div>
  )
}

const s = {
  splash1: {
    minHeight: '100dvh',
    background: '#fce8ee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: '28px',
    animation: 'fadeIn 0.4s ease',
  },
  wordmark: {
    fontFamily: 'var(--font-serif)',
    fontSize: '68px',
    fontWeight: '400',
    color: '#1a1614',
    letterSpacing: '-2px',
    lineHeight: '1',
  },
  splash2: {
    minHeight: '100dvh',
    background: '#fce8ee',
    display: 'flex',
    alignItems: 'center',
    animation: 'fadeIn 0.4s ease',
  },
  splash2Inner: {
    padding: '48px 28px 56px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    width: '100%',
  },
  logoSmall: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    color: '#8a837a',
    marginBottom: '32px',
    fontWeight: '400',
  },
  tagline: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(30px, 8vw, 40px)',
    fontWeight: '300',
    color: '#1a1614',
    lineHeight: '1.2',
    marginBottom: '20px',
    letterSpacing: '-0.3px',
  },
  sub: {
    fontSize: '14px',
    color: '#4a4540',
    lineHeight: '1.7',
    marginBottom: '40px',
  },
  cta: {
    background: '#e91e8c',
    color: '#ffffff',
    border: 'none',
    padding: '18px 32px',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    borderRadius: '0',
    marginBottom: '16px',
    alignSelf: 'flex-start',
    fontFamily: 'var(--font-sans)',
  },
  privacy: {
    fontSize: '11px',
    color: '#8a837a',
  },
}
