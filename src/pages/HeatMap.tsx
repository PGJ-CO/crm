import { useState } from 'react';
import { Map, Filter, Download, TrendingUp, TrendingDown, Minus, Target, DollarSign, Home, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const MOCK_ZIP_DATA = [
  { zip: '80202', deals: 12, avgProfit: 42000, distressIndex: 78, buyerDemand: 85, investorActivity: 72, roi: 82, trend: 'improving', propertyCount: 340 },
  { zip: '80204', deals: 8, avgProfit: 38000, distressIndex: 65, buyerDemand: 70, investorActivity: 55, roi: 71, trend: 'stable', propertyCount: 520 },
  { zip: '80210', deals: 15, avgProfit: 55000, distressIndex: 45, buyerDemand: 92, investorActivity: 88, roi: 90, trend: 'improving', propertyCount: 280 },
  { zip: '80219', deals: 6, avgProfit: 32000, distressIndex: 82, buyerDemand: 60, investorActivity: 40, roi: 65, trend: 'declining', propertyCount: 410 },
  { zip: '80223', deals: 10, avgProfit: 41000, distressIndex: 70, buyerDemand: 75, investorActivity: 62, roi: 74, trend: 'stable', propertyCount: 390 },
  { zip: '80227', deals: 4, avgProfit: 28000, distressIndex: 55, buyerDemand: 50, investorActivity: 35, roi: 52, trend: 'declining', propertyCount: 600 },
  { zip: '80233', deals: 9, avgProfit: 45000, distressIndex: 60, buyerDemand: 80, investorActivity: 70, roi: 78, trend: 'improving', propertyCount: 310 },
  { zip: '80239', deals: 7, avgProfit: 36000, distressIndex: 72, buyerDemand: 65, investorActivity: 48, roi: 62, trend: 'stable', propertyCount: 450 },
];

export default function HeatMap() {
  const [layer, setLayer] = useState('roi');
  const [sortBy, setSortBy] = useState<'roi' | 'deals' | 'distressIndex'>('roi');

  const sorted = [...MOCK_ZIP_DATA].sort((a, b) => b[sortBy] - a[sortBy]);

  const trendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-accent" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const heatColor = (value: number) => {
    if (value >= 80) return 'bg-accent/20 text-accent';
    if (value >= 60) return 'bg-crm-warning/20 text-crm-warning';
    if (value >= 40) return 'bg-primary/20 text-primary';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="crm-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title flex items-center gap-2">
            <Map className="w-7 h-7 text-primary" />
            Heat Maps
          </h1>
          <p className="crm-page-subtitle">Visualize deal activity and opportunity by zip code</p>
        </div>
        <div className="flex gap-2">
          <Select value={layer} onValueChange={setLayer}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Map Layer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roi">ROI Potential</SelectItem>
              <SelectItem value="distress">Seller Distress</SelectItem>
              <SelectItem value="demand">Buyer Demand</SelectItem>
              <SelectItem value="activity">Investor Activity</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => toast.info('Export placeholder')}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Map Placeholder */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="h-[400px] bg-muted/30 flex flex-col items-center justify-center rounded-lg">
            <Map className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Interactive Map</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md text-center">
              Connect Google Maps Platform or Mapbox to enable interactive heat map visualization with zip code overlays.
            </p>
            <Badge variant="secondary" className="mt-3">Map Provider Required</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="crm-stat-card">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" /> Zip Codes Analyzed</div>
          <div className="text-2xl font-bold text-foreground">{MOCK_ZIP_DATA.length}</div>
        </Card>
        <Card className="crm-stat-card">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" /> Total Deals</div>
          <div className="text-2xl font-bold text-foreground">{MOCK_ZIP_DATA.reduce((s, d) => s + d.deals, 0)}</div>
        </Card>
        <Card className="crm-stat-card">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" /> Avg Profit/Deal</div>
          <div className="text-2xl font-bold text-accent">
            ${Math.round(MOCK_ZIP_DATA.reduce((s, d) => s + d.avgProfit, 0) / MOCK_ZIP_DATA.length).toLocaleString()}
          </div>
        </Card>
        <Card className="crm-stat-card">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><Home className="w-3 h-3" /> Properties Tracked</div>
          <div className="text-2xl font-bold text-foreground">{MOCK_ZIP_DATA.reduce((s, d) => s + d.propertyCount, 0).toLocaleString()}</div>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Zip Code Analysis</CardTitle>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roi">Sort by ROI</SelectItem>
                <SelectItem value="deals">Sort by Deals</SelectItem>
                <SelectItem value="distressIndex">Sort by Distress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zip Code</TableHead>
                <TableHead className="text-right">Deals</TableHead>
                <TableHead className="text-right">Avg Profit</TableHead>
                <TableHead className="text-right">Distress</TableHead>
                <TableHead className="text-right">Buyer Demand</TableHead>
                <TableHead className="text-right">ROI Score</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead className="text-right">Properties</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(zip => (
                <TableRow key={zip.zip}>
                  <TableCell className="font-medium text-foreground">{zip.zip}</TableCell>
                  <TableCell className="text-right text-foreground">{zip.deals}</TableCell>
                  <TableCell className="text-right font-medium text-foreground">${zip.avgProfit.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={heatColor(zip.distressIndex)}>{zip.distressIndex}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={heatColor(zip.buyerDemand)}>{zip.buyerDemand}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={heatColor(zip.roi)}>{zip.roi}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {trendIcon(zip.trend)}
                      <span className="text-xs capitalize text-foreground">{zip.trend}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{zip.propertyCount}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => toast.info(`Generate list for ${zip.zip}`)}>
                      <Users className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
