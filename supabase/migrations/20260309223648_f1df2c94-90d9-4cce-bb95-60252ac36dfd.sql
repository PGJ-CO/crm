
-- Enable RLS on all new tables
ALTER TABLE public.property_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skip_trace_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heat_map_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_estimates ENABLE ROW LEVEL SECURITY;

-- Public read access policies (these are internal CRM data tables, accessible to authenticated users)
-- For now allow all access since auth isn't set up yet; will tighten when RBAC is added in Phase 3
CREATE POLICY "Allow all access to property_snapshots" ON public.property_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to skip_trace_results" ON public.skip_trace_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to deal_scores" ON public.deal_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to saved_searches" ON public.saved_searches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lead_lists" ON public.lead_lists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lead_list_members" ON public.lead_list_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to heat_map_data" ON public.heat_map_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to repair_estimates" ON public.repair_estimates FOR ALL USING (true) WITH CHECK (true);
