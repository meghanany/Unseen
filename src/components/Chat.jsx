import { useState, useEffect, useRef, useCallback } from 'react'
import {
  AIBubble, UserBubble, TypingIndicator,
  ProductCard, InputBar, BottomSheet, ChatHeader,
  C, FONT_PUBLIC, FONT_CANELA,
} from './UIComponents'
import { getProducts, REGIONS } from '../data/products'
import { saveToWardrobe, getWardrobe } from '../utils/wardrobe'

// ─── Helpers ──────────────────────────────────────────────────────────────────
let _id = 0
const mid = () => String(++_id)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ─── Landing card (first message) ────────────────────────────────────────────
function LandingCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'vs-msg-in 0.3s ease' }}>
      <p style={{ ...FONT_CANELA, fontSize: 16, lineHeight: '20px', letterSpacing: '0.64px', color: C.textDark, margin: 0 }}>
        Ask me something like...
      </p>
      <div style={{
        background: C.pinkBg,
        border: `1px solid ${C.pinkAccent}`,
        borderRadius: 10,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 295,
      }}>
        <p style={{ ...FONT_PUBLIC(), fontSize: 13, lineHeight: '20px', letterSpacing: '0.52px', color: C.textDark, margin: 0 }}>
          What type of bra can I wear with this top?
        </p>
        {/* Example outfit image placeholder */}
        <div style={{
          width: 147, height: 105,
          borderRadius: 10,
          background: '#f0e8ea',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
        }}>
          👗
        </div>
        <p style={{ ...FONT_PUBLIC(), fontStyle: 'italic', fontSize: 12, lineHeight: '20px', letterSpacing: '0.48px', color: C.textDark, margin: 0 }}>
          PS: Upload an image, screenshot, or lay it flat!
        </p>
      </div>
    </div>
  )
}

// ─── Main Chat ────────────────────────────────────────────────────────────────
export default function Chat({ onBack }) {
  const [messages, setMessages]       = useState([])
  const [isTyping, setIsTyping]       = useState(false)
  const [phase, setPhase]             = useState('upload')
  const [region, setRegion]           = useState(null)
  const regionRef                     = useRef(null)
  const [analysis, setAnalysis]       = useState(null)
  const [followups, setFollowups]     = useState([])
  const [followupIdx, setFollowupIdx] = useState(0)
  const [showSheet, setShowSheet]     = useState(false)
  const galleryRef                    = useRef(null)
  const cameraRef                     = useRef(null)
  const bottomRef                     = useRef(null)
  const phaseRef                      = useRef(phase)

  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { regionRef.current = region }, [region])

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [messages, isTyping])

  const addMsg   = useCallback((msg) => setMessages((m) => [...m, { id: mid(), ...msg }]), [])
  const typing   = useCallback(async (ms = 1000) => { setIsTyping(true); await sleep(ms); setIsTyping(false) }, [])

  // ── Init: show upload prompt first ──
  useEffect(() => {
    const init = async () => {
      await sleep(400)
      addMsg({ type: 'landing' })
    }
    init()
  }, []) // eslint-disable-line

  // ── Action handler (buttons inside AI bubbles) ──
  const handleAction = useCallback(async (action) => {
    const currentPhase = phaseRef.current

    if (currentPhase === 'location') {
      if (action.id === 'other') {
        addMsg({ type: 'user', text: action.label })
        await typing(800)
        addMsg({
          type: 'ai',
          text: 'Which region are you shopping from?',
          actions: [
            { id: 'IN', label: '🇮🇳 India' },
            { id: 'US', label: '🇺🇸 United States' },
            { id: 'UK', label: '🇬🇧 United Kingdom' },
          ],
        })
        return
      }
      // region confirmed
      const r = action.id
      setRegion(r); regionRef.current = r
      setPhase('followup_or_results'); phaseRef.current = 'followup_or_results'
      addMsg({ type: 'user', text: action.label })

      // now check if we have followups pending
      if (followups.length > 0) {
        setPhase('followup'); phaseRef.current = 'followup'
        await typing(900)
        const q = followups[0]
        addMsg({
          type: 'ai',
          text: q.question,
          actions: q.options.map((o) => ({ id: o, label: o })),
        })
      } else if (analysis) {
        setPhase('results'); phaseRef.current = 'results'
        await typing(1200)
        await showRecommendation(analysis, r)
      }

    } else if (currentPhase === 'followup') {
      addMsg({ type: 'user', text: action.label })
      const next = followupIdx + 1
      setFollowupIdx(next)

      if (next < followups.length) {
        await typing(900)
        const q = followups[next]
        addMsg({
          type: 'ai',
          text: q.question,
          actions: q.options.map((o) => ({ id: o, label: o })),
        })
      } else {
        setPhase('results'); phaseRef.current = 'results'
        await typing(1200)
        await showRecommendation(analysis, regionRef.current)
      }

    } else if (currentPhase === 'done') {
      addMsg({ type: 'user', text: action.label })
      if (action.id === 'save') {
        if (analysis) saveToWardrobe({ analysis, savedAt: new Date().toISOString() })
        await typing(600)
        addMsg({ type: 'ai', text: `Saved! 🗂️ You have ${getWardrobe().length} look${getWardrobe().length === 1 ? '' : 's'} in your wardrobe.` })
      } else if (action.id === 'more' || action.id === 'reset') {
        setPhase('upload'); phaseRef.current = 'upload'
        setAnalysis(null); setFollowups([]); setFollowupIdx(0)
        await typing(600)
        addMsg({ type: 'ai', text: 'Upload your next outfit! 👗 Tap + to attach a photo.' })
      }
    }
  }, [followupIdx, followups, analysis, addMsg, typing]) // eslint-disable-line

  // ── Show recommendation ──
  const showRecommendation = useCallback(async (result, r) => {
    const products = getProducts(result.primary_recommendation.type, r).slice(0, 3)
    addMsg({
      type: 'ai',
      text: `Here are the best ${result.primary_recommendation.name.toLowerCase()}s for your ${result.garment_summary}:`,
      products,
    })
    await sleep(800)
    addMsg({
      type: 'ai',
      text: 'Do you like these options or would you like me to suggest more?',
      actions: [
        { id: 'more', label: "I'd like more options!" },
        { id: 'save', label: "No thanks! I'm good!" },
      ],
    })
    setPhase('done'); phaseRef.current = 'done'
  }, [addMsg])

  // ── Process uploaded image ──
  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setShowSheet(false)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target.result
      const base64  = dataUrl.split(',')[1]
      const mediaType = file.type || 'image/jpeg'

      addMsg({ type: 'user', image: dataUrl, text: '' })
      setPhase('analyzing'); phaseRef.current = 'analyzing'
      setIsTyping(true)

      // Run API call in parallel while we ask about location
      let apiPromise
      try {
        const isDev = window.location.hostname === 'localhost'
        if (isDev) {
          apiPromise = sleep(3500).then(() => mockResult())
        } else {
          apiPromise = fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageData: base64, mediaType }),
          }).then(async (res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            return result
          })
        }
      } catch (err) {
        apiPromise = Promise.reject(err)
      }

      // Ask location while API runs
      setIsTyping(false)
      await sleep(300)
      await typing(800)
      setPhase('location'); phaseRef.current = 'location'
      addMsg({
        type: 'ai',
        text: "We've detected your location as India. Is this correct?",
        actions: [
          { id: 'IN',    label: 'Yes, proceed' },
          { id: 'other', label: 'No, I am in a different location' },
        ],
      })

      // Store API result when ready
      apiPromise.then((result) => {
        setAnalysis(result)
        if (result.needs_followup && result.followup_questions?.length > 0) {
          setFollowups(result.followup_questions)
          setFollowupIdx(0)
        }
      }).catch((err) => {
        console.error(err)
        // Will surface the error after location is confirmed
      })
    }
    reader.readAsDataURL(file)
  }, [addMsg, typing, showRecommendation])

  const canAttach = phase === 'upload' || phase === 'done'

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: C.white }}>
      {/* Header */}
      <ChatHeader onClose={onBack} />

      {/* Message thread */}
      <div className="vs-messages" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg) => {
          if (msg.type === 'landing') {
            return <LandingCard key={msg.id} />
          }
          if (msg.type === 'user') {
            return (
              <UserBubble key={msg.id} text={msg.text} image={msg.image} />
            )
          }
          // AI message — may have products below the bubble
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AIBubble
                text={msg.text}
                actions={msg.actions}
                onActionClick={handleAction}
              />
              {msg.products && msg.products.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 0 }}>
                  {msg.products.map((p) => (
                    <ProductCard
                      key={p.id}
                      name={p.name}
                      store={p.store}
                      price={p.price}
                      url={p.url}
                      rating={4.5}
                      ratingCount={59}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <InputBar
        onPlusClick={() => canAttach && setShowSheet(true)}
        disabled={!canAttach}
        placeholder={
          phase === 'analyzing' ? 'Analysing your outfit…'
          : phase === 'location' ? 'Choose your location above'
          : "Type what you're looking for..."
        }
      />

      {/* Hidden file inputs */}
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => processFile(e.target.files[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
        onChange={(e) => processFile(e.target.files[0])} />

      {/* Bottom sheet */}
      <BottomSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        onChooseGallery={() => { setShowSheet(false); galleryRef.current?.click() }}
        onTakePhoto={() => { setShowSheet(false); cameraRef.current?.click() }}
      />
    </div>
  )
}

// ─── Mock (localhost only) ────────────────────────────────────────────────────
function mockResult() {
  return {
    garment_type: 'dress',
    garment_summary: 'black backless dress',
    needs_followup: true,
    followup_questions: [{
      question: "You're looking for a bra that works well with a black backless dress. Do you prefer:",
      options: ['A natural look', 'A push up effect'],
    }],
    primary_recommendation: {
      type: 'boob_tape',
      name: 'Boob Tape',
      reasoning: 'Best for backless styles.',
    },
    alternatives: [
      { type: 'nipple_covers', name: 'Nipple Covers', reasoning: 'For a completely free feeling.' },
      { type: 'backless_adhesive_bra', name: 'Adhesive Bra', reasoning: 'For more structured support.' },
    ],
  }
}
