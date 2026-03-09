import { useState } from 'react';
import { Target, TrendingUp, Filter, Download, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface ScoredLead {
  id: string;
  address: string;
  city: string;
  ownerName: string;
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  factors: { label: string; impact: number }[];
  previousScore: number;
  lastUpdated: string;
}

const MOCK_SCORED: ScoredLead[] = Array.from({ length: 20 }, (_, i) => {
  const score = Math.max(5, 95 - i * 4 + (i % 3) * 5);
  return {
    id: `ds-${i}`,
    address: `${100 + i * 23} ${['Oak', 'Elm', 'Pine', 'Cedar', 'Maple'][i % 5]} St`,
    city: ['Denver', 'Aurora', 'Lakewood', 'Arvada'][i % 4],
    ownerName: ['John Smith', 'Maria Garcia', 'Robert Johnson', 'Sarah Williams', 'David Brown'][i % 5],
    score,
    tier: score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold',
    factors: [
      { label: 'Equity Position', impact: 10 + (i % 15) },
      { label: 'Ownership Duration', impact: 5 + (i % 10) },
      { label: 'Distress Signals', impact: 8 + (i % 12) },
      { label: 'Market Conditions', impact: 3 + (i % 8) },
      { label: 'Property Condition', impact: 2 + (i % 7) },
    ].sort((a, b) => b.impact - a.impact),
    previousScore: score + (i % 2 === 0 ? -5 : 3),
    lastUpdated: new Date(Date.now() - i * 3600000).toISOString(),
  };
});

export default function DealScore() {
  const [minScore, setMinScore] = useState([0]);
  const [tierFilter, setTierFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = MOCK_SCORED.filter(s => {
    if (s.score < minScore[0]) return false;
    if (tierFilter !== 'all' && s.tier !== tierFilter) return false;
    return true;
  });

  const hotCount = MOCK_SCORED.filter(s => s.tier === 'hot').length;
  const warmCount = MOCK_SCORED.filter(s => s.tier === 'warm').length;
  const coldCount = MOCK_SCORED.filter(s => s.tier === 'cold').length;
  const avgScore = Math.round(MOCK_SCORED.reduce((s, l) => s + l.score, 0) / MOCK_SCORED.length);

  const scoreBadge = (score: number) => {
    if (score >= 70) return 'bg-accent/10 text-accent';
    if (score >= 40) return 'bg-crm-warning/10 text-crm-warning';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="crm-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title flex items-center gap-2">
            <Target className="w-7 h-7 text-primary" />
            Deal Score
          </h1>
          <p className="crm-page-subtitle">AI-powered lead scoring analyzing 50+ data points per property</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Batch re-score placeholder')}>
            <BarChart3 className="w-4 h-4 mr-1" /> Re-Score All
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Export placeholder')}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="crm-stat-card">
          <div className="text-xs text-muted-foreground">Average Score</div>
          <div className="text-2xl font-bold text-foreground">{avgScore}</div>
        </Card>
        <Card className="crm-stat-card">
          <div className="text-xs text-muted-foreground">🔥 Hot (70+)</div>
          <div className="text-2xl font-bold text-accent">{hotCount}</div>
        </Card>
        <Card className="crm-stat-card">
          <div className="text-xs text-muted-foreground">🌡️ Warm (40-69)</div>
          <div className="text-2xl font-bold text-crm-warning">{warmCount}</div>
        </Card>
        <Card className="crm-stat-card">
          <div className="text-xs text-muted-foreground">❄️ Cold (&lt;40)</div>
          <div className="text-2xl font-bold text-muted-foreground">{coldCount}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="py-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label className="text-xs text-muted-foreground mb-2 block">Minimum Score: {minScore[0]}</label>
            <Slider value={minScore} onValueChange={setMinScore} max={100} step={5} className="w-full" />
          </div>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="hot">Hot (70+)</SelectItem>
              <SelectItem value="warm">Warm (40-69)</SelectItem>
              <SelectItem value="cold">Cold (&lt;40)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{filtered.length} Scored Properties</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-16">Score</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Top Factor</TableHead>
                <TableHead className="text-center">Change</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(lead => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer"
                  onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                >
                  <TableCell className="text-center">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${scoreBadge(lead.score)}`}>
                      {lead.score}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm text-foreground">{lead.address}</p>
                    <p className="text-xs text-muted-foreground">{lead.city}, CO</p>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{lead.ownerName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={scoreBadge(lead.score)}>
                      {lead.tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{lead.factors[0]?.label}</TableCell>
                  <TableCell className="text-center">
                    {lead.score > lead.previousScore ? (
                      <span className="inline-flex items-center text-accent text-sm">
                        <ArrowUpRight className="w-4 h-4" />+{lead.score - lead.previousScore}
                      </span>
                    ) : lead.score < lead.previousScore ? (
                      <span className="inline-flex items-center text-destructive text-sm">
                        <ArrowDownRight className="w-4 h-4" />{lead.score - lead.previousScore}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(lead.lastUpdated).toLocaleDateString()}
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
