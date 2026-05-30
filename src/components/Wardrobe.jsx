import { useState } from 'react'
import { getWardrobe, removeFromWardrobe, clearWardrobe } from '../utils/wardrobe'
import { getProducts, REGIONS } from '../data/products'

export default function Wardrobe({ onBack, onReset, region }) {
  const [items, setItems] = useState(() => getWardrobe())
  const [expanded, setExpanded] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const handleRemove = (id) => {
    removeFromWardrobe(id)
    setItems(getWardrobe())
    if (expanded === id) setExpanded(null)
  }

  const handleClear = () => {
    clearWardrobe()
    setItems([])
    setConfirmClear(false)
    setExpanded(null)
  }

  const activeItem = items.find(i => i.id === expanded)

  return (
    <div style={styles.container}>
      {/* Nav */}
      <div style={styles.nav}>
        <button style={styles.back} onClick={onBack}>← Back</button>
        <span style={styles.logo}>UNSEEN</span>
        <span style={{ width: 56 }} />
      </div>

      <div style={styles.content}>
        <div style={styles.titleRow}>
          <div>
            <h2 style={styles.title}>My Wardrobe</h2>
            <p style={styles.subtitle}>{items.length} outfit{items.length !== 1 ? 's' : ''} saved</p>
          </div>
          {items.length > 0 && (
            confirmClear ? (
              <div style={styles.confirmRow}>
                <button style={styles.confirmYes} onClick={handleClear}>Clear all</button>
                <button style={styles.confirmNo} onClick={() => setConfirmClear(false)}>Cancel</button>
              </div>
            ) : (
              <button style={styles.clearBtn} onClick={() => setConfirmClear(true)}>Clear all</button>
            )
          )}
        </div>

        {items.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyIcon}>🪞</p>
            <p style={styles.emptyTitle}>Your wardrobe is empty</p>
            <p style={styles.emptySub}>Save an outfit from your results to build your wardrobe.</p>
            <button style={styles.emptyBtn} onClick={onReset}>Analyse an outfit</button>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div style={styles.grid}>
              {items.map(item => (
                <button
                  key={item.id}
                  style={{
                    ...styles.card,
                    ...(expanded === item.id ? styles.cardActive : {}),
                  }}
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  {item.imagePreview ? (
                    <img src={item.imagePreview} alt="Outfit" style={styles.cardImg} />
                  ) : (
                    <div style={styles.cardPlaceholder}>👗</div>
                  )}
                  <div style={styles.cardOverlay}>
                    <p style={styles.cardType}>
                      {item.primary_recommendation?.name || '—'}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Expanded detail */}
            {activeItem && (
              <div style={styles.detail}>
                <div style={styles.detailHeader}>
                  <div>
                    <p style={styles.detailLabel}>Primary recommendation</p>
                    <p style={styles.detailRec}>{activeItem.primary_recommendation?.name}</p>
                    <p style={styles.detailType}>{activeItem.primary_recommendation?.type?.replace(/_/g, ' ')}</p>
                  </div>
                  <button style={styles.removeBtn} onClick={() => handleRemove(activeItem.id)}>
                    Remove
                  </button>
                </div>

                <p style={styles.detailReason}>{activeItem.primary_recommendation?.reasoning}</p>

                {/* Products */}
                {activeItem.primary_recommendation?.type && (
                  <div style={styles.detailProducts}>
                    <p style={styles.detailProductsLabel}>Shop in {REGIONS[region]?.name}</p>
                    {getProducts(activeItem.primary_recommendation.type, region).slice(0, 3).map(p => (
                      <a
                        key={p.id}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.productRow}
                      >
                        <div style={{ ...styles.swatch, background: p.color || 'var(--surface-3)' }} />
                        <div style={styles.productText}>
                          <span style={styles.productName}>{p.name}</span>
                          <span style={styles.productStore}>{p.store}</span>
                        </div>
                        <span style={styles.productPrice}>{p.price}</span>
                        <span style={styles.productArrow}>→</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Garment summary */}
                {activeItem.garment_summary && (
                  <p style={styles.garmentNote}>{activeItem.garment_summary}</p>
                )}

                <p style={styles.savedAt}>
                  Saved {new Date(activeItem.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            )}
          </>
        )}
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
  },
  back: { fontSize: '14px', color: 'var(--text-3)', width: 56, textAlign: 'left' },
  logo: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '5px',
  },
  content: {
    flex: 1,
    padding: '24px 20px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '26px',
    fontWeight: '400',
    color: 'var(--text)',
    marginBottom: '4px',
  },
  subtitle: { fontSize: '13px', color: 'var(--text-3)' },
  clearBtn: { fontSize: '12px', color: 'var(--text-3)', padding: '6px 0' },
  confirmRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  confirmYes: { fontSize: '12px', color: 'var(--red)', padding: '6px 12px', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '20px', background: 'rgba(248,113,113,0.08)' },
  confirmNo: { fontSize: '12px', color: 'var(--text-3)', padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '20px' },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyIcon: { fontSize: '40px' },
  emptyTitle: { fontSize: '18px', color: 'var(--text)', fontFamily: 'var(--font-serif)' },
  emptySub: { fontSize: '14px', color: 'var(--text-3)', lineHeight: '1.6', maxWidth: '260px' },
  emptyBtn: {
    marginTop: '8px',
    background: 'var(--accent)',
    color: 'white',
    padding: '14px 28px',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  card: {
    position: 'relative',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    aspectRatio: '3/4',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    padding: 0,
  },
  cardActive: {
    borderColor: 'var(--accent)',
  },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '24px 10px 10px',
    background: 'linear-gradient(to top, rgba(10,10,15,0.85), transparent)',
  },
  cardType: {
    fontSize: '11px',
    color: 'var(--text)',
    fontWeight: '500',
    lineHeight: '1.3',
    textAlign: 'left',
  },
  detail: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '18px',
    border: '1px solid var(--accent)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  detailLabel: { fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' },
  detailRec: { fontSize: '16px', color: 'var(--text)', fontWeight: '500', marginBottom: '3px' },
  detailType: { fontSize: '12px', color: 'var(--text-3)', textTransform: 'capitalize' },
  removeBtn: { fontSize: '12px', color: 'var(--red)', padding: '6px 0' },
  detailReason: { fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.6' },
  detailProducts: { display: 'flex', flexDirection: 'column', gap: '8px' },
  detailProductsLabel: { fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' },
  productRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--surface-2)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    border: '1px solid var(--border)',
  },
  swatch: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  productText: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' },
  productName: { fontSize: '13px', color: 'var(--text)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  productStore: { fontSize: '11px', color: 'var(--text-3)' },
  productPrice: { fontSize: '12px', color: 'var(--accent-light)', flexShrink: 0 },
  productArrow: { fontSize: '12px', color: 'var(--text-3)', flexShrink: 0 },
  garmentNote: {
    fontSize: '12px',
    color: 'var(--text-3)',
    fontStyle: 'italic',
    lineHeight: '1.5',
    borderTop: '1px solid var(--border)',
    paddingTop: '12px',
  },
  savedAt: { fontSize: '11px', color: 'var(--text-3)' },
}
