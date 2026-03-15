
-- Buy Boxes table
CREATE TABLE public.buy_boxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  strategy_type text NOT NULL DEFAULT 'brrrr',
  description text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  target_states text[] DEFAULT '{}',
  target_cities text[] DEFAULT '{}',
  target_zip_codes text[] DEFAULT '{}',
  target_neighborhoods text[] DEFAULT '{}',
  target_school_districts text[] DEFAULT '{}',
  property_types_allowed text[] DEFAULT '{"single_family","multi_family","condo","townhouse"}',
  min_beds integer,
  min_baths numeric,
  min_sqft integer,
  max_sqft integer,
  min_year_built integer,
  max_purchase_price numeric,
  min_purchase_price numeric,
  max_rehab_budget numeric,
  min_arv numeric,
  min_profit numeric,
  min_profit_margin_pct numeric,
  min_equity_spread numeric,
  max_cash_left_in_deal numeric,
  min_rent numeric,
  min_rent_to_price_ratio numeric,
  preferred_condition_levels text[] DEFAULT '{}',
  preferred_finish_level text,
  target_hold_period_months integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.buy_boxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to buy_boxes" ON public.buy_boxes FOR ALL TO public USING (true) WITH CHECK (true);

-- Buy Box Match Results table
CREATE TABLE public.buy_box_match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buy_box_id uuid REFERENCES public.buy_boxes(id) ON DELETE CASCADE NOT NULL,
  lead_property_id text,
  property_snapshot_id uuid REFERENCES public.property_snapshots(id) ON DELETE SET NULL,
  strategy_type text,
  overall_match_score integer DEFAULT 0,
  location_score integer DEFAULT 0,
  property_type_score integer DEFAULT 0,
  layout_score integer DEFAULT 0,
  price_score integer DEFAULT 0,
  rehab_score integer DEFAULT 0,
  arv_score integer DEFAULT 0,
  strategy_fit_score integer DEFAULT 0,
  school_district_score integer DEFAULT 0,
  deal_margin_score integer DEFAULT 0,
  pass_status text DEFAULT 'fail',
  primary_success_reason text,
  primary_failure_reason text,
  reason_passed_summary text,
  reason_failed_summary text,
  recommended_action text DEFAULT 'review_manually',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.buy_box_match_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to buy_box_match_results" ON public.buy_box_match_results FOR ALL TO public USING (true) WITH CHECK (true);

-- Buy Box Rule Results table
CREATE TABLE public.buy_box_rule_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_result_id uuid REFERENCES public.buy_box_match_results(id) ON DELETE CASCADE NOT NULL,
  buy_box_id uuid REFERENCES public.buy_boxes(id) ON DELETE CASCADE NOT NULL,
  lead_property_id text,
  rule_name text NOT NULL,
  expected_value text,
  actual_value text,
  passed boolean DEFAULT false,
  fail_severity text DEFAULT 'soft_fail',
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.buy_box_rule_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to buy_box_rule_results" ON public.buy_box_rule_results FOR ALL TO public USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_buy_boxes_strategy ON public.buy_boxes(strategy_type);
CREATE INDEX idx_buy_boxes_active ON public.buy_boxes(is_active);
CREATE INDEX idx_match_results_buy_box ON public.buy_box_match_results(buy_box_id);
CREATE INDEX idx_match_results_score ON public.buy_box_match_results(overall_match_score DESC);
CREATE INDEX idx_match_results_status ON public.buy_box_match_results(pass_status);
CREATE INDEX idx_rule_results_match ON public.buy_box_rule_results(match_result_id);
