import { useState } from 'react';
import { Gavel, TrendingUp, TrendingDown, Minus, Filter, Download, MapPin, DollarSign, Calendar, AlertTriangle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Stub data for UI scaffolding
const STUB_FORECLOSURES = [
  { id: '1', address: '1234 Main St', zip: '80202', saleDate: '2026-04-15', openingBid: 185000, estimatedArv: 310000, opportunityScore: 67.6, status: 'upcoming', caseNumber: '2026CV001234' },
  { id: '2', address: '567 Oak Ave', zip: '80204', saleDate: '2026-04-18', openingBid: 142000, estimatedArv: 255000, opportunityScore: 79.6, status: 'upcoming', caseNumber: '2026CV001567' },
  { id: '3', address: '890 Pine Blvd', zip: '80210', saleDate: '2026-04-22', openingBid: 225000, estimatedArv: 340000, opportunityScore: 51.1, status: 'upcoming', caseNumber: '2026CV001890' },
  { id: '4', address: '321 Elm Dr', zip: '80219', saleDate: '2026-03-28', openingBid: 98000, estimatedArv: 195000, opportunityScore: 99.0, status: 'upcoming', caseNumber: '2026CV000321' },
  { id: '5', address: '654 Cedar Ln', zip: '80223', saleDate: '2026-05-01', openingBid: 275000, estimatedArv: 385000, opportunityScore: 40.0, status: 'upcoming', caseNumber: '2026CV000654' },
];

const STUB_STATS = [
  { month: 'Oct 2025', starts: 45, releases: 32, total: 77 },
  { month: 'Nov 2025', starts: 52, releases: 28, total: 80 },
  { month: 'Dec 2025', starts: 38, releases: 35, total: 73 },
  { month: 'Jan 2026', starts: 61, releases: 30, total: 91 },
  { month: 'Feb 2026', starts: 55, releases: 33, total: 88 },
  { month: 'Mar 2026', starts: 48, releases: 37, total: 85 },
];

export default function Foreclosures() {
  const [zipFilter, setZipFilter] = useState('');
  const [minScore, setMinScore] = useState('');
  const [sortBy, setSortBy] = useState('opportunityScore');

  const filtered = STUB_FORECLOSURES
    .filter(f => !zipFilter || f.zip.includes(zipFilter))
    .filter(f => !minScore || f.opportunityScore >= Number(minScore))
    .sort((a, b) => sortBy === 'opportunityScore'
      ? b.opportunityScore - a.opportunityScore
      : new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
    );

  return (
    <div className="crm-page animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="crm-page-title flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" /> Foreclosures
          </h1>
          <p className="crm-page-subtitle">Denver Sheriff foreclosure sales & market trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Scraping will run via Firecrawl')} disabled>
            <Download className="mr-1 h-3 w-3" /> Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="py-3 text-center">
          <p className="text-2xl font-bold text-foreground">{STUB_FORECLOSURES.length}</p>
          <p className="text-[10px] text-muted-foreground">Upcoming Sales</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="text-2xl font-bold text-foreground">
            ${(STUB_FORECLOSURES.reduce((s, f) => s + f.openingBid, 0) / STUB_FORECLOSURES.length / 1000).toFixed(0)}k
          </p>
          <p className="text-[10px] text-muted-foreground">Avg Opening Bid</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="text-2xl font-bold text-[hsl(var(--crm-success))]">
            {STUB_FORECLOSURES.filter(f => f.opportunityScore >= 60).length}
          </p>
          <p className="text-[10px] text-muted-foreground">High Opportunity</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="text-2xl font-bold text-foreground">{STUB_STATS[STUB_STATS.length - 1].starts}</p>
          <p className="text-[10px] text-muted-foreground">New Starts (This Month)</p>
        </Card>
      </div>

      <Tabs defaultValue="auctions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="auctions">Upcoming Auctions</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="auctions">
          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <Input placeholder="Filter by zip..." value={zipFilter} onChange={e => setZipFilter(e.target.value)} className="w-32" />
            <Input placeholder="Min score..." value={minScore} onChange={e => setMinScore(e.target.value)} className="w-28" type="number" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opportunityScore">Opportunity Score</SelectItem>
                <SelectItem value="saleDate">Sale Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Zip</TableHead>
                  <TableHead>Sale Date</TableHead>
                  <TableHead className="text-right">Opening Bid</TableHead>
                  <TableHead className="text-right">Est. ARV</TableHead>
                  <TableHead className="text-right">Opportunity</TableHead>
                  <TableHead>Case #</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(f => (
                  <TableRow key={f.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{f.address}</TableCell>
                    <TableCell>{f.zip}</TableCell>
                    <TableCell>{new Date(f.saleDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">${f.openingBid.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${f.estimatedArv.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={`text-[10px] ${f.opportunityScore >= 60
                        ? 'bg-[hsl(var(--crm-success))] text-primary-foreground'
                        : f.opportunityScore >= 40
                          ? 'bg-[hsl(var(--crm-warning))] text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {f.opportunityScore.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{f.caseNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Foreclosure Trends (6 months)
              </CardTitle>
              <CardDescription>Data from Denver Clerk & Recorder monthly reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {STUB_STATS.map((s, i) => {
                  const prev = STUB_STATS[i - 1];
                  const change = prev ? s.starts - prev.starts : 0;
                  return (
                    <div key={s.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.month}</p>
                        <p className="text-xs text-muted-foreground">{s.total} total filings</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">{s.starts} starts</p>
                          <p className="text-xs text-muted-foreground">{s.releases} releases</p>
                        </div>
                        {prev && (
                          <Badge variant="outline" className="text-[10px]">
                            {change > 0 ? <TrendingUp className="h-3 w-3 mr-1 text-destructive" /> : change < 0 ? <TrendingDown className="h-3 w-3 mr-1 text-[hsl(var(--crm-success))]" /> : <Minus className="h-3 w-3 mr-1" />}
                            {change > 0 ? '+' : ''}{change}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-4">Source: Denver Clerk & Recorder foreclosure reports (PDF parsed)</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Foreclosure Alerts</CardTitle>
              <CardDescription>Get notified when new foreclosures match your criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center border border-dashed rounded-lg">
                <AlertTriangle className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Alert Configuration Coming Soon</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Set up email alerts for new foreclosures matching your target zip codes, minimum opportunity score, and property type criteria.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
