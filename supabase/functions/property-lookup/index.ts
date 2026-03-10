const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return new Response(
        JSON.stringify({ success: false, error: 'A valid property address is required (minimum 5 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedAddress = address.trim().toLowerCase();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache: look for matching address updated within last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: cached, error: cacheError } = await supabase
      .from('property_snapshots')
      .select('*')
      .ilike('property_address', `%${normalizedAddress}%`)
      .gte('updated_at', thirtyDaysAgo.toISOString())
      .limit(1)
      .maybeSingle();

    if (cacheError) {
      console.error('Cache lookup error:', cacheError);
    }

    if (cached) {
      console.log('Cache hit for:', normalizedAddress);
      return new Response(
        JSON.stringify({
          success: true,
          source: 'cache',
          data: cached,
          cached_at: cached.updated_at,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Also check for older cached results (> 30 days) as stale data
    const { data: stale } = await supabase
      .from('property_snapshots')
      .select('*')
      .ilike('property_address', `%${normalizedAddress}%`)
      .limit(1)
      .maybeSingle();

    if (stale) {
      console.log('Stale cache hit for:', normalizedAddress);
      return new Response(
        JSON.stringify({
          success: true,
          source: 'stale_cache',
          data: stale,
          cached_at: stale.updated_at,
          stale: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No cache hit — in production, this is where you'd call ATTOM/CoreLogic/PropStream API
    // For now, return not found with guidance
    console.log('No data found for:', normalizedAddress);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Property not found. Data will be available once a property data provider (ATTOM, CoreLogic, PropStream) is connected.',
        address: address.trim(),
      }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Property lookup error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Lookup failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
