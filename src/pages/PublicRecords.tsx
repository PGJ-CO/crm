import { useState } from 'react';
import { FileSearch, Building2, AlertTriangle, DollarSign, Key, Scale, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const STUB_PERMITS = [
  { id: '1', address: '1234 Main St', permitType: 'Remodel', issueDate: '2026-02-15', valuation: 45000, contractor: 'ABC Construction', status: 'Issued' },
  { id: '2', address: '567 Oak Ave', permitType: 'Addition', issueDate: '2026-01-20', valuation: 82000, contractor: 'Smith Builders', status: 'Completed' },
  { id: '3', address: '890 Pine Blvd', permitType: 'New Construction', issueDate: '2025-12-10', valuation: 350000, contractor: 'Denver Homes LLC', status: 'Issued' },
];

const STUB_VIOLATIONS = [
  { id: '1', address: '321 Elm Dr', type: 'Building', date: '2026-02-28', status: 'Open', description: 'Unpermitted construction in rear yard' },
  { id: '2', address: '654 Cedar Ln', type: 'Zoning', date: '2026-01-15', status: 'Open', description: 'Illegal short-term rental operation' },
  { id: '3', address: '987 Birch Way', type: 'Health', date: '2025-11-20', status: 'Closed', description: 'Unsanitary conditions reported' },
];

const STUB_TAX_DELINQUENT = [
  { id: '1', address: '111 Distressed Ave', years: '2024, 2025', amountOwed: 8500, penalty: 1200, totalDue: 9700, lienStatus: 'Active' },
  { id: '2', address: '222 Trouble St', years: '2023, 2024, 2025', amountOwed: 15200, penalty: 3800, totalDue: 19000, lienStatus: 'Active' },
  { id: '3', address: '333 Hardship Blvd', years: '2025', amountOwed: 4200, penalty: 420, totalDue: 4620, lienStatus: 'Pending' },
];

const STUB_RENTALS = [
  { id: '1', address: '444 Rental Dr', licenseNum: 'RL-2024-1234', status: 'Active', units: 4, expiration: '2026-12-31', type: 'Long-term' },
  { id: '2', address: '555 Landlord Ln', licenseNum: 'RL-2023-5678', status: 'Expired', units: 2, expiration: '2025-06-30', type: 'Long-term' },
  { id: '3', address: '666 STR Ave', licenseNum: 'RL-2025-9012', status: 'Active', units: 1, expiration: '2027-03-15', type: 'Short-term' },
];

const STUB_EVICTIONS = [
  { id: '1', address: '777 Eviction Rd', caseNumber: '2026FE001234', filingDate: '2026-02-10', plaintiff: 'John Doe', status: 'Pending', amount: null },
  { id: '2', address: '888 Court St', caseNumber: '2026FE001567', filingDate: '2026-01-05', plaintiff: 'Jane Smith', status: 'Judgment', amount: 4500 },
];

export default function PublicRecords() {
  const [addressSearch, setAddressSearch] = useState('');

  return (
    <div className="crm-page animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="crm-page-title flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" /> Public Records
          </h1>
          <p className="crm-page-subtitle">Building permits, code violations, tax delinquencies, rental licenses & evictions</p>
        </div>
      </div>

      <div className="mb-4">
        <Input placeholder="Search by address..." value={addressSearch} onChange={e => setAddressSearch(e.target.value)} className="max-w-sm" />
      </div>

      <Tabs defaultValue="permits" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="permits">Building Permits</TabsTrigger>
          <TabsTrigger value="violations">Code Violations</TabsTrigger>
          <TabsTrigger value="tax">Tax Delinquent</TabsTrigger>
          <TabsTrigger value="rentals">Rental Licenses</TabsTrigger>
          <TabsTrigger value="evictions">Evictions</TabsTrigger>
        </TabsList>

        <TabsContent value="permits">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Building Permits</CardTitle>
              <CardDescription>Denver Open Data — weekly updates via Firecrawl</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead className="text-right">Valuation</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STUB_PERMITS.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.address}</TableCell>
                      <TableCell>{p.permitType}</TableCell>
                      <TableCell>{new Date(p.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">${p.valuation.toLocaleString()}</TableCell>
                      <TableCell>{p.contractor}</TableCell>
                      <TableCell><Badge variant={p.status === 'Completed' ? 'default' : 'secondary'} className="text-[10px]">{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Code Violations</CardTitle>
              <CardDescription>Denver Open Data — weekly updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STUB_VIOLATIONS.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.address}</TableCell>
                      <TableCell>{v.type}</TableCell>
                      <TableCell>{new Date(v.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={v.status === 'Open' ? 'destructive' : 'default'} className="text-[10px]">{v.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{v.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" /> Tax Delinquent Properties</CardTitle>
              <CardDescription>Denver County Treasurer — quarterly updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Year(s)</TableHead>
                    <TableHead className="text-right">Owed</TableHead>
                    <TableHead className="text-right">Penalties</TableHead>
                    <TableHead className="text-right">Total Due</TableHead>
                    <TableHead>Lien</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STUB_TAX_DELINQUENT.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.address}</TableCell>
                      <TableCell className="text-xs">{t.years}</TableCell>
                      <TableCell className="text-right">${t.amountOwed.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${t.penalty.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold">${t.totalDue.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={t.lienStatus === 'Active' ? 'destructive' : 'secondary'} className="text-[10px]">{t.lienStatus}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rentals">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4" /> Rental Licenses</CardTitle>
              <CardDescription>Denver Open Data — monthly updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>License #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STUB_RENTALS.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.address}</TableCell>
                      <TableCell className="text-xs">{r.licenseNum}</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell>{r.units}</TableCell>
                      <TableCell>{new Date(r.expiration).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === 'Active' ? 'default' : 'destructive'} className="text-[10px]">{r.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evictions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Scale className="h-4 w-4" /> Eviction Filings</CardTitle>
              <CardDescription>Denver County Court Records — weekly updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Case #</TableHead>
                    <TableHead>Filing Date</TableHead>
                    <TableHead>Plaintiff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Judgment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STUB_EVICTIONS.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.address}</TableCell>
                      <TableCell className="text-xs">{e.caseNumber}</TableCell>
                      <TableCell>{new Date(e.filingDate).toLocaleDateString()}</TableCell>
                      <TableCell>{e.plaintiff}</TableCell>
                      <TableCell>
                        <Badge variant={e.status === 'Judgment' ? 'destructive' : 'secondary'} className="text-[10px]">{e.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{e.amount ? `$${e.amount.toLocaleString()}` : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
