CREATE INDEX IF NOT EXISTS idx_permits_address ON public.building_permits(address);
CREATE INDEX IF NOT EXISTS idx_permits_issue_date ON public.building_permits(issue_date);
CREATE INDEX IF NOT EXISTS idx_violations_address ON public.code_violations(address);
CREATE INDEX IF NOT EXISTS idx_demographics_zip ON public.demographics(zip_code);

ALTER TABLE public.demographics ADD CONSTRAINT valid_population CHECK (population >= 0);

CREATE TABLE IF NOT EXISTS public.data_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('running', 'completed', 'failed')),
  error_message TEXT
);

ALTER TABLE public.data_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to data_sync_log" ON public.data_sync_log FOR ALL USING (true) WITH CHECK (true);