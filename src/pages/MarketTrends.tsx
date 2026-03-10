import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, DollarSign, Home, Clock, Upload, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const STUB_ZIPS = ['80202', '80204', '80210', '80219', '80223', '80227', '80233', '80239'];

const STUB_TRENDS = STUB_ZIPS.map(zip => ({
  zip,
  medianPrice: 320000 + Math.floor(Math.random() * 180000),
  homesSold: 15 + Math.floor(Math.random() * 40),
  newListings: 20 + Math.floor(Math.random() * 35),
  inventory: 40 + Math.floor(Math.random() * 80),
  dom: 12 + Math.floor(Math.random() * 30),
  pricePerSqft: 180 + Math.floor(Math.random() * 120),
  momChange: (Math.random() * 6 - 2).toFixed(1),
  yoyChange: (Math.random() * 12 - 3).toFixed(1),
}));

const STUB_MONTHLY = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2025, i, 1);
  return {
    month: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    medianPrice: 340000 + Math.floor(Math.random() * 40000) + i * 2000,
    homesSold: 200 + Math.floor(Math.random() * 80) + (i > 3 && i < 9 ? 40 : 0),
    inventory: 800 + Math.floor(Math.random() * 200) - i * 10,
    dom: 25 - Math.floor(i * 0.8) + Math.floor(Math.random() * 5),
  };
});

export default function MarketTrends() {
  const [selectedZip, setSelectedZip] = useState('all');

  const displayTrends = selectedZip === 'all' ? STUB_TRENDS : STUB_TRENDS.filter(t => t.zip === selectedZip);

  return (
    <div className="crm-page animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="crm-page-title flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Market Trends
          </h1>
          <p className="crm-page-subtitle">Denver metro market data by zip code (Redfin Data Center)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <Upload className="mr-1 h-3 w-3" /> Import CSV
          </Button>
        </div>
      </div>

      {/* Metro summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Card className="py-3 text-center">
          <p className="text-lg font-bold text-foreground">$385k</p>
          <p className="text-[10px] text-muted-foreground">Median Price</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="text-lg font-bold text-foreground">243</p>
          <p className="text-[10px] text-muted-foreground">Homes Sold</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="text-lg font-bold text-foreground">18</p>
          <p className="text-[10px] text-muted-foreground">Median DOM</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="text-lg font-bold text-foreground">$232</p>
          <p className="text-[10px] text-muted-foreground">Price/Sqft</p>
        </Card>
        <Card className="py-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--crm-success))]" />
            <p className="text-lg font-bold text-[hsl(var(--crm-success))]">+3.2%</p>
          </div>
          <p className="text-[10px] text-muted-foreground">YoY Change</p>
        </Card>
      </div>

      <Tabs defaultValue="byzip" className="space-y-4">
        <TabsList>
          <TabsTrigger value="byzip">By Zip Code</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="compare">Compare Zips</TabsTrigger>
        </TabsList>

        <TabsContent value="byzip">
          <div className="flex gap-2 mb-4">
            <Select value={selectedZip} onValueChange={setSelectedZip}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Zips" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zip Codes</SelectItem>
                {STUB_ZIPS.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zip</TableHead>
                  <TableHead className="text-right">Median Price</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Listings</TableHead>
                  <TableHead className="text-right">Inventory</TableHead>
                  <TableHead className="text-right">DOM</TableHead>
                  <TableHead className="text-right">$/Sqft</TableHead>
                  <TableHead className="text-right">MoM</TableHead>
                  <TableHead className="text-right">YoY</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTrends.map(t => (
                  <TableRow key={t.zip}>
                    <TableCell className="font-medium">{t.zip}</TableCell>
                    <TableCell className="text-right">${(t.medianPrice / 1000).toFixed(0)}k</TableCell>
                    <TableCell className="text-right">{t.homesSold}</TableCell>
                    <TableCell className="text-right">{t.newListings}</TableCell>
                    <TableCell className="text-right">{t.inventory}</TableCell>
                    <TableCell className="text-right">{t.dom}</TableCell>
                    <TableCell className="text-right">${t.pricePerSqft}</TableCell>
                    <TableCell className="text-right">
                      <span className={Number(t.momChange) >= 0 ? 'text-[hsl(var(--crm-success))]' : 'text-destructive'}>
                        {Number(t.momChange) >= 0 ? '+' : ''}{t.momChange}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={Number(t.yoyChange) >= 0 ? 'text-[hsl(var(--crm-success))]' : 'text-destructive'}>
                        {Number(t.yoyChange) >= 0 ? '+' : ''}{t.yoyChange}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">12-Month Trend (Denver Metro)</CardTitle>
              <CardDescription>Aggregated market data across all tracked zip codes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {STUB_MONTHLY.map(m => (
                  <div key={m.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <p className="text-sm font-medium text-foreground w-24">{m.month}</p>
                    <div className="flex gap-6 text-xs text-muted-foreground">
                      <span><DollarSign className="h-3 w-3 inline" /> ${(m.medianPrice / 1000).toFixed(0)}k</span>
                      <span><Home className="h-3 w-3 inline" /> {m.homesSold} sold</span>
                      <span>Inv: {m.inventory}</span>
                      <span><Clock className="h-3 w-3 inline" /> {m.dom} DOM</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zip Code Comparison</CardTitle>
              <CardDescription>Compare market metrics across 2-3 zip codes side by side</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center border border-dashed rounded-lg">
                <Filter className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Comparison Tool Coming Soon</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Select 2-3 zip codes to compare median prices, DOM, inventory, and more with interactive charts.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
