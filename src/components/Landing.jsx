import { useState } from 'react'
import { REGIONS } from '../data/products'
import { getWardrobe } from '../utils/wardrobe'

export default function Landing({ onStart, region, setRegion }) {
  const [showRegions, setShowRegions] = useState(false)
  const wardrobeCount = getWardrobe().length

  return (
    <div style={styles.container}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <span style={styles.topBarText}>AI-POWERED INNERWEAR MATCHING · FREE TO USE</span>
      </div>

      {/* Nav */}
      <div style={styles.nav}>
        <span style={styles.logo}>UNSEEN</span>
        {wardrobeCount > 0 && (
          <button style={styles.wardrobeBtn} onClick={onStart}>
            My Wardrobe · {wardrobeCount}
          </button>
        )}
      </div>

      {/* Hero */}
      <div style={styles.heroBg}>
        <div style={styles.heroInner}>
          <p style={styles.heroEyebrow}>The layer nobody sees.</p>
          <h1 style={styles.headline}>THE DIFFERENCE<br />EVERYONE<br />NOTICES.</h1>
          <p style={styles.heroSub}>
            Upload any outfit. Know exactly what innerwear works underneath — no guessing, no wardrobe fails.
          </p>
          <button style={styles.cta} onClick={onStart}>
            UPLOAD YOUR OUTFIT →
          </button>
        </div>
        <div style={styles.decoCircle} />
        <div style={styles.decoLine} />
      </div>

      {/* How it works strip */}
      <div style={styles.howStrip}>
        {[
          ['01', 'UPLOAD', 'Screenshot, flat lay, or hanger shot'],
          ['02', 'ANALYSE', 'Claude AI reads your garment'],
          ['03', 'SHOP', 'Real products, your region'],
        ].map(([num, title, desc]) => (
          <div key={num} style={styles.howStep}>
            <span style={styles.howNum}>{num}</span>
            <span style={styles.howTitle}>{title}</span>
            <span style={styles.howDesc}>{desc}</span>
          </div>
        ))}
      </div>

      {/* Privacy + Region */}
      <div style={styles.bottomSection}>
        <div style={styles.privacyBadge}>
          <span>🔒</span>
          <span style={styles.privacyText}>No need to wear it · Photo never stored</span>
        </div>

        <div style={{ position: 'relative' }}>
          <button style={styles.regionBtn} onClick={() => setShowRegions(!showRegions)}>
            <span>{REGIONS[region].flag}</span>
            <span>{REGIONS[region].name}</span>
            <span style={{ opacity: 0.4, marginLeft: 'auto' }}>▾</span>
          </button>
          {showRegions && (
            <div style={styles.regionDropdown}>
              {Object.entries(REGIONS).map(([key, val]) => (
                <button
                  key={key}
                  style={{ ...styles.regionOption, ...(region === key ? styles.regionActive : {}) }}
                  onClick={() => { setRegion(key); setShowRegions(false) }}
                >
                  <span>{val.flag}</span>
                  <span>{val.name}</span>
                  {region === key && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Eco bar */}
      <div style={styles.ecoBar}>
        <p style={styles.ecoText}>
          🌱 Fashion returns generate <strong>27M tonnes of CO₂</strong> annually. Getting it right the first time starts here.
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
  },
  topBar: {
    background: 'var(--green)',
    padding: '10px 20px',
    textAlign: 'center',
  },
  topBarText: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#ffffff',
    fontWeight: '500',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  },
  logo: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    fontWeight: '600',
    letterSpacing: '8px',
    color: 'var(--text)',
  },
  wardrobeBtn: {
    fontSize: '11px',
    letterSpacing: '1px',
    color: 'var(--text-3)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '7px 14px',
    background: 'transparent',
    textTransform: 'uppercase',
  },
  heroBg: {
    background: 'var(--pink-light)',
    position: 'relative',
    overflow: 'hidden',
    padding: '48px 24px 56px',
    flex: 1,
  },
  heroInner: {
    position: 'relative',
    zIndex: 2,
  },
  heroEyebrow: {
    fontSize: '12px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    marginBottom: '16px',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  headline: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(48px, 13vw, 68px)',
    fontWeight: '300',
    lineHeight: '0.93',
    color: 'var(--text)',
    letterSpacing: '-1px',
    marginBottom: '24px',
    textTransform: 'uppercase',
  },
  heroSub: {
    fontSize: '14px',
    color: 'var(--text-2)',
    lineHeight: '1.7',
    maxWidth: '300px',
    marginBottom: '36px',
  },
  cta: {
    display: 'inline-block',
    background: 'var(--accent)',
    color: 'white',
    padding: '16px 28px',
    borderRadius: '0',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '2.5px',
    border: 'none',
    cursor: 'pointer',
  },
  decoCircle: {
    position: 'absolute',
    right: '-50px',
    top: '10px',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    border: '1px solid rgba(212,84,122,0.15)',
    pointerEvents: 'none',
  },
  decoLine: {
    position: 'absolute',
    right: '48px',
    bottom: '0',
    width: '1px',
    height: '100px',
    background: 'rgba(212,84,122,0.25)',
    pointerEvents: 'none',
  },
  howStrip: {
    display: 'flex',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  },
  howStep: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '18px 12px',
    borderRight: '1px solid var(--border)',
  },
  howNum: {
    fontSize: '10px',
    color: 'var(--accent)',
    letterSpacing: '1px',
    fontWeight: '700',
    marginBottom: '4px',
  },
  howTitle: {
    fontSize: '10px',
    letterSpacing: '2px',
    color: 'var(--text)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  howDesc: {
    fontSize: '11px',
    color: 'var(--text-3)',
    lineHeight: '1.4',
  },
  bottomSection: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    background: 'var(--surface)',
  },
  privacyBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  privacyText: {
    fontSize: '12px',
    color: 'var(--text-3)',
  },
  regionBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 14px',
    fontSize: '13px',
    color: 'var(--text-2)',
    textAlign: 'left',
  },
  regionDropdown: {
    position: 'absolute',
    bottom: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    zIndex: 10,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  regionOption: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '13px 16px',
    fontSize: '13px',
    color: 'var(--text-2)',
    borderBottom: '1px solid var(--border)',
    textAlign: 'left',
  },
  regionActive: {
    color: 'var(--accent)',
    background: 'var(--accent-dim)',
  },
  ecoBar: {
    background: 'var(--green-bg)',
    padding: '14px 24px',
    borderTop: '1px solid rgba(45,74,53,0.1)',
  },
  ecoText: {
    fontSize: '12px',
    color: 'var(--green-text)',
    lineHeight: '1.6',
  },
}
