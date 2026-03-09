import { useState, useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map, Filter, Download, TrendingUp, TrendingDown, Minus, Target, DollarSign, Home, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const MAPBOX_TOKEN = "pk.eyJ1IjoibmV2ZXJzdW1tZXI3NCIsImEiOiJjbW1oNDZ1bjYwYmIwMnFwdG8wMzMzaWJ5In0.-6ODr_GW3H4wfKpkQtrgbA";

const MOCK_ZIP_DATA = [
  { zip: '80202', deals: 12, avgProfit: 42000, distressIndex: 78, buyerDemand: 85, investorActivity: 72, roi: 82, trend: 'improving', propertyCount: 340, lat: 39.7530, lng: -104.9995 },
  { zip: '80204', deals: 8, avgProfit: 38000, distressIndex: 65, buyerDemand: 70, investorActivity: 55, roi: 71, trend: 'stable', propertyCount: 520, lat: 39.7370, lng: -105.0156 },
  { zip: '80210', deals: 15, avgProfit: 55000, distressIndex: 45, buyerDemand: 92, investorActivity: 88, roi: 90, trend: 'improving', propertyCount: 280, lat: 39.6790, lng: -104.9680 },
  { zip: '80219', deals: 6, avgProfit: 32000, distressIndex: 82, buyerDemand: 60, investorActivity: 40, roi: 65, trend: 'declining', propertyCount: 410, lat: 39.6780, lng: -105.0310 },
  { zip: '80223', deals: 10, avgProfit: 41000, distressIndex: 70, buyerDemand: 75, investorActivity: 62, roi: 74, trend: 'stable', propertyCount: 390, lat: 39.7010, lng: -104.9980 },
  { zip: '80227', deals: 4, avgProfit: 28000, distressIndex: 55, buyerDemand: 50, investorActivity: 35, roi: 52, trend: 'declining', propertyCount: 600, lat: 39.6740, lng: -105.0860 },
  { zip: '80233', deals: 9, avgProfit: 45000, distressIndex: 60, buyerDemand: 80, investorActivity: 70, roi: 78, trend: 'improving', propertyCount: 310, lat: 39.8130, lng: -104.9470 },
  { zip: '80239', deals: 7, avgProfit: 36000, distressIndex: 72, buyerDemand: 65, investorActivity: 48, roi: 62, trend: 'stable', propertyCount: 450, lat: 39.7860, lng: -104.8490 },
];

type LayerKey = 'roi' | 'distress' | 'demand' | 'activity';

const LAYER_FIELD: Record<LayerKey, keyof typeof MOCK_ZIP_DATA[0]> = {
  roi: 'roi',
  distress: 'distressIndex',
  demand: 'buyerDemand',
  activity: 'investorActivity',
};

const LAYER_COLORS: Record<LayerKey, [string, string]> = {
  roi: ['#fef3c7', '#16a34a'],
  distress: ['#fef3c7', '#dc2626'],
  demand: ['#dbeafe', '#2563eb'],
  activity: ['#ede9fe', '#7c3aed'],
};

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function colorForValue(value: number, layer: LayerKey) {
  const t = Math.min(Math.max(value / 100, 0), 1);
  const [lo, hi] = LAYER_COLORS[layer];
  const parse = (hex: string) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const [r1, g1, b1] = parse(lo);
  const [r2, g2, b2] = parse(hi);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `rgb(${r},${g},${b})`;
}

export default function HeatMap() {
  const [layer, setLayer] = useState<LayerKey>('roi');
  const [sortBy, setSortBy] = useState<'roi' | 'deals' | 'distressIndex'>('roi');
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const sorted = [...MOCK_ZIP_DATA].sort((a, b) => b[sortBy] - a[sortBy]);

  const updateMarkers = useCallback(() => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    const map = mapRef.current;
    if (!map) return;

    const field = LAYER_FIELD[layer];

    MOCK_ZIP_DATA.forEach(zip => {
      const value = zip[field] as number;
      const color = colorForValue(value, layer);

      const el = document.createElement('div');
      el.className = 'heat-marker';
      el.style.cssText = `
        width: ${24 + value * 0.4}px;
        height: ${24 + value * 0.4}px;
        border-radius: 50%;
        background: ${color};
        opacity: 0.75;
        border: 2px solid rgba(255,255,255,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: ${value > 60 ? '#fff' : '#1a1a1a'};
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        transition: transform 0.15s;
      `;
      el.textContent = String(value);
      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.25)'; el.style.opacity = '1'; });
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; el.style.opacity = '0.75'; });

      const popup = new mapboxgl.Popup({ offset: 20, closeButton: false }).setHTML(`
        <div style="font-family:system-ui;padding:4px 0;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;">Zip ${zip.zip}</div>
          <div style="font-size:12px;color:#666;">Deals: ${zip.deals} · Avg Profit: $${zip.avgProfit.toLocaleString()}</div>
          <div style="font-size:12px;color:#666;">ROI: ${zip.roi} · Distress: ${zip.distressIndex} · Demand: ${zip.buyerDemand}</div>
          <div style="font-size:12px;color:#666;">Properties: ${zip.propertyCount} · Trend: ${zip.trend}</div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([zip.lng, zip.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [layer]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-104.97, 39.74],
      zoom: 10.5,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;
    map.on('load', () => updateMarkers());
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (mapRef.current?.loaded()) updateMarkers();
  }, [layer, updateMarkers]);

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
          <Select value={layer} onValueChange={(v) => setLayer(v as LayerKey)}>
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

      {/* Interactive Mapbox Map */}
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-0">
          <div ref={mapContainer} className="h-[450px] w-full rounded-lg" />
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
