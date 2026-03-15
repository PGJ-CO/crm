// Buy Box Scoring & Matching Engine

export interface BuyBox {
  id: string;
  name: string;
  strategy_type: 'brrrr' | 'mid_flip' | 'high_flip';
  description?: string;
  is_default: boolean;
  is_active: boolean;
  target_states: string[];
  target_cities: string[];
  target_zip_codes: string[];
  target_neighborhoods: string[];
  target_school_districts: string[];
  property_types_allowed: string[];
  min_beds?: number;
  min_baths?: number;
  min_sqft?: number;
  max_sqft?: number;
  min_year_built?: number;
  max_purchase_price?: number;
  min_purchase_price?: number;
  max_rehab_budget?: number;
  min_arv?: number;
  min_profit?: number;
  min_profit_margin_pct?: number;
  min_equity_spread?: number;
  max_cash_left_in_deal?: number;
  min_rent?: number;
  min_rent_to_price_ratio?: number;
  preferred_condition_levels: string[];
  preferred_finish_level?: string;
  target_hold_period_months?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadProperty {
  id: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  neighborhood?: string;
  school_district?: string;
  asking_price?: number;
  sqft?: number;
  beds?: number;
  baths?: number;
  year_built?: number;
  property_type?: string;
  condition_estimate?: string;
  estimated_rehab?: number;
  estimated_arv?: number;
  estimated_rent?: number;
  listing_notes?: string;
  source?: string;
  pipeline_stage?: string;
}

export interface RuleResult {
  rule_name: string;
  expected_value: string;
  actual_value: string;
  passed: boolean;
  fail_severity: 'soft_fail' | 'hard_fail';
  explanation: string;
}

export interface MatchResult {
  buy_box_id: string;
  lead_property_id: string;
  strategy_type: string;
  overall_match_score: number;
  location_score: number;
  property_type_score: number;
  layout_score: number;
  price_score: number;
  rehab_score: number;
  arv_score: number;
  strategy_fit_score: number;
  school_district_score: number;
  deal_margin_score: number;
  pass_status: 'pass' | 'borderline' | 'fail';
  primary_success_reason: string;
  primary_failure_reason: string;
  reason_passed_summary: string;
  reason_failed_summary: string;
  recommended_action: string;
  rules: RuleResult[];
}

// Weights for scoring categories (total = 100)
const WEIGHTS = {
  location: 15,
  property_type: 10,
  layout: 10,
  price: 15,
  rehab: 15,
  arv: 10,
  strategy_fit: 10,
  school_district: 5,
  deal_margin: 10,
};

function arrayContains(arr: string[] | undefined, value: string | undefined): boolean {
  if (!arr || arr.length === 0) return true; // no restriction
  if (!value) return false;
  return arr.map(v => v.toLowerCase()).includes(value.toLowerCase());
}

function scoreLocation(bb: BuyBox, prop: LeadProperty): { score: number; rules: RuleResult[] } {
  const rules: RuleResult[] = [];
  let checks = 0, passed = 0;

  if (bb.target_zip_codes.length > 0) {
    checks++;
    const ok = arrayContains(bb.target_zip_codes, prop.zip);
    if (ok) passed++;
    rules.push({ rule_name: 'zip_code_allowed', expected_value: bb.target_zip_codes.join(', '), actual_value: prop.zip || 'N/A', passed: ok, fail_severity: 'hard_fail', explanation: ok ? 'Property in target zip code' : 'Property outside target zip codes' });
  }
  if (bb.target_cities.length > 0) {
    checks++;
    const ok = arrayContains(bb.target_cities, prop.city);
    if (ok) passed++;
    rules.push({ rule_name: 'city_allowed', expected_value: bb.target_cities.join(', '), actual_value: prop.city || 'N/A', passed: ok, fail_severity: 'hard_fail', explanation: ok ? 'Property in target city' : 'Property outside target cities' });
  }
  if (bb.target_states.length > 0) {
    checks++;
    const ok = arrayContains(bb.target_states, prop.state);
    if (ok) passed++;
    rules.push({ rule_name: 'state_allowed', expected_value: bb.target_states.join(', '), actual_value: prop.state || 'N/A', passed: ok, fail_severity: 'hard_fail', explanation: ok ? 'Property in target state' : 'Property outside target states' });
  }

  const score = checks === 0 ? WEIGHTS.location : Math.round((passed / checks) * WEIGHTS.location);
  return { score, rules };
}

function scorePropertyType(bb: BuyBox, prop: LeadProperty): { score: number; rules: RuleResult[] } {
  const ok = arrayContains(bb.property_types_allowed, prop.property_type);
  return {
    score: ok ? WEIGHTS.property_type : 0,
    rules: [{ rule_name: 'property_type_allowed', expected_value: bb.property_types_allowed.join(', '), actual_value: prop.property_type || 'N/A', passed: ok, fail_severity: 'hard_fail', explanation: ok ? 'Property type matches criteria' : 'Property type not allowed' }],
  };
}

function scoreLayout(bb: BuyBox, prop: LeadProperty): { score: number; rules: RuleResult[] } {
  const rules: RuleResult[] = [];
  let checks = 0, passed = 0;

  if (bb.min_beds != null && prop.beds != null) {
    checks++;
    const ok = prop.beds >= bb.min_beds;
    if (ok) passed++;
    rules.push({ rule_name: 'min_beds', expected_value: `≥${bb.min_beds}`, actual_value: String(prop.beds), passed: ok, fail_severity: 'soft_fail', explanation: ok ? 'Beds requirement met' : `Needs ${bb.min_beds} beds, has ${prop.beds}` });
  }
  if (bb.min_baths != null && prop.baths != null) {
    checks++;
    const ok = prop.baths >= bb.min_baths;
    if (ok) passed++;
    rules.push({ rule_name: 'min_baths', expected_value: `≥${bb.min_baths}`, actual_value: String(prop.baths), passed: ok, fail_severity: 'soft_fail', explanation: ok ? 'Baths requirement met' : `Needs ${bb.min_baths} baths, has ${prop.baths}` });
  }
  if (bb.min_sqft != null && prop.sqft != null) {
    checks++;
    const ok = prop.sqft >= bb.min_sqft;
    if (ok) passed++;
    rules.push({ rule_name: 'min_sqft', expected_value: `≥${bb.min_sqft}`, actual_value: String(prop.sqft), passed: ok, fail_severity: 'soft_fail', explanation: ok ? 'Sqft requirement met' : `Needs ${bb.min_sqft} sqft, has ${prop.sqft}` });
  }
  if (bb.max_sqft != null && prop.sqft != null) {
    checks++;
    const ok = prop.sqft <= bb.max_sqft;
    if (ok) passed++;
    rules.push({ rule_name: 'max_sqft', expected_value: `≤${bb.max_sqft}`, actual_value: String(prop.sqft), passed: ok, fail_severity: 'soft_fail', explanation: ok ? 'Max sqft requirement met' : `Exceeds max ${bb.max_sqft} sqft` });
  }

  const score = checks === 0 ? WEIGHTS.layout : Math.round((passed / checks) * WEIGHTS.layout);
  return { score, rules };
}

function scorePrice(bb: BuyBox, prop: LeadProperty): { score: number; rules: RuleResult[] } {
  const rules: RuleResult[] = [];
  let checks = 0, passed = 0;

  if (bb.max_purchase_price != null && prop.asking_price != null) {
    checks++;
    const ok = prop.asking_price <= bb.max_purchase_price;
    if (ok) passed++;
    rules.push({ rule_name: 'max_purchase_price', expected_value: `≤$${bb.max_purchase_price.toLocaleString()}`, actual_value: `$${prop.asking_price.toLocaleString()}`, passed: ok, fail_severity: 'hard_fail', explanation: ok ? 'Price within budget' : 'Purchase price exceeds maximum' });
  }
  if (bb.min_purchase_price != null && prop.asking_price != null) {
    checks++;
    const ok = prop.asking_price >= bb.min_purchase_price;
    if (ok) passed++;
    rules.push({ rule_name: 'min_purchase_price', expected_value: `≥$${bb.min_purchase_price.toLocaleString()}`, actual_value: `$${prop.asking_price.toLocaleString()}`, passed: ok, fail_severity: 'soft_fail', explanation: ok ? 'Price above minimum' : 'Purchase price below minimum' });
  }

  const score = checks === 0 ? WEIGHTS.price : Math.round((passed / checks) * WEIGHTS.price);
  return { score, rules };
}

function scoreRehab(bb: BuyBox, prop: LeadProperty): { score: number; rules: RuleResult[] } {
  const rules: RuleResult[] = [];
  if (bb.max_rehab_budget != null && prop.estimated_rehab != null) {
    const ok = prop.estimated_rehab <= bb.max_rehab_budget;
    rules.push({ rule_name: 'max_rehab_budget', expected_value: `≤$${bb.max_rehab_budget.toLocaleString()}`, actual_value: `$${prop.estimated_rehab.toLocaleString()}`, passed: ok, fail_severity: 'soft_fail', explanation: ok ? 'Rehab within budget' : 'Rehab estimate exceeds budget' });
    return { score: ok ? WEIGHTS.rehab : Math.round(WEIGHTS.rehab * 0.3), rules };
  }
  return { score: WEIGHTS.rehab, rules };
}

function scoreArv(bb: BuyBox, prop: LeadProperty): { score: number; rules: RuleResult[] } {
  const rules: RuleResult[] = [];
  if (bb.min_arv != null && prop.estimated_arv != null) {
    const ok = prop.estimated_arv >= bb.min_arv;
    rules.push({ rule_name: 'min_arv', expected_value: `≥$${bb.min_arv.toLocaleString()}`, actual_value: `$${prop.estimated_arv.toLocaleString()}`, passed: ok, fail_severity: 'hard_fail', explanation: ok ? 'ARV meets minimum target' : 'ARV below minimum target' });
    return { score: ok ? WEIGHTS.arv : 0, rules };
  }
  return { score: WEIGHTS.arv, rules };
}

function scoreStrategyFit(bb: BuyBox, prop: LeadProperty): { score: number; rules: RuleResult[] } {
  let fit = WEIGHTS.strategy_fit;
  const rules: RuleResult[] = [];

  if (bb.strategy_type === 'brrrr') {
    // BRRRR prioritizes rental viability
    if (bb.min_rent != null && prop.estimated_rent != null) {
      const ok = prop.estimated_rent >= bb.min_rent;
      if (!ok) fit = Math.round(fit * 0.4);
      rules.push({ rule_name: 'min_rent', expected_value: `≥$${bb.min_rent}`, actual_value: `$${prop.estimated_rent || 'N/A'}`, passed: ok, fail_severity: 'hard_fail', explanation: ok ? 'Rent meets BRRRR minimum' : 'Rent too low for BRRRR strategy' });
    }
  } else if (bb.strategy_type === 'high_flip') {
    // High flip needs strong ARV spread
    if (prop.estimated_arv && prop.asking_price && prop.estimated_rehab) {
      const spread = prop.estimated_arv - prop.asking_price - prop.estimated_rehab;
      const marginPct = (spread / prop.estimated_arv) * 100;
      const ok = marginPct >= 20;
      if (!ok) fit = Math.round(fit * 0.3);
      rules.push({ rule_name: 'high_flip_margin', expected_value: '≥20%', actual_value: `${marginPct.toFixed(1)}%`, passed: ok, fail_severity: 'hard_fail', explanation: ok ? 'Margin supports high-end flip' : 'Margin too thin for high-end flip' });
    }
  }

  return { score: fit, rules };
}

function scoreSchoolDistrict(bb: BuyBox, prop: LeadProperty): { score: number; rules: RuleResult[] } {
  if (bb.target_school_districts.length === 0) return { score: WEIGHTS.school_district, rules: [] };
  const ok = arrayContains(bb.target_school_districts, prop.school_district);
  return {
    score: ok ? WEIGHTS.school_district : 0,
    rules: [{ rule_name: 'school_district', expected_value: bb.target_school_districts.join(', '), actual_value: prop.school_district || 'N/A', passed: ok, fail_severity: 'soft_fail', explanation: ok ? 'School district matches preference' : 'School district outside preference' }],
  };
}

function scoreDealMargin(bb: BuyBox, prop: LeadProperty): { score: number; rules: RuleResult[] } {
  const rules: RuleResult[] = [];
  let checks = 0, passed = 0;

  if (bb.min_profit != null && prop.estimated_arv != null && prop.asking_price != null && prop.estimated_rehab != null) {
    checks++;
    const profit = prop.estimated_arv - prop.asking_price - prop.estimated_rehab;
    const ok = profit >= bb.min_profit;
    if (ok) passed++;
    rules.push({ rule_name: 'min_profit', expected_value: `≥$${bb.min_profit.toLocaleString()}`, actual_value: `$${profit.toLocaleString()}`, passed: ok, fail_severity: 'hard_fail', explanation: ok ? 'Projected profit meets minimum' : 'Projected profit below minimum' });
  }

  if (bb.min_equity_spread != null && prop.estimated_arv != null && prop.asking_price != null) {
    checks++;
    const spread = ((prop.estimated_arv - prop.asking_price) / prop.estimated_arv) * 100;
    const ok = spread >= bb.min_equity_spread;
    if (ok) passed++;
    rules.push({ rule_name: 'equity_spread', expected_value: `≥${bb.min_equity_spread}%`, actual_value: `${spread.toFixed(1)}%`, passed: ok, fail_severity: 'hard_fail', explanation: ok ? 'Equity spread sufficient' : 'Equity spread insufficient' });
  }

  const score = checks === 0 ? WEIGHTS.deal_margin : Math.round((passed / checks) * WEIGHTS.deal_margin);
  return { score, rules };
}

export function evaluateMatch(bb: BuyBox, prop: LeadProperty): MatchResult {
  const loc = scoreLocation(bb, prop);
  const ptype = scorePropertyType(bb, prop);
  const layout = scoreLayout(bb, prop);
  const price = scorePrice(bb, prop);
  const rehab = scoreRehab(bb, prop);
  const arv = scoreArv(bb, prop);
  const strat = scoreStrategyFit(bb, prop);
  const school = scoreSchoolDistrict(bb, prop);
  const margin = scoreDealMargin(bb, prop);

  const overall = loc.score + ptype.score + layout.score + price.score + rehab.score + arv.score + strat.score + school.score + margin.score;
  const allRules = [...loc.rules, ...ptype.rules, ...layout.rules, ...price.rules, ...rehab.rules, ...arv.rules, ...strat.rules, ...school.rules, ...margin.rules];

  const hardFails = allRules.filter(r => !r.passed && r.fail_severity === 'hard_fail');
  const passedRules = allRules.filter(r => r.passed);
  const failedRules = allRules.filter(r => !r.passed);

  let pass_status: 'pass' | 'borderline' | 'fail' = 'fail';
  if (hardFails.length === 0 && overall >= 85) pass_status = 'pass';
  else if (hardFails.length <= 1 && overall >= 55) pass_status = 'borderline';

  const reason_passed_summary = passedRules.map(r => r.explanation).join('; ');
  const reason_failed_summary = failedRules.map(r => r.explanation).join('; ');
  const primary_success_reason = passedRules[0]?.explanation || '';
  const primary_failure_reason = failedRules.sort((a, b) => (a.fail_severity === 'hard_fail' ? -1 : 1))[0]?.explanation || '';

  let recommended_action = 'review_manually';
  if (pass_status === 'pass' && overall >= 85) recommended_action = 'pursue_now';
  else if (pass_status === 'borderline' && overall >= 70) recommended_action = 'review_manually';
  else if (pass_status === 'borderline') recommended_action = 'renegotiate';
  else if (overall >= 40) recommended_action = 'hold_for_later';
  else recommended_action = 'reject';

  return {
    buy_box_id: bb.id,
    lead_property_id: prop.id,
    strategy_type: bb.strategy_type,
    overall_match_score: overall,
    location_score: loc.score,
    property_type_score: ptype.score,
    layout_score: layout.score,
    price_score: price.score,
    rehab_score: rehab.score,
    arv_score: arv.score,
    strategy_fit_score: strat.score,
    school_district_score: school.score,
    deal_margin_score: margin.score,
    pass_status,
    primary_success_reason,
    primary_failure_reason,
    reason_passed_summary,
    reason_failed_summary,
    recommended_action,
    rules: allRules,
  };
}

export function determineStrategyFit(prop: LeadProperty, buyBoxes: BuyBox[]): {
  primary_strategy_fit: string;
  secondary_strategy_fit: string;
  strategy_confidence_score: number;
  results: MatchResult[];
} {
  const results = buyBoxes.filter(bb => bb.is_active).map(bb => evaluateMatch(bb, prop));
  results.sort((a, b) => b.overall_match_score - a.overall_match_score);

  return {
    primary_strategy_fit: results[0]?.strategy_type || 'mid_flip',
    secondary_strategy_fit: results[1]?.strategy_type || '',
    strategy_confidence_score: results[0]?.overall_match_score || 0,
    results,
  };
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Strong Match';
  if (score >= 70) return 'Possible Match';
  if (score >= 55) return 'Weak Match';
  return 'Reject';
}

export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 55) return 'text-orange-500';
  return 'text-destructive';
}

export function getActionLabel(action: string): string {
  const map: Record<string, string> = {
    pursue_now: 'Pursue Now',
    review_manually: 'Manual Review',
    renegotiate: 'Renegotiate',
    hold_for_later: 'Hold',
    reject: 'Reject',
  };
  return map[action] || action;
}

export function getStrategyLabel(strategy: string): string {
  const map: Record<string, string> = {
    brrrr: 'BRRRR',
    mid_flip: 'Mid-Level Flip',
    high_flip: 'High-End Flip',
  };
  return map[strategy] || strategy;
}
