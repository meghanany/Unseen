import { useState, useEffect, useRef, useId } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────
export const C = {
  pinkBg:        '#fef4f7',
  pinkAccent:    '#e5487a',
  greyBg:        '#f5f5f6',
  greyBorder:    '#a69ba1',
  textDark:      '#221d1d',
  textSecondary: '#4e3844',
  white:         '#ffffff',
  inputBorder:   '#4e3844',
  divider:       '#e8e3df',
}

// 'Canela Text' is a custom font — add CanelaText-Bold-Trial.otf to /public if you have it.
// Falls back to Cormorant Garamond (already loaded via Google Fonts).
export const FONT_CANELA = {
  fontFamily: "'Canela Text', 'Cormorant Garamond', Georgia, serif",
  fontWeight: 700,
}

export const FONT_PUBLIC = (weight = 300) => ({
  fontFamily: "'Public Sans', 'Inter', -apple-system, sans-serif",
  fontWeight: weight,
})

// ─── Inject global keyframes once ────────────────────────────────────────────
const STYLE_ID = 'vs-global-styles'
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = `
    @keyframes vs-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40%           { transform: translateY(-5px); }
    }
    @keyframes vs-slide-up {
      from { transform: translateX(-50%) translateY(100%); }
      to   { transform: translateX(-50%) translateY(0); }
    }
    @keyframes vs-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes vs-msg-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .vs-input:focus { outline: none; }
    .vs-input::placeholder { color: #a69ba1; }
    .vs-messages::-webkit-scrollbar { width: 0; }
    .vs-btn-reset {
      background: none; border: none; padding: 0;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
  `
  document.head.appendChild(el)
}

// ─── Time helper ──────────────────────────────────────────────────────────────
export function getCurrentTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

// ─── UserBubble ───────────────────────────────────────────────────────────────
export function UserBubble({ text, timestamp, image }) {
  const time = useRef(timestamp ?? getCurrentTime()).current
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', animation: 'vs-msg-in 0.3s ease' }}>
      <div style={{
        background: C.pinkBg,
        border: `1px solid ${C.pinkAccent}`,
        borderRadius: 10,
        padding: 12,
        maxWidth: 295,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'flex-end',
        boxSizing: 'border-box',
      }}>
        <p style={{ ...FONT_PUBLIC(), fontSize: 13, lineHeight: '20px', letterSpacing: '0.52px', color: C.textDark, margin: 0, wordBreak: 'break-word' }}>
          {text}
        </p>
        {image && (
          <img src={image} alt="" style={{ width: 147, height: 105, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
        )}
      </div>
      <p style={{ ...FONT_PUBLIC(), fontSize: 10.67, lineHeight: '16px', letterSpacing: '0.43px', color: C.textSecondary, margin: '2px 0 0', textAlign: 'right' }}>
        {time}
      </p>
    </div>
  )
}

// ─── AIBubble ─────────────────────────────────────────────────────────────────
export function AIBubble({ text, timestamp, actions, onActionClick }) {
  const time = useRef(timestamp ?? getCurrentTime()).current
  const [selectedId, setSelectedId] = useState(null)

  function handleClick(action) {
    if (selectedId !== null) return
    setSelectedId(action.id)
    onActionClick?.(action)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', animation: 'vs-msg-in 0.3s ease' }}>
      <div style={{
        background: C.greyBg,
        border: `1px solid ${C.greyBorder}`,
        borderRadius: 10,
        padding: 12,
        maxWidth: 295,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxSizing: 'border-box',
      }}>
        {text && (
          <p style={{ ...FONT_PUBLIC(), fontSize: 12, lineHeight: '20px', letterSpacing: '0.48px', color: C.textDark, margin: 0, wordBreak: 'break-word' }}>
            {text}
          </p>
        )}
        {actions && actions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {actions.map((action) => {
              const selected = selectedId === action.id
              return (
                <button
                  key={action.id}
                  onClick={() => handleClick(action)}
                  disabled={selectedId !== null}
                  style={{
                    ...FONT_PUBLIC(),
                    fontSize: 12,
                    lineHeight: '20px',
                    letterSpacing: '0.48px',
                    color: selected ? C.white : C.textDark,
                    background: selected ? C.pinkAccent : C.white,
                    border: `1px solid ${selected ? C.pinkAccent : C.greyBorder}`,
                    borderRadius: 20,
                    padding: '8px 16px',
                    width: '100%',
                    cursor: selectedId !== null ? 'default' : 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {action.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
      <p style={{ ...FONT_PUBLIC(), fontSize: 10.67, lineHeight: '16px', letterSpacing: '0.43px', color: C.textSecondary, margin: '2px 0 0' }}>
        {time}
      </p>
    </div>
  )
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────
export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{
        background: C.greyBg,
        border: `1px solid ${C.greyBorder}`,
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
      }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            display: 'inline-block',
            width: 6, height: 6,
            borderRadius: '50%',
            background: C.pinkAccent,
            animation: `vs-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
export function ProductCard({ image, name = 'Product', store = 'Store', rating = 4, ratingCount, price = '₹0', url }) {
  const starBaseId = useId()
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        position: 'relative',
        background: C.white,
        border: `1px solid ${C.greyBorder}`,
        borderRadius: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        width: '100%',
      }}>
        {/* Thumbnail */}
        <div style={{ width: 80, height: 81, flexShrink: 0, overflow: 'hidden', alignSelf: 'flex-start', background: C.greyBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {image
            ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <span style={{ fontSize: 28 }}>{storeEmoji(store)}</span>
          }
        </div>
        {/* Info */}
        <div style={{ flex: 1, paddingLeft: 9, paddingRight: 8, paddingTop: 10, paddingBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <p style={{ ...FONT_PUBLIC(), fontSize: 12, lineHeight: '20px', letterSpacing: '0.48px', color: C.textDark, margin: 0 }}>{name}</p>
            <p style={{ ...FONT_PUBLIC(), fontSize: 12, lineHeight: '20px', letterSpacing: '0.48px', color: C.greyBorder, margin: 0 }}>{store}</p>
          </div>
          <div>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const fraction = Math.min(1, Math.max(0, rating - (n - 1)))
                const gradId = `${starBaseId}s${n}`
                return (
                  <svg key={n} width="12" height="12" viewBox="0 0 12 12">
                    <defs>
                      <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
                        <stop offset={`${fraction * 100}%`} stopColor={C.pinkAccent} />
                        <stop offset={`${fraction * 100}%`} stopColor={C.greyBorder} />
                      </linearGradient>
                    </defs>
                    <path d="M6 1.2L7.35 3.94L10.39 4.38L8.2 6.52L8.7 9.54L6 8.12L3.3 9.54L3.8 6.52L1.61 4.38L4.65 3.94Z" fill={`url(#${gradId})`} />
                  </svg>
                )
              })}
            </div>
            {ratingCount !== undefined && (
              <p style={{ ...FONT_PUBLIC(), fontSize: 9, lineHeight: '16px', letterSpacing: '0.28px', color: '#605858', margin: 0 }}>
                (Based on {ratingCount} ratings)
              </p>
            )}
          </div>
        </div>
        {/* Price */}
        <p style={{ position: 'absolute', top: 12, right: 12, ...FONT_PUBLIC(600), fontSize: 16, lineHeight: '16px', letterSpacing: '0.64px', color: C.pinkAccent, margin: 0, whiteSpace: 'nowrap' }}>
          {price}
        </p>
      </div>
    </a>
  )
}

function storeEmoji(store = '') {
  const s = store.toLowerCase()
  if (s.includes('myntra')) return '👗'
  if (s.includes('nykaa')) return '💄'
  if (s.includes('zivame') || s.includes('clovia')) return '🛍️'
  if (s.includes('amazon')) return '📦'
  if (s.includes('victoria')) return '🌹'
  if (s.includes('asos')) return '✨'
  if (s.includes('nordstrom')) return '🏬'
  if (s.includes('m&s') || s.includes('marks')) return '🇬🇧'
  return '🛍️'
}

// ─── InputBar ─────────────────────────────────────────────────────────────────
export function InputBar({ onPlusClick, placeholder = "Type what you're looking for...", disabled }) {
  return (
    <div style={{
      flexShrink: 0,
      background: C.white,
      borderTop: `1px solid ${C.divider}`,
      borderLeft: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      borderRadius: '10px 10px 0 0',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      boxSizing: 'border-box',
      width: '100%',
    }}>
      <button
        className="vs-btn-reset"
        onClick={onPlusClick}
        disabled={disabled}
        aria-label="Attach"
        style={{ width: 22, height: 22, flexShrink: 0, fontSize: 22, color: C.textDark, opacity: disabled ? 0.3 : 1 }}
      >
        +
      </button>
      <div style={{
        flex: 1,
        border: `1px solid ${C.inputBorder}`,
        borderRadius: 10,
        background: C.white,
        padding: '9px 14px',
      }}>
        <p style={{ ...FONT_PUBLIC(), fontSize: 13.5, lineHeight: '20px', letterSpacing: '0.54px', color: '#a69ba1', margin: 0 }}>
          {placeholder}
        </p>
      </div>
    </div>
  )
}

// ─── BottomSheet ──────────────────────────────────────────────────────────────
export function BottomSheet({ isOpen, onClose, onChooseGallery, onTakePhoto }) {
  if (!isOpen) return null
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(34,29,29,0.45)', zIndex: 200, animation: 'vs-fade-in 0.2s ease' }} />
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        width: '100%',
        maxWidth: 480,
        background: C.white,
        borderRadius: '16px 16px 0 0',
        zIndex: 201,
        paddingBottom: 32,
        animation: 'vs-slide-up 0.25s ease-out',
      }}>
        <div style={{ width: 36, height: 4, background: C.greyBorder, borderRadius: 2, margin: '12px auto 8px' }} />
        {[
          { label: 'Choose from gallery', handler: onChooseGallery },
          { label: 'Take a photo', handler: onTakePhoto },
        ].map((opt) => (
          <button
            key={opt.label}
            onClick={() => { opt.handler?.(); onClose() }}
            style={{
              display: 'block', width: '100%',
              padding: '16px 24px',
              background: 'none', border: 'none',
              borderTop: `1px solid ${C.divider}`,
              cursor: 'pointer', textAlign: 'left',
              ...FONT_PUBLIC(),
              fontSize: 15, lineHeight: '24px', letterSpacing: '0.3px',
              color: C.textDark,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  )
}

// ─── ChatHeader ───────────────────────────────────────────────────────────────
export function ChatHeader({ onClose }) {
  return (
    <div style={{
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px 20px 17px',
      borderBottom: `1px solid ${C.divider}`,
      background: C.white,
    }}>
      <button className="vs-btn-reset" onClick={onClose} style={{ width: 32, height: 32, fontSize: 18, color: C.textDark }}>✕</button>
      <span style={{ ...FONT_CANELA, fontSize: 12, lineHeight: '20px', letterSpacing: '1.92px', color: C.textDark, textTransform: 'uppercase' }}>
        VIRTUAL STYLIST
      </span>
      {/* Filter icon */}
      <button className="vs-btn-reset" style={{ width: 32, height: 32 }}>
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <line x1="0" y1="2" x2="18" y2="2" stroke={C.textDark} strokeWidth="1.5"/>
          <line x1="0" y1="7" x2="18" y2="7" stroke={C.textDark} strokeWidth="1.5"/>
          <line x1="0" y1="12" x2="18" y2="12" stroke={C.textDark} strokeWidth="1.5"/>
          <circle cx="5" cy="2" r="2" fill={C.white} stroke={C.textDark} strokeWidth="1.5"/>
          <circle cx="13" cy="7" r="2" fill={C.white} stroke={C.textDark} strokeWidth="1.5"/>
          <circle cx="7" cy="12" r="2" fill={C.white} stroke={C.textDark} strokeWidth="1.5"/>
        </svg>
      </button>
    </div>
  )
}
