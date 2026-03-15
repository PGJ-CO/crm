
-- Deal Finder Results table
CREATE TABLE public.deal_finder_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_snapshot_id uuid REFERENCES public.property_snapshots(id) ON DELETE CASCADE,
  lead_property_id text,
  buy_box_id uuid REFERENCES public.buy_boxes(id) ON DELETE SET NULL,
  source text DEFAULT 'manual',
  estimated_rehab_low numeric DEFAULT 0,
  estimated_rehab_high numeric DEFAULT 0,
  estimated_rehab numeric DEFAULT 0,
  estimated_arv_low numeric DEFAULT 0,
  estimated_arv numeric DEFAULT 0,
  estimated_arv_high numeric DEFAULT 0,
  estimated_rent numeric DEFAULT 0,
  max_allowable_offer numeric DEFAULT 0,
  estimated_flip_profit numeric DEFAULT 0,
  estimated_cash_left_in_deal numeric DEFAULT 0,
  primary_strategy_fit text DEFAULT 'mid_flip',
  secondary_strategy_fit text,
  buy_box_match_score integer DEFAULT 0,
  rehab_risk_score integer DEFAULT 0,
  arv_confidence_score integer DEFAULT 0,
  deal_score integer DEFAULT 0,
  deal_classification text DEFAULT 'reject',
  rejection_reason text,
  recommended_action text DEFAULT 'review_manually',
  scoring_breakdown jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deal_finder_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to deal_finder_results"
  ON public.deal_finder_results FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_deal_finder_results_snapshot ON public.deal_finder_results(property_snapshot_id);
CREATE INDEX idx_deal_finder_results_classification ON public.deal_finder_results(deal_classification);
CREATE INDEX idx_deal_finder_results_score ON public.deal_finder_results(deal_score DESC);
CREATE INDEX idx_deal_finder_results_strategy ON public.deal_finder_results(primary_strategy_fit);
