import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })

// TEST_MODE je vypnutý, dokud není secret explicitně nastaven na "true".
const isTestMode = () => (Deno.env.get('TEST_MODE') ?? 'false').trim().toLowerCase() === 'true'

// Časově konstantní porovnání, aby nešlo heslo hádat po znacích.
const safeEqual = (a: string, b: string) => {
  const ab = new TextEncoder().encode(a)
  const bb = new TextEncoder().encode(b)
  if (ab.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i]
  return diff === 0
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const action = typeof body?.action === 'string' ? body.action : 'status'

    if (action === 'status') {
      return json({ testMode: isTestMode() })
    }

    if (action === 'verify') {
      if (!isTestMode()) {
        return json({ success: false, error: 'Testovací režim není aktivní.' }, 403)
      }

      const expected = Deno.env.get('ACCESS_PASSWORD') ?? ''
      const password = typeof body?.password === 'string' ? body.password : ''

      if (!expected) {
        return json({ success: false, error: 'Přístupové heslo není nastaveno.' }, 500)
      }
      if (!password || password.length > 200) {
        return json({ success: false, error: 'Zadejte přístupové heslo.' }, 400)
      }
      if (!safeEqual(password, expected)) {
        return json({ success: false, error: 'Nesprávné heslo.' }, 401)
      }

      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 dní
      return json({ success: true, expiresAt })
    }

    return json({ success: false, error: 'Neznámá akce.' }, 400)
  } catch (error) {
    console.error('access-gate error:', error)
    return json({ success: false, error: 'Neznámá chyba' }, 500)
  }
})
