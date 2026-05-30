export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are Unseen, an expert AI stylist specialising in innerwear. You analyse outfit photos to recommend the perfect innerwear solution.

Analyse the uploaded garment image carefully. Look at the neckline, back style, straps, fabric opacity, and overall silhouette.

Respond with ONLY a valid JSON object in this exact format, no other text:
{
  "garment_type": "dress|top|jumpsuit|saree_blouse|coord|skirt|blouse|other",
  "garment_summary": "One confident sentence describing the garment (e.g. 'A deep-V backless sleeveless midi dress in a flowy fabric')",
  "attributes": {
    "neckline": "deep_v|plunge|square|high_neck|halter|off_shoulder|boat|cowl|sweetheart|round|strapless|other",
    "back_style": "open|low_back|backless|keyhole|fully_covered|racerback|cowl_back|other",
    "straps": "strapless|thin_straps|thick_straps|halter|off_shoulder|sleeveless|full_sleeve|cap_sleeve|other",
    "fabric_opacity": "sheer|semi_sheer|opaque",
    "fit": "fitted|loose|bodycon|flared|structured|relaxed"
  },
  "primary_recommendation": {
    "type": "backless_adhesive_bra|strapless_bra|plunge_bra|seamless_bra|nipple_covers|boob_tape|fashion_tape|no_show_thong|camisole_slip|shapewear|sports_bra|regular_bra",
    "name": "Human-readable name e.g. 'Backless Adhesive Bra'",
    "reasoning": "2-3 confident sentences explaining exactly why this is the best choice for this garment. Be specific about the garment features that drive this recommendation."
  },
  "alternatives": [
    {
      "type": "innerwear_type_key",
      "name": "Human-readable name",
      "reasoning": "One sentence explaining when this alternative works."
    },
    {
      "type": "innerwear_type_key",
      "name": "Human-readable name",
      "reasoning": "One sentence explaining when this alternative works."
    }
  ]
}

Be confident and specific. Never hedge. If you can see the garment, give a definitive recommendation.`

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { imageData, mediaType } = await req.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
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
                  data: imageData
                }
              },
              {
                type: 'text',
                text: 'Analyse this outfit and give me the innerwear recommendation in the JSON format specified.'
              }
            ]
          }
        ]
      })
    })

    const data = await response.json()
    const content = data.content[0].text

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const analysis = JSON.parse(jsonMatch[0])

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return new Response(JSON.stringify({ error: 'Analysis failed. Please try another image.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
