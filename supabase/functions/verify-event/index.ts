// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  eventId: string
  title: string
  description?: string
  source_url?: string
}

interface ChatResponse {
  choices: Array<{ message: { content: string } }>
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl      = Deno.env.get('SUPABASE_URL')!
  const supabaseSvcKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const groqKey          = Deno.env.get('GROQ_API_KEY')!

  const db   = createClient(supabaseUrl, supabaseSvcKey)
  const body: RequestBody = await req.json()

  if (!body.eventId || !body.title)
    return new Response(JSON.stringify({ error: 'Missing eventId or title' }), { status: 400 })

  try {
    const prompt = `You are a news verification AI for a conflict/war monitoring platform.

Evaluate the following submission and determine if it is a credible, real conflict or war-related event (not fictional, satirical, or spam).

Title: ${body.title}
${body.description ? `Description: ${body.description}` : ''}
${body.source_url ? `Source URL: ${body.source_url}` : ''}

Respond ONLY with a JSON object in this exact format:
{"confidence": 0.0, "is_credible": false, "reason": "brief reason"}

Where confidence is a float from 0.0 to 1.0 (1.0 = definitely a real conflict event).`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 120,
        response_format: { type: 'json_object' },
      }),
    })

    const data: ChatResponse = await res.json()
    const raw    = data.choices?.[0]?.message?.content?.trim() ?? '{}'
    const result = JSON.parse(raw)

    const confidence = Math.min(1, Math.max(0, Number(result.confidence) || 0))
    const approved   = confidence >= 0.75

    await db
      .from('events')
      .update({ status: approved ? 'approved' : 'pending', ai_verified: approved, ai_confidence: confidence })
      .eq('id', body.eventId)

    return new Response(
      JSON.stringify({ eventId: body.eventId, confidence, approved }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    await db
      .from('events')
      .update({ status: 'pending', ai_verified: false })
      .eq('id', body.eventId)

    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
