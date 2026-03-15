
-- Property snapshots indexes
CREATE INDEX IF NOT EXISTS idx_property_snapshots_address_lower ON property_snapshots(LOWER(property_address));
CREATE INDEX IF NOT EXISTS idx_property_snapshots_updated_at ON property_snapshots(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_snapshots_zip ON property_snapshots(zip);

-- Building permits indexes
CREATE INDEX IF NOT EXISTS idx_building_permits_property_id ON building_permits(property_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_building_permits_address_lower ON building_permits(LOWER(address));
CREATE INDEX IF NOT EXISTS idx_building_permits_issue_date ON building_permits(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_building_permits_permit_number ON building_permits(permit_number);

-- Code violations indexes
CREATE INDEX IF NOT EXISTS idx_code_violations_property_id ON code_violations(property_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_code_violations_address_lower ON code_violations(LOWER(address));
CREATE INDEX IF NOT EXISTS idx_code_violations_case_number ON code_violations(case_number);

-- Foreclosures indexes
CREATE INDEX IF NOT EXISTS idx_foreclosures_address_lower ON foreclosures(LOWER(address));
CREATE INDEX IF NOT EXISTS idx_foreclosures_sale_date ON foreclosures(sale_date DESC);

-- Demographics indexes
CREATE INDEX IF NOT EXISTS idx_demographics_zip ON demographics(zip_code);
CREATE INDEX IF NOT EXISTS idx_demographics_zip_year ON demographics(zip_code, year);

-- Crime data indexes
CREATE INDEX IF NOT EXISTS idx_crime_neighborhood ON crime_data(neighborhood);
CREATE INDEX IF NOT EXISTS idx_crime_zip ON crime_data(zip_code);

-- Data sync log index
CREATE INDEX IF NOT EXISTS idx_sync_log_type_started ON data_sync_log(sync_type, started_at DESC);

-- Lead list members indexes
CREATE INDEX IF NOT EXISTS idx_lead_list_members_list_id ON lead_list_members(lead_list_id);
CREATE INDEX IF NOT EXISTS idx_lead_list_members_snapshot_id ON lead_list_members(property_snapshot_id);

-- Deal finder results indexes
CREATE INDEX IF NOT EXISTS idx_deal_finder_results_snapshot_id ON deal_finder_results(property_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_deal_finder_results_score ON deal_finder_results(deal_score DESC);

-- Tax delinquencies indexes
CREATE INDEX IF NOT EXISTS idx_tax_delinquencies_address_lower ON tax_delinquencies(LOWER(address));
CREATE INDEX IF NOT EXISTS idx_tax_delinquencies_property_id ON tax_delinquencies(property_snapshot_id);

-- Evictions indexes
CREATE INDEX IF NOT EXISTS idx_evictions_address_lower ON evictions(LOWER(address));
CREATE INDEX IF NOT EXISTS idx_evictions_property_id ON evictions(property_snapshot_id);
