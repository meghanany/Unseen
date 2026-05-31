import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '20mb' }))

const SYSTEM_PROMPT = `You are Unseen, an expert AI stylist specialising in innerwear. You analyse outfit photos to recommend the perfect innerwear solution in a conversational chat interface.

Analyse the uploaded garment image carefully. Look at the neckline, back style, straps, fabric opacity, and overall silhouette.

Decide if you need 1 follow-up question to give the best recommendation (max 1 question, max 4 answer options). Only ask a follow-up if the garment is genuinely ambiguous — for example, if the neckline is clear (deep V, strapless, backless), you don't need a follow-up. If it's a basic top or tee, you might want to ask about the occasion or preferred style.

Respond with ONLY a valid JSON object in this exact format, no other text:
{
  "garment_type": "dress|top|jumpsuit|saree_blouse|coord|skirt|blouse|other",
  "garment_summary": "One warm, confident sentence describing what you see",
  "attributes": {
    "neckline": "deep_v|plunge|square|high_neck|halter|off_shoulder|boat|cowl|sweetheart|round|strapless|other",
    "back_style": "open|low_back|backless|keyhole|fully_covered|racerback|cowl_back|other",
    "straps": "strapless|thin_straps|thick_straps|halter|off_shoulder|sleeveless|full_sleeve|cap_sleeve|other",
    "fabric_opacity": "sheer|semi_sheer|opaque",
    "fit": "fitted|loose|bodycon|flared|structured|relaxed"
  },
  "needs_followup": true,
  "followup_questions": [
    {
      "question": "Short, friendly question (max 1 question total)",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }
  ],
  "primary_recommendation": {
    "type": "backless_adhesive_bra|strapless_bra|plunge_bra|seamless_bra|nipple_covers|boob_tape|fashion_tape|no_show_thong|camisole_slip|shapewear|sports_bra|regular_bra",
    "name": "Human-readable name e.g. 'Backless Adhesive Bra'",
    "reasoning": "1-2 confident sentences explaining exactly why this is the best choice."
  },
  "alternatives": [
    {
      "type": "innerwear_type_key",
      "name": "Human-readable name",
      "reasoning": "One sentence on when/why this alternative works."
    },
    {
      "type": "innerwear_type_key",
      "name": "Human-readable name",
      "reasoning": "One sentence on when/why this alternative works."
    }
  ]
}

If you don't need a follow-up, set "needs_followup": false and "followup_questions": [].
Be confident and specific. Never hedge.`

app.post('/api/analyze', async (req, res) => {
  try {
    const { imageData, mediaType } = req.body

    if (!imageData || !mediaType) {
      return res.status(400).json({ error: 'Missing imageData or mediaType' })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageData,
                },
              },
              {
                type: 'text',
                text: 'Analyse this outfit and give me the innerwear recommendation in the JSON format specified.',
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()

    if (data.error) throw new Error(data.error.message)

    const content = data.content[0].text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const analysis = JSON.parse(jsonMatch[0])
    res.json(analysis)
  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({ error: 'Analysis failed. Please try another image.' })
  }
})

app.get('/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Unseen API running on port ${PORT}`))
