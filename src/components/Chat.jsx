import { useState, useEffect, useRef, useCallback } from 'react'
import { getProducts, REGIONS } from '../data/products'
import { saveToWardrobe, getWardrobe } from '../utils/wardrobe'

// ─── Helpers ───────────────────────────────────────────────────────────────────
let _id = 0
const mid = () => String(++_id)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const now = () => {
  const d = new Date()
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingBubble() {
  return (
    <div style={s.msgRow}>
      <div style={s.aiBubble}>
        <div style={s.dots}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ ...s.dot, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── AI bubble (text + optional action buttons inside) ───────────────────────
function AiMessage({ msg, onSelect }) {
  const hasOptions = msg.options && msg.options.length > 0
  const hasProducts = msg.products && msg.products.length > 0

  return (
    <div style={s.msgRow}>
      <div style={{ maxWidth: '82%' }}>
        <div style={s.aiBubble}>
          {/* Text content */}
          {msg.content && (
            <p style={s.bubbleText}>{renderBold(msg.content)}</p>
          )}

          {/* Option buttons inside the bubble */}
          {hasOptions && (
            <div style={{ ...s.optionsCol, marginTop: msg.content ? 10 : 0 }}>
              {msg.options.map((opt) => {
                const isSelected = msg.selectedOption === opt.value
                return (
                  <button
                    key={opt.value}
                    style={isSelected ? s.optBtnSelected : s.optBtn}
                    onClick={() => !msg.selectedOption && onSelect && onSelect(msg.id, opt)}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Product cards stacked inside the bubble */}
          {hasProducts && (
            <div style={{ marginTop: msg.content ? 10 : 0 }}>
              {msg.subtitle && (
                <p style={s.promoLink}>
                  🔥 <span style={s.promoLinkText}>See real customer photos and styling tips</span> for the best match!
                </p>
              )}
              <div style={s.productsList}>
                {msg.products.map((p) => (
                  <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" style={s.productCard}>
                    <div style={s.productThumb}>
                      <span style={{ fontSize: 22 }}>{storeEmoji(p.store)}</span>
                    </div>
                    <div style={s.productInfo}>
                      <p style={s.productName}>{p.name}</p>
                      <p style={s.productStore}>{p.store}</p>
                      <div style={s.productRating}>
                        <span style={s.stars}>★★★★½</span>
                        <span style={s.ratingCount}>(Based on 59 ratings)</span>
                      </div>
                    </div>
                    <p style={s.productPrice}>{p.price}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <p style={s.timestamp}>{msg.time}</p>
      </div>
    </div>
  )
}

// ─── User bubble ──────────────────────────────────────────────────────────────
function UserMessage({ msg }) {
  return (
    <div style={s.userRow}>
      <div style={{ maxWidth: '70%' }}>
        {msg.imageSrc ? (
          <div style={s.userImageBubble}>
            <img src={msg.imageSrc} alt="outfit" style={s.userImage} />
          </div>
        ) : (
          <div style={s.userBubble}>
            <p style={s.bubbleText}>{msg.content}</p>
          </div>
        )}
        <p style={{ ...s.timestamp, textAlign: 'right' }}>{msg.time}</p>
      </div>
    </div>
  )
}

// ─── Bold text renderer ───────────────────────────────────────────────────────
function renderBold(text) {
  if (!text?.includes('**')) return text
  return text.split(/\*\*(.+?)\*\*/).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

function storeEmoji(store) {
  const s = store?.toLowerCase() || ''
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

// ─── Main Chat ────────────────────────────────────────────────────────────────
export default function Chat({ onBack }) {
  const [messages, setMessages] = useState([])
  const [phase, setPhase] = useState('location')
  const [region, setRegion] = useState(null)
  const regionRef = useRef(null)
  const [analysis, setAnalysis] = useState(null)
  const [pendingFollowups, setPendingFollowups] = useState([])
  const [followupIdx, setFollowupIdx] = useState(0)
  const [showSheet, setShowSheet] = useState(false)
  const galleryRef = useRef(null)
  const cameraRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => { regionRef.current = region }, [region])

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [messages])

  // Helpers to add messages
  const addMsg = useCallback((msg) => {
    setMessages((m) => [...m, { id: mid(), time: now(), ...msg }])
  }, [])

  const addTyping = useCallback(() => {
    setMessages((m) => [...m, { id: 'typing', type: 'typing' }])
  }, [])

  const removeTyping = useCallback(() => {
    setMessages((m) => m.filter((x) => x.id !== 'typing'))
  }, [])

  // Update a specific message (e.g. to set selectedOption)
  const updateMsg = useCallback((id, patch) => {
    setMessages((m) => m.map((x) => x.id === id ? { ...x, ...patch } : x))
  }, [])

  // ── Init: location question ──
  useEffect(() => {
    const init = async () => {
      await sleep(600)
      addTyping()
      await sleep(1000)
      removeTyping()
      addMsg({
        from: 'ai',
        type: 'ai',
        content: "We've detected your location as India. Is this correct?",
        options: [
          { label: 'Yes, proceed', value: 'IN' },
          { label: 'No, I am in a different location', value: 'other' },
        ],
      })
    }
    init()
  }, []) // eslint-disable-line

  // ── Option selected (any AI message with options) ──
  const handleOptionSelect = useCallback(async (msgId, opt) => {
    // Visually mark selection in the bubble
    updateMsg(msgId, { selectedOption: opt.value })

    await sleep(300)

    const r = regionRef.current

    if (phase === 'location') {
      let chosenRegion = opt.value

      if (opt.value === 'other') {
        // Show region picker
        await sleep(500)
        addMsg({
          from: 'ai',
          type: 'ai',
          content: 'Which region are you in?',
          options: [
            { label: '🇮🇳 India', value: 'IN' },
            { label: '🇺🇸 United States', value: 'US' },
            { label: '🇬🇧 United Kingdom', value: 'UK' },
          ],
        })
        return
      }

      // 'IN' or a region key
      if (['IN', 'US', 'UK'].includes(opt.value)) {
        chosenRegion = opt.value
      }

      setRegion(chosenRegion)
      regionRef.current = chosenRegion

      addMsg({ from: 'user', type: 'user', content: opt.label })
      setPhase('upload')

      await sleep(600)
      addTyping()
      await sleep(1000)
      removeTyping()

      const storeHint =
        chosenRegion === 'IN' ? 'Zivame, Clovia, or Myntra'
        : chosenRegion === 'UK' ? 'M&S or ASOS'
        : "Victoria's Secret or Aerie"

      addMsg({
        from: 'ai',
        type: 'ai',
        content: `${REGIONS[chosenRegion].flag} Perfect! Upload your outfit — a screenshot from ${storeHint}, flat lay, or hanger shot works great. Tap + to attach.`,
      })

    } else if (phase === 'followup') {
      addMsg({ from: 'user', type: 'user', content: opt.label })

      const nextIdx = followupIdx + 1
      setFollowupIdx(nextIdx)

      if (nextIdx < pendingFollowups.length) {
        await sleep(500)
        addTyping()
        await sleep(900)
        removeTyping()
        const next = pendingFollowups[nextIdx]
        addMsg({
          from: 'ai',
          type: 'ai',
          content: next.question,
          options: next.options.map((o) => ({ label: o, value: o })),
        })
      } else {
        // Done with followups → show results
        setPhase('results')
        await sleep(400)
        addTyping()
        await sleep(1200)
        removeTyping()
        await showRecommendation(analysis, regionRef.current)
      }

    } else if (phase === 'done') {
      addMsg({ from: 'user', type: 'user', content: opt.label })

      if (opt.value === 'more') {
        await sleep(400)
        addTyping()
        await sleep(800)
        removeTyping()
        addMsg({ from: 'ai', type: 'ai', content: "Here are more options for you! Try uploading a different outfit to get fresh recommendations." })
      } else if (opt.value === 'save') {
        if (analysis) saveToWardrobe({ analysis, savedAt: new Date().toISOString() })
        await sleep(400)
        addMsg({ from: 'ai', type: 'ai', content: `Saved to your wardrobe! 🗂️ You've got ${getWardrobe().length} look${getWardrobe().length === 1 ? '' : 's'} saved.` })
      } else if (opt.value === 'reset') {
        setPhase('upload')
        setAnalysis(null)
        setPendingFollowups([])
        setFollowupIdx(0)
        await sleep(400)
        addMsg({ from: 'ai', type: 'ai', content: 'Upload your next outfit! 👗' })
      }
    }
  }, [phase, followupIdx, pendingFollowups, analysis, addMsg, addTyping, removeTyping, updateMsg]) // eslint-disable-line

  // ── Show recommendation ──
  const showRecommendation = useCallback(async (result, r) => {
    const primaryProducts = getProducts(result.primary_recommendation.type, r).slice(0, 3)

    addMsg({
      from: 'ai',
      type: 'ai',
      content: `Here are the best ${result.primary_recommendation.name.toLowerCase()}s for your ${result.garment_summary.toLowerCase()}:`,
      subtitle: true,
      products: primaryProducts,
    })

    await sleep(800)
    addMsg({
      from: 'ai',
      type: 'ai',
      content: 'Do you like these options or would you like me to suggest more options?',
      options: [
        { label: "I'd like more options!", value: 'more' },
        { label: "No thanks! I'm good!", value: 'save' },
      ],
    })
    setPhase('done')
  }, [addMsg])

  // ── Process uploaded image ──
  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setShowSheet(false)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target.result
      const base64 = dataUrl.split(',')[1]
      const mediaType = file.type || 'image/jpeg'

      addMsg({ from: 'user', type: 'user', imageSrc: dataUrl })
      setPhase('analyzing')
      await sleep(300)
      addTyping()

      try {
        const isDev = window.location.hostname === 'localhost'
        let result

        if (isDev) {
          await sleep(3500)
          result = mockResult()
        } else {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageData: base64, mediaType }),
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          result = await res.json()
          if (result.error) throw new Error(result.error)
        }

        removeTyping()
        setAnalysis(result)

        if (result.needs_followup && result.followup_questions?.length > 0) {
          setPendingFollowups(result.followup_questions)
          setFollowupIdx(0)
          setPhase('followup')

          await sleep(400)
          addTyping()
          await sleep(1000)
          removeTyping()

          const q = result.followup_questions[0]
          addMsg({
            from: 'ai',
            type: 'ai',
            content: q.question,
            options: q.options.map((o) => ({ label: o, value: o })),
          })
        } else {
          setPhase('results')
          await sleep(400)
          await showRecommendation(result, regionRef.current)
        }
      } catch (err) {
        console.error(err)
        removeTyping()
        addMsg({ from: 'ai', type: 'ai', content: "I couldn't read that image clearly. Try a brighter photo or a screenshot? 🤔" })
        setPhase('upload')
      }
    }
    reader.readAsDataURL(file)
  }, [addMsg, addTyping, removeTyping, showRecommendation])

  const canAttach = phase === 'upload' || phase === 'done'

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.headerBtn} onClick={onBack}>✕</button>
        <span style={s.headerTitle}>VIRTUAL STYLIST</span>
        <button style={s.headerBtn}>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <line x1="0" y1="2" x2="18" y2="2" stroke="#1a1614" strokeWidth="1.5"/>
            <line x1="0" y1="7" x2="18" y2="7" stroke="#1a1614" strokeWidth="1.5"/>
            <line x1="0" y1="12" x2="18" y2="12" stroke="#1a1614" strokeWidth="1.5"/>
            <circle cx="5" cy="2" r="2" fill="white" stroke="#1a1614" strokeWidth="1.5"/>
            <circle cx="13" cy="7" r="2" fill="white" stroke="#1a1614" strokeWidth="1.5"/>
            <circle cx="7" cy="12" r="2" fill="white" stroke="#1a1614" strokeWidth="1.5"/>
          </svg>
        </button>
      </div>

      {/* Thread */}
      <div style={s.thread}>
        <div style={s.threadInner}>
          {messages.map((msg) => {
            if (msg.type === 'typing') return <TypingBubble key="typing" />
            if (msg.from === 'user') return <UserMessage key={msg.id} msg={msg} />
            return (
              <AiMessage
                key={msg.id}
                msg={msg}
                onSelect={(msgId, opt) => handleOptionSelect(msgId, opt)}
              />
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div style={s.inputBar}>
        <button
          style={{ ...s.plusBtn, opacity: canAttach ? 1 : 0.35 }}
          onClick={() => canAttach && setShowSheet(true)}
        >
          +
        </button>
        <div style={s.inputField}>
          <span style={s.inputPlaceholder}>Type what you're looking for...</span>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => processFile(e.target.files[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
        onChange={(e) => processFile(e.target.files[0])} />

      {/* Bottom sheet */}
      {showSheet && (
        <div style={s.overlay} onClick={() => setShowSheet(false)}>
          <div style={s.sheet} onClick={(e) => e.stopPropagation()}>
            <div style={s.sheetHandle} />
            <p style={s.sheetTitle}>Add your outfit</p>
            <button style={s.sheetRow} onClick={() => { setShowSheet(false); galleryRef.current?.click() }}>
              <span style={s.sheetIcon}>🖼️</span> Choose from gallery
            </button>
            <button style={s.sheetRow} onClick={() => { setShowSheet(false); cameraRef.current?.click() }}>
              <span style={s.sheetIcon}>📷</span> Take a photo
            </button>
            <button style={s.sheetCancel} onClick={() => setShowSheet(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
function mockResult() {
  return {
    garment_type: 'dress',
    garment_summary: 'black backless dress',
    needs_followup: true,
    followup_questions: [
      {
        question: "You're looking for a bra that works well with a black backless dress. Do you prefer:",
        options: ['A natural look', 'A push up effect'],
      },
    ],
    primary_recommendation: {
      type: 'boob_tape',
      name: 'Boob Tape',
      reasoning: 'Best for backless styles — gives lift and shape with full back exposure.',
    },
    alternatives: [
      { type: 'nipple_covers', name: 'Nipple Covers', reasoning: 'For a completely free feeling.' },
      { type: 'backless_adhesive_bra', name: 'Adhesive Bra', reasoning: 'For more structured support.' },
    ],
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  container: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    background: '#ffffff',
    borderBottom: '1px solid #f0f0f0',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#1a1614',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  headerTitle: {
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '3px',
    color: '#1a1614',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-sans)',
  },
  thread: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  threadInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '20px 16px 16px',
  },
  // AI message
  msgRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    animation: 'messageIn 0.3s ease',
  },
  aiBubble: {
    background: '#f2f2f2',
    borderRadius: '16px',
    padding: '14px 16px',
    maxWidth: '82%',
  },
  bubbleText: {
    fontSize: '14px',
    color: '#1a1614',
    lineHeight: '1.55',
    margin: 0,
  },
  optionsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  optBtn: {
    background: '#ffffff',
    border: '1.5px solid #d0d0d0',
    borderRadius: '24px',
    padding: '10px 18px',
    fontSize: '14px',
    color: '#1a1614',
    cursor: 'pointer',
    textAlign: 'center',
    fontFamily: 'var(--font-sans)',
    transition: 'all 0.15s ease',
  },
  optBtnSelected: {
    background: '#e91e8c',
    border: '1.5px solid #e91e8c',
    borderRadius: '24px',
    padding: '10px 18px',
    fontSize: '14px',
    color: '#ffffff',
    cursor: 'default',
    textAlign: 'center',
    fontFamily: 'var(--font-sans)',
  },
  timestamp: {
    fontSize: '11px',
    color: '#aaaaaa',
    marginTop: '4px',
    paddingLeft: '4px',
  },
  // User message
  userRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    animation: 'messageIn 0.3s ease',
  },
  userBubble: {
    background: '#ffffff',
    border: '1.5px solid #e91e8c',
    borderRadius: '16px 16px 4px 16px',
    padding: '12px 16px',
  },
  userImageBubble: {
    border: '1.5px solid #e91e8c',
    borderRadius: '16px 16px 4px 16px',
    overflow: 'hidden',
    maxWidth: '220px',
  },
  userImage: {
    width: '100%',
    maxHeight: '260px',
    objectFit: 'cover',
    display: 'block',
  },
  // Products
  promoLink: {
    fontSize: '12px',
    color: '#1a1614',
    marginBottom: '10px',
    lineHeight: '1.5',
  },
  promoLinkText: {
    color: '#e91e8c',
    fontStyle: 'italic',
    textDecoration: 'underline',
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  productCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #ebebeb',
    padding: '10px',
    textDecoration: 'none',
  },
  productThumb: {
    width: '56px',
    height: '56px',
    borderRadius: '8px',
    background: '#f8f8f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  productInfo: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1614',
    margin: 0,
    lineHeight: '1.3',
  },
  productStore: {
    fontSize: '11px',
    color: '#888888',
    margin: '2px 0',
  },
  productRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  stars: {
    fontSize: '11px',
    color: '#f59e0b',
  },
  ratingCount: {
    fontSize: '10px',
    color: '#aaaaaa',
  },
  productPrice: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#e91e8c',
    flexShrink: 0,
    margin: 0,
  },
  // Typing dots
  dots: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
    padding: '2px 0',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#aaaaaa',
    display: 'inline-block',
    animation: 'typingBounce 1.2s ease-in-out infinite',
  },
  // Input bar
  inputBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px 24px',
    background: '#ffffff',
    borderTop: '1px solid #f0f0f0',
    position: 'sticky',
    bottom: 0,
  },
  plusBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#1a1614',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
    fontWeight: '300',
    lineHeight: 1,
    transition: 'opacity 0.15s ease',
  },
  inputField: {
    flex: 1,
    border: '1.5px solid #d0d0d0',
    borderRadius: '24px',
    padding: '11px 18px',
    display: 'flex',
    alignItems: 'center',
  },
  inputPlaceholder: {
    fontSize: '14px',
    color: '#aaaaaa',
  },
  // Bottom sheet
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-end',
    animation: 'fadeIn 0.2s ease',
  },
  sheet: {
    background: '#ffffff',
    borderRadius: '20px 20px 0 0',
    padding: '12px 20px 40px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    animation: 'slideUp 0.25s ease',
  },
  sheetHandle: {
    width: '36px',
    height: '4px',
    borderRadius: '2px',
    background: '#e0e0e0',
    margin: '0 auto 16px',
  },
  sheetTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#888888',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  sheetRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 4px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1614',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #f0f0f0',
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
  sheetIcon: {
    fontSize: '22px',
  },
  sheetCancel: {
    marginTop: '8px',
    padding: '14px',
    fontSize: '14px',
    color: '#888888',
    background: 'transparent',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    textAlign: 'center',
    width: '100%',
  },
}
