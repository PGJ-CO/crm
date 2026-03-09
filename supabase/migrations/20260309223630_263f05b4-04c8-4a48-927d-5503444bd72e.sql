
-- Property Snapshots: comprehensive property research data
CREATE TABLE public.property_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  county TEXT,
  beds INTEGER,
  baths NUMERIC(3,1),
  sqft INTEGER,
  lot_sqft INTEGER,
  year_built INTEGER,
  property_type TEXT DEFAULT 'single_family',
  zoning TEXT,
  owner_name TEXT,
  owner_mailing_address TEXT,
  owner_type TEXT DEFAULT 'individual',
  is_absentee BOOLEAN DEFAULT false,
  is_out_of_state BOOLEAN DEFAULT false,
  purchase_date DATE,
  purchase_price NUMERIC(12,2),
  current_value NUMERIC(12,2),
  estimated_equity NUMERIC(12,2),
  equity_percent NUMERIC(5,2),
  mortgage_balance NUMERIC(12,2),
  mortgage_lender TEXT,
  mortgage_rate NUMERIC(5,3),
  mortgage_term INTEGER,
  tax_assessed_value NUMERIC(12,2),
  annual_taxes NUMERIC(10,2),
  tax_delinquent BOOLEAN DEFAULT false,
  tax_delinquent_amount NUMERIC(10,2),
  is_pre_foreclosure BOOLEAN DEFAULT false,
  is_vacant BOOLEAN DEFAULT false,
  has_code_violations BOOLEAN DEFAULT false,
  code_violation_count INTEGER DEFAULT 0,
  is_probate BOOLEAN DEFAULT false,
  is_divorce BOOLEAN DEFAULT false,
  ownership_years INTEGER,
  is_high_equity BOOLEAN DEFAULT false,
  is_tired_landlord BOOLEAN DEFAULT false,
  rental_units INTEGER DEFAULT 0,
  occupancy_status TEXT DEFAULT 'unknown',
  condition TEXT DEFAULT 'unknown',
  arv NUMERIC(12,2),
  rental_value NUMERIC(10,2),
  days_on_market INTEGER,
  last_sale_date DATE,
  last_sale_price NUMERIC(12,2),
  distress_score INTEGER DEFAULT 0,
  data_source TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Skip Trace Results
CREATE TABLE public.skip_trace_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_snapshot_id UUID REFERENCES public.property_snapshots(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  phones JSONB DEFAULT '[]'::jsonb,
  emails JSONB DEFAULT '[]'::jsonb,
  current_address TEXT,
  relatives JSONB DEFAULT '[]'::jsonb,
  associates JSONB DEFAULT '[]'::jsonb,
  is_dnc BOOLEAN DEFAULT false,
  is_litigator BOOLEAN DEFAULT false,
  confidence_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  provider TEXT,
  raw_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal Scores
CREATE TABLE public.deal_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_snapshot_id UUID REFERENCES public.property_snapshots(id) ON DELETE CASCADE,
  lead_id TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  tier TEXT DEFAULT 'cold',
  factors JSONB DEFAULT '{}'::jsonb,
  score_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved Searches for Lead Finder
CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_preset BOOLEAN DEFAULT false,
  category TEXT,
  estimated_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  schedule TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead Lists
CREATE TABLE public.lead_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  source TEXT,
  saved_search_id UUID REFERENCES public.saved_searches(id),
  property_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead List Members (junction table)
CREATE TABLE public.lead_list_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_list_id UUID NOT NULL REFERENCES public.lead_lists(id) ON DELETE CASCADE,
  property_snapshot_id UUID NOT NULL REFERENCES public.property_snapshots(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lead_list_id, property_snapshot_id)
);

-- Heat Map Data (aggregated by zip code)
CREATE TABLE public.heat_map_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zip_code TEXT NOT NULL,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  deal_count INTEGER DEFAULT 0,
  avg_deal_profit NUMERIC(12,2),
  seller_distress_index NUMERIC(5,2) DEFAULT 0,
  buyer_demand_index NUMERIC(5,2) DEFAULT 0,
  investor_activity_index NUMERIC(5,2) DEFAULT 0,
  avg_equity_percent NUMERIC(5,2),
  avg_dom INTEGER,
  property_count INTEGER DEFAULT 0,
  roi_score NUMERIC(5,2) DEFAULT 0,
  trend TEXT DEFAULT 'stable',
  data_period TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Repair Estimates
CREATE TABLE public.repair_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_snapshot_id UUID REFERENCES public.property_snapshots(id) ON DELETE CASCADE,
  lead_id TEXT,
  name TEXT NOT NULL DEFAULT 'New Estimate',
  version INTEGER DEFAULT 1,
  line_items JSONB DEFAULT '[]'::jsonb,
  contingency_percent NUMERIC(5,2) DEFAULT 10,
  subtotal NUMERIC(12,2) DEFAULT 0,
  contingency_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  cost_per_sqft NUMERIC(8,2),
  arv NUMERIC(12,2),
  purchase_price NUMERIC(12,2),
  holding_costs NUMERIC(12,2),
  selling_costs NUMERIC(12,2),
  estimated_profit NUMERIC(12,2),
  roi_percent NUMERIC(8,2),
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_property_snapshots_zip ON public.property_snapshots(zip);
CREATE INDEX idx_property_snapshots_state ON public.property_snapshots(state);
CREATE INDEX idx_property_snapshots_distress ON public.property_snapshots(distress_score DESC);
CREATE INDEX idx_skip_trace_property ON public.skip_trace_results(property_snapshot_id);
CREATE INDEX idx_deal_scores_score ON public.deal_scores(score DESC);
CREATE INDEX idx_deal_scores_property ON public.deal_scores(property_snapshot_id);
CREATE INDEX idx_heat_map_zip ON public.heat_map_data(zip_code);
CREATE INDEX idx_lead_list_members_list ON public.lead_list_members(lead_list_id);
CREATE INDEX idx_repair_estimates_property ON public.repair_estimates(property_snapshot_id);
