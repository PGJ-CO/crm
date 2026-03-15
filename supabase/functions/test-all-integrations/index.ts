import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BASE_URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

async function testFunction(name: string, opts?: RequestInit): Promise<{ name: string; status: string; ms: number; error?: string }> {
  const start = Date.now()
  try {
    const res = await fetch(`${BASE_URL}/functions/v1/${name}`, {
      method: opts?.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        ...(opts?.headers as Record<string, string> || {}),
      },
      body: opts?.body,
    })
    const body = await res.json().catch(() => null)
    return {
      name,
      status: res.ok ? 'pass' : 'fail',
      ms: Date.now() - start,
      error: res.ok ? undefined : (body?.error || `HTTP ${res.status}`),
    }
  } catch (e) {
    return { name, status: 'error', ms: Date.now() - start, error: e.message }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const results = await Promise.all([
    testFunction('sync-denver-permits', { body: '{}' }),
    testFunction('sync-census-data', { body: JSON.stringify({ zipCodes: ['80202'] }) }),
    testFunction('property-lookup', { body: JSON.stringify({ address: '1234 Main St, Denver, CO' }) }),
    testFunction('sync-code-violations', { body: '{}' }),
    testFunction('sync-crime-data', { body: '{}' }),
  ])

  const passed = results.filter(r => r.status === 'pass').length
  const summary = `${passed}/${results.length} passed`

  // Log to data_sync_log
  const supabase = createClient(BASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  await supabase.from('data_sync_log').insert({
    sync_type: 'integration_test',
    status: passed === results.length ? 'completed' : 'failed',
    records_processed: passed,
    records_failed: results.length - passed,
    completed_at: new Date().toISOString(),
  })

  return new Response(
    JSON.stringify({ summary, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
