import { useState } from 'react';
import { MapPin, GraduationCap, Shield, Users, TrendingUp, Home, Star, BarChart3, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const STUB_ZIPS = ['80202', '80204', '80210', '80219', '80223', '80227', '80233', '80239'];

const STUB_NEIGHBORHOOD = {
  zip: '80210',
  investmentScore: 8.2,
  demographics: { population: 34500, medianAge: 35.2, medianIncome: 78500, povertyRate: 8.3, employmentRate: 94.2, medianRent: 1850, educationPct: 52.1 },
  schools: [
    { name: 'University Park Elementary', type: 'Elementary', rating: 9 },
    { name: 'Merrill Middle School', type: 'Middle', rating: 7 },
    { name: 'South High School', type: 'High', rating: 6 },
  ],
  crimeScore: 32,
  crimeBreakdown: [
    { type: 'Property Crime', count: 145, trend: 'down' },
    { type: 'Violent Crime', count: 23, trend: 'stable' },
    { type: 'Vehicle Theft', count: 67, trend: 'up' },
  ],
  market: { medianPrice: 485000, dom: 14, yoyChange: 4.2, activeForeclosures: 3, recentPermits: 12 },
  gentrificationIndicators: ['Rising home prices', 'New construction permits', 'Decreasing crime', 'Higher education levels'],
};

function ScoreBar({ label, value, max = 100, color = 'bg-primary' }: { label: string; value: number; max?: number; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}{max === 100 ? '%' : ''}</span>
      </div>
      <Progress value={(value / max) * 100} className="h-2" />
    </div>
  );
}

export default function NeighborhoodAnalysis() {
  const [selectedZip, setSelectedZip] = useState('80210');
  const data = STUB_NEIGHBORHOOD;

  return (
    <div className="crm-page animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="crm-page-title flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Neighborhood Analysis
          </h1>
          <p className="crm-page-subtitle">Comprehensive zip-code level investment intelligence</p>
        </div>
      </div>

      {/* Zip selector + investment score */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={selectedZip} onValueChange={setSelectedZip}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STUB_ZIPS.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
          </SelectContent>
        </Select>
        <Card className="flex items-center gap-3 px-4 py-2">
          <Star className="h-5 w-5 text-[hsl(var(--crm-warning))]" />
          <div>
            <p className="text-xl font-bold text-foreground">{data.investmentScore}</p>
            <p className="text-[10px] text-muted-foreground">Investment Score</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="crime">Crime</TabsTrigger>
          <TabsTrigger value="permits">Permits & Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Population</span><span className="font-medium text-foreground">{data.demographics.population.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Median Income</span><span className="font-medium text-foreground">${data.demographics.medianIncome.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Median Rent</span><span className="font-medium text-foreground">${data.demographics.medianRent.toLocaleString()}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Schools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.schools.map(s => (
                  <div key={s.name} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">{s.name}</span>
                    <Badge variant={s.rating >= 8 ? 'default' : 'secondary'} className="text-[10px]">{s.rating}/10</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Safety</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ScoreBar label="Crime Score (lower = safer)" value={data.crimeScore} />
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active Foreclosures</span><span className="font-medium text-foreground">{data.market.activeForeclosures}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Recent Permits</span><span className="font-medium text-foreground">{data.market.recentPermits}</span></div>
              </CardContent>
            </Card>
          </div>

          {/* Gentrification indicators */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Gentrification Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.gentrificationIndicators.map(g => (
                  <Badge key={g} variant="outline" className="text-xs">{g}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Census Demographics — {selectedZip}</CardTitle>
              <CardDescription>Data from U.S. Census Bureau (annual)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreBar label="Employment Rate" value={data.demographics.employmentRate} />
              <ScoreBar label="Education (Bachelor's+)" value={data.demographics.educationPct} />
              <ScoreBar label="Housing Occupancy" value={91.5} />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-lg font-bold text-foreground">{data.demographics.medianAge}</p>
                  <p className="text-[10px] text-muted-foreground">Median Age</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-lg font-bold text-foreground">{data.demographics.povertyRate}%</p>
                  <p className="text-[10px] text-muted-foreground">Poverty Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nearby Schools — {selectedZip}</CardTitle>
              <CardDescription>Ratings from GreatSchools.org (annual)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.schools.map(s => (
                  <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 10 }, (_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < s.rating ? 'text-[hsl(var(--crm-warning))] fill-[hsl(var(--crm-warning))]' : 'text-muted'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-foreground">{s.rating}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crime">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Crime Statistics — {selectedZip}</CardTitle>
              <CardDescription>Denver Open Data crime reports (monthly)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.crimeBreakdown.map(c => (
                  <div key={c.type} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.type}</p>
                      <p className="text-xs text-muted-foreground">{c.count} incidents (last 12 months)</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {c.trend === 'up' ? '↑ Rising' : c.trend === 'down' ? '↓ Falling' : '→ Stable'}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-lg border border-dashed text-center">
                <Shield className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Crime heat map integration available on the Heat Maps page</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permits">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Building Permits & Activity — {selectedZip}</CardTitle>
              <CardDescription>Denver Open Data building permits (weekly)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center border border-dashed rounded-lg">
                <Home className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Permit Data Integration</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Building permit data will be scraped from Denver Open Data and displayed here with permit type, valuation, and contractor details.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
