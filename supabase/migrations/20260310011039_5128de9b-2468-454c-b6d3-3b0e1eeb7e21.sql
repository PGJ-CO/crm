
-- Foreclosures table
CREATE TABLE public.foreclosures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_snapshot_id uuid REFERENCES public.property_snapshots(id),
  address text NOT NULL,
  sale_date date,
  sale_time text,
  opening_bid numeric,
  case_number text,
  legal_description text,
  property_type text,
  estimated_arv numeric,
  opportunity_score numeric,
  status text DEFAULT 'upcoming',
  source text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.foreclosures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to foreclosures" ON public.foreclosures FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_foreclosures_sale_date ON public.foreclosures(sale_date);
CREATE INDEX idx_foreclosures_address ON public.foreclosures(address);

-- Building Permits table
CREATE TABLE public.building_permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_snapshot_id uuid REFERENCES public.property_snapshots(id),
  address text NOT NULL,
  permit_type text,
  permit_number text,
  permit_date date,
  issue_date date,
  valuation_amount numeric,
  contractor_name text,
  status text DEFAULT 'issued',
  work_description text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.building_permits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to building_permits" ON public.building_permits FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_building_permits_address ON public.building_permits(address);

-- Code Violations table
CREATE TABLE public.code_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_snapshot_id uuid REFERENCES public.property_snapshots(id),
  address text NOT NULL,
  violation_type text,
  violation_date date,
  status text DEFAULT 'open',
  description text,
  case_number text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.code_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to code_violations" ON public.code_violations FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_code_violations_address ON public.code_violations(address);

-- Tax Delinquencies table
CREATE TABLE public.tax_delinquencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_snapshot_id uuid REFERENCES public.property_snapshots(id),
  address text NOT NULL,
  parcel_number text,
  tax_year integer,
  amount_owed numeric,
  penalty_interest numeric,
  total_due numeric,
  lien_status text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tax_delinquencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to tax_delinquencies" ON public.tax_delinquencies FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_tax_delinquencies_address ON public.tax_delinquencies(address);

-- Market Trends table
CREATE TABLE public.market_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code text NOT NULL,
  month date NOT NULL,
  median_sale_price numeric,
  homes_sold integer,
  new_listings integer,
  inventory integer,
  days_on_market integer,
  price_per_sqft numeric,
  mom_change numeric,
  yoy_change numeric,
  source text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.market_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to market_trends" ON public.market_trends FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_market_trends_zip ON public.market_trends(zip_code);
CREATE UNIQUE INDEX idx_market_trends_zip_month ON public.market_trends(zip_code, month);

-- Rental Licenses table
CREATE TABLE public.rental_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_snapshot_id uuid REFERENCES public.property_snapshots(id),
  address text NOT NULL,
  license_number text,
  status text DEFAULT 'active',
  issue_date date,
  expiration_date date,
  num_units integer DEFAULT 1,
  owner_name text,
  license_type text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rental_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to rental_licenses" ON public.rental_licenses FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_rental_licenses_address ON public.rental_licenses(address);

-- Evictions table
CREATE TABLE public.evictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_snapshot_id uuid REFERENCES public.property_snapshots(id),
  address text NOT NULL,
  case_number text,
  filing_date date,
  plaintiff text,
  defendant text,
  status text DEFAULT 'pending',
  judgment_amount numeric,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.evictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to evictions" ON public.evictions FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_evictions_address ON public.evictions(address);

-- Demographics table
CREATE TABLE public.demographics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code text NOT NULL,
  year integer NOT NULL,
  population integer,
  median_age numeric,
  median_income numeric,
  poverty_rate numeric,
  employment_rate numeric,
  housing_occupancy_rate numeric,
  median_rent numeric,
  education_bachelors_pct numeric,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.demographics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to demographics" ON public.demographics FOR ALL USING (true) WITH CHECK (true);
CREATE UNIQUE INDEX idx_demographics_zip_year ON public.demographics(zip_code, year);

-- Schools table
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  school_type text,
  rating integer,
  address text,
  zip_code text,
  test_scores numeric,
  student_teacher_ratio numeric,
  enrollment integer,
  lat numeric,
  lng numeric,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to schools" ON public.schools FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_schools_zip ON public.schools(zip_code);

-- Crime Data table
CREATE TABLE public.crime_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_date date,
  crime_type text,
  address text,
  zip_code text,
  neighborhood text,
  offense_category text,
  lat numeric,
  lng numeric,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crime_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to crime_data" ON public.crime_data FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_crime_data_zip ON public.crime_data(zip_code);
CREATE INDEX idx_crime_data_date ON public.crime_data(incident_date);

-- Foreclosure Stats table (monthly PDF data)
CREATE TABLE public.foreclosure_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL,
  new_starts integer,
  releases integer,
  total_activity integer,
  mom_change numeric,
  yoy_change numeric,
  source text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.foreclosure_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to foreclosure_stats" ON public.foreclosure_stats FOR ALL USING (true) WITH CHECK (true);
CREATE UNIQUE INDEX idx_foreclosure_stats_month ON public.foreclosure_stats(month);
