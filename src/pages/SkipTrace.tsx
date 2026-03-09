import { useState } from 'react';
import { Search, Upload, Download, Phone, Mail, MapPin, AlertTriangle, CheckCircle, Clock, XCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface SkipTraceResult {
  id: string;
  ownerName: string;
  propertyAddress: string;
  phones: { number: string; type: string; confidence: number }[];
  emails: { address: string; confidence: number }[];
  currentAddress: string;
  isDnc: boolean;
  isLitigator: boolean;
  status: 'completed' | 'pending' | 'failed';
  tracedAt: string;
}

const MOCK_RESULTS: SkipTraceResult[] = Array.from({ length: 15 }, (_, i) => ({
  id: `st-${i}`,
  ownerName: ['John Smith', 'Maria Garcia', 'Robert Johnson', 'Sarah Williams', 'David Brown', 'Lisa Davis', 'Michael Wilson', 'Jennifer Taylor'][i % 8],
  propertyAddress: `${100 + i * 37} ${['Oak', 'Elm', 'Pine', 'Cedar'][i % 4]} St, Denver, CO`,
  phones: [
    { number: `(303) 555-${String(1000 + i).padStart(4, '0')}`, type: 'Mobile', confidence: 85 + (i % 15) },
    ...(i % 3 === 0 ? [{ number: `(720) 555-${String(2000 + i).padStart(4, '0')}`, type: 'Landline', confidence: 60 + (i % 20) }] : []),
  ],
  emails: i % 2 === 0 ? [{ address: `contact${i}@email.com`, confidence: 70 + (i % 25) }] : [],
  currentAddress: `${500 + i * 12} ${['Maple', 'Birch', 'Spruce'][i % 3]} Ave, ${['Denver', 'Phoenix', 'Dallas'][i % 3]}, ${['CO', 'AZ', 'TX'][i % 3]}`,
  isDnc: i % 7 === 0,
  isLitigator: i % 12 === 0,
  status: i < 12 ? 'completed' : i < 14 ? 'pending' : 'failed',
  tracedAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

export default function SkipTrace() {
  const [singleName, setSingleName] = useState('');
  const [singleAddress, setSingleAddress] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchProgress, setBatchProgress] = useState<number | null>(null);

  const completedCount = MOCK_RESULTS.filter(r => r.status === 'completed').length;
  const pendingCount = MOCK_RESULTS.filter(r => r.status === 'pending').length;
  const failedCount = MOCK_RESULTS.filter(r => r.status === 'failed').length;

  const runSingleTrace = () => {
    if (!singleName && !singleAddress) {
      toast.error('Enter a name or address to skip trace');
      return;
    }
    toast.info('Skip trace provider integration placeholder — connect BatchSkipTracing, IDI Data, or similar API');
  };

  const runBatchTrace = () => {
    setBatchProgress(0);
    const interval = setInterval(() => {
      setBatchProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          toast.success('Batch skip trace complete (demo)');
          return null;
        }
        return prev + 10;
      });
    }, 300);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-accent" />;
    if (status === 'pending') return <Clock className="w-4 h-4 text-crm-warning" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="crm-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />
            Skip Tracing
          </h1>
          <p className="crm-page-subtitle">Find phone numbers, emails, and current addresses for property owners</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="crm-stat-card">
          <div className="text-xs text-muted-foreground">Total Traced</div>
          <div className="text-2xl font-bold text-foreground">{MOCK_RESULTS.length}</div>
        </Card>
        <Card className="crm-stat-card">
          <div className="text-xs text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold text-accent">{completedCount}</div>
        </Card>
        <Card className="crm-stat-card">
          <div className="text-xs text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-crm-warning">{pendingCount}</div>
        </Card>
        <Card className="crm-stat-card">
          <div className="text-xs text-muted-foreground">Failed</div>
          <div className="text-2xl font-bold text-destructive">{failedCount}</div>
        </Card>
      </div>

      <Tabs defaultValue="single" className="space-y-4">
        <TabsList>
          <TabsTrigger value="single">Single Trace</TabsTrigger>
          <TabsTrigger value="batch">Batch Trace</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Individual Skip Trace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Owner Name</label>
                  <Input
                    placeholder="John Smith"
                    value={singleName}
                    onChange={e => setSingleName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Property Address</label>
                  <Input
                    placeholder="123 Main St, Denver, CO 80202"
                    value={singleAddress}
                    onChange={e => setSingleAddress(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={runSingleTrace}>
                <Search className="w-4 h-4 mr-1" /> Run Skip Trace
              </Button>
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">⚡ Provider Integration Required</p>
                <p>Connect a skip trace provider (BatchSkipTracing, IDI Data, TLOxp) to enable live lookups. Currently showing demo data.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Batch Skip Trace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="font-medium text-foreground">Upload CSV File</p>
                <p className="text-sm text-muted-foreground mt-1">Up to 10,000 records per batch. Include name and/or address columns.</p>
                <Button variant="outline" className="mt-4" onClick={() => toast.info('CSV upload placeholder')}>
                  <Upload className="w-4 h-4 mr-1" /> Select File
                </Button>
              </div>

              {batchProgress !== null && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Processing batch...</span>
                    <span className="text-muted-foreground">{batchProgress}%</span>
                  </div>
                  <Progress value={batchProgress} />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={runBatchTrace} disabled={batchProgress !== null}>
                  Run Batch Trace (Demo)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Skip Trace Results</CardTitle>
                <div className="flex gap-2">
                  {selectedIds.size > 0 && (
                    <Button size="sm" variant="outline" onClick={() => toast.info('Add to calling list placeholder')}>
                      <Phone className="w-4 h-4 mr-1" /> Add to Call List ({selectedIds.size})
                    </Button>
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
                        <Checkbox />
                      </TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Phone(s)</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_RESULTS.map(r => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(r.id)}
                            onCheckedChange={() => toggleSelect(r.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-sm text-foreground">{r.ownerName}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {r.propertyAddress}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            {r.phones.map(p => (
                              <div key={p.number} className="flex items-center gap-1 text-xs">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <span className="text-foreground">{p.number}</span>
                                <Badge variant="outline" className="text-[9px] px-1">{p.type}</Badge>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {r.emails.length > 0 ? (
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span className="text-foreground">{r.emails[0].address}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {r.isDnc && <Badge variant="destructive" className="text-[10px] px-1.5">DNC</Badge>}
                            {r.isLitigator && <Badge className="text-[10px] px-1.5 bg-crm-warning text-white">Litigator</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {statusIcon(r.status)}
                            <span className="text-xs capitalize text-foreground">{r.status}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
