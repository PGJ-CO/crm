import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DENVER_PERMITS_API = "https://www.denvergov.org/media/gis/DataCatalog/building_permits/csv/building_permits.csv"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const response = await fetch(DENVER_PERMITS_API)
    if (!response.ok) {
      throw new Error(`Denver API returned ${response.status}`)
    }
    const csvText = await response.text()

    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

    const permits = lines.slice(1, 101)
      .map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((h, i) => { row[h] = values[i] || '' })

        return {
          permit_number: row['PERMIT_NUM'] || row['permit_number'] || values[0] || null,
          address: row['ADDRESS'] || row['address'] || values[1] || '',
          permit_type: row['PERMIT_TYPE'] || row['permit_type'] || values[2] || null,
          issue_date: row['ISSUE_DATE'] || row['issue_date'] || values[3] || null,
          status: row['STATUS'] || row['status'] || values[4] || 'issued',
          valuation_amount: parseFloat(row['VALUATION'] || row['valuation'] || values[5] || '0') || null,
          raw_data: row,
        }
      })
      .filter(p => p.address && p.address.length > 2)

    if (permits.length === 0) {
      return new Response(
        JSON.stringify({ success: true, imported: 0, message: 'No valid permits found in CSV' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error } = await supabase
      .from('building_permits')
      .upsert(permits, {
        onConflict: 'permit_number',
        ignoreDuplicates: false,
      })

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        imported: permits.length,
        message: 'Denver permits synced successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
