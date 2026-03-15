import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DENVER_CRIME_API = "https://www.denvergov.org/media/gis/DataCatalog/crime/csv/crime.csv"

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: syncLog } = await supabase
      .from('data_sync_log')
      .insert({ sync_type: 'crime_data', status: 'running' })
      .select('id')
      .single()

    const response = await fetch(DENVER_CRIME_API)
    if (!response.ok) {
      throw new Error(`Denver API returned ${response.status}`)
    }

    const csvText = await response.text()
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

    let processed = 0
    let failed = 0
    const batch: any[] = []

    for (const line of lines.slice(1, 301)) {
      try {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((h, i) => { row[h] = values[i] || '' })

        const incidentDate = row['REPORTED_DATE'] || row['incident_date'] || values[0] || null
        const neighborhood = row['NEIGHBORHOOD_ID'] || row['neighborhood'] || values[6] || null

        batch.push({
          incident_date: incidentDate ? incidentDate.split(' ')[0] : null,
          offense_category: row['OFFENSE_CATEGORY_ID'] || row['offense_category'] || values[2] || null,
          crime_type: row['OFFENSE_TYPE_ID'] || row['crime_type'] || values[1] || null,
          address: row['INCIDENT_ADDRESS'] || row['address'] || values[5] || null,
          neighborhood,
          lat: parseFloat(row['GEO_LAT'] || row['lat'] || values[7] || '') || null,
          lng: parseFloat(row['GEO_LON'] || row['lng'] || values[8] || '') || null,
          zip_code: row['ZIP_CODE'] || row['zip_code'] || null,
          raw_data: row,
        })
        processed++
      } catch {
        failed++
      }
    }

    if (batch.length > 0) {
      const { error } = await supabase.from('crime_data').insert(batch)
      if (error) throw error
    }

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
