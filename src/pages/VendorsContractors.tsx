import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Phone, Mail, Star, FileText, HardHat, Truck, MapPin } from 'lucide-react';

export interface Vendor {
  id: string;
  name: string;
  company: string;
  type: 'vendor' | 'contractor';
  specialty: string;
  phone: string;
  email: string;
  areas: string[];
  rating: 'a' | 'b' | 'c';
  hasW9: boolean;
  notes: string;
  lastUsed: string;
  projectCount: number;
}

const seedVendors: Vendor[] = [
  { id: 'v1', name: 'Mike Torres', company: 'Torres Roofing', type: 'contractor', specialty: 'Roofing', phone: '(555) 901-2345', email: 'mike@torresroofing.com', areas: ['Dallas', 'Fort Worth'], rating: 'a', hasW9: true, notes: 'Reliable, fast turnaround', lastUsed: '2025-01-05', projectCount: 8 },
  { id: 'v2', name: 'Sarah Chen', company: 'Chen Plumbing Co', type: 'contractor', specialty: 'Plumbing', phone: '(555) 234-5678', email: 'sarah@chenplumbing.com', areas: ['Dallas'], rating: 'a', hasW9: true, notes: 'Great pricing on multi-unit', lastUsed: '2025-01-02', projectCount: 5 },
  { id: 'v3', name: 'Tom Davis', company: 'Davis Electric', type: 'contractor', specialty: 'Electrical', phone: '(555) 345-6789', email: 'tom@daviselectric.com', areas: ['Dallas', 'Plano'], rating: 'b', hasW9: false, notes: '', lastUsed: '2024-12-15', projectCount: 3 },
  { id: 'v4', name: 'Home Depot Pro', company: 'Home Depot', type: 'vendor', specialty: 'Building Materials', phone: '(555) 456-7890', email: 'pro@homedepot.com', areas: ['DFW Metro'], rating: 'a', hasW9: true, notes: 'Pro account - 10% discount', lastUsed: '2025-01-08', projectCount: 12 },
  { id: 'v5', name: 'ABC Title Co', company: 'ABC Title', type: 'vendor', specialty: 'Title & Closing', phone: '(555) 567-8901', email: 'closings@abctitle.com', areas: ['Dallas', 'Fort Worth', 'Arlington'], rating: 'a', hasW9: true, notes: 'Preferred title company', lastUsed: '2025-01-06', projectCount: 15 },
  { id: 'v6', name: 'Juan Garcia', company: 'Garcia HVAC', type: 'contractor', specialty: 'HVAC', phone: '(555) 678-9012', email: 'juan@garciahvac.com', areas: ['Fort Worth'], rating: 'b', hasW9: true, notes: '', lastUsed: '2024-11-20', projectCount: 2 },
  { id: 'v7', name: 'LegalShield Docs', company: 'LegalShield', type: 'vendor', specialty: 'Legal Services', phone: '(555) 789-0123', email: 'docs@legalshield.com', areas: ['Texas'], rating: 'b', hasW9: false, notes: 'Contract review service', lastUsed: '2024-12-01', projectCount: 4 },
];

const ratingColors: Record<string, string> = {
  a: 'bg-[hsl(var(--crm-success))] text-primary-foreground',
  b: 'bg-[hsl(var(--crm-warning))] text-primary-foreground',
  c: 'bg-[hsl(var(--crm-danger))] text-primary-foreground',
};

export default function VendorsContractors() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'contractor' | 'vendor'>('all');

  const filtered = seedVendors.filter(v => {
    const matchesTab = tab === 'all' || v.type === tab;
    const s = search.toLowerCase();
    const matchesSearch = !search ||
      v.name.toLowerCase().includes(s) ||
      v.company.toLowerCase().includes(s) ||
      v.specialty.toLowerCase().includes(s) ||
      v.areas.some(a => a.toLowerCase().includes(s));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="crm-page animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title flex items-center gap-2"><HardHat className="h-5 w-5" /> Vendors & Contractors</h1>
          <p className="crm-page-subtitle">
            {seedVendors.filter(v => v.type === 'contractor').length} contractors · {seedVendors.filter(v => v.type === 'vendor').length} vendors
          </p>
        </div>
        <Button size="sm" disabled><Plus className="mr-1 h-3 w-3" /> Add New</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name, specialty, area..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="contractor">Contractors</TabsTrigger>
            <TabsTrigger value="vendor">Vendors</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="text-center py-4">
          <HardHat className="h-6 w-6 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{seedVendors.filter(v => v.type === 'contractor').length}</p>
          <p className="text-[10px] text-muted-foreground">Contractors</p>
        </Card>
        <Card className="text-center py-4">
          <Truck className="h-6 w-6 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{seedVendors.filter(v => v.type === 'vendor').length}</p>
          <p className="text-[10px] text-muted-foreground">Vendors</p>
        </Card>
        <Card className="text-center py-4">
          <FileText className="h-6 w-6 text-[hsl(var(--crm-success))] mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{seedVendors.filter(v => v.hasW9).length}</p>
          <p className="text-[10px] text-muted-foreground">W9 On File</p>
        </Card>
        <Card className="text-center py-4">
          <Star className="h-6 w-6 text-[hsl(var(--crm-warning))] mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{seedVendors.filter(v => v.rating === 'a').length}</p>
          <p className="text-[10px] text-muted-foreground">A-Rated</p>
        </Card>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map(v => (
          <div key={v.id} className="crm-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${v.type === 'contractor' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                {v.type === 'contractor' ? <HardHat className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-foreground truncate">{v.name}</span>
                  <Badge className={`crm-badge text-[10px] ${ratingColors[v.rating]}`}>{v.rating.toUpperCase()}</Badge>
                  {v.hasW9 && <Badge variant="outline" className="text-[10px] px-1.5">W9 ✓</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{v.company} · {v.specialty}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{v.areas.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
              <div className="text-center">
                <p className="font-semibold text-foreground">{v.projectCount}</p>
                <p className="text-[10px]">Projects</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled title="Call">
                  <Phone className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled title="Email">
                  <Mail className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="crm-card p-12 text-center">
            <HardHat className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No vendors or contractors match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
