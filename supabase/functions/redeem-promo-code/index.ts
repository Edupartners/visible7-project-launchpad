import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Chybí promo kód.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Klient ověřený přihlašovacím tokenem z requestu - zjistíme, KDO kód uplatňuje
    const authHeader = req.headers.get('Authorization')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    )

    const { data: userData, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Musíte být přihlášeni.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }
    const userId = userData.user.id

    // Service role klient - jediný, kdo smí číst/psát do promo_codes a subscriptions
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const normalizedCode = code.trim().toUpperCase()

    const { data: promo, error: promoError } = await adminClient
      .from('promo_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle()

    if (promoError) throw promoError

    if (!promo) {
      return new Response(
        JSON.stringify({ success: false, error: 'Neplatný promo kód.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Tento promo kód už vypršel.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 410 }
      )
    }

    if (promo.max_uses !== null && promo.times_used >= promo.max_uses) {
      return new Response(
        JSON.stringify({ success: false, error: 'Tento promo kód byl už plně využit.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 410 }
      )
    }

    // Prodloužení přístupu o extends_access_days dní ode dneška
    const newAccessUntil = new Date()
    newAccessUntil.setDate(newAccessUntil.getDate() + promo.extends_access_days)

    const { error: updateError } = await adminClient
      .from('subscriptions')
      .update({
        status: 'active',
        access_until: newAccessUntil.toISOString(),
        promo_code_used: normalizedCode,
      })
      .eq('user_id', userId)

    if (updateError) throw updateError

    await adminClient
      .from('promo_codes')
      .update({ times_used: promo.times_used + 1 })
      .eq('id', promo.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Promo kód uplatněn! Přístup máte aktivní do ${newAccessUntil.toLocaleDateString('cs-CZ')}.`,
        accessUntil: newAccessUntil.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in redeem-promo-code function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Neznámá chyba' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
