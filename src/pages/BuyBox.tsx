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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Plus, Copy, Archive, Star, Target, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { evaluateMatch, getScoreLabel, getScoreColor, getActionLabel, getStrategyLabel, type BuyBox as BuyBoxType, type LeadProperty, type MatchResult } from '@/lib/buybox-engine';
import { useCRM } from '@/contexts/CRMContext';

const STRATEGY_OPTIONS = [
  { value: 'brrrr', label: 'BRRRR' },
  { value: 'mid_flip', label: 'Mid-Level Flip' },
  { value: 'high_flip', label: 'High-End Flip' },
];

const PROPERTY_TYPES = ['single_family', 'multi_family', 'condo', 'townhouse', 'duplex', 'triplex', 'fourplex'];

const emptyBuyBox: Partial<BuyBoxType> = {
  name: '', strategy_type: 'brrrr', description: '', is_default: false, is_active: true,
  target_states: [], target_cities: [], target_zip_codes: [], target_neighborhoods: [],
  target_school_districts: [], property_types_allowed: ['single_family'],
  preferred_condition_levels: [],
};

export default function BuyBoxPage() {
  const [buyBoxes, setBuyBoxes] = useState<BuyBoxType[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<Partial<BuyBoxType>>(emptyBuyBox);
  const [activeTab, setActiveTab] = useState('manage');
  const [matchResults, setMatchResults] = useState<(MatchResult & { propertyAddress: string })[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const { leads, properties, getProperty, getOwner } = useCRM();

  useEffect(() => { fetchBuyBoxes(); }, []);

  async function fetchBuyBoxes() {
    setLoading(true);
    const { data, error } = await supabase.from('buy_boxes').select('*').order('created_at', { ascending: false });
    if (error) { toast({ title: 'Error loading buy boxes', variant: 'destructive' }); }
    else {
      setBuyBoxes((data || []).map(d => ({
        ...d,
        target_states: d.target_states || [],
        target_cities: d.target_cities || [],
        target_zip_codes: d.target_zip_codes || [],
        target_neighborhoods: d.target_neighborhoods || [],
        target_school_districts: d.target_school_districts || [],
        property_types_allowed: d.property_types_allowed || [],
        preferred_condition_levels: d.preferred_condition_levels || [],
      })) as BuyBoxType[]);
    }
    setLoading(false);
  }

  async function saveBuyBox() {
    const { id, created_at, updated_at, ...payload } = editingBox as any;
    if (!payload.name) { toast({ title: 'Name is required', variant: 'destructive' }); return; }

    if (id) {
      const { error } = await supabase.from('buy_boxes').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) toast({ title: 'Error updating', variant: 'destructive' });
      else toast({ title: 'Buy box updated' });
    } else {
      const { error } = await supabase.from('buy_boxes').insert(payload);
      if (error) toast({ title: 'Error creating', variant: 'destructive' });
      else toast({ title: 'Buy box created' });
    }
    setFormOpen(false);
    setEditingBox(emptyBuyBox);
    fetchBuyBoxes();
  }

  async function duplicateBox(box: BuyBoxType) {
    const { id, created_at, updated_at, ...rest } = box;
    const { error } = await supabase.from('buy_boxes').insert({ ...rest, name: `${rest.name} (Copy)`, is_default: false });
    if (!error) { toast({ title: 'Buy box duplicated' }); fetchBuyBoxes(); }
  }

  async function toggleActive(box: BuyBoxType) {
    await supabase.from('buy_boxes').update({ is_active: !box.is_active, updated_at: new Date().toISOString() }).eq('id', box.id);
    fetchBuyBoxes();
  }

  async function setDefault(box: BuyBoxType) {
    await supabase.from('buy_boxes').update({ is_default: false, updated_at: new Date().toISOString() }).neq('id', box.id);
    await supabase.from('buy_boxes').update({ is_default: true, updated_at: new Date().toISOString() }).eq('id', box.id);
    fetchBuyBoxes();
  }

  function runMatchAll() {
    const box = buyBoxes.find(b => b.id === selectedBoxId);
    if (!box) { toast({ title: 'Select a buy box first', variant: 'destructive' }); return; }

    const leadProps: LeadProperty[] = leads.map(l => {
      const prop = getProperty(l.propertyId);
      return {
        id: l.id,
        address: prop?.address || '',
        city: prop?.city,
        state: prop?.state,
        zip: prop?.zip,
        asking_price: undefined,
        sqft: prop?.sqft,
        beds: prop?.beds,
        baths: prop?.baths,
        year_built: prop?.yearBuilt,
        property_type: 'single_family',
        condition_estimate: prop?.condition,
      };
    });

    const results = leadProps.map(lp => {
      const res = evaluateMatch(box, lp);
      return { ...res, propertyAddress: lp.address };
    });
    results.sort((a, b) => b.overall_match_score - a.overall_match_score);
    setMatchResults(results);
    setActiveTab('results');
    toast({ title: `Evaluated ${results.length} leads against "${box.name}"` });
  }

  const field = (label: string, key: keyof BuyBoxType, type: string = 'text', placeholder?: string) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={(editingBox as any)[key] ?? ''}
        onChange={e => setEditingBox(prev => ({ ...prev, [key]: type === 'number' ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value }))}
      />
    </div>
  );

  const arrayField = (label: string, key: keyof BuyBoxType, placeholder?: string) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        placeholder={placeholder || 'Comma-separated values'}
        value={((editingBox as any)[key] || []).join(', ')}
        onChange={e => setEditingBox(prev => ({ ...prev, [key]: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buy Box Manager</h1>
          <p className="text-sm text-muted-foreground">Define acquisition criteria, evaluate leads, and score deals</p>
        </div>
        <Button onClick={() => { setEditingBox(emptyBuyBox); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Buy Box
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manage">Buy Boxes</TabsTrigger>
          <TabsTrigger value="evaluate">Evaluate Leads</TabsTrigger>
          <TabsTrigger value="results">Match Results</TabsTrigger>
          <TabsTrigger value="strategy">Strategy View</TabsTrigger>
        </TabsList>

        {/* MANAGE TAB */}
        <TabsContent value="manage">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : buyBoxes.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              No buy boxes yet. Create one to start evaluating leads.
            </CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {buyBoxes.map(box => (
                <Card key={box.id} className={`relative ${!box.is_active ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{box.name}</CardTitle>
                        <CardDescription className="text-xs">{box.description || 'No description'}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        {box.is_default && <Badge variant="default" className="text-[10px]">Default</Badge>}
                        <Badge variant="outline" className="text-[10px]">{getStrategyLabel(box.strategy_type)}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {box.max_purchase_price && <div>Max Price: <span className="text-foreground font-medium">${box.max_purchase_price.toLocaleString()}</span></div>}
                      {box.min_arv && <div>Min ARV: <span className="text-foreground font-medium">${box.min_arv.toLocaleString()}</span></div>}
                      {box.max_rehab_budget && <div>Max Rehab: <span className="text-foreground font-medium">${box.max_rehab_budget.toLocaleString()}</span></div>}
                      {box.min_beds && <div>Min Beds: <span className="text-foreground font-medium">{box.min_beds}</span></div>}
                      {box.target_zip_codes?.length > 0 && <div className="col-span-2">Zips: <span className="text-foreground font-medium">{box.target_zip_codes.join(', ')}</span></div>}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingBox(box); setFormOpen(true); }}>Edit</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => duplicateBox(box)}><Copy className="h-3 w-3 mr-1" />Duplicate</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleActive(box)}><Archive className="h-3 w-3 mr-1" />{box.is_active ? 'Deactivate' : 'Activate'}</Button>
                      {!box.is_default && <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setDefault(box)}><Star className="h-3 w-3 mr-1" />Set Default</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* EVALUATE TAB */}
        <TabsContent value="evaluate">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evaluate Leads Against Buy Box</CardTitle>
              <CardDescription>Select a buy box and run all CRM leads through the scoring engine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-1">
                  <Label>Buy Box</Label>
                  <Select value={selectedBoxId || ''} onValueChange={setSelectedBoxId}>
                    <SelectTrigger><SelectValue placeholder="Select a buy box" /></SelectTrigger>
                    <SelectContent>
                      {buyBoxes.filter(b => b.is_active).map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name} ({getStrategyLabel(b.strategy_type)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={runMatchAll}><Target className="h-4 w-4 mr-2" />Run Evaluation</Button>
              </div>
              <p className="text-xs text-muted-foreground">{leads.length} leads available for evaluation</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RESULTS TAB */}
        <TabsContent value="results">
          {matchResults.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No results yet. Run an evaluation first.</CardContent></Card>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {['All', 'Strong Match', 'Possible Match', 'Weak Match', 'Reject'].map(label => {
                  const count = label === 'All' ? matchResults.length : matchResults.filter(r => getScoreLabel(r.overall_match_score) === label).length;
                  return <Badge key={label} variant="outline" className="cursor-pointer">{label} ({count})</Badge>;
                })}
              </div>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Rehab</TableHead>
                      <TableHead>ARV</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchResults.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-sm">{r.propertyAddress || 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getScoreColor(r.overall_match_score)}`}>{r.overall_match_score}</span>
                            <Progress value={r.overall_match_score} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.pass_status === 'pass' ? 'default' : r.pass_status === 'borderline' ? 'secondary' : 'destructive'} className="text-[10px]">
                            {r.pass_status === 'pass' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {r.pass_status === 'borderline' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {r.pass_status === 'fail' && <XCircle className="h-3 w-3 mr-1" />}
                            {getScoreLabel(r.overall_match_score)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{r.location_score}/15</TableCell>
                        <TableCell className="text-xs">{r.price_score}/15</TableCell>
                        <TableCell className="text-xs">{r.rehab_score}/15</TableCell>
                        <TableCell className="text-xs">{r.arv_score}/10</TableCell>
                        <TableCell className="text-xs">{r.deal_margin_score}/10</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{getActionLabel(r.recommended_action)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* STRATEGY VIEW TAB */}
        <TabsContent value="strategy">
          <div className="grid gap-4 md:grid-cols-3">
            {STRATEGY_OPTIONS.map(s => {
              const stratBoxes = buyBoxes.filter(b => b.strategy_type === s.value && b.is_active);
              const stratResults = matchResults.filter(r => r.strategy_type === s.value);
              const strong = stratResults.filter(r => r.overall_match_score >= 85).length;
              return (
                <Card key={s.value}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{s.label}</CardTitle>
                    <CardDescription>{stratBoxes.length} active buy box{stratBoxes.length !== 1 ? 'es' : ''}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Total matches evaluated: <span className="text-foreground font-medium">{stratResults.length}</span></div>
                      <div>Strong matches: <span className="text-green-600 font-medium">{strong}</span></div>
                      <div>Possible: <span className="text-yellow-600 font-medium">{stratResults.filter(r => r.overall_match_score >= 70 && r.overall_match_score < 85).length}</span></div>
                    </div>
                    {stratBoxes.map(b => (
                      <Badge key={b.id} variant="outline" className="text-[10px] mr-1">{b.name}</Badge>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* BUY BOX FORM DIALOG */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBox.id ? 'Edit Buy Box' : 'Create Buy Box'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {field('Name', 'name', 'text', 'e.g. Denver BRRRR Box')}
              <div className="space-y-1">
                <Label className="text-xs">Strategy</Label>
                <Select value={editingBox.strategy_type || 'brrrr'} onValueChange={v => setEditingBox(prev => ({ ...prev, strategy_type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STRATEGY_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea value={editingBox.description || ''} onChange={e => setEditingBox(prev => ({ ...prev, description: e.target.value }))} rows={2} />
            </div>

            <h4 className="font-semibold text-sm text-foreground pt-2 border-t">Location Criteria</h4>
            <div className="grid grid-cols-2 gap-3">
              {arrayField('Target States', 'target_states', 'CO, TX')}
              {arrayField('Target Cities', 'target_cities', 'Denver, Aurora')}
              {arrayField('Target Zip Codes', 'target_zip_codes', '80202, 80203')}
              {arrayField('Neighborhoods', 'target_neighborhoods', 'Capitol Hill, RiNo')}
              {arrayField('School Districts', 'target_school_districts', 'DPS')}
            </div>

            <h4 className="font-semibold text-sm text-foreground pt-2 border-t">Property Criteria</h4>
            <div className="grid grid-cols-3 gap-3">
              {field('Min Beds', 'min_beds', 'number')}
              {field('Min Baths', 'min_baths', 'number')}
              {field('Min Sqft', 'min_sqft', 'number')}
              {field('Max Sqft', 'max_sqft', 'number')}
              {field('Min Year Built', 'min_year_built', 'number')}
            </div>

            <h4 className="font-semibold text-sm text-foreground pt-2 border-t">Financial Criteria</h4>
            <div className="grid grid-cols-3 gap-3">
              {field('Max Purchase Price', 'max_purchase_price', 'number')}
              {field('Min Purchase Price', 'min_purchase_price', 'number')}
              {field('Max Rehab Budget', 'max_rehab_budget', 'number')}
              {field('Min ARV', 'min_arv', 'number')}
              {field('Min Profit ($)', 'min_profit', 'number')}
              {field('Min Profit Margin %', 'min_profit_margin_pct', 'number')}
              {field('Min Equity Spread %', 'min_equity_spread', 'number')}
              {field('Max Cash Left in Deal', 'max_cash_left_in_deal', 'number')}
            </div>

            <h4 className="font-semibold text-sm text-foreground pt-2 border-t">Rental Criteria (BRRRR)</h4>
            <div className="grid grid-cols-3 gap-3">
              {field('Min Rent', 'min_rent', 'number')}
              {field('Min Rent-to-Price Ratio', 'min_rent_to_price_ratio', 'number')}
              {field('Hold Period (months)', 'target_hold_period_months', 'number')}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Textarea value={editingBox.notes || ''} onChange={e => setEditingBox(prev => ({ ...prev, notes: e.target.value }))} rows={2} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={saveBuyBox}>Save Buy Box</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
