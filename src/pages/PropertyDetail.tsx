import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCRM } from '@/contexts/CRMContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyLookup } from '@/components/property/PropertyLookup';
import {
  ArrowLeft, Building2, HardHat, FileText, MessageSquare, DollarSign,
  Phone, Mail, MapPin, Calendar, User, PenTool, Scale, Search,
} from 'lucide-react';

// Stub contractor assignments for demo
const stubContractors = [
  { id: 'v1', name: 'Mike Torres', company: 'Torres Roofing', specialty: 'Roofing', estimate: 4500, status: 'completed' as const, hasW9: true },
  { id: 'v2', name: 'Sarah Chen', company: 'Chen Plumbing Co', specialty: 'Plumbing', estimate: 2800, status: 'in_progress' as const, hasW9: true },
  { id: 'v3', name: 'Tom Davis', company: 'Davis Electric', specialty: 'Electrical', estimate: 3200, status: 'pending' as const, hasW9: false },
];

const stubComms = [
  { id: 'c1', from: 'You', to: 'Mike Torres', channel: 'sms', content: 'Roof job at 123 Oak St is approved. When can you start?', date: '2025-01-06' },
  { id: 'c2', from: 'Mike Torres', to: 'You', channel: 'sms', content: 'I can start Monday. Will bring the crew out at 8am.', date: '2025-01-06' },
  { id: 'c3', from: 'You', to: 'Sarah Chen', channel: 'email', content: 'Please send the updated estimate for the bathroom remodel.', date: '2025-01-05' },
];

const statusColors: Record<string, string> = {
  completed: 'bg-[hsl(var(--crm-success))] text-primary-foreground',
  in_progress: 'bg-[hsl(var(--crm-warning))] text-primary-foreground',
  pending: 'bg-muted text-muted-foreground',
};

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProperty, getOwner, leads, getLead } = useCRM();

  const property = getProperty(id || '');
  const owner = property ? getOwner(property.ownerId) : undefined;
  const lead = leads.find(l => l.propertyId === id);

  if (!property) {
    return (
      <div className="crm-page animate-slide-in text-center py-20">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Property not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="mr-1 h-3 w-3" /> Go Back</Button>
      </div>
    );
  }

  const totalEstimates = stubContractors.reduce((s, c) => s + c.estimate, 0);

  return (
    <div className="crm-page animate-slide-in">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-1 h-3 w-3" /> Back
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title">{property.address}</h1>
          <p className="crm-page-subtitle flex items-center gap-2">
            <MapPin className="h-3 w-3" /> {property.city}, {property.state} {property.zip}
          </p>
          {owner && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <User className="h-3 w-3" /> {owner.firstName} {owner.lastName}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {lead && (
            <Badge className={`crm-badge ${lead.stage === 'closed_won' ? 'bg-[hsl(var(--crm-success))] text-primary-foreground' : 'bg-primary text-primary-foreground'}`}>
              {lead.stage === 'closed_won' ? 'Closed' : lead.stage.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </div>

      {/* Property overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Card className="text-center py-3">
          <p className="text-lg font-bold text-foreground">{property.beds}/{property.baths}</p>
          <p className="text-[10px] text-muted-foreground">Bed/Bath</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-lg font-bold text-foreground">{property.sqft.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Sqft</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-lg font-bold text-foreground">{property.yearBuilt}</p>
          <p className="text-[10px] text-muted-foreground">Year Built</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-lg font-bold text-foreground capitalize">{property.condition}</p>
          <p className="text-[10px] text-muted-foreground">Condition</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-lg font-bold text-foreground">${totalEstimates.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Estimates</p>
        </Card>
      </div>

      <Tabs defaultValue="contractors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
          <TabsTrigger value="estimates">Estimates & W9s</TabsTrigger>
          <TabsTrigger value="comms">Communications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Contractors Tab */}
        <TabsContent value="contractors">
          <div className="space-y-2">
            {stubContractors.map(c => (
              <div key={c.id} className="crm-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <HardHat className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.company} · {c.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-sm text-foreground">${c.estimate.toLocaleString()}</p>
                  <Badge className={`crm-badge text-[10px] ${statusColors[c.status]}`}>{c.status.replace('_', ' ')}</Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled><Phone className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled><MessageSquare className="h-3 w-3" /></Button>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2" disabled><HardHat className="mr-1 h-3 w-3" /> Assign Contractor</Button>
          </div>
        </TabsContent>

        {/* Estimates & W9s Tab */}
        <TabsContent value="estimates">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estimates & W9 Documents</CardTitle>
              <CardDescription>Track contractor estimates and tax documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stubContractors.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name} — {c.specialty}</p>
                      <p className="text-xs text-muted-foreground">Estimate: ${c.estimate.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.hasW9 ? 'default' : 'destructive'} className="text-[10px]">
                        {c.hasW9 ? 'W9 ✓' : 'W9 Missing'}
                      </Badge>
                      <Button size="sm" variant="outline" className="text-xs" disabled>
                        <FileText className="mr-1 h-3 w-3" /> View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-lg border border-dashed text-center">
                <DollarSign className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Upload estimates and W9s here — requires Lovable Cloud for file storage</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="comms">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contractor Communications</CardTitle>
              <CardDescription>Messages and calls with contractors on this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stubComms.map(c => (
                  <div key={c.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${c.from === 'You' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {c.channel === 'sms' ? <MessageSquare className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-foreground">{c.from}</span>
                        <span className="text-[10px] text-muted-foreground">→ {c.to}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{c.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-3" disabled>
                <MessageSquare className="mr-1 h-3 w-3" /> Send Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Documents</CardTitle>
              <CardDescription>Contracts, agreements, and files linked to this property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center border border-dashed rounded-lg">
                <Scale className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Create Contractor Agreements</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  Generate professional owner-contractor agreements with AI-powered estimate extraction.
                </p>
                <Link to={`/contracts?property=${id}`}>
                  <Button size="sm">
                    <Scale className="mr-1 h-3 w-3" /> Create Contract
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
