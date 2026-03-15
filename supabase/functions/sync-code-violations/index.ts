import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DENVER_VIOLATIONS_API = "https://www.denvergov.org/media/gis/DataCatalog/code_violations/csv/code_violations.csv"

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log sync start
    const { data: syncLog } = await supabase
      .from('data_sync_log')
      .insert({ sync_type: 'code_violations', status: 'running' })
      .select('id')
      .single()

    const response = await fetch(DENVER_VIOLATIONS_API)
    if (!response.ok) {
      throw new Error(`Denver API returned ${response.status}`)
    }

    const csvText = await response.text()
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

    let processed = 0
    let failed = 0
    const batch: any[] = []

    for (const line of lines.slice(1, 201)) {
      try {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((h, i) => { row[h] = values[i] || '' })

        const address = row['ADDRESS'] || row['address'] || values[0] || ''
        if (!address || address.length < 3) continue

        batch.push({
          address,
          case_number: row['CASE_NUMBER'] || row['case_number'] || values[1] || null,
          violation_type: row['VIOLATION_TYPE'] || row['type'] || values[2] || null,
          violation_date: row['VIOLATION_DATE'] || row['date'] || values[3] || null,
          status: row['STATUS'] || row['status'] || values[4] || 'open',
          description: row['DESCRIPTION'] || row['description'] || values[5] || null,
          raw_data: row,
        })
        processed++
      } catch {
        failed++
      }
    }

    if (batch.length > 0) {
      const { error } = await supabase.from('code_violations').insert(batch)
      if (error) throw error
    }

    // Log completion
    if (syncLog?.id) {
      await supabase.from('data_sync_log').update({
        status: 'completed',
        records_processed: processed,
        records_failed: failed,
        completed_at: new Date().toISOString(),
      }).eq('id', syncLog.id)
    }

    return new Response(
      JSON.stringify({ success: true, imported: processed, failed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
