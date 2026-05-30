import { useState } from 'react'
import { REGIONS } from '../data/products'
import { getWardrobe } from '../utils/wardrobe'

export default function Landing({ onStart, region, setRegion }) {
  const [showRegions, setShowRegions] = useState(false)
  const wardrobeCount = getWardrobe().length

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.logo}>UNSEEN</span>
        {wardrobeCount > 0 && (
          <button style={styles.wardrobeBtn} onClick={onStart}>
            My Wardrobe · {wardrobeCount}
          </button>
        )}
      </div>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroText}>
          <h1 style={styles.headline}>
            The layer nobody sees.
          </h1>
          <h1 style={styles.headline2}>
            The difference everyone notices.
          </h1>
        </div>
        <p style={styles.subtext}>
          Upload any outfit. Know exactly what innerwear works underneath — no guessing, no wardrobe fails.
        </p>
      </div>

      {/* Privacy badge */}
      <div style={styles.privacyBadge}>
        <span style={styles.lock}>🔒</span>
        <span style={styles.privacyText}>No need to wear it · Screenshot or flat lay works · Photo never stored</span>
      </div>

      {/* Region selector */}
      <div style={styles.regionWrap}>
        <button style={styles.regionBtn} onClick={() => setShowRegions(!showRegions)}>
          <span>{REGIONS[region].flag}</span>
          <span>Shopping in {REGIONS[region].name}</span>
          <span style={{ marginLeft: 'auto', opacity: 0.5 }}>▾</span>
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
                {region === key && <span style={{ marginLeft: 'auto' }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <button style={styles.cta} onClick={onStart}>
        Upload Your Outfit →
      </button>

      {/* Impact stat */}
      <div style={styles.impactBar}>
        <p style={styles.impactText}>
          🌱 Fashion returns generate <strong style={{ color: 'var(--green)' }}>27M tonnes of CO₂</strong> annually. Buying right the first time starts here.
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
    padding: '0 20px 32px',
    gap: '0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '56px',
    paddingBottom: '8px',
  },
  logo: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: '600',
    letterSpacing: '6px',
    color: 'var(--text)',
  },
  wardrobeBtn: {
    fontSize: '12px',
    color: 'var(--text-3)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '6px 14px',
    background: 'var(--surface)',
  },
  hero: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingTop: '48px',
    paddingBottom: '32px',
    gap: '20px',
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  headline: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(36px, 10vw, 48px)',
    fontWeight: '300',
    lineHeight: '1.1',
    color: 'var(--text)',
    letterSpacing: '-0.5px',
  },
  headline2: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(36px, 10vw, 48px)',
    fontWeight: '300',
    lineHeight: '1.1',
    color: 'var(--accent-light)',
    letterSpacing: '-0.5px',
    fontStyle: 'italic',
  },
  subtext: {
    fontSize: '15px',
    color: 'var(--text-2)',
    lineHeight: '1.6',
    maxWidth: '340px',
  },
  privacyBadge: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
    marginBottom: '16px',
  },
  lock: { fontSize: '14px', flexShrink: 0, marginTop: '1px' },
  privacyText: {
    fontSize: '13px',
    color: 'var(--text-3)',
    lineHeight: '1.5',
  },
  regionWrap: {
    position: 'relative',
    marginBottom: '16px',
  },
  regionBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
    fontSize: '14px',
    color: 'var(--text-2)',
    textAlign: 'left',
  },
  regionDropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    zIndex: 10,
  },
  regionOption: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    fontSize: '14px',
    color: 'var(--text-2)',
    borderBottom: '1px solid var(--border)',
    textAlign: 'left',
  },
  regionActive: {
    color: 'var(--accent-light)',
    background: 'var(--accent-dim)',
  },
  cta: {
    width: '100%',
    background: 'var(--accent)',
    color: 'white',
    padding: '18px',
    borderRadius: 'var(--radius)',
    fontSize: '16px',
    fontWeight: '500',
    letterSpacing: '0.3px',
    marginBottom: '20px',
    transition: 'opacity var(--transition)',
  },
  impactBar: {
    background: 'var(--green-bg)',
    border: '1px solid rgba(134,239,172,0.15)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
  },
  impactText: {
    fontSize: '13px',
    color: 'var(--text-3)',
    lineHeight: '1.5',
  },
}
