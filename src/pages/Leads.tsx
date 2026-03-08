import { useState, useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { LEAD_STAGES, type LeadStage } from '@/types/crm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, List, Columns, Filter, ChevronRight, Phone, MessageSquare, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type ViewMode = 'kanban' | 'list';

export default function Leads() {
  const { leads, owners, properties, getOwner, getProperty, updateLeadStage, addLead, addOwner, addProperty, users } = useCRM();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const owner = getOwner(l.ownerId);
      const prop = getProperty(l.propertyId);
      const searchLower = search.toLowerCase();
      const matchesSearch = !search ||
        `${owner?.firstName} ${owner?.lastName}`.toLowerCase().includes(searchLower) ||
        prop?.address.toLowerCase().includes(searchLower) ||
        owner?.phones.some(p => p.includes(search)) ||
        l.tags.some(t => t.toLowerCase().includes(searchLower));
      const matchesSource = filterSource === 'all' || l.source === filterSource;
      return matchesSearch && matchesSource;
    });
  }, [leads, search, filterSource, getOwner, getProperty]);

  const sources = [...new Set(leads.map(l => l.source))];

  const handleDrop = (leadId: string, stage: LeadStage) => {
    updateLeadStage(leadId, stage);
  };

  return (
    <div className="crm-page animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title">Leads Pipeline</h1>
          <p className="crm-page-subtitle">{leads.length} total leads · {leads.filter(l => l.stage !== 'dead_dnc' && l.stage !== 'closed_won').length} active</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-3 w-3" /> Add Lead</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Quick Add Lead</DialogTitle>
              </DialogHeader>
              <QuickAddForm onClose={() => setAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name, address, phone, tag..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-40">
            <Filter className="h-3 w-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg overflow-hidden">
          <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')} className="rounded-none">
            <Columns className="h-3 w-3" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-none">
            <List className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-3 min-w-max">
            {LEAD_STAGES.map(stage => {
              const stageLeads = filteredLeads.filter(l => l.stage === stage.key);
              return (
                <div
                  key={stage.key}
                  className="crm-kanban-col"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const leadId = e.dataTransfer.getData('leadId');
                    if (leadId) handleDrop(leadId, stage.key);
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                    <Badge variant="secondary" className="text-[10px] ml-auto">{stageLeads.length}</Badge>
                  </div>
                  <div className="space-y-2 flex-1">
                    {stageLeads.map(lead => (
                      <LeadCard key={lead.id} lead={lead} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="crm-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Owner</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Property</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Stage</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Score</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Source</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Last Touch</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Next Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => {
                  const owner = getOwner(lead.ownerId);
                  const prop = getProperty(lead.propertyId);
                  const stageInfo = LEAD_STAGES.find(s => s.key === lead.stage);
                  return (
                    <tr key={lead.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{owner?.firstName} {owner?.lastName}</td>
                      <td className="p-3 text-muted-foreground">{prop?.address}, {prop?.city}</td>
                      <td className="p-3">
                        <Badge className={`crm-badge ${stageInfo?.color} text-primary-foreground`}>{stageInfo?.label}</Badge>
                      </td>
                      <td className="p-3">
                        <MotivationBadge score={lead.motivationScore} />
                      </td>
                      <td className="p-3 text-muted-foreground">{lead.source}</td>
                      <td className="p-3 text-muted-foreground">{lead.lastTouch}</td>
                      <td className="p-3 text-muted-foreground truncate max-w-[200px]">{lead.nextAction}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: ReturnType<typeof useCRM>['leads'][0] }) {
  const { getOwner, getProperty } = useCRM();
  const owner = getOwner(lead.ownerId);
  const prop = getProperty(lead.propertyId);

  return (
    <div
      className="crm-kanban-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('leadId', lead.id);
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-medium text-foreground truncate">{owner?.firstName} {owner?.lastName}</p>
        <MotivationBadge score={lead.motivationScore} />
      </div>
      <p className="text-xs text-muted-foreground truncate mb-2">{prop?.address}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {lead.tags.slice(0, 2).map(tag => (
          <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{lead.lastTouch}</span>
      </div>
    </div>
  );
}

function MotivationBadge({ score }: { score: number }) {
  const cls = score >= 70 ? 'crm-motivation-high' : score >= 40 ? 'crm-motivation-medium' : 'crm-motivation-low';
  return <span className={`crm-badge ${cls}`}>{score}</span>;
}

function QuickAddForm({ onClose }: { onClose: () => void }) {
  const { addLead, addOwner, addProperty, users } = useCRM();
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    address: '', city: '', state: 'TX', zip: '',
    beds: '3', baths: '2', sqft: '', yearBuilt: '',
    source: 'Direct Mail', notes: '', motivationScore: '50',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ownerId = `o_${Date.now()}`;
    const propId = `p_${Date.now()}`;
    const leadId = `l_${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];

    addOwner({
      id: ownerId, firstName: form.firstName, lastName: form.lastName,
      phones: form.phone ? [form.phone] : [], emails: form.email ? [form.email] : [],
      mailingAddress: `${form.address}, ${form.city}, ${form.state} ${form.zip}`,
      notes: '', consentSms: true, consentEmail: true, consentPhone: true, isDnc: false, createdAt: now,
    });
    addProperty({
      id: propId, address: form.address, city: form.city, state: form.state, zip: form.zip,
      unitCount: 1, beds: parseInt(form.beds) || 3, baths: parseInt(form.baths) || 2,
      sqft: parseInt(form.sqft) || 0, yearBuilt: parseInt(form.yearBuilt) || 0,
      occupancy: 'unknown', condition: 'fair', photos: [], ownerId, createdAt: now,
    });
    addLead({
      id: leadId, ownerId, propertyId: propId, source: form.source, stage: 'new',
      tags: [], motivationScore: parseInt(form.motivationScore) || 50,
      lastTouch: now, nextAction: 'Initial outreach',
      assignedUserId: users[0]?.id || 'u1', notes: form.notes, createdAt: now,
    });
    onClose();
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">First Name *</Label>
          <Input required value={form.firstName} onChange={e => update('firstName', e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Last Name *</Label>
          <Input required value={form.lastName} onChange={e => update('lastName', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Phone</Label>
          <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(555) 123-4567" />
        </div>
        <div>
          <Label className="text-xs">Email</Label>
          <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} />
        </div>
      </div>
      <div>
        <Label className="text-xs">Property Address *</Label>
        <Input required value={form.address} onChange={e => update('address', e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">City *</Label>
          <Input required value={form.city} onChange={e => update('city', e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">State</Label>
          <Input value={form.state} onChange={e => update('state', e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Zip</Label>
          <Input value={form.zip} onChange={e => update('zip', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Source</Label>
          <Select value={form.source} onValueChange={v => update('source', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['Direct Mail', 'Cold Text', 'PPC', 'Referral', 'Driving for Dollars'].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Motivation (0-100)</Label>
          <Input type="number" min="0" max="100" value={form.motivationScore} onChange={e => update('motivationScore', e.target.value)} />
        </div>
      </div>
      <div>
        <Label className="text-xs">Notes</Label>
        <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Add Lead</Button>
      </div>
    </form>
  );
}
