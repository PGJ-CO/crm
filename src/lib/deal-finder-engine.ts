// Deal Finder AI Engine
// Screens properties, estimates rehab/ARV, calculates MAO, scores and classifies deals

import { evaluateMatch, type BuyBox, type LeadProperty, type MatchResult } from './buybox-engine';

export interface DealFinderInput {
  id: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  asking_price?: number;
  sqft?: number;
  beds?: number;
  baths?: number;
  year_built?: number;
  lot_size?: number;
  property_type?: string;
  school_district?: string;
  listing_notes?: string;
  condition_estimate?: string;
  listing_url?: string;
  source?: string;
  pipeline_stage?: string;
  // optional overrides
  estimated_rehab?: number;
  estimated_arv?: number;
  estimated_rent?: number;
}

export interface DealFinderResult {
  lead_property_id: string;
  address: string;
  source?: string;
  estimated_rehab_low: number;
  estimated_rehab_high: number;
  estimated_rehab: number;
  estimated_arv_low: number;
  estimated_arv: number;
  estimated_arv_high: number;
  estimated_rent: number;
  max_allowable_offer: number;
  estimated_flip_profit: number;
  estimated_cash_left_in_deal: number;
  primary_strategy_fit: string;
  secondary_strategy_fit: string;
  buy_box_match_score: number;
  rehab_risk_score: number;
  arv_confidence_score: number;
  deal_score: number;
  deal_classification: 'strong_match' | 'possible_match' | 'weak_match' | 'reject';
  rejection_reason: string;
  recommended_action: string;
  scoring_breakdown: Record<string, number>;
  match_result?: MatchResult;
}

// ---- Rehab Estimation ----

function estimateRehabRange(prop: DealFinderInput): { low: number; high: number; mid: number; risk: number } {
  const sqft = prop.sqft || 1200;
  const condition = (prop.condition_estimate || 'unknown').toLowerCase();
  const yearBuilt = prop.year_built || 1980;
  const notes = (prop.listing_notes || '').toLowerCase();

  let lowPerSqft = 25, highPerSqft = 50; // cosmetic default
  let risk = 30;

  if (condition === 'distressed' || condition === 'poor' || notes.includes('gut') || notes.includes('fire') || notes.includes('condemned')) {
    lowPerSqft = 100; highPerSqft = 180; risk = 85;
  } else if (condition === 'fair' || notes.includes('needs work') || notes.includes('handyman') || notes.includes('fixer')) {
    lowPerSqft = 50; highPerSqft = 90; risk = 55;
  } else if (condition === 'good') {
    lowPerSqft = 25; highPerSqft = 50; risk = 25;
  } else if (condition === 'excellent') {
    lowPerSqft = 10; highPerSqft = 25; risk = 10;
  }

  // Age adjustment
  if (yearBuilt < 1960) { lowPerSqft += 15; highPerSqft += 25; risk += 15; }
  else if (yearBuilt < 1980) { lowPerSqft += 5; highPerSqft += 10; risk += 5; }

  const low = Math.round(sqft * lowPerSqft);
  const high = Math.round(sqft * highPerSqft);
  const mid = Math.round((low + high) / 2);

  return { low, high, mid, risk: Math.min(risk, 100) };
}

// ---- ARV Pre-Estimation ----

function estimateARV(prop: DealFinderInput): { low: number; mid: number; high: number; confidence: number } {
  // Heuristic: use price-per-sqft multipliers by condition
  const sqft = prop.sqft || 1200;
  const condition = (prop.condition_estimate || 'unknown').toLowerCase();
  const askingPrice = prop.asking_price || 0;

  // Base price per sqft estimates (after-repair)
  let basePpsf = 150; // default
  let confidence = 40;

  if (askingPrice > 0 && sqft > 0) {
    const currentPpsf = askingPrice / sqft;
    // ARV is typically higher than current price
    const multiplier = condition === 'distressed' ? 2.0 :
                       condition === 'poor' ? 1.7 :
                       condition === 'fair' ? 1.4 :
                       condition === 'good' ? 1.15 : 1.05;
    basePpsf = currentPpsf * multiplier;
    confidence = 55;
  }

  const mid = Math.round(sqft * basePpsf);
  const low = Math.round(mid * 0.9);
  const high = Math.round(mid * 1.1);

  return { low, mid, high, confidence: Math.min(confidence, 100) };
}

// ---- Rent Estimation ----

function estimateRent(prop: DealFinderInput): number {
  const beds = prop.beds || 3;
  const sqft = prop.sqft || 1200;
  // Simple heuristic: base rent on beds + sqft
  const baseRent = beds * 350 + (sqft - 800) * 0.3;
  return Math.max(Math.round(baseRent / 50) * 50, 800);
}

// ---- MAO (70% Rule) ----

function calculateMAO(arv: number, rehabCost: number): number {
  return Math.round(arv * 0.70 - rehabCost);
}

// ---- Flip Profit ----

function calculateFlipProfit(arv: number, purchasePrice: number, rehabCost: number): number {
  const sellingCost = Math.round(arv * 0.08);
  return Math.round(arv - sellingCost - purchasePrice - rehabCost);
}

// ---- BRRRR Cash Left ----

function calculateCashLeftInDeal(arv: number, purchasePrice: number, rehabCost: number): number {
  const refiAmount = Math.round(arv * 0.75);
  return Math.round(purchasePrice + rehabCost - refiAmount);
}

// ---- Strategy Fit ----

function determineStrategy(prop: DealFinderInput, rehab: { low: number; high: number; mid: number }, arv: { mid: number }, rent: number): { primary: string; secondary: string } {
  const askingPrice = prop.asking_price || 0;
  const rehabMid = rehab.mid;
  const profit = calculateFlipProfit(arv.mid, askingPrice, rehabMid);
  const cashLeft = calculateCashLeftInDeal(arv.mid, askingPrice, rehabMid);
  const condition = (prop.condition_estimate || '').toLowerCase();

  const scores: Record<string, number> = { brrrr: 0, mid_flip: 0, high_flip: 0 };

  // BRRRR favors: good rental, low cash left, moderate rehab
  if (rent >= 1200) scores.brrrr += 30;
  else if (rent >= 900) scores.brrrr += 15;
  if (cashLeft <= 10000) scores.brrrr += 30;
  else if (cashLeft <= 25000) scores.brrrr += 15;
  if (rehabMid < 80000) scores.brrrr += 20;

  // Mid flip: balanced rehab and profit
  if (profit >= 25000 && profit < 75000) scores.mid_flip += 30;
  else if (profit >= 15000) scores.mid_flip += 15;
  if (rehabMid >= 30000 && rehabMid <= 100000) scores.mid_flip += 25;
  if (condition === 'fair' || condition === 'poor') scores.mid_flip += 20;

  // High flip: high ARV, high profit, premium rehab OK
  if (arv.mid >= 400000) scores.high_flip += 25;
  if (profit >= 75000) scores.high_flip += 30;
  else if (profit >= 50000) scores.high_flip += 15;
  if (condition === 'good' || condition === 'fair') scores.high_flip += 20;

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  return { primary: sorted[0][0], secondary: sorted[1]?.[0] || '' };
}

// ---- Deal Classification ----

function classifyDeal(score: number): DealFinderResult['deal_classification'] {
  if (score >= 85) return 'strong_match';
  if (score >= 70) return 'possible_match';
  if (score >= 55) return 'weak_match';
  return 'reject';
}

function getRecommendedAction(classification: string): string {
  switch (classification) {
    case 'strong_match': return 'pursue_now';
    case 'possible_match': return 'review_manually';
    case 'weak_match': return 'hold_for_later';
    default: return 'reject';
  }
}

// ---- Main Deal Finder ----

export function analyzeDeal(prop: DealFinderInput, buyBox?: BuyBox): DealFinderResult {
  // Use provided values or estimate
  const rehabRange = prop.estimated_rehab
    ? { low: prop.estimated_rehab * 0.8, high: prop.estimated_rehab * 1.2, mid: prop.estimated_rehab, risk: 40 }
    : estimateRehabRange(prop);

  const arvRange = prop.estimated_arv
    ? { low: prop.estimated_arv * 0.9, mid: prop.estimated_arv, high: prop.estimated_arv * 1.1, confidence: 70 }
    : estimateARV(prop);

  const rent = prop.estimated_rent || estimateRent(prop);
  const askingPrice = prop.asking_price || 0;

  const mao = calculateMAO(arvRange.mid, rehabRange.mid);
  const flipProfit = calculateFlipProfit(arvRange.mid, askingPrice, rehabRange.mid);
  const cashLeft = calculateCashLeftInDeal(arvRange.mid, askingPrice, rehabRange.mid);

  const strategy = determineStrategy(prop, rehabRange, arvRange, rent);

  // Score via buy box if provided
  let matchScore = 0;
  let matchResult: MatchResult | undefined;
  let rejectionReasons: string[] = [];

  if (buyBox) {
    const leadProp: LeadProperty = {
      ...prop,
      estimated_rehab: rehabRange.mid,
      estimated_arv: arvRange.mid,
      estimated_rent: rent,
    };
    matchResult = evaluateMatch(buyBox, leadProp);
    matchScore = matchResult.overall_match_score;
    if (matchResult.reason_failed_summary) {
      rejectionReasons.push(matchResult.reason_failed_summary);
    }
  } else {
    // Simple scoring without buy box
    let score = 50;
    if (flipProfit > 50000) score += 20;
    else if (flipProfit > 25000) score += 10;
    else if (flipProfit < 0) score -= 20;

    if (askingPrice > 0 && askingPrice <= mao) score += 15;
    else if (askingPrice > 0 && askingPrice <= mao * 1.1) score += 5;
    else if (askingPrice > mao * 1.2) score -= 10;

    if (rehabRange.risk < 40) score += 10;
    else if (rehabRange.risk > 70) score -= 10;

    if (arvRange.confidence > 50) score += 5;

    matchScore = Math.max(0, Math.min(100, score));
  }

  // Rejection logic
  if (askingPrice > 0 && arvRange.mid > 0) {
    const spread = (arvRange.mid - askingPrice) / arvRange.mid;
    if (spread < 0.15) rejectionReasons.push('Insufficient ARV spread');
  }
  if (flipProfit < 0) rejectionReasons.push('Negative profit projection');
  if (askingPrice > mao * 1.3 && askingPrice > 0) rejectionReasons.push('Price far exceeds MAO');

  const classification = classifyDeal(matchScore);
  const action = getRecommendedAction(classification);

  return {
    lead_property_id: prop.id,
    address: prop.address,
    source: prop.source,
    estimated_rehab_low: Math.round(rehabRange.low),
    estimated_rehab_high: Math.round(rehabRange.high),
    estimated_rehab: Math.round(rehabRange.mid),
    estimated_arv_low: Math.round(arvRange.low),
    estimated_arv: Math.round(arvRange.mid),
    estimated_arv_high: Math.round(arvRange.high),
    estimated_rent: rent,
    max_allowable_offer: mao,
    estimated_flip_profit: flipProfit,
    estimated_cash_left_in_deal: cashLeft,
    primary_strategy_fit: strategy.primary,
    secondary_strategy_fit: strategy.secondary,
    buy_box_match_score: matchScore,
    rehab_risk_score: Math.round(rehabRange.risk),
    arv_confidence_score: Math.round(arvRange.confidence),
    deal_score: matchScore,
    deal_classification: classification,
    rejection_reason: rejectionReasons.join('; '),
    recommended_action: action,
    scoring_breakdown: matchResult ? {
      location: matchResult.location_score,
      property_type: matchResult.property_type_score,
      layout: matchResult.layout_score,
      price: matchResult.price_score,
      rehab: matchResult.rehab_score,
      arv: matchResult.arv_score,
      strategy_fit: matchResult.strategy_fit_score,
      school_district: matchResult.school_district_score,
      deal_margin: matchResult.deal_margin_score,
    } : {},
    match_result: matchResult,
  };
}

export function analyzeDeals(props: DealFinderInput[], buyBox?: BuyBox): DealFinderResult[] {
  return props
    .map(p => analyzeDeal(p, buyBox))
    .sort((a, b) => b.deal_score - a.deal_score);
}

export function getClassificationLabel(c: string): string {
  const map: Record<string, string> = {
    strong_match: 'Strong Match',
    possible_match: 'Possible Match',
    weak_match: 'Weak Match',
    reject: 'Reject',
  };
  return map[c] || c;
}

export function getClassificationColor(c: string): string {
  switch (c) {
    case 'strong_match': return 'text-green-600';
    case 'possible_match': return 'text-yellow-600';
    case 'weak_match': return 'text-orange-500';
    default: return 'text-destructive';
  }
}

export function getClassificationBadgeVariant(c: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (c) {
    case 'strong_match': return 'default';
    case 'possible_match': return 'secondary';
    case 'weak_match': return 'outline';
    default: return 'destructive';
  }
}

export { getStrategyLabel, getActionLabel } from './buybox-engine';
