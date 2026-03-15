import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ACS 5-Year variables: https://api.census.gov/data/2021/acs/acs5/variables.html
const CENSUS_BASE_URL = "https://api.census.gov/data/2021/acs/acs5"
const VARIABLES = [
  'NAME',
  'B01003_001E', // Total population
  'B01002_001E', // Median age
  'B19013_001E', // Median household income
  'B25064_001E', // Median gross rent
  'B15003_022E', // Bachelor's degree count
  'B15003_001E', // Total education population (for pct calc)
  'B23025_002E', // In labor force
  'B23025_001E', // Total labor force population
  'B25002_002E', // Occupied housing units
  'B25002_001E', // Total housing units
  'B17001_002E', // Below poverty
  'B17001_001E', // Total poverty universe
].join(',')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const CENSUS_API_KEY = Deno.env.get('CENSUS_API_KEY')
    if (!CENSUS_API_KEY) {
      throw new Error('CENSUS_API_KEY secret is not configured')
    }

    const { zipCodes } = await req.json()
    if (!zipCodes || !Array.isArray(zipCodes) || zipCodes.length === 0) {
      throw new Error('zipCodes array is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const demographics = []

    for (const zip of zipCodes.slice(0, 50)) {
      try {
        const url = `${CENSUS_BASE_URL}?get=${VARIABLES}&for=zip%20code%20tabulation%20area:${zip}&key=${CENSUS_API_KEY}`
        const response = await fetch(url)

        if (!response.ok) {
          console.error(`Census API error for ${zip}: ${response.status}`)
          continue
        }

        const data = await response.json()
        if (!data || data.length < 2) continue

        const row = data[1]
        const population = parseInt(row[1]) || null
        const medianAge = parseFloat(row[2]) || null
        const medianIncome = parseInt(row[3]) || null
        const medianRent = parseInt(row[4]) || null
        const bachelors = parseInt(row[5]) || 0
        const eduTotal = parseInt(row[6]) || 1
        const inLaborForce = parseInt(row[7]) || 0
        const laborTotal = parseInt(row[8]) || 1
        const occupiedUnits = parseInt(row[9]) || 0
        const totalUnits = parseInt(row[10]) || 1
        const belowPoverty = parseInt(row[11]) || 0
        const povertyTotal = parseInt(row[12]) || 1

        demographics.push({
          zip_code: zip,
          year: 2021,
          population,
          median_age: medianAge,
          median_income: medianIncome,
          median_rent: medianRent,
          education_bachelors_pct: Math.round((bachelors / eduTotal) * 10000) / 100,
          employment_rate: Math.round((inLaborForce / laborTotal) * 10000) / 100,
          housing_occupancy_rate: Math.round((occupiedUnits / totalUnits) * 10000) / 100,
          poverty_rate: Math.round((belowPoverty / povertyTotal) * 10000) / 100,
          raw_data: { source: 'census_acs5_2021', variables: data[0], values: row },
        })

        // Rate limit: ~500 req/day free tier
        await new Promise(resolve => setTimeout(resolve, 250))
      } catch (e) {
        console.error(`Failed to fetch zip ${zip}:`, e.message)
      }
    }

    if (demographics.length === 0) {
      return new Response(
        JSON.stringify({ success: true, imported: 0, message: 'No valid data returned from Census API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error } = await supabase
      .from('demographics')
      .upsert(demographics, {
        onConflict: 'zip_code,year',
        ignoreDuplicates: false,
      })

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        imported: demographics.length,
        message: `Census demographics synced for ${demographics.length} zip codes`,
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
