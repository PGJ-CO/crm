import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  BarChart3, TrendingUp, TrendingDown, Home, DollarSign, Target, AlertTriangle,
  Plus, RefreshCw, MapPin, Building2, Hammer, ArrowUpRight, ArrowDownRight, Info,
  CheckCircle2, Lightbulb,
} from 'lucide-react';
import {
  type NeighborhoodMetrics, type CompData, type RentalData, type FlipOutcome,
  computeNeighborhoodMetrics, formatCurrency, formatPct,
  getStrategyBiasLabel, getStrategyBiasColor, getSensitivityLabel,
  generateBuyBoxRecommendations, type BuyBoxRecommendation,
} from '@/lib/market-intelligence-engine';

// ── Types ────────────────────────────────────────────────────

type DBMetrics = NeighborhoodMetrics & { id: string };

// ── Page ─────────────────────────────────────────────────────

export default function MarketIntelligencePage() {
  const [metrics, setMetrics] = useState<DBMetrics[]>([]);
  const [comps, setComps] = useState<CompData[]>([]);
  const [rentals, setRentals] = useState<RentalData[]>([]);
  const [flips, setFlips] = useState<FlipOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedZip, setSelectedZip] = useState<string>('all');

  // Dialogs
  const [compDialogOpen, setCompDialogOpen] = useState(false);
  const [rentalDialogOpen, setRentalDialogOpen] = useState(false);
  const [flipDialogOpen, setFlipDialogOpen] = useState(false);
  const [detailMetrics, setDetailMetrics] = useState<DBMetrics | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [mRes, cRes, rRes, fRes] = await Promise.all([
      supabase.from('neighborhood_market_metrics').select('*').order('last_updated', { ascending: false }),
      supabase.from('market_comp_data').select('*').order('sale_date', { ascending: false }).limit(500),
      supabase.from('market_rental_data').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('flip_project_outcomes').select('*').order('created_at', { ascending: false }).limit(200),
    ]);
    if (mRes.data) setMetrics(mRes.data as unknown as DBMetrics[]);
    if (cRes.data) setComps(cRes.data as unknown as CompData[]);
    if (rRes.data) setRentals(rRes.data as unknown as RentalData[]);
    if (fRes.data) setFlips(fRes.data as unknown as FlipOutcome[]);
    setLoading(false);
  }

  // ── Derived ──────────────────────────────────────────────

  const zipCodes = useMemo(() => {
    const zips = new Set<string>();
    metrics.forEach(m => m.zip && zips.add(m.zip));
    comps.forEach(c => c.zip && zips.add(c.zip));
    return Array.from(zips).sort();
  }, [metrics, comps]);

  const filteredMetrics = useMemo(() =>
    selectedZip === 'all' ? metrics : metrics.filter(m => m.zip === selectedZip),
    [metrics, selectedZip]
  );

  const topBRRRR = useMemo(() =>
    [...filteredMetrics].filter(m => m.strategy_bias === 'brrrr_friendly' || m.strategy_bias === 'mixed')
      .sort((a, b) => (b.rental_price_avg || 0) - (a.rental_price_avg || 0)).slice(0, 5),
    [filteredMetrics]
  );
  const topFlip = useMemo(() =>
    [...filteredMetrics].filter(m => m.strategy_bias === 'flip_friendly' || m.strategy_bias === 'mixed')
      .sort((a, b) => (b.avg_flip_margin_pct || 0) - (a.avg_flip_margin_pct || 0)).slice(0, 5),
    [filteredMetrics]
  );
  const topHighFlip = useMemo(() =>
    [...filteredMetrics].filter(m => m.strategy_bias === 'high_flip_friendly')
      .sort((a, b) => (b.renovation_sensitivity_score || 0) - (a.renovation_sensitivity_score || 0)).slice(0, 5),
    [filteredMetrics]
  );

  const recommendations = useMemo(() => {
    const all: (BuyBoxRecommendation & { zip?: string })[] = [];
    filteredMetrics.forEach(m => {
      generateBuyBoxRecommendations(m).forEach(r => all.push({ ...r, zip: m.zip }));
    });
    return all;
  }, [filteredMetrics]);

  // ── Recalculate ────────────────────────────────────────

  async function recalculateMetrics() {
    if (!comps.length) {
      toast({ title: 'No comp data', description: 'Add comparable sales before recalculating.' });
      return;
    }

    const zipGroups = new Map<string, { comps: CompData[]; rentals: RentalData[]; flips: FlipOutcome[] }>();
    comps.forEach(c => {
      const z = c.zip || 'unknown';
      if (!zipGroups.has(z)) zipGroups.set(z, { comps: [], rentals: [], flips: [] });
      zipGroups.get(z)!.comps.push(c);
    });
    rentals.forEach(r => {
      const z = r.zip || 'unknown';
      if (!zipGroups.has(z)) zipGroups.set(z, { comps: [], rentals: [], flips: [] });
      zipGroups.get(z)!.rentals.push(r);
    });
    flips.forEach(f => {
      const z = f.zip || 'unknown';
      if (!zipGroups.has(z)) zipGroups.set(z, { comps: [], rentals: [], flips: [] });
      zipGroups.get(z)!.flips.push(f);
    });

    for (const [zip, data] of zipGroups) {
      const existing = metrics.find(m => m.zip === zip);
      const computed = computeNeighborhoodMetrics(data.comps, data.rentals, data.flips, {
        zip, city: data.comps[0]?.city, state: data.comps[0]?.state,
        monthly_trend_pct: existing?.monthly_trend_pct,
        yearly_trend_pct: existing?.yearly_trend_pct,
      });

      if (existing?.id) {
        await supabase.from('neighborhood_market_metrics').update({
          ...computed, last_updated: new Date().toISOString(),
        }).eq('id', existing.id);
      } else {
        await supabase.from('neighborhood_market_metrics').insert({
          ...computed, last_updated: new Date().toISOString(),
        } as any);
      }
    }

    toast({ title: 'Metrics recalculated', description: `Updated ${zipGroups.size} neighborhoods.` });
    loadAll();
  }

  // ── Add Comp ──────────────────────────────────────────

  const [newComp, setNewComp] = useState<Partial<CompData>>({ property_type: 'single_family', renovation_level: 'average' });

  async function saveComp() {
    if (!newComp.sale_price || !newComp.zip) {
      toast({ title: 'Missing fields', description: 'Sale price and zip required.', variant: 'destructive' });
      return;
    }
    const ppsf = newComp.sqft && newComp.sqft > 0 ? Math.round(newComp.sale_price / newComp.sqft) : 0;
    await supabase.from('market_comp_data').insert({ ...newComp, price_per_sqft: ppsf } as any);
    toast({ title: 'Comp saved' });
    setCompDialogOpen(false);
    setNewComp({ property_type: 'single_family', renovation_level: 'average' });
    loadAll();
  }

  // ── Add Rental ────────────────────────────────────────

  const [newRental, setNewRental] = useState<Partial<RentalData>>({ property_type: 'single_family' });

  async function saveRental() {
    if (!newRental.rent || !newRental.zip) {
      toast({ title: 'Missing fields', description: 'Rent and zip required.', variant: 'destructive' });
      return;
    }
    const rppsf = newRental.sqft && newRental.sqft > 0 ? Math.round((newRental.rent / newRental.sqft) * 100) / 100 : 0;
    await supabase.from('market_rental_data').insert({ ...newRental, rent_price_per_sqft: rppsf } as any);
    toast({ title: 'Rental saved' });
    setRentalDialogOpen(false);
    setNewRental({ property_type: 'single_family' });
    loadAll();
  }

  // ── Add Flip Outcome ──────────────────────────────────

  const [newFlip, setNewFlip] = useState<Partial<FlipOutcome>>({ strategy_used: 'mid_flip', success_flag: true });

  async function saveFlip() {
    if (!newFlip.purchase_price || !newFlip.resale_price) {
      toast({ title: 'Missing fields', description: 'Purchase and resale price required.', variant: 'destructive' });
      return;
    }
    const profit = (newFlip.resale_price || 0) - (newFlip.purchase_price || 0) - (newFlip.rehab_cost || 0);
    const marginPct = newFlip.resale_price ? Math.round((profit / newFlip.resale_price) * 1000) / 10 : 0;
    await supabase.from('flip_project_outcomes').insert({
      ...newFlip, profit, margin_pct: marginPct, success_flag: profit > 0,
    } as any);
    toast({ title: 'Flip outcome saved' });
    setFlipDialogOpen(false);
    setNewFlip({ strategy_used: 'mid_flip', success_flag: true });
    loadAll();
  }

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Market Intelligence</h1>
          <p className="text-muted-foreground text-sm">Neighborhood insights, ARV ceilings, flip rates, and strategy analysis</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedZip} onValueChange={setSelectedZip}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Zips" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zips</SelectItem>
              {zipCodes.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={recalculateMetrics} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-1" /> Recalculate
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Neighborhoods</p>
          <p className="text-2xl font-bold">{filteredMetrics.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Comps Tracked</p>
          <p className="text-2xl font-bold">{comps.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Rental Data Points</p>
          <p className="text-2xl font-bold">{rentals.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Flip Outcomes</p>
          <p className="text-2xl font-bold">{flips.length}</p>
        </CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comps">Comps</TabsTrigger>
          <TabsTrigger value="rentals">Rentals</TabsTrigger>
          <TabsTrigger value="flips">Flip Outcomes</TabsTrigger>
          <TabsTrigger value="strategy">Strategy View</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* ── Overview ────────────────────────────────── */}
        <TabsContent value="overview">
          {loading ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : filteredMetrics.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No neighborhood metrics yet. Add comps & rentals, then recalculate.</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setCompDialogOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add Comp</Button>
                <Button variant="outline" onClick={() => setRentalDialogOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add Rental</Button>
              </div>
            </CardContent></Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Neighborhood Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zip</TableHead>
                      <TableHead>Median Price</TableHead>
                      <TableHead>ARV Ceiling</TableHead>
                      <TableHead>Avg $/sqft</TableHead>
                      <TableHead>Flip Rate</TableHead>
                      <TableHead>Avg Rent</TableHead>
                      <TableHead>Renov. Sensitivity</TableHead>
                      <TableHead>Strategy Bias</TableHead>
                      <TableHead>Data Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMetrics.map(m => (
                      <TableRow key={m.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailMetrics(m)}>
                        <TableCell className="font-medium">{m.zip || '—'}</TableCell>
                        <TableCell>{formatCurrency(m.median_sale_price)}</TableCell>
                        <TableCell>{formatCurrency(m.arv_ceiling_price)}</TableCell>
                        <TableCell>{m.avg_price_per_sqft ? `$${m.avg_price_per_sqft}` : '—'}</TableCell>
                        <TableCell>{m.flip_count > 0 ? `${m.flip_success_rate}% (${m.flip_count})` : '—'}</TableCell>
                        <TableCell>{formatCurrency(m.rental_price_avg)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={m.renovation_sensitivity_score} className="w-16 h-2" />
                            <span className="text-xs">{getSensitivityLabel(m.renovation_sensitivity_score)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStrategyBiasColor(m.strategy_bias)}>
                            {getStrategyBiasLabel(m.strategy_bias)}
                          </Badge>
                        </TableCell>
                        <TableCell>{m.data_points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Comps ───────────────────────────────────── */}
        <TabsContent value="comps">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Comparable Sales</CardTitle>
              <Button size="sm" onClick={() => setCompDialogOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add Comp</Button>
            </CardHeader>
            <CardContent>
              {comps.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No comps added yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Zip</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>$/sqft</TableHead>
                      <TableHead>Beds/Baths</TableHead>
                      <TableHead>Sqft</TableHead>
                      <TableHead>Renovation</TableHead>
                      <TableHead>Sale Date</TableHead>
                      <TableHead>DOM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comps.slice(0, 100).map((c, i) => (
                      <TableRow key={c.id || i}>
                        <TableCell className="font-medium">{c.address || '—'}</TableCell>
                        <TableCell>{c.zip || '—'}</TableCell>
                        <TableCell>{formatCurrency(c.sale_price)}</TableCell>
                        <TableCell>{c.price_per_sqft ? `$${c.price_per_sqft}` : '—'}</TableCell>
                        <TableCell>{c.beds ?? '—'}/{c.baths ?? '—'}</TableCell>
                        <TableCell>{c.sqft?.toLocaleString() || '—'}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{c.renovation_level || '—'}</Badge></TableCell>
                        <TableCell>{c.sale_date || '—'}</TableCell>
                        <TableCell>{c.days_on_market ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Rentals ─────────────────────────────────── */}
        <TabsContent value="rentals">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Rental Data</CardTitle>
              <Button size="sm" onClick={() => setRentalDialogOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add Rental</Button>
            </CardHeader>
            <CardContent>
              {rentals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No rental data yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Zip</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>$/sqft</TableHead>
                      <TableHead>Beds/Baths</TableHead>
                      <TableHead>Sqft</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentals.slice(0, 100).map((r, i) => (
                      <TableRow key={r.id || i}>
                        <TableCell className="font-medium">{r.address || '—'}</TableCell>
                        <TableCell>{r.zip || '—'}</TableCell>
                        <TableCell>{formatCurrency(r.rent)}/mo</TableCell>
                        <TableCell>{r.rent_price_per_sqft ? `$${r.rent_price_per_sqft}` : '—'}</TableCell>
                        <TableCell>{r.beds ?? '—'}/{r.baths ?? '—'}</TableCell>
                        <TableCell>{r.sqft?.toLocaleString() || '—'}</TableCell>
                        <TableCell className="capitalize">{r.property_type?.replace('_', ' ') || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Flips ───────────────────────────────────── */}
        <TabsContent value="flips">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Flip Project Outcomes</CardTitle>
              <Button size="sm" onClick={() => setFlipDialogOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add Flip</Button>
            </CardHeader>
            <CardContent>
              {flips.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No flip outcomes recorded yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zip</TableHead>
                      <TableHead>Purchase</TableHead>
                      <TableHead>Rehab</TableHead>
                      <TableHead>Resale</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Hold (days)</TableHead>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Success</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flips.map((f, i) => (
                      <TableRow key={f.id || i}>
                        <TableCell>{f.zip || '—'}</TableCell>
                        <TableCell>{formatCurrency(f.purchase_price)}</TableCell>
                        <TableCell>{formatCurrency(f.rehab_cost)}</TableCell>
                        <TableCell>{formatCurrency(f.resale_price)}</TableCell>
                        <TableCell className={f.profit >= 0 ? 'text-emerald-600' : 'text-destructive'}>{formatCurrency(f.profit)}</TableCell>
                        <TableCell>{formatPct(f.margin_pct)}</TableCell>
                        <TableCell>{f.hold_time_days ?? '—'}</TableCell>
                        <TableCell className="capitalize">{f.strategy_used?.replace('_', ' ') || '—'}</TableCell>
                        <TableCell>{f.success_flag ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Strategy View ───────────────────────────── */}
        <TabsContent value="strategy">
          <div className="grid md:grid-cols-3 gap-4">
            <StrategyCard title="Top BRRRR Neighborhoods" icon={<Home className="w-4 h-4" />} items={topBRRRR} labelKey="rental_price_avg" labelPrefix="Avg Rent: " />
            <StrategyCard title="Top Flip Neighborhoods" icon={<TrendingUp className="w-4 h-4" />} items={topFlip} labelKey="avg_flip_margin_pct" labelSuffix="% margin" />
            <StrategyCard title="Top High-End Flip" icon={<ArrowUpRight className="w-4 h-4" />} items={topHighFlip} labelKey="renovation_sensitivity_score" labelPrefix="Sensitivity: " />
          </div>
        </TabsContent>

        {/* ── Recommendations ─────────────────────────── */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Buy Box & Strategy Recommendations</CardTitle>
              <CardDescription>Based on current market intelligence data</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Add market data and recalculate to generate recommendations.</p>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((r, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
                      r.severity === 'warning' ? 'border-amber-200 bg-amber-50/50' :
                      r.severity === 'success' ? 'border-emerald-200 bg-emerald-50/50' :
                      'border-border bg-muted/30'
                    }`}>
                      {r.severity === 'warning' ? <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" /> :
                       r.severity === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" /> :
                       <Info className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{r.category}</Badge>
                          {r.zip && <span className="text-xs text-muted-foreground">{r.zip}</span>}
                        </div>
                        <p className="text-sm mt-1">{r.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Detail Dialog ─────────────────────────────── */}
      <Dialog open={!!detailMetrics} onOpenChange={(o) => !o && setDetailMetrics(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{detailMetrics?.zip || 'Neighborhood'} — Market Detail</DialogTitle></DialogHeader>
          {detailMetrics && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="Median Sale Price" value={formatCurrency(detailMetrics.median_sale_price)} />
              <Stat label="ARV Ceiling" value={formatCurrency(detailMetrics.arv_ceiling_price)} />
              <Stat label="Avg $/sqft" value={detailMetrics.avg_price_per_sqft ? `$${detailMetrics.avg_price_per_sqft}` : '—'} />
              <Stat label="ARV Ceiling $/sqft" value={detailMetrics.arv_ceiling_ppsf ? `$${detailMetrics.arv_ceiling_ppsf}` : '—'} />
              <Stat label="Flip Count" value={String(detailMetrics.flip_count)} />
              <Stat label="Flip Success Rate" value={formatPct(detailMetrics.flip_success_rate)} />
              <Stat label="Avg Flip Profit" value={formatCurrency(detailMetrics.avg_flip_profit)} />
              <Stat label="Avg Flip Margin" value={formatPct(detailMetrics.avg_flip_margin_pct)} />
              <Stat label="Avg DOM" value={detailMetrics.avg_days_on_market ? `${detailMetrics.avg_days_on_market} days` : '—'} />
              <Stat label="Rent Low" value={formatCurrency(detailMetrics.rental_price_low)} />
              <Stat label="Rent Avg" value={formatCurrency(detailMetrics.rental_price_avg)} />
              <Stat label="Rent High" value={formatCurrency(detailMetrics.rental_price_high)} />
              <Stat label="Rent $/sqft" value={detailMetrics.rent_price_per_sqft ? `$${detailMetrics.rent_price_per_sqft}` : '—'} />
              <Stat label="Rehab $/sqft" value={detailMetrics.avg_rehab_cost_per_sqft ? `$${detailMetrics.avg_rehab_cost_per_sqft}` : '—'} />
              <Stat label="Renov. Sensitivity" value={`${detailMetrics.renovation_sensitivity_score} — ${getSensitivityLabel(detailMetrics.renovation_sensitivity_score)}`} />
              <Stat label="Strategy Bias" value={getStrategyBiasLabel(detailMetrics.strategy_bias)} />
              <Stat label="MoM Trend" value={formatPct(detailMetrics.monthly_trend_pct)} />
              <Stat label="YoY Trend" value={formatPct(detailMetrics.yearly_trend_pct)} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Add Comp Dialog ───────────────────────────── */}
      <Dialog open={compDialogOpen} onOpenChange={setCompDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Comparable Sale</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Address" value={newComp.address || ''} onChange={v => setNewComp(p => ({ ...p, address: v }))} />
            <Field label="Zip *" value={newComp.zip || ''} onChange={v => setNewComp(p => ({ ...p, zip: v }))} />
            <Field label="City" value={newComp.city || ''} onChange={v => setNewComp(p => ({ ...p, city: v }))} />
            <Field label="State" value={newComp.state || ''} onChange={v => setNewComp(p => ({ ...p, state: v }))} />
            <NumField label="Sale Price *" value={newComp.sale_price} onChange={v => setNewComp(p => ({ ...p, sale_price: v }))} />
            <NumField label="Sqft" value={newComp.sqft} onChange={v => setNewComp(p => ({ ...p, sqft: v }))} />
            <NumField label="Beds" value={newComp.beds} onChange={v => setNewComp(p => ({ ...p, beds: v }))} />
            <NumField label="Baths" value={newComp.baths} onChange={v => setNewComp(p => ({ ...p, baths: v }))} />
            <NumField label="DOM" value={newComp.days_on_market} onChange={v => setNewComp(p => ({ ...p, days_on_market: v }))} />
            <div>
              <Label className="text-xs">Renovation Level</Label>
              <Select value={newComp.renovation_level || 'average'} onValueChange={v => setNewComp(p => ({ ...p, renovation_level: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['outdated', 'average', 'renovated', 'high_end'].map(l => <SelectItem key={l} value={l} className="capitalize">{l.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Field label="Sale Date" value={newComp.sale_date || ''} onChange={v => setNewComp(p => ({ ...p, sale_date: v }))} placeholder="YYYY-MM-DD" />
          </div>
          <Button onClick={saveComp} className="mt-2 w-full">Save Comp</Button>
        </DialogContent>
      </Dialog>

      {/* ── Add Rental Dialog ─────────────────────────── */}
      <Dialog open={rentalDialogOpen} onOpenChange={setRentalDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Rental Data</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Address" value={newRental.address || ''} onChange={v => setNewRental(p => ({ ...p, address: v }))} />
            <Field label="Zip *" value={newRental.zip || ''} onChange={v => setNewRental(p => ({ ...p, zip: v }))} />
            <NumField label="Rent/mo *" value={newRental.rent} onChange={v => setNewRental(p => ({ ...p, rent: v }))} />
            <NumField label="Sqft" value={newRental.sqft} onChange={v => setNewRental(p => ({ ...p, sqft: v }))} />
            <NumField label="Beds" value={newRental.beds} onChange={v => setNewRental(p => ({ ...p, beds: v }))} />
            <NumField label="Baths" value={newRental.baths} onChange={v => setNewRental(p => ({ ...p, baths: v }))} />
          </div>
          <Button onClick={saveRental} className="mt-2 w-full">Save Rental</Button>
        </DialogContent>
      </Dialog>

      {/* ── Add Flip Dialog ───────────────────────────── */}
      <Dialog open={flipDialogOpen} onOpenChange={setFlipDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Flip Outcome</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Zip" value={newFlip.zip || ''} onChange={v => setNewFlip(p => ({ ...p, zip: v }))} />
            <Field label="City" value={newFlip.city || ''} onChange={v => setNewFlip(p => ({ ...p, city: v }))} />
            <NumField label="Purchase Price *" value={newFlip.purchase_price} onChange={v => setNewFlip(p => ({ ...p, purchase_price: v }))} />
            <NumField label="Rehab Cost" value={newFlip.rehab_cost} onChange={v => setNewFlip(p => ({ ...p, rehab_cost: v }))} />
            <NumField label="Resale Price *" value={newFlip.resale_price} onChange={v => setNewFlip(p => ({ ...p, resale_price: v }))} />
            <NumField label="ARV Projection" value={newFlip.arv_projection} onChange={v => setNewFlip(p => ({ ...p, arv_projection: v }))} />
            <NumField label="Hold Time (days)" value={newFlip.hold_time_days} onChange={v => setNewFlip(p => ({ ...p, hold_time_days: v }))} />
            <div>
              <Label className="text-xs">Strategy</Label>
              <Select value={newFlip.strategy_used || 'mid_flip'} onValueChange={v => setNewFlip(p => ({ ...p, strategy_used: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brrrr">BRRRR</SelectItem>
                  <SelectItem value="mid_flip">Mid Flip</SelectItem>
                  <SelectItem value="high_flip">High Flip</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={saveFlip} className="mt-2 w-full">Save Flip Outcome</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 bg-muted/30 rounded">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function StrategyCard({ title, icon, items, labelKey, labelPrefix, labelSuffix }: {
  title: string; icon: React.ReactNode; items: DBMetrics[];
  labelKey: keyof DBMetrics; labelPrefix?: string; labelSuffix?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">{icon} {title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No data yet</p>
        ) : items.map(m => (
          <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">{m.zip}</p>
              <p className="text-xs text-muted-foreground">{m.city}, {m.state}</p>
            </div>
            <Badge variant="outline">
              {labelPrefix || ''}{typeof m[labelKey] === 'number' ? (labelKey.includes('price') || labelKey.includes('profit') ? formatCurrency(m[labelKey] as number) : m[labelKey]) : '—'}{labelSuffix || ''}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-8" />
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number | undefined; onChange: (v: number) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type="number" value={value ?? ''} onChange={e => onChange(Number(e.target.value))} className="h-8" />
    </div>
  );
}
