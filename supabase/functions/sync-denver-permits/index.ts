import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const DENVER_APIS = {
  permits: "https://www.denvergov.org/media/gis/DataCatalog/building_permits/csv/building_permits.csv",
  violations: "https://www.denvergov.org/media/gis/DataCatalog/code_violations/csv/code_violations.csv",
}

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
    const { data: logEntry } = await supabase
      .from('data_sync_log')
      .insert({
        sync_type: 'denver_open_data',
        status: 'running',
      })
      .select()
      .single()

    const results: { permits: number; violations: number; errors: string[] } = {
      permits: 0,
      violations: 0,
      errors: [],
    }

    // Sync Building Permits
    try {
      console.log('Fetching building permits...')
      const permitsResponse = await fetch(DENVER_APIS.permits)
      if (!permitsResponse.ok) throw new Error(`Denver permits API returned ${permitsResponse.status}`)
      const permitsCSV = await permitsResponse.text()
      const permits = parseCSV(permitsCSV).slice(0, 1000)

      console.log(`Parsed ${permits.length} permits`)

      const mapped = permits
        .map(p => ({
          permit_number: p.PERMIT_NUMBER || p.PERMIT_NUM || p.permit_number || null,
          address: p.ADDRESS || p.address || '',
          permit_type: p.PERMIT_TYPE || p.permit_type || null,
          issue_date: parseDate(p.ISSUE_DATE || p.issue_date),
          status: p.STATUS || p.status || 'issued',
          valuation_amount: parseFloat(p.VALUATION || p.valuation || '0') || null,
          work_description: p.WORK_DESCRIPTION || p.work_description || null,
          contractor_name: p.CONTRACTOR_NAME || p.contractor_name || null,
          raw_data: p,
        }))
        .filter(p => p.address && p.address.length > 2)

      if (mapped.length > 0) {
        const { error: permitsError } = await supabase
          .from('building_permits')
          .upsert(mapped, { onConflict: 'permit_number', ignoreDuplicates: false })

        if (permitsError) {
          console.error('Permits upsert error:', permitsError)
          results.errors.push(`Permits: ${permitsError.message}`)
        } else {
          results.permits = mapped.length
        }
      }
    } catch (error) {
      console.error('Permits fetch error:', error)
      results.errors.push(`Permits fetch: ${(error as Error).message}`)
    }

    // Sync Code Violations
    try {
      console.log('Fetching code violations...')
      const violationsResponse = await fetch(DENVER_APIS.violations)
      if (!violationsResponse.ok) throw new Error(`Denver violations API returned ${violationsResponse.status}`)
      const violationsCSV = await violationsResponse.text()
      const violations = parseCSV(violationsCSV).slice(0, 1000)

      console.log(`Parsed ${violations.length} violations`)

      const mapped = violations
        .map(v => ({
          case_number: v.CASE_NUMBER || v.case_number || null,
          address: v.ADDRESS || v.address || '',
          violation_type: v.VIOLATION_TYPE || v.violation_type || null,
          violation_date: parseDate(v.VIOLATION_DATE || v.violation_date),
          status: v.STATUS || v.status || 'open',
          description: v.DESCRIPTION || v.description || null,
          raw_data: v,
        }))
        .filter(v => v.address && v.address.length > 2)

      if (mapped.length > 0) {
        const { error: violationsError } = await supabase
          .from('code_violations')
          .upsert(mapped, { onConflict: 'case_number', ignoreDuplicates: false })

        if (violationsError) {
          console.error('Violations upsert error:', violationsError)
          results.errors.push(`Violations: ${violationsError.message}`)
        } else {
          results.violations = mapped.length
        }
      }
    } catch (error) {
      console.error('Violations fetch error:', error)
      results.errors.push(`Violations fetch: ${(error as Error).message}`)
    }

    // Update sync log
    if (logEntry?.id) {
      await supabase
        .from('data_sync_log')
        .update({
          records_processed: results.permits + results.violations,
          records_failed: results.errors.length,
          status: results.errors.length > 0 ? 'failed' : 'completed',
          completed_at: new Date().toISOString(),
          error_message: results.errors.length > 0 ? results.errors.join('; ') : null,
        })
        .eq('id', logEntry.id)
    }

    return new Response(
      JSON.stringify({
        success: results.errors.length === 0,
        results,
        message: 'Denver data sync completed',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Fatal error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function parseDate(val: string | undefined | null): string | null {
  if (!val) return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
    const obj: Record<string, string> = {}
    headers.forEach((header, i) => {
      obj[header] = values[i] || ''
    })
    return obj
  }).filter(obj => Object.values(obj).some(v => v !== ''))
}
