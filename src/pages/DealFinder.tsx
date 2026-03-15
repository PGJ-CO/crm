import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import {
  Search, Upload, Plus, Play, TrendingUp, TrendingDown, DollarSign, Home, Target,
  CheckCircle2, XCircle, AlertTriangle, ArrowRight, FileText, BarChart3, Filter,
} from 'lucide-react';
import {
  analyzeDeal, analyzeDeals, getClassificationLabel, getClassificationColor,
  getClassificationBadgeVariant, getStrategyLabel, getActionLabel,
  type DealFinderInput, type DealFinderResult,
} from '@/lib/deal-finder-engine';
import { type BuyBox } from '@/lib/buybox-engine';
import { useCRM } from '@/contexts/CRMContext';

const CONDITION_OPTIONS = ['excellent', 'good', 'fair', 'poor', 'distressed'];
const PROPERTY_TYPES = ['single_family', 'multi_family', 'condo', 'townhouse', 'duplex'];
const SOURCE_OPTIONS = ['Manual Entry', 'CSV Upload', 'MLS', 'Zillow', 'Redfin', 'Wholesaler', 'Off-Market', 'Marketing'];

const emptyDeal: DealFinderInput = {
  id: '', address: '', city: '', state: '', zip: '',
  asking_price: undefined, sqft: undefined, beds: undefined, baths: undefined,
  year_built: undefined, lot_size: undefined, property_type: 'single_family',
  condition_estimate: 'fair', source: 'Manual Entry', listing_notes: '',
};

export default function DealFinderPage() {
  const [buyBoxes, setBuyBoxes] = useState<BuyBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string>('');
  const [results, setResults] = useState<DealFinderResult[]>([]);
  const [activeTab, setActiveTab] = useState('intake');
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<DealFinderResult | null>(null);
  const [newDeal, setNewDeal] = useState<DealFinderInput>(emptyDeal);
  const [manualDeals, setManualDeals] = useState<DealFinderInput[]>([]);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStrategy, setFilterStrategy] = useState<string>('all');
  const [csvText, setCsvText] = useState('');
  const { leads, getProperty } = useCRM();

  useEffect(() => {
    supabase.from('buy_boxes').select('*').eq('is_active', true).order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setBuyBoxes(data.map(d => ({
          ...d,
          target_states: d.target_states || [], target_cities: d.target_cities || [],
          target_zip_codes: d.target_zip_codes || [], target_neighborhoods: d.target_neighborhoods || [],
          target_school_districts: d.target_school_districts || [],
          property_types_allowed: d.property_types_allowed || [],
          preferred_condition_levels: d.preferred_condition_levels || [],
        })) as BuyBox[]);
      });
  }, []);

  function addManualDeal() {
    if (!newDeal.address) { toast({ title: 'Address is required', variant: 'destructive' }); return; }
    const deal = { ...newDeal, id: crypto.randomUUID() };
    setManualDeals(prev => [deal, ...prev]);
    setNewDeal(emptyDeal);
    setFormOpen(false);
    toast({ title: 'Property added to screening queue' });
  }

  function importFromCRM() {
    const crmDeals: DealFinderInput[] = leads.map(l => {
      const p = getProperty(l.propertyId);
      return {
        id: l.id,
        address: p?.address || 'Unknown',
        city: p?.city, state: p?.state, zip: p?.zip,
        sqft: p?.sqft, beds: p?.beds, baths: p?.baths,
        year_built: p?.yearBuilt, property_type: 'single_family',
        condition_estimate: p?.condition || 'fair',
        source: l.source, pipeline_stage: l.stage,
      };
    });
    setManualDeals(prev => [...crmDeals.filter(d => !prev.find(e => e.id === d.id)), ...prev]);
    toast({ title: `Imported ${crmDeals.length} leads from CRM` });
  }

  function parseCSV() {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) { toast({ title: 'CSV needs header + data rows', variant: 'destructive' }); return; }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const deals: DealFinderInput[] = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });
      deals.push({
        id: crypto.randomUUID(),
        address: row.address || row.property_address || '',
        city: row.city, state: row.state, zip: row.zip,
        asking_price: row.asking_price ? Number(row.asking_price) : undefined,
        sqft: row.sqft ? Number(row.sqft) : undefined,
        beds: row.beds ? Number(row.beds) : undefined,
        baths: row.baths ? Number(row.baths) : undefined,
        year_built: row.year_built ? Number(row.year_built) : undefined,
        property_type: row.property_type || 'single_family',
        condition_estimate: row.condition || 'fair',
        source: 'CSV Upload',
      });
    }
    setManualDeals(prev => [...deals, ...prev]);
    setCsvText('');
    toast({ title: `Parsed ${deals.length} properties from CSV` });
  }

  function runScreening() {
    if (manualDeals.length === 0) { toast({ title: 'No properties to screen', variant: 'destructive' }); return; }
    const box = buyBoxes.find(b => b.id === selectedBoxId);
    const analyzed = analyzeDeals(manualDeals, box);
    setResults(analyzed);
    setActiveTab('results');
    toast({ title: `Screened ${analyzed.length} properties${box ? ` against "${box.name}"` : ''}` });
  }

  const filtered = useMemo(() => {
    let r = results;
    if (filterClass !== 'all') r = r.filter(x => x.deal_classification === filterClass);
    if (filterStrategy !== 'all') r = r.filter(x => x.primary_strategy_fit === filterStrategy);
    return r;
  }, [results, filterClass, filterStrategy]);

  const stats = useMemo(() => ({
    strong: results.filter(r => r.deal_classification === 'strong_match').length,
    possible: results.filter(r => r.deal_classification === 'possible_match').length,
    weak: results.filter(r => r.deal_classification === 'weak_match').length,
    reject: results.filter(r => r.deal_classification === 'reject').length,
  }), [results]);

  const fmt = (n: number) => n >= 0 ? `$${n.toLocaleString()}` : `-$${Math.abs(n).toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deal Finder AI</h1>
          <p className="text-sm text-muted-foreground">Screen, score, and rank investment opportunities automatically</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={importFromCRM}><Upload className="h-4 w-4 mr-2" />Import CRM Leads</Button>
          <Button onClick={() => { setNewDeal(emptyDeal); setFormOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Property</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="intake">Deal Intake</TabsTrigger>
          <TabsTrigger value="results">Results {results.length > 0 && `(${results.length})`}</TabsTrigger>
          <TabsTrigger value="strategy">Strategy View</TabsTrigger>
        </TabsList>

        {/* INTAKE TAB */}
        <TabsContent value="intake" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Screening Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Screen Properties</CardTitle>
                <CardDescription>Select a buy box and run the screening engine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Buy Box (optional)</Label>
                  <Select value={selectedBoxId} onValueChange={setSelectedBoxId}>
                    <SelectTrigger><SelectValue placeholder="Auto-score without buy box" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Buy Box (auto-score)</SelectItem>
                      {buyBoxes.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name} ({getStrategyLabel(b.strategy_type)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{manualDeals.length} properties in queue</span>
                  <Button onClick={runScreening} disabled={manualDeals.length === 0}>
                    <Play className="h-4 w-4 mr-2" />Run Screening
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CSV Import */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">CSV / Paste Import</CardTitle>
                <CardDescription>Paste CSV data with headers: address, city, state, zip, asking_price, sqft, beds, baths, year_built, condition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="address,city,state,zip,asking_price,sqft,beds,baths,year_built,condition&#10;123 Main St,Denver,CO,80202,250000,1400,3,2,1985,fair"
                  rows={4} value={csvText} onChange={e => setCsvText(e.target.value)}
                />
                <Button variant="outline" onClick={parseCSV} disabled={!csvText.trim()} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />Parse CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Queue Table */}
          {manualDeals.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Screening Queue ({manualDeals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-auto max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Address</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Beds/Bath</TableHead>
                        <TableHead>Sqft</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manualDeals.slice(0, 50).map(d => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium text-sm">{d.address}</TableCell>
                          <TableCell className="text-sm">{d.city}, {d.state}</TableCell>
                          <TableCell className="text-sm">{d.asking_price ? fmt(d.asking_price) : '—'}</TableCell>
                          <TableCell className="text-sm">{d.beds || '—'}/{d.baths || '—'}</TableCell>
                          <TableCell className="text-sm">{d.sqft?.toLocaleString() || '—'}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] capitalize">{d.condition_estimate || '—'}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{d.source}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive"
                              onClick={() => setManualDeals(prev => prev.filter(x => x.id !== d.id))}>Remove</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* RESULTS TAB */}
        <TabsContent value="results" className="space-y-4">
          {results.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No results yet. Add properties and run screening.</CardContent></Card>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <Card className="cursor-pointer hover:ring-1 ring-primary" onClick={() => setFilterClass('strong_match')}>
                  <CardContent className="py-4 flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div><div className="text-2xl font-bold text-foreground">{stats.strong}</div><div className="text-xs text-muted-foreground">Strong Match</div></div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:ring-1 ring-primary" onClick={() => setFilterClass('possible_match')}>
                  <CardContent className="py-4 flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    <div><div className="text-2xl font-bold text-foreground">{stats.possible}</div><div className="text-xs text-muted-foreground">Possible Match</div></div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:ring-1 ring-primary" onClick={() => setFilterClass('weak_match')}>
                  <CardContent className="py-4 flex items-center gap-3">
                    <TrendingDown className="h-8 w-8 text-orange-500" />
                    <div><div className="text-2xl font-bold text-foreground">{stats.weak}</div><div className="text-xs text-muted-foreground">Weak Match</div></div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:ring-1 ring-primary" onClick={() => setFilterClass('reject')}>
                  <CardContent className="py-4 flex items-center gap-3">
                    <XCircle className="h-8 w-8 text-destructive" />
                    <div><div className="text-2xl font-bold text-foreground">{stats.reject}</div><div className="text-xs text-muted-foreground">Rejected</div></div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Badge variant={filterClass === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterClass('all')}>All ({results.length})</Badge>
                {['strong_match', 'possible_match', 'weak_match', 'reject'].map(c => (
                  <Badge key={c} variant={filterClass === c ? 'default' : 'outline'} className="cursor-pointer"
                    onClick={() => setFilterClass(filterClass === c ? 'all' : c)}>
                    {getClassificationLabel(c)} ({results.filter(r => r.deal_classification === c).length})
                  </Badge>
                ))}
                <span className="text-muted-foreground mx-2">|</span>
                {['brrrr', 'mid_flip', 'high_flip'].map(s => (
                  <Badge key={s} variant={filterStrategy === s ? 'default' : 'outline'} className="cursor-pointer"
                    onClick={() => setFilterStrategy(filterStrategy === s ? 'all' : s)}>
                    {getStrategyLabel(s)}
                  </Badge>
                ))}
              </div>

              {/* Results Table */}
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Asking</TableHead>
                      <TableHead>MAO</TableHead>
                      <TableHead>Est. Rehab</TableHead>
                      <TableHead>Est. ARV</TableHead>
                      <TableHead>Flip Profit</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(r => (
                      <TableRow key={r.lead_property_id} className="cursor-pointer hover:bg-muted/50"
                        onClick={() => { setSelectedResult(r); setDetailOpen(true); }}>
                        <TableCell className="font-medium text-sm max-w-[200px] truncate">{r.address}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${getClassificationColor(r.deal_classification)}`}>{r.deal_score}</span>
                            <Progress value={r.deal_score} className="w-12 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getClassificationBadgeVariant(r.deal_classification)} className="text-[10px]">
                            {getClassificationLabel(r.deal_classification)}
                          </Badge>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{getStrategyLabel(r.primary_strategy_fit)}</Badge></TableCell>
                        <TableCell className="text-sm">{r.address && manualDeals.find(d => d.id === r.lead_property_id)?.asking_price ? fmt(manualDeals.find(d => d.id === r.lead_property_id)!.asking_price!) : '—'}</TableCell>
                        <TableCell className="text-sm font-medium">{fmt(r.max_allowable_offer)}</TableCell>
                        <TableCell className="text-sm">{fmt(r.estimated_rehab)}</TableCell>
                        <TableCell className="text-sm">{fmt(r.estimated_arv)}</TableCell>
                        <TableCell className={`text-sm font-medium ${r.estimated_flip_profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                          {fmt(r.estimated_flip_profit)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{getActionLabel(r.recommended_action)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        {/* STRATEGY VIEW TAB */}
        <TabsContent value="strategy" className="space-y-4">
          {results.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Run screening first to see strategy breakdown.</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {['brrrr', 'mid_flip', 'high_flip'].map(strategy => {
                const stratResults = results.filter(r => r.primary_strategy_fit === strategy);
                const strong = stratResults.filter(r => r.deal_classification === 'strong_match');
                const avgProfit = stratResults.length > 0
                  ? Math.round(stratResults.reduce((s, r) => s + r.estimated_flip_profit, 0) / stratResults.length) : 0;
                const avgCashLeft = stratResults.length > 0
                  ? Math.round(stratResults.reduce((s, r) => s + r.estimated_cash_left_in_deal, 0) / stratResults.length) : 0;

                return (
                  <Card key={strategy}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{getStrategyLabel(strategy)}</CardTitle>
                      <CardDescription>{stratResults.length} opportunities found</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-muted-foreground">Strong matches<div className="text-foreground font-bold text-lg">{strong.length}</div></div>
                        <div className="text-muted-foreground">Avg profit<div className={`font-bold text-lg ${avgProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(avgProfit)}</div></div>
                        {strategy === 'brrrr' && <div className="col-span-2 text-muted-foreground">Avg cash left<div className="text-foreground font-bold">{fmt(avgCashLeft)}</div></div>}
                      </div>
                      {strong.slice(0, 3).map(r => (
                        <div key={r.lead_property_id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50 cursor-pointer"
                          onClick={() => { setSelectedResult(r); setDetailOpen(true); }}>
                          <span className="truncate max-w-[160px] font-medium">{r.address}</span>
                          <span className="text-green-600 font-bold">{r.deal_score}</span>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setFilterStrategy(strategy); setFilterClass('all'); setActiveTab('results'); }}>
                        View all {getStrategyLabel(strategy)} deals <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ADD PROPERTY DIALOG */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Property for Screening</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Address *</Label>
                <Input placeholder="123 Main St" value={newDeal.address} onChange={e => setNewDeal(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="space-y-1"><Label className="text-xs">City</Label><Input value={newDeal.city || ''} onChange={e => setNewDeal(p => ({ ...p, city: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><Label className="text-xs">State</Label><Input value={newDeal.state || ''} onChange={e => setNewDeal(p => ({ ...p, state: e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Zip</Label><Input value={newDeal.zip || ''} onChange={e => setNewDeal(p => ({ ...p, zip: e.target.value }))} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Asking Price</Label><Input type="number" value={newDeal.asking_price ?? ''} onChange={e => setNewDeal(p => ({ ...p, asking_price: e.target.value ? Number(e.target.value) : undefined }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Sqft</Label><Input type="number" value={newDeal.sqft ?? ''} onChange={e => setNewDeal(p => ({ ...p, sqft: e.target.value ? Number(e.target.value) : undefined }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Beds</Label><Input type="number" value={newDeal.beds ?? ''} onChange={e => setNewDeal(p => ({ ...p, beds: e.target.value ? Number(e.target.value) : undefined }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Baths</Label><Input type="number" value={newDeal.baths ?? ''} onChange={e => setNewDeal(p => ({ ...p, baths: e.target.value ? Number(e.target.value) : undefined }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Year Built</Label><Input type="number" value={newDeal.year_built ?? ''} onChange={e => setNewDeal(p => ({ ...p, year_built: e.target.value ? Number(e.target.value) : undefined }))} /></div>
              <div className="space-y-1">
                <Label className="text-xs">Condition</Label>
                <Select value={newDeal.condition_estimate || 'fair'} onValueChange={v => setNewDeal(p => ({ ...p, condition_estimate: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CONDITION_OPTIONS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Property Type</Label>
                <Select value={newDeal.property_type || 'single_family'} onValueChange={v => setNewDeal(p => ({ ...p, property_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Source</Label>
                <Select value={newDeal.source || 'Manual Entry'} onValueChange={v => setNewDeal(p => ({ ...p, source: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SOURCE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Listing Notes</Label>
                <Textarea rows={2} value={newDeal.listing_notes || ''} onChange={e => setNewDeal(p => ({ ...p, listing_notes: e.target.value }))} placeholder="Handyman special, needs work..." />
              </div>
              <div className="space-y-1"><Label className="text-xs">Listing URL</Label><Input value={newDeal.listing_url || ''} onChange={e => setNewDeal(p => ({ ...p, listing_url: e.target.value }))} placeholder="https://..." /></div>
              <div className="space-y-1"><Label className="text-xs">Lot Size (sqft)</Label><Input type="number" value={newDeal.lot_size ?? ''} onChange={e => setNewDeal(p => ({ ...p, lot_size: e.target.value ? Number(e.target.value) : undefined }))} /></div>
            </div>
            <Button onClick={addManualDeal} className="w-full">Add to Screening Queue</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DEAL DETAIL DIALOG */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedResult && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" /> {selectedResult.address}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Score & Classification */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-4xl font-black ${getClassificationColor(selectedResult.deal_classification)}`}>{selectedResult.deal_score}</div>
                    <Badge variant={getClassificationBadgeVariant(selectedResult.deal_classification)} className="mt-1">{getClassificationLabel(selectedResult.deal_classification)}</Badge>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex gap-2">
                      <Badge variant="outline">{getStrategyLabel(selectedResult.primary_strategy_fit)}</Badge>
                      {selectedResult.secondary_strategy_fit && <Badge variant="outline" className="opacity-60">{getStrategyLabel(selectedResult.secondary_strategy_fit)}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">Recommended: <span className="text-foreground font-medium">{getActionLabel(selectedResult.recommended_action)}</span></div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'MAO (70% Rule)', value: fmt(selectedResult.max_allowable_offer), icon: Target },
                    { label: 'Est. Rehab', value: `${fmt(selectedResult.estimated_rehab_low)} – ${fmt(selectedResult.estimated_rehab_high)}`, icon: DollarSign },
                    { label: 'Est. ARV', value: `${fmt(selectedResult.estimated_arv_low)} – ${fmt(selectedResult.estimated_arv_high)}`, icon: TrendingUp },
                    { label: 'Flip Profit', value: fmt(selectedResult.estimated_flip_profit), icon: BarChart3, color: selectedResult.estimated_flip_profit >= 0 ? 'text-green-600' : 'text-destructive' },
                    { label: 'Cash Left (BRRRR)', value: fmt(selectedResult.estimated_cash_left_in_deal), icon: DollarSign },
                    { label: 'Est. Rent', value: fmt(selectedResult.estimated_rent), icon: Home },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><item.icon className="h-3 w-3" />{item.label}</div>
                      <div className={`font-bold text-sm ${item.color || 'text-foreground'}`}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Risk Scores */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Rehab Risk</div>
                    <Progress value={selectedResult.rehab_risk_score} className="h-2" />
                    <div className="text-xs font-medium">{selectedResult.rehab_risk_score}/100</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">ARV Confidence</div>
                    <Progress value={selectedResult.arv_confidence_score} className="h-2" />
                    <div className="text-xs font-medium">{selectedResult.arv_confidence_score}/100</div>
                  </div>
                </div>

                {/* Scoring Breakdown */}
                {Object.keys(selectedResult.scoring_breakdown).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Score Breakdown</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(selectedResult.scoring_breakdown).map(([key, val]) => (
                        <div key={key} className="text-xs p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                          <span className="float-right font-bold">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Reasons */}
                {selectedResult.rejection_reason && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center gap-1 text-xs font-medium text-destructive mb-1"><XCircle className="h-3 w-3" />Rejection Reasons</div>
                    <p className="text-xs text-destructive/80">{selectedResult.rejection_reason}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
