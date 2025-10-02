import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json()
    
    console.log('Proxying WordPress install request to external API')
    
    const response = await fetch('http://api.micek.group/api/index.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    const responseText = await response.text()
    
    let parsedResult
    try {
      parsedResult = JSON.parse(responseText)
    } catch (parseError) {
      const jsonMatch = responseText.match(/\{.*\}/s)
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid response format from API')
      }
    }

    return new Response(
      JSON.stringify(parsedResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in proxy function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
