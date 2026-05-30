import { useState } from 'react'
import { getProducts, REGIONS } from '../data/products'
import { saveToWardrobe } from '../utils/wardrobe'

export default function Results({ analysis, imagePreview, region, setRegion, onReset, onWardrobe }) {
  const [saved, setSaved] = useState(false)
  const [showRegions, setShowRegions] = useState(false)
  const [activeTab, setActiveTab] = useState(0) // 0 = primary, 1 = alt1, 2 = alt2

  if (!analysis) return null

  const { garment_summary, attributes, primary_recommendation, alternatives } = analysis

  const allRecs = [
    primary_recommendation,
    ...(alternatives || []),
  ].filter(Boolean)

  const activeRec = allRecs[activeTab]
  const products = activeRec ? getProducts(activeRec.type, region) : []

  const handleSave = () => {
    saveToWardrobe({
      imagePreview,
      garment_summary,
      attributes,
      primary_recommendation,
      alternatives,
      region,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const attrItems = attributes ? [
    attributes.neckline && ['Neckline', attributes.neckline],
    attributes.back_style && ['Back', attributes.back_style],
    attributes.straps && ['Straps', attributes.straps],
    attributes.fabric_opacity && ['Fabric', attributes.fabric_opacity],
    attributes.fit && ['Fit', attributes.fit],
  ].filter(Boolean) : []

  return (
    <div style={styles.container}>
      {/* Nav */}
      <div style={styles.nav}>
        <button style={styles.navBtn} onClick={onReset}>← New</button>
        <span style={styles.logo}>UNSEEN</span>
        <button style={styles.navBtn} onClick={onWardrobe}>Wardrobe</button>
      </div>

      <div style={styles.scroll}>
        {/* Outfit thumbnail + summary */}
        <div style={styles.hero}>
          {imagePreview && (
            <div style={styles.thumbWrap}>
              <img src={imagePreview} alt="Your outfit" style={styles.thumbImg} />
            </div>
          )}
          <div style={styles.heroText}>
            <p style={styles.garmentLabel}>Your outfit</p>
            <p style={styles.garmentSummary}>{garment_summary}</p>
          </div>
        </div>

        {/* Attributes chips */}
        {attrItems.length > 0 && (
          <div style={styles.section}>
            <p style={styles.sectionLabel}>Detected details</p>
            <div style={styles.chips}>
              {attrItems.map(([label, val]) => (
                <div key={label} style={styles.chip}>
                  <span style={styles.chipLabel}>{label}</span>
                  <span style={styles.chipVal}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation tabs */}
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Recommendations</p>
          {allRecs.length > 1 && (
            <div style={styles.tabs}>
              {allRecs.map((rec, i) => (
                <button
                  key={i}
                  style={{ ...styles.tab, ...(activeTab === i ? styles.tabActive : {}) }}
                  onClick={() => setActiveTab(i)}
                >
                  {i === 0 ? 'Best match' : `Option ${i + 1}`}
                </button>
              ))}
            </div>
          )}

          {activeRec && (
            <div style={styles.recCard}>
              <div style={styles.recHeader}>
                <div>
                  <p style={styles.recName}>{activeRec.name}</p>
                  <p style={styles.recType}>{activeRec.type?.replace(/_/g, ' ')}</p>
                </div>
                {activeTab === 0 && (
                  <span style={styles.bestBadge}>Best</span>
                )}
              </div>
              <p style={styles.recReason}>{activeRec.reasoning}</p>
            </div>
          )}
        </div>

        {/* Region selector */}
        <div style={styles.section}>
          <div style={styles.regionRow}>
            <p style={styles.sectionLabel}>Shop in</p>
            <div style={{ position: 'relative' }}>
              <button style={styles.regionPill} onClick={() => setShowRegions(!showRegions)}>
                {REGIONS[region].flag} {REGIONS[region].name} ▾
              </button>
              {showRegions && (
                <div style={styles.regionDrop}>
                  {Object.entries(REGIONS).map(([key, val]) => (
                    <button
                      key={key}
                      style={{ ...styles.regionOpt, ...(region === key ? styles.regionOptActive : {}) }}
                      onClick={() => { setRegion(key); setShowRegions(false) }}
                    >
                      {val.flag} {val.name} {region === key && '✓'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product cards */}
          {products.length > 0 ? (
            <div style={styles.products}>
              {products.map(product => (
                <a
                  key={product.id}
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.productCard}
                >
                  <div style={{ ...styles.productSwatch, background: product.color || 'var(--surface-3)' }} />
                  <div style={styles.productInfo}>
                    <p style={styles.productName}>{product.name}</p>
                    <p style={styles.productStore}>{product.store}</p>
                  </div>
                  <div style={styles.productRight}>
                    <p style={styles.productPrice}>{product.price}</p>
                    <span style={styles.arrow}>→</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p style={styles.noProducts}>No products found for this region. Try switching region above.</p>
          )}
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            style={{ ...styles.saveBtn, ...(saved ? styles.saveBtnDone : {}) }}
            onClick={handleSave}
            disabled={saved}
          >
            {saved ? '✓ Saved to Wardrobe' : '+ Save to Wardrobe'}
          </button>
          <button style={styles.resetBtn} onClick={onReset}>
            Try another outfit
          </button>
        </div>

        {/* Sustainability nudge */}
        <div style={styles.ecoBar}>
          <p style={styles.ecoText}>
            🌱 Getting innerwear right means fewer returns — and less ending up in landfills.
          </p>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100dvh', display: 'flex', flexDirection: 'column' },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    background: 'var(--bg)',
    zIndex: 10,
  },
  navBtn: { fontSize: '13px', color: 'var(--text-3)', width: 56, textAlign: 'left' },
  logo: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '5px',
  },
  scroll: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0' },
  hero: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    padding: '20px 20px 0',
  },
  thumbWrap: {
    width: '80px',
    height: '100px',
    borderRadius: '10px',
    overflow: 'hidden',
    flexShrink: 0,
    border: '1px solid var(--border)',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  heroText: { flex: 1, paddingTop: '4px' },
  garmentLabel: { fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' },
  garmentSummary: { fontSize: '15px', color: 'var(--text)', lineHeight: '1.5' },
  section: { padding: '20px 20px 0' },
  sectionLabel: {
    fontSize: '11px',
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '12px',
  },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '6px 12px',
  },
  chipLabel: { fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  chipVal: { fontSize: '12px', color: 'var(--text-2)', textTransform: 'capitalize' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '12px' },
  tab: {
    padding: '7px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    color: 'var(--text-3)',
    border: '1px solid var(--border)',
    background: 'transparent',
  },
  tabActive: {
    background: 'var(--accent-dim)',
    color: 'var(--accent-light)',
    borderColor: 'var(--accent)',
  },
  recCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '16px',
    border: '1px solid var(--border)',
  },
  recHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  recName: { fontSize: '16px', fontWeight: '500', color: 'var(--text)', marginBottom: '4px' },
  recType: { fontSize: '12px', color: 'var(--text-3)', textTransform: 'capitalize' },
  bestBadge: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--accent-light)',
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent)',
    borderRadius: '10px',
    padding: '3px 8px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  recReason: { fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.6' },
  regionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  regionPill: {
    fontSize: '13px',
    color: 'var(--text-2)',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '6px 12px',
  },
  regionDrop: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 4px)',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    zIndex: 20,
    minWidth: '160px',
  },
  regionOpt: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    fontSize: '13px',
    color: 'var(--text-2)',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
  },
  regionOptActive: { color: 'var(--accent-light)', background: 'var(--accent-dim)' },
  products: { display: 'flex', flexDirection: 'column', gap: '10px' },
  productCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px',
    transition: 'border-color 0.2s',
    textDecoration: 'none',
  },
  productSwatch: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  productInfo: { flex: 1, minWidth: 0 },
  productName: { fontSize: '14px', color: 'var(--text)', fontWeight: '500', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  productStore: { fontSize: '12px', color: 'var(--text-3)' },
  productRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 },
  productPrice: { fontSize: '13px', color: 'var(--accent-light)', fontWeight: '500' },
  arrow: { fontSize: '14px', color: 'var(--text-3)' },
  noProducts: { fontSize: '13px', color: 'var(--text-3)', fontStyle: 'italic' },
  actions: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  saveBtn: {
    width: '100%',
    background: 'var(--accent)',
    color: 'white',
    padding: '16px',
    borderRadius: 'var(--radius)',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'opacity 0.2s',
  },
  saveBtnDone: {
    background: 'var(--surface)',
    color: 'var(--green)',
    border: '1px solid rgba(134,239,172,0.3)',
  },
  resetBtn: {
    width: '100%',
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-2)',
    padding: '14px',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
  },
  ecoBar: {
    margin: '0 20px',
    background: 'var(--green-bg)',
    border: '1px solid rgba(134,239,172,0.15)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
  },
  ecoText: { fontSize: '13px', color: 'var(--text-3)', lineHeight: '1.5' },
}
