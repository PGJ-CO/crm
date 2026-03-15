
-- Market Intelligence Engine tables

-- Neighborhood-level aggregated metrics
CREATE TABLE public.neighborhood_market_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text,
  city text,
  zip text,
  neighborhood text,
  school_district text,
  property_type text DEFAULT 'single_family',
  median_sale_price numeric,
  median_price_per_sqft numeric,
  avg_price_per_sqft numeric,
  arv_ceiling_price numeric,
  arv_ceiling_ppsf numeric,
  flip_count integer DEFAULT 0,
  flip_success_rate numeric,
  avg_flip_profit numeric,
  avg_flip_margin_pct numeric,
  avg_days_on_market integer,
  rental_price_low numeric,
  rental_price_avg numeric,
  rental_price_high numeric,
  rent_price_per_sqft numeric,
  avg_rehab_cost_per_sqft numeric,
  renovation_sensitivity_score integer DEFAULT 0,
  strategy_bias text DEFAULT 'mixed',
  monthly_trend_pct numeric,
  yearly_trend_pct numeric,
  data_points integer DEFAULT 0,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.neighborhood_market_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to neighborhood_market_metrics" ON public.neighborhood_market_metrics FOR ALL TO public USING (true) WITH CHECK (true);
CREATE INDEX idx_nmm_zip ON public.neighborhood_market_metrics(zip);
CREATE INDEX idx_nmm_city_state ON public.neighborhood_market_metrics(city, state);

-- Comparable sales data
CREATE TABLE public.market_comp_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood text,
  zip text,
  city text,
  state text,
  address text,
  sale_price numeric,
  price_per_sqft numeric,
  beds integer,
  baths numeric,
  sqft integer,
  year_built integer,
  renovation_level text DEFAULT 'unknown',
  sale_date date,
  days_on_market integer,
  property_type text DEFAULT 'single_family',
  property_snapshot_id uuid REFERENCES public.property_snapshots(id),
  source text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.market_comp_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to market_comp_data" ON public.market_comp_data FOR ALL TO public USING (true) WITH CHECK (true);
CREATE INDEX idx_mcd_zip ON public.market_comp_data(zip);
CREATE INDEX idx_mcd_neighborhood ON public.market_comp_data(neighborhood);

-- Rental listings / comps
CREATE TABLE public.market_rental_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood text,
  zip text,
  city text,
  state text,
  address text,
  rent numeric,
  sqft integer,
  beds integer,
  baths numeric,
  rent_price_per_sqft numeric,
  property_type text DEFAULT 'single_family',
  lease_date date,
  source text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.market_rental_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to market_rental_data" ON public.market_rental_data FOR ALL TO public USING (true) WITH CHECK (true);
CREATE INDEX idx_mrd_zip ON public.market_rental_data(zip);

-- Flip project outcomes for learning
CREATE TABLE public.flip_project_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_snapshot_id uuid REFERENCES public.property_snapshots(id),
  neighborhood text,
  zip text,
  city text,
  state text,
  purchase_price numeric,
  rehab_cost numeric,
  resale_price numeric,
  arv_projection numeric,
  profit numeric,
  margin_pct numeric,
  hold_time_days integer,
  strategy_used text DEFAULT 'mid_flip',
  success_flag boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.flip_project_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to flip_project_outcomes" ON public.flip_project_outcomes FOR ALL TO public USING (true) WITH CHECK (true);
CREATE INDEX idx_fpo_zip ON public.flip_project_outcomes(zip);
