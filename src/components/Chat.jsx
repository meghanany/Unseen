import { useState, useEffect, useRef, useCallback } from 'react'
import { getProducts, REGIONS } from '../data/products'
import { saveToWardrobe, getWardrobe } from '../utils/wardrobe'

// ─── Message helpers ───────────────────────────────────────────────────────────
let _id = 0
const mid = () => ++_id

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ─── Sub-components ────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={bubble.aiWrap}>
      <div style={bubble.avatar}>✦</div>
      <div style={{ ...bubble.ai, padding: '14px 18px' }}>
        <div style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                ...styles.dot,
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function AiBubble({ content }) {
  return (
    <div style={bubble.aiWrap}>
      <div style={bubble.avatar}>✦</div>
      <div style={bubble.ai}>{content}</div>
    </div>
  )
}

function UserBubble({ content }) {
  return (
    <div style={bubble.userWrap}>
      <div style={bubble.user}>{content}</div>
    </div>
  )
}

function UserImageBubble({ src }) {
  return (
    <div style={bubble.userWrap}>
      <div style={bubble.userImg}>
        <img src={src} alt="Your outfit" style={styles.uploadedImg} />
      </div>
    </div>
  )
}

function QuickReplies({ options, onSelect, disabled }) {
  const [selected, setSelected] = useState(null)
  return (
    <div style={styles.qrWrap}>
      {options.map((opt) => (
        <button
          key={opt.value ?? opt.label}
          style={{
            ...styles.qrBtn,
            ...(selected === (opt.value ?? opt.label) ? styles.qrBtnSelected : {}),
            ...(disabled ? styles.qrBtnDisabled : {}),
          }}
          onClick={() => {
            if (disabled || selected) return
            setSelected(opt.value ?? opt.label)
            onSelect(opt)
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ProductCards({ products, recommendation }) {
  return (
    <div style={styles.cardsOuter}>
      {recommendation && (
        <div style={styles.recBadge}>
          <span style={styles.recStar}>★</span>
          <span style={styles.recLabel}>Top Pick</span>
        </div>
      )}
      <div style={styles.cardsScroll}>
        {products.map((p) => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.card}
          >
            <div style={{ ...styles.cardThumb, background: p.color + '22' }}>
              <span style={{ fontSize: '28px' }}>
                {getProductEmoji(p.store)}
              </span>
            </div>
            <div style={styles.cardInfo}>
              <p style={styles.cardName}>{p.name}</p>
              <p style={styles.cardStore}>{p.store}</p>
              <div style={styles.cardBottom}>
                <span style={styles.cardPrice}>{p.price}</span>
                <span style={styles.cardArrow}>→</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

function getProductEmoji(store) {
  const s = store.toLowerCase()
  if (s.includes('zivame') || s.includes('clovia') || s.includes('enamor') || s.includes('jockey') || s.includes('amante')) return '🛍️'
  if (s.includes('myntra')) return '👗'
  if (s.includes('nykaa')) return '💄'
  if (s.includes('amazon')) return '📦'
  if (s.includes('victoria')) return '🌹'
  if (s.includes('asos')) return '✨'
  if (s.includes('nordstrom')) return '🏬'
  if (s.includes('aerie')) return '🌸'
  if (s.includes('m&s') || s.includes('marks')) return '🇬🇧'
  if (s.includes('john lewis')) return '🏪'
  return '🛍️'
}

// ─── Main Chat component ───────────────────────────────────────────────────────

export default function Chat({ onBack }) {
  const [messages, setMessages] = useState([])
  const [phase, setPhase] = useState('location') // location | upload | analyzing | followup | results | done
  const [region, setRegion] = useState(null)
  const regionRef = useRef(null)
  const [analysis, setAnalysis] = useState(null)
  const [pendingFollowups, setPendingFollowups] = useState([])
  const [followupIdx, setFollowupIdx] = useState(0)
  const [savedToWardrobe, setSavedToWardrobe] = useState(false)
  const [showAttachSheet, setShowAttachSheet] = useState(false)
  const galleryRef = useRef(null)
  const cameraRef = useRef(null)
  const bottomRef = useRef(null)
  const phaseRef = useRef(phase)

  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { regionRef.current = region }, [region])

  // ── Message helpers ──
  const push = useCallback((msg) => {
    setMessages((m) => [...m, { id: mid(), ...msg }])
  }, [])

  const pushTyping = useCallback(() => {
    setMessages((m) => [...m, { id: 'typing', type: 'typing' }])
  }, [])

  const removeTyping = useCallback(() => {
    setMessages((m) => m.filter((msg) => msg.id !== 'typing'))
  }, [])

  // ── Scroll on new messages ──
  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }, [messages])

  // ── Init conversation ──
  useEffect(() => {
    const init = async () => {
      await sleep(500)
      pushTyping()
      await sleep(1100)
      removeTyping()
      push({ from: 'ai', type: 'text', content: "Hey! 👋 I'm your AI stylist. Let's find you the perfect innerwear for your outfit." })
      await sleep(600)
      push({ from: 'ai', type: 'text', content: 'First — where are you shopping from?' })
      await sleep(300)
      push({
        from: 'ai',
        type: 'quick_replies',
        options: [
          { label: '🇮🇳 India', value: 'IN' },
          { label: '🇺🇸 United States', value: 'US' },
          { label: '🇬🇧 United Kingdom', value: 'UK' },
        ],
        onSelectKey: 'location',
      })
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Location selected ──
  const handleLocationSelect = useCallback(async (option) => {
    const r = option.value
    setRegion(r)
    regionRef.current = r

    // Freeze the quick replies by replacing with a confirmed text
    setMessages((m) => m.filter((msg) => msg.type !== 'quick_replies'))
    push({ from: 'user', type: 'text', content: option.label })

    setPhase('upload')

    await sleep(500)
    pushTyping()
    await sleep(1000)
    removeTyping()

    const storeHint =
      r === 'IN' ? 'Zivame, Clovia, or Myntra'
      : r === 'UK' ? 'M&S or ASOS'
      : "Victoria's Secret or Aerie"

    push({ from: 'ai', type: 'text', content: `${REGIONS[r].flag} Great! Now upload your outfit — a screenshot from ${storeHint}, flat lay, or hanger shot all work perfectly.` })
    await sleep(400)
    push({ from: 'ai', type: 'text', content: 'Tap the ＋ button below to attach a photo 📸' })
  }, [push, pushTyping, removeTyping])

  // ── Image file processing ──
  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 12 * 1024 * 1024) {
      push({ from: 'ai', type: 'text', content: 'That image is a bit large. Could you try one under 12MB?' })
      return
    }

    setShowAttachSheet(false)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target.result
      const base64 = dataUrl.split(',')[1]
      const mediaType = file.type || 'image/jpeg'

      push({ from: 'user', type: 'image', src: dataUrl })
      setPhase('analyzing')
      await sleep(300)
      pushTyping()

      try {
        const isDev = window.location.hostname === 'localhost'
        let result

        if (isDev) {
          await sleep(3800)
          result = getMockResult()
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
          await showFollowup(result.followup_questions[0])
        } else {
          setPhase('results')
          await showRecommendation(result, regionRef.current)
        }
      } catch (err) {
        console.error(err)
        removeTyping()
        push({ from: 'ai', type: 'text', content: "Hmm, I couldn't read that image clearly. Try a brighter photo or a screenshot from a shopping app? 🤔" })
        setPhase('upload')
      }
    }
    reader.readAsDataURL(file)
  }, [push, pushTyping, removeTyping]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Show a follow-up question ──
  const showFollowup = useCallback(async (q) => {
    await sleep(600)
    push({ from: 'ai', type: 'text', content: q.question })
    await sleep(300)
    push({
      from: 'ai',
      type: 'quick_replies',
      options: q.options.map((o) => ({ label: o, value: o })),
      onSelectKey: 'followup',
    })
  }, [push])

  // ── Follow-up answered ──
  const handleFollowupSelect = useCallback(async (option) => {
    setMessages((m) => m.filter((msg) => msg.type !== 'quick_replies'))
    push({ from: 'user', type: 'text', content: option.label })

    const nextIdx = followupIdx + 1
    setFollowupIdx(nextIdx)

    if (nextIdx < pendingFollowups.length) {
      // Show next follow-up
      await showFollowup(pendingFollowups[nextIdx])
    } else {
      // All follow-ups done → show results
      setPhase('results')
      await sleep(500)
      pushTyping()
      await sleep(1200)
      removeTyping()
      await showRecommendation(analysis, regionRef.current)
    }
  }, [followupIdx, pendingFollowups, analysis, push, pushTyping, removeTyping, showFollowup]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Show recommendation ──
  const showRecommendation = useCallback(async (result, r) => {
    const primaryProducts = getProducts(result.primary_recommendation.type, r)
    const alt1Products = result.alternatives?.[0] ? getProducts(result.alternatives[0].type, r) : []
    const alt2Products = result.alternatives?.[1] ? getProducts(result.alternatives[1].type, r) : []

    push({ from: 'ai', type: 'text', content: `Here's what works perfectly with your outfit ✨` })
    await sleep(400)
    push({ from: 'ai', type: 'text', content: result.garment_summary })
    await sleep(600)

    // Primary recommendation
    push({ from: 'ai', type: 'text', content: `**${result.primary_recommendation.name}** — ${result.primary_recommendation.reasoning}` })
    await sleep(300)
    push({ from: 'ai', type: 'products', products: primaryProducts, isPrimary: true })

    // Alternatives
    if (alt1Products.length > 0) {
      await sleep(800)
      push({ from: 'ai', type: 'text', content: `Also works: **${result.alternatives[0].name}** — ${result.alternatives[0].reasoning}` })
      await sleep(300)
      push({ from: 'ai', type: 'products', products: alt1Products, isPrimary: false })
    }

    if (alt2Products.length > 0) {
      await sleep(600)
      push({ from: 'ai', type: 'text', content: `Or: **${result.alternatives[1].name}** — ${result.alternatives[1].reasoning}` })
      await sleep(300)
      push({ from: 'ai', type: 'products', products: alt2Products, isPrimary: false })
    }

    // Wardrobe offer
    await sleep(900)
    push({ from: 'ai', type: 'text', content: 'Want to save this look to your wardrobe for next time?' })
    await sleep(300)
    push({
      from: 'ai',
      type: 'quick_replies',
      options: [
        { label: '🗂️ Save to wardrobe', value: 'save' },
        { label: '📸 Try another outfit', value: 'reset' },
      ],
      onSelectKey: 'wardrobe',
    })

    setPhase('done')
  }, [push]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Wardrobe / reset ──
  const handleWardrobeSelect = useCallback(async (option) => {
    setMessages((m) => m.filter((msg) => msg.type !== 'quick_replies'))
    push({ from: 'user', type: 'text', content: option.label })

    if (option.value === 'save') {
      if (analysis) {
        saveToWardrobe({
          analysis,
          savedAt: new Date().toISOString(),
        })
        setSavedToWardrobe(true)
      }
      await sleep(400)
      push({ from: 'ai', type: 'text', content: `Saved! 🗂️ You've got ${getWardrobe().length} look${getWardrobe().length === 1 ? '' : 's'} in your wardrobe.` })
      await sleep(600)
      push({ from: 'ai', type: 'text', content: 'Want to try another outfit?' })
      await sleep(300)
      push({
        from: 'ai',
        type: 'quick_replies',
        options: [{ label: '📸 New outfit', value: 'reset' }],
        onSelectKey: 'reset',
      })
    } else {
      // Reset
      handleReset()
    }
  }, [analysis, push]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = useCallback(async () => {
    setMessages((m) => m.filter((msg) => msg.type !== 'quick_replies'))
    setPhase('upload')
    setAnalysis(null)
    setPendingFollowups([])
    setFollowupIdx(0)
    setSavedToWardrobe(false)
    await sleep(400)
    push({ from: 'ai', type: 'text', content: 'Upload your next outfit! 👗' })
  }, [push])

  // ── Quick reply dispatcher ──
  const handleQuickReply = useCallback((onSelectKey, option) => {
    if (onSelectKey === 'location') handleLocationSelect(option)
    else if (onSelectKey === 'followup') handleFollowupSelect(option)
    else if (onSelectKey === 'wardrobe') handleWardrobeSelect(option)
    else if (onSelectKey === 'reset') handleReset()
  }, [handleLocationSelect, handleFollowupSelect, handleWardrobeSelect, handleReset])

  // ── Render messages ──
  const renderMessage = (msg) => {
    if (msg.type === 'typing') return <TypingDots key="typing" />

    if (msg.from === 'user') {
      if (msg.type === 'image') return <UserImageBubble key={msg.id} src={msg.src} />
      return (
        <UserBubble key={msg.id} content={<span>{renderText(msg.content)}</span>} />
      )
    }

    // AI messages
    if (msg.type === 'quick_replies') {
      return (
        <QuickReplies
          key={msg.id}
          options={msg.options}
          onSelect={(opt) => handleQuickReply(msg.onSelectKey, opt)}
          disabled={phase === 'analyzing'}
        />
      )
    }

    if (msg.type === 'products') {
      return (
        <div key={msg.id} style={styles.productsWrap}>
          <ProductCards products={msg.products} recommendation={msg.isPrimary} />
        </div>
      )
    }

    return (
      <AiBubble key={msg.id} content={<span>{renderText(msg.content)}</span>} />
    )
  }

  // Bold text renderer (simple **bold** support)
  const renderText = (text) => {
    if (!text || !text.includes('**')) return text
    const parts = text.split(/\*\*(.+?)\*\*/)
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    )
  }

  const canAttach = phase === 'upload' || phase === 'done'

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div style={styles.headerCenter}>
          <p style={styles.headerLabel}>VIRTUAL STYLIST</p>
          <div style={styles.onlineDot} />
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Message thread */}
      <div style={styles.thread}>
        <div style={styles.threadInner}>
          {messages.map(renderMessage)}
          <div ref={bottomRef} style={{ height: 8 }} />
        </div>
      </div>

      {/* Input bar */}
      <div style={styles.inputBar}>
        <button
          style={{ ...styles.attachBtn, ...(canAttach ? {} : styles.attachBtnDisabled) }}
          onClick={() => canAttach && setShowAttachSheet(true)}
        >
          ＋
        </button>
        <div style={styles.inputField}>
          <span style={styles.inputPlaceholder}>
            {phase === 'upload' ? 'Tap ＋ to upload your outfit' :
             phase === 'analyzing' ? 'Analysing your outfit…' :
             phase === 'location' ? 'Choose your location above' :
             'Message your stylist…'}
          </span>
        </div>
        <button style={styles.sendBtn}>↑</button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => processFile(e.target.files[0])}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => processFile(e.target.files[0])}
      />

      {/* Attach bottom sheet */}
      {showAttachSheet && (
        <div style={styles.sheetOverlay} onClick={() => setShowAttachSheet(false)}>
          <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.sheetHandle} />
            <p style={styles.sheetTitle}>Add your outfit</p>
            <button
              style={styles.sheetBtn}
              onClick={() => { setShowAttachSheet(false); galleryRef.current?.click() }}
            >
              <span style={styles.sheetBtnIcon}>🖼️</span>
              <span>Choose from gallery</span>
            </button>
            <button
              style={styles.sheetBtn}
              onClick={() => { setShowAttachSheet(false); cameraRef.current?.click() }}
            >
              <span style={styles.sheetBtnIcon}>📷</span>
              <span>Take a photo</span>
            </button>
            <button style={styles.sheetCancel} onClick={() => setShowAttachSheet(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Mock data (dev only) ──────────────────────────────────────────────────────
function getMockResult() {
  return {
    garment_type: 'deep_v_dress',
    garment_summary: 'A deep V-neck dress with spaghetti straps — elegant, flowy, and semi-sheer through the bodice.',
    attributes: {
      neckline: 'deep V-neck',
      back_style: 'open back',
      straps: 'spaghetti straps',
      fabric_opacity: 'semi-sheer',
      fit: 'fitted bodice, flowy skirt',
    },
    needs_followup: true,
    followup_questions: [
      {
        question: "What's the occasion for this dress?",
        options: ['Casual day out', 'Date night', 'Formal event', 'Wedding guest'],
      },
    ],
    primary_recommendation: {
      type: 'backless_adhesive_bra',
      name: 'Backless Adhesive Bra',
      reasoning: 'The deep V and open back rule out any traditional bra. An adhesive bra gives lift and stays completely invisible under the neckline and back.',
    },
    alternatives: [
      {
        type: 'nipple_covers',
        name: 'Nipple Covers',
        reasoning: 'For a completely free feeling — silicone covers are invisible and perfect for open-back styles.',
      },
      {
        type: 'fashion_tape',
        name: 'Fashion Tape',
        reasoning: 'For extra security along the V-neckline to keep the fabric in place all evening.',
      },
    ],
  }
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const bubble = {
  aiWrap: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    maxWidth: '82%',
    animation: 'messageIn 0.3s ease',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    flexShrink: 0,
    marginBottom: '2px',
  },
  ai: {
    background: 'var(--bubble-ai)',
    borderRadius: '18px 18px 18px 4px',
    padding: '12px 16px',
    fontSize: '14px',
    color: 'var(--text)',
    lineHeight: '1.55',
    wordBreak: 'break-word',
  },
  userWrap: {
    display: 'flex',
    justifyContent: 'flex-end',
    animation: 'messageIn 0.3s ease',
  },
  user: {
    background: 'var(--bubble-user)',
    border: '1.5px solid var(--bubble-user-border)',
    borderRadius: '18px 18px 4px 18px',
    padding: '12px 16px',
    fontSize: '14px',
    color: 'var(--text)',
    lineHeight: '1.55',
    maxWidth: '75%',
    wordBreak: 'break-word',
  },
  userImg: {
    borderRadius: '16px 16px 4px 16px',
    overflow: 'hidden',
    maxWidth: '220px',
    border: '1.5px solid var(--bubble-user-border)',
  },
}

const styles = {
  container: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: 'var(--text-2)',
    background: 'transparent',
    borderRadius: '50%',
    flexShrink: 0,
  },
  headerCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  headerLabel: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '2.5px',
    color: 'var(--text)',
    textTransform: 'uppercase',
  },
  onlineDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#22c55e',
  },
  thread: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '0 0 12px',
  },
  threadInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '20px 16px 8px',
  },
  dotsRow: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
    height: '16px',
  },
  dot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--text-3)',
    animation: 'typingBounce 1.2s ease-in-out infinite',
  },
  uploadedImg: {
    width: '100%',
    maxHeight: '280px',
    objectFit: 'cover',
    display: 'block',
  },
  qrWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    paddingLeft: '36px',
    animation: 'messageIn 0.3s ease',
  },
  qrBtn: {
    background: 'var(--surface)',
    border: '1.5px solid var(--border-light)',
    borderRadius: '20px',
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-2)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'var(--font-sans)',
    whiteSpace: 'nowrap',
  },
  qrBtnSelected: {
    background: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: 'white',
  },
  qrBtnDisabled: {
    opacity: 0.5,
    cursor: 'default',
  },
  productsWrap: {
    paddingLeft: '36px',
    animation: 'messageIn 0.3s ease',
  },
  cardsOuter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  recBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  recStar: {
    color: '#f59e0b',
    fontSize: '12px',
  },
  recLabel: {
    fontSize: '10px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: 'var(--text-3)',
    fontWeight: '600',
  },
  cardsScroll: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '4px',
    scrollSnapType: 'x mandatory',
  },
  card: {
    background: 'var(--surface)',
    borderRadius: '14px',
    border: '1px solid var(--border)',
    minWidth: '148px',
    maxWidth: '148px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    textDecoration: 'none',
    transition: 'transform 0.15s ease',
  },
  cardThumb: {
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    padding: '10px 12px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    flex: 1,
  },
  cardName: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text)',
    lineHeight: '1.3',
  },
  cardStore: {
    fontSize: '11px',
    color: 'var(--text-3)',
  },
  cardBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '6px',
  },
  cardPrice: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--accent)',
  },
  cardArrow: {
    fontSize: '12px',
    color: 'var(--text-3)',
  },
  inputBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    background: 'var(--surface)',
    borderTop: '1px solid var(--border)',
    position: 'sticky',
    bottom: 0,
    zIndex: 10,
  },
  attachBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
    border: 'none',
    fontFamily: 'var(--font-sans)',
    transition: 'opacity 0.15s ease',
  },
  attachBtnDisabled: {
    opacity: 0.35,
    cursor: 'default',
  },
  inputField: {
    flex: 1,
    background: 'var(--surface-2)',
    borderRadius: '20px',
    padding: '10px 16px',
    border: '1px solid var(--border)',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
  },
  inputPlaceholder: {
    fontSize: '13px',
    color: 'var(--text-3)',
  },
  sendBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    flexShrink: 0,
    border: 'none',
  },
  sheetOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-end',
    animation: 'fadeIn 0.2s ease',
  },
  sheet: {
    background: 'var(--surface)',
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
    background: 'var(--border)',
    margin: '0 auto 16px',
  },
  sheetTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-3)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  sheetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '18px 4px',
    borderBottom: '1px solid var(--border)',
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--text)',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
  sheetBtnIcon: {
    fontSize: '22px',
  },
  sheetCancel: {
    marginTop: '8px',
    padding: '14px',
    fontSize: '14px',
    color: 'var(--text-3)',
    background: 'transparent',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    textAlign: 'center',
    width: '100%',
  },
}
