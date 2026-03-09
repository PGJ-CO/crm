import { useState } from 'react';
import { Search, Filter, Download, Save, List, ChevronDown, ChevronRight, Star, MapPin, DollarSign, AlertTriangle, Home, Users, TrendingUp, Clock, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FilterCategory {
  label: string;
  icon: React.ElementType;
  filters: { key: string; label: string; type: 'checkbox' | 'range' | 'select'; options?: string[] }[];
}

const FILTER_CATEGORIES: FilterCategory[] = [
  {
    label: 'Property',
    icon: Home,
    filters: [
      { key: 'propertyType', label: 'Property Type', type: 'select', options: ['Single Family', 'Multi-Family', 'Condo', 'Townhouse', 'Land', 'Commercial'] },
      { key: 'bedsMin', label: 'Min Beds', type: 'range' },
      { key: 'bedsMax', label: 'Max Beds', type: 'range' },
      { key: 'sqftMin', label: 'Min Sqft', type: 'range' },
      { key: 'sqftMax', label: 'Max Sqft', type: 'range' },
      { key: 'yearBuiltMin', label: 'Min Year Built', type: 'range' },
      { key: 'yearBuiltMax', label: 'Max Year Built', type: 'range' },
    ],
  },
  {
    label: 'Owner',
    icon: Users,
    filters: [
      { key: 'absentee', label: 'Absentee Owner', type: 'checkbox' },
      { key: 'outOfState', label: 'Out-of-State Owner', type: 'checkbox' },
      { key: 'corporate', label: 'Corporate Owned', type: 'checkbox' },
      { key: 'ownershipMin', label: 'Min Years Owned', type: 'range' },
      { key: 'ownershipMax', label: 'Max Years Owned', type: 'range' },
      { key: 'tiredLandlord', label: 'Tired Landlord', type: 'checkbox' },
    ],
  },
  {
    label: 'Financial',
    icon: DollarSign,
    filters: [
      { key: 'equityMin', label: 'Min Equity %', type: 'range' },
      { key: 'equityMax', label: 'Max Equity %', type: 'range' },
      { key: 'valueMin', label: 'Min Value', type: 'range' },
      { key: 'valueMax', label: 'Max Value', type: 'range' },
      { key: 'taxDelinquent', label: 'Tax Delinquent', type: 'checkbox' },
      { key: 'freeAndClear', label: 'Free & Clear', type: 'checkbox' },
    ],
  },
  {
    label: 'Distress Signals',
    icon: AlertTriangle,
    filters: [
      { key: 'preForeclosure', label: 'Pre-Foreclosure', type: 'checkbox' },
      { key: 'vacant', label: 'Vacant', type: 'checkbox' },
      { key: 'codeViolations', label: 'Code Violations', type: 'checkbox' },
      { key: 'probate', label: 'Probate', type: 'checkbox' },
      { key: 'divorce', label: 'Divorce', type: 'checkbox' },
      { key: 'highEquity', label: 'High Equity (70%+)', type: 'checkbox' },
    ],
  },
  {
    label: 'Market',
    icon: TrendingUp,
    filters: [
      { key: 'domMin', label: 'Min Days on Market', type: 'range' },
      { key: 'domMax', label: 'Max Days on Market', type: 'range' },
      { key: 'priceReduced', label: 'Price Reduced', type: 'checkbox' },
    ],
  },
];

const PRESET_SEARCHES = [
  { name: 'Absentee + High Equity', description: 'Absentee owners with 70%+ equity', icon: Star, filters: { absentee: true, equityMin: 70 } },
  { name: 'Pre-Foreclosure', description: 'Properties in pre-foreclosure status', icon: AlertTriangle, filters: { preForeclosure: true } },
  { name: 'Tired Landlords', description: 'Long ownership, multiple properties', icon: Clock, filters: { tiredLandlord: true, ownershipMin: 10 } },
  { name: 'Vacant Properties', description: 'Currently vacant properties', icon: Home, filters: { vacant: true } },
  { name: 'Probate Leads', description: 'Properties in probate', icon: Users, filters: { probate: true } },
  { name: 'Tax Delinquent', description: 'Properties with delinquent taxes', icon: DollarSign, filters: { taxDelinquent: true } },
  { name: 'Free & Clear', description: 'No mortgage, high equity potential', icon: TrendingUp, filters: { freeAndClear: true } },
  { name: 'Distress Stacking', description: 'Multiple distress signals', icon: Layers, filters: { preForeclosure: true, taxDelinquent: true, vacant: true } },
];

// Mock results for demonstration
const MOCK_RESULTS = Array.from({ length: 20 }, (_, i) => ({
  id: `prop-${i}`,
  address: `${100 + i * 37} ${['Oak', 'Elm', 'Pine', 'Cedar', 'Maple'][i % 5]} St`,
  city: ['Denver', 'Aurora', 'Lakewood', 'Arvada', 'Westminster'][i % 5],
  state: 'CO',
  zip: `80${200 + i}`,
  beds: 2 + (i % 4),
  baths: 1 + (i % 3),
  sqft: 900 + i * 120,
  yearBuilt: 1960 + (i % 40),
  ownerName: `Owner ${i + 1}`,
  equityPercent: 30 + (i * 7) % 70,
  estimatedValue: 200000 + i * 25000,
  distressScore: Math.floor(Math.random() * 100),
  signals: [
    i % 3 === 0 ? 'pre-foreclosure' : null,
    i % 4 === 0 ? 'vacant' : null,
    i % 5 === 0 ? 'tax-delinquent' : null,
    i % 2 === 0 ? 'absentee' : null,
    i % 6 === 0 ? 'code-violations' : null,
  ].filter(Boolean) as string[],
}));

export default function LeadFinder() {
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchLocation, setSearchLocation] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['Property']));

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const toggleFilter = (key: string, value: any) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (typeof value === 'boolean') {
        next[key] ? delete next[key] : (next[key] = true);
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const applyPreset = (preset: typeof PRESET_SEARCHES[0]) => {
    setActiveFilters(preset.filters);
    setHasSearched(true);
    toast.success(`Applied preset: ${preset.name}`);
  };

  const runSearch = () => {
    setHasSearched(true);
    toast.success(`Found ${MOCK_RESULTS.length} properties matching your criteria`);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === MOCK_RESULTS.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(MOCK_RESULTS.map(r => r.id)));
    }
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  const signalColor = (signal: string) => {
    const map: Record<string, string> = {
      'pre-foreclosure': 'bg-destructive/10 text-destructive',
      'vacant': 'bg-crm-warning/10 text-crm-warning',
      'tax-delinquent': 'bg-destructive/10 text-destructive',
      'absentee': 'bg-primary/10 text-primary',
      'code-violations': 'bg-crm-warning/10 text-crm-warning',
      'probate': 'bg-purple-100 text-purple-700',
    };
    return map[signal] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="crm-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title flex items-center gap-2">
            <Search className="w-7 h-7 text-primary" />
            Lead Finder
          </h1>
          <p className="crm-page-subtitle">Search properties and build targeted lead lists</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Saved searches coming soon')}>
            <Save className="w-4 h-4 mr-1" /> Saved Searches
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Lists page coming soon')}>
            <List className="w-4 h-4 mr-1" /> My Lists
          </Button>
        </div>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="presets">Preset Searches</TabsTrigger>
        </TabsList>

        <TabsContent value="presets">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_SEARCHES.map(preset => (
              <Card
                key={preset.name}
                className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/30"
                onClick={() => applyPreset(preset)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <preset.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{preset.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{preset.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="search">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filter Panel */}
            <Card className="lg:w-80 shrink-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="text-xs">{activeFilterCount} active</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                {/* Location */}
                <div className="pb-3 border-b">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Location</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="City, ZIP, or County"
                      value={searchLocation}
                      onChange={e => setSearchLocation(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>

                {FILTER_CATEGORIES.map(cat => (
                  <Collapsible key={cat.label} open={openCategories.has(cat.label)}>
                    <CollapsibleTrigger
                      className="flex items-center justify-between w-full py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => toggleCategory(cat.label)}
                    >
                      <span className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4 text-muted-foreground" />
                        {cat.label}
                      </span>
                      {openCategories.has(cat.label) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pb-3">
                      {cat.filters.map(f => (
                        <div key={f.key} className="pl-6">
                          {f.type === 'checkbox' ? (
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox
                                checked={!!activeFilters[f.key]}
                                onCheckedChange={() => toggleFilter(f.key, true)}
                              />
                              <span className="text-foreground">{f.label}</span>
                            </label>
                          ) : f.type === 'select' ? (
                            <Select onValueChange={v => toggleFilter(f.key, v)}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder={f.label} />
                              </SelectTrigger>
                              <SelectContent>
                                {f.options?.map(o => (
                                  <SelectItem key={o} value={o}>{o}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type="number"
                              placeholder={f.label}
                              className="h-8 text-xs"
                              value={activeFilters[f.key] || ''}
                              onChange={e => toggleFilter(f.key, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}

                <div className="pt-3 space-y-2">
                  <Button className="w-full" onClick={runSearch}>
                    <Search className="w-4 h-4 mr-1" /> Search Properties
                  </Button>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setActiveFilters({})}>
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {!hasSearched ? (
                <Card className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">Start Your Search</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Use the filters on the left or select a preset search to find motivated sellers in your target market.
                  </p>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {MOCK_RESULTS.length} Properties Found
                      </CardTitle>
                      <div className="flex gap-2">
                        {selectedIds.size > 0 && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => toast.info('Skip trace integration placeholder')}>
                              Skip Trace ({selectedIds.size})
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toast.info('Add to list placeholder')}>
                              <List className="w-4 h-4 mr-1" /> Add to List
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => toast.info('Export placeholder')}>
                          <Download className="w-4 h-4 mr-1" /> Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <Checkbox
                                checked={selectedIds.size === MOCK_RESULTS.length}
                                onCheckedChange={selectAll}
                              />
                            </TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="text-right">Equity</TableHead>
                            <TableHead>Signals</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {MOCK_RESULTS.map(prop => (
                            <TableRow
                              key={prop.id}
                              className="cursor-pointer"
                              onClick={() => navigate(`/property-snapshot/${prop.id}`)}
                            >
                              <TableCell onClick={e => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedIds.has(prop.id)}
                                  onCheckedChange={() => toggleSelect(prop.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm text-foreground">{prop.address}</p>
                                  <p className="text-xs text-muted-foreground">{prop.city}, {prop.state} {prop.zip}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-foreground">{prop.ownerName}</TableCell>
                              <TableCell className="text-right text-sm font-medium text-foreground">
                                ${prop.estimatedValue.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary" className={prop.equityPercent >= 70 ? 'bg-accent/10 text-accent' : ''}>
                                  {prop.equityPercent}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {prop.signals.slice(0, 3).map(s => (
                                    <Badge key={s} variant="outline" className={`text-[10px] px-1.5 ${signalColor(s)}`}>
                                      {s}
                                    </Badge>
                                  ))}
                                  {prop.signals.length > 3 && (
                                    <Badge variant="outline" className="text-[10px] px-1.5">+{prop.signals.length - 3}</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                  prop.distressScore >= 70 ? 'bg-accent/10 text-accent' :
                                  prop.distressScore >= 40 ? 'bg-crm-warning/10 text-crm-warning' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {prop.distressScore}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
