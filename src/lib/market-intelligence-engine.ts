// Market Intelligence Engine
// Analyzes comps, rentals, flips, and market data to generate neighborhood-level insights

export interface NeighborhoodMetrics {
  id?: string;
  state?: string;
  city?: string;
  zip?: string;
  neighborhood?: string;
  school_district?: string;
  property_type?: string;
  median_sale_price: number;
  median_price_per_sqft: number;
  avg_price_per_sqft: number;
  arv_ceiling_price: number;
  arv_ceiling_ppsf: number;
  flip_count: number;
  flip_success_rate: number;
  avg_flip_profit: number;
  avg_flip_margin_pct: number;
  avg_days_on_market: number;
  rental_price_low: number;
  rental_price_avg: number;
  rental_price_high: number;
  rent_price_per_sqft: number;
  avg_rehab_cost_per_sqft: number;
  renovation_sensitivity_score: number;
  strategy_bias: string;
  monthly_trend_pct: number;
  yearly_trend_pct: number;
  data_points: number;
  last_updated?: string;
}

export interface CompData {
  id?: string;
  neighborhood?: string;
  zip?: string;
  city?: string;
  state?: string;
  address?: string;
  sale_price: number;
  price_per_sqft: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  year_built?: number;
  renovation_level?: string;
  sale_date?: string;
  days_on_market?: number;
  property_type?: string;
}

export interface RentalData {
  id?: string;
  neighborhood?: string;
  zip?: string;
  city?: string;
  state?: string;
  address?: string;
  rent: number;
  sqft?: number;
  beds?: number;
  baths?: number;
  rent_price_per_sqft?: number;
  property_type?: string;
  lease_date?: string;
}

export interface FlipOutcome {
  id?: string;
  neighborhood?: string;
  zip?: string;
  city?: string;
  state?: string;
  purchase_price: number;
  rehab_cost: number;
  resale_price: number;
  arv_projection?: number;
  profit: number;
  margin_pct: number;
  hold_time_days?: number;
  strategy_used?: string;
  success_flag: boolean;
}

// ── Helpers ──────────────────────────────────────────────────

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function percentile(arr: number[], p: number): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * s.length) - 1;
  return s[Math.max(0, idx)];
}

// ── ARV Ceiling ──────────────────────────────────────────────

export function calculateARVCeiling(comps: CompData[]): { arv_ceiling_price: number; arv_ceiling_ppsf: number } {
  if (!comps.length) return { arv_ceiling_price: 0, arv_ceiling_ppsf: 0 };

  // Use top 20% of renovated comps (or all if none tagged)
  const renovated = comps.filter(c =>
    c.renovation_level === 'renovated' || c.renovation_level === 'high_end'
  );
  const pool = renovated.length >= 3 ? renovated : comps;

  const prices = pool.map(c => c.sale_price).filter(Boolean);
  const ppsfs = pool.map(c => c.price_per_sqft).filter(Boolean);

  return {
    arv_ceiling_price: Math.round(percentile(prices, 85)),
    arv_ceiling_ppsf: Math.round(percentile(ppsfs, 85)),
  };
}

// ── Flip Success Metrics ─────────────────────────────────────

export function calculateFlipMetrics(flips: FlipOutcome[]) {
  if (!flips.length) return {
    flip_count: 0, flip_success_rate: 0, avg_flip_profit: 0,
    avg_flip_margin_pct: 0, avg_days_on_market: 0,
  };

  const successes = flips.filter(f => f.success_flag);
  const doms = flips.map(f => f.hold_time_days).filter((d): d is number => d != null && d > 0);

  return {
    flip_count: flips.length,
    flip_success_rate: Math.round((successes.length / flips.length) * 100),
    avg_flip_profit: Math.round(avg(flips.map(f => f.profit))),
    avg_flip_margin_pct: Math.round(avg(flips.map(f => f.margin_pct)) * 10) / 10,
    avg_days_on_market: Math.round(avg(doms)),
  };
}

// ── Rent Range Detection ─────────────────────────────────────

export function calculateRentRange(rentals: RentalData[]) {
  if (!rentals.length) return {
    rental_price_low: 0, rental_price_avg: 0, rental_price_high: 0,
    rent_price_per_sqft: 0,
  };

  const rents = rentals.map(r => r.rent).filter(Boolean);
  const rppsfs = rentals.map(r => r.rent_price_per_sqft).filter((v): v is number => v != null && v > 0);

  return {
    rental_price_low: Math.round(percentile(rents, 15)),
    rental_price_avg: Math.round(avg(rents)),
    rental_price_high: Math.round(percentile(rents, 85)),
    rent_price_per_sqft: Math.round(avg(rppsfs) * 100) / 100,
  };
}

// ── Renovation Sensitivity ───────────────────────────────────

export function calculateRenovationSensitivity(comps: CompData[]): number {
  if (comps.length < 4) return 50; // neutral if insufficient data

  const buckets: Record<string, number[]> = {
    outdated: [], average: [], renovated: [], high_end: [],
  };

  for (const c of comps) {
    const level = c.renovation_level || 'average';
    if (buckets[level]) buckets[level].push(c.price_per_sqft);
  }

  const avgOutdated = avg(buckets.outdated);
  const avgAverage = avg(buckets.average);
  const avgRenovated = avg(buckets.renovated);
  const avgHighEnd = avg(buckets.high_end);

  // Measure spread between lowest and highest renovation tiers
  const allAvgs = [avgOutdated, avgAverage, avgRenovated, avgHighEnd].filter(v => v > 0);
  if (allAvgs.length < 2) return 50;

  const low = Math.min(...allAvgs);
  const high = Math.max(...allAvgs);
  const spreadPct = ((high - low) / low) * 100;

  // 0-100 scale: >60% spread = 100, <10% = 0
  return Math.min(100, Math.max(0, Math.round((spreadPct / 60) * 100)));
}

export function getSensitivityLabel(score: number): string {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

// ── Strategy Bias ────────────────────────────────────────────

export function calculateStrategyBias(metrics: {
  flip_success_rate: number;
  avg_flip_margin_pct: number;
  rent_price_per_sqft: number;
  renovation_sensitivity_score: number;
  avg_days_on_market: number;
  rental_price_avg: number;
  median_sale_price: number;
}): string {
  const { flip_success_rate, avg_flip_margin_pct, renovation_sensitivity_score, rental_price_avg, median_sale_price, avg_days_on_market } = metrics;

  const rentToPriceRatio = median_sale_price > 0 ? (rental_price_avg * 12) / median_sale_price : 0;
  const flipStrength = (flip_success_rate * 0.4) + (Math.min(avg_flip_margin_pct, 30) * 2);
  const brrrrStrength = (rentToPriceRatio * 500) + (avg_days_on_market < 30 ? 20 : 0);
  const highFlipViable = renovation_sensitivity_score >= 65 && avg_flip_margin_pct >= 18;

  if (highFlipViable && flipStrength > 50) return 'high_flip_friendly';
  if (flipStrength > 45 && brrrrStrength > 40) return 'mixed';
  if (flipStrength > 45) return 'flip_friendly';
  if (brrrrStrength > 35) return 'brrrr_friendly';
  if (flipStrength < 20 && brrrrStrength < 20) return 'low_potential';
  return 'mixed';
}

export function getStrategyBiasLabel(bias: string): string {
  const map: Record<string, string> = {
    brrrr_friendly: 'BRRRR Friendly',
    flip_friendly: 'Flip Friendly',
    high_flip_friendly: 'High-End Flip Friendly',
    mixed: 'Mixed Strategy',
    low_potential: 'Low Investment Potential',
  };
  return map[bias] || bias;
}

export function getStrategyBiasColor(bias: string): string {
  const map: Record<string, string> = {
    brrrr_friendly: 'text-blue-600',
    flip_friendly: 'text-emerald-600',
    high_flip_friendly: 'text-purple-600',
    mixed: 'text-amber-600',
    low_potential: 'text-muted-foreground',
  };
  return map[bias] || 'text-foreground';
}

// ── Buy Box Recommendation ──────────────────────────────────

export interface BuyBoxRecommendation {
  category: string;
  message: string;
  severity: 'info' | 'warning' | 'success';
}

export function generateBuyBoxRecommendations(metrics: NeighborhoodMetrics): BuyBoxRecommendation[] {
  const recs: BuyBoxRecommendation[] = [];

  if (metrics.arv_ceiling_price > 0 && metrics.median_sale_price > 0) {
    const ceilingRatio = metrics.arv_ceiling_price / metrics.median_sale_price;
    if (ceilingRatio < 1.15) {
      recs.push({ category: 'ARV', message: `ARV ceiling in ${metrics.zip || 'this area'} is only ${Math.round((ceilingRatio - 1) * 100)}% above median — reduce ARV expectations.`, severity: 'warning' });
    }
  }

  if (metrics.avg_rehab_cost_per_sqft > 100) {
    recs.push({ category: 'Rehab', message: `Average rehab runs $${Math.round(metrics.avg_rehab_cost_per_sqft)}/sqft — increase rehab budget allowances.`, severity: 'warning' });
  }

  if (metrics.flip_success_rate > 0 && metrics.flip_success_rate < 50) {
    recs.push({ category: 'Strategy', message: `Flip success rate is only ${metrics.flip_success_rate}% — consider BRRRR over flips.`, severity: 'warning' });
  }

  if (metrics.renovation_sensitivity_score >= 70) {
    recs.push({ category: 'Renovation', message: `High renovation sensitivity (${metrics.renovation_sensitivity_score}) — premium finishes are well-rewarded here.`, severity: 'success' });
  } else if (metrics.renovation_sensitivity_score <= 30 && metrics.renovation_sensitivity_score > 0) {
    recs.push({ category: 'Renovation', message: `Low renovation sensitivity — use rental-grade finishes to preserve margins.`, severity: 'info' });
  }

  if (metrics.monthly_trend_pct < -1) {
    recs.push({ category: 'Market', message: `Prices declining ${Math.abs(metrics.monthly_trend_pct).toFixed(1)}% MoM — lower max purchase price.`, severity: 'warning' });
  } else if (metrics.monthly_trend_pct > 2) {
    recs.push({ category: 'Market', message: `Prices growing ${metrics.monthly_trend_pct.toFixed(1)}% MoM — market is appreciating.`, severity: 'success' });
  }

  if (metrics.rent_price_per_sqft > 0 && metrics.median_sale_price > 0) {
    const rtp = (metrics.rental_price_avg * 12) / metrics.median_sale_price;
    if (rtp >= 0.08) {
      recs.push({ category: 'BRRRR', message: `Strong rent-to-price ratio (${(rtp * 100).toFixed(1)}%) — strong BRRRR market.`, severity: 'success' });
    }
  }

  return recs;
}

// ── Full Metrics Computation ─────────────────────────────────

export function computeNeighborhoodMetrics(
  comps: CompData[],
  rentals: RentalData[],
  flips: FlipOutcome[],
  existingMetrics?: Partial<NeighborhoodMetrics>,
): NeighborhoodMetrics {
  const prices = comps.map(c => c.sale_price).filter(Boolean);
  const ppsfs = comps.map(c => c.price_per_sqft).filter(Boolean);
  const doms = comps.map(c => c.days_on_market).filter((d): d is number => d != null && d > 0);

  const { arv_ceiling_price, arv_ceiling_ppsf } = calculateARVCeiling(comps);
  const flipMetrics = calculateFlipMetrics(flips);
  const rentRange = calculateRentRange(rentals);
  const renovSensitivity = calculateRenovationSensitivity(comps);

  const rehabCosts = flips.map(f => {
    if (f.rehab_cost > 0) {
      // Approximate sqft from price ratios if we have comp data
      const avgPpsf = avg(ppsfs);
      if (avgPpsf > 0) return f.rehab_cost / (f.resale_price / avgPpsf);
    }
    return 0;
  }).filter(v => v > 0);

  const base: NeighborhoodMetrics = {
    state: existingMetrics?.state,
    city: existingMetrics?.city,
    zip: existingMetrics?.zip,
    neighborhood: existingMetrics?.neighborhood,
    school_district: existingMetrics?.school_district,
    property_type: existingMetrics?.property_type || 'single_family',
    median_sale_price: Math.round(median(prices)),
    median_price_per_sqft: Math.round(median(ppsfs)),
    avg_price_per_sqft: Math.round(avg(ppsfs)),
    arv_ceiling_price,
    arv_ceiling_ppsf,
    ...flipMetrics,
    ...rentRange,
    avg_rehab_cost_per_sqft: Math.round(avg(rehabCosts)),
    renovation_sensitivity_score: renovSensitivity,
    strategy_bias: 'mixed',
    monthly_trend_pct: existingMetrics?.monthly_trend_pct ?? 0,
    yearly_trend_pct: existingMetrics?.yearly_trend_pct ?? 0,
    data_points: comps.length + rentals.length + flips.length,
  };

  base.strategy_bias = calculateStrategyBias({
    flip_success_rate: base.flip_success_rate,
    avg_flip_margin_pct: base.avg_flip_margin_pct,
    rent_price_per_sqft: base.rent_price_per_sqft,
    renovation_sensitivity_score: base.renovation_sensitivity_score,
    avg_days_on_market: base.avg_days_on_market,
    rental_price_avg: base.rental_price_avg,
    median_sale_price: base.median_sale_price,
  });

  return base;
}

// ── ARV Ceiling Warning ──────────────────────────────────────

export function checkARVCeilingWarning(projectedARV: number, ceilingPrice: number): string | null {
  if (ceilingPrice <= 0) return null;
  if (projectedARV > ceilingPrice * 1.1) {
    return `Projected ARV ($${projectedARV.toLocaleString()}) exceeds neighborhood ceiling ($${ceilingPrice.toLocaleString()}) by ${Math.round(((projectedARV / ceilingPrice) - 1) * 100)}%`;
  }
  return null;
}

// ── Formatting helpers ───────────────────────────────────────

export function formatCurrency(v: number | null | undefined): string {
  if (v == null || v === 0) return '—';
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function formatPct(v: number | null | undefined): string {
  if (v == null) return '—';
  return v.toFixed(1) + '%';
}
