import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Upload, PenTool, FolderOpen, File, FileSignature } from 'lucide-react';

const templateStubs = [
  { id: 't1', name: 'Purchase Agreement', type: 'Contract', status: 'ready' },
  { id: 't2', name: 'Assignment of Contract', type: 'Contract', status: 'ready' },
  { id: 't3', name: 'Letter of Intent', type: 'Letter', status: 'ready' },
  { id: 't4', name: 'Proof of Funds', type: 'Document', status: 'draft' },
  { id: 't5', name: 'Seller Disclosure', type: 'Disclosure', status: 'draft' },
];

const recentDocs = [
  { id: 'd1', name: 'Purchase Agreement - 123 Oak St', lead: 'Robert Martinez', date: '2025-01-08', status: 'signed' },
  { id: 'd2', name: 'LOI - 456 Pine Ave', lead: 'Karen White', date: '2025-01-07', status: 'sent' },
  { id: 'd3', name: 'Assignment - 789 Elm Dr', lead: 'James Wilson', date: '2025-01-05', status: 'draft' },
];

export default function Documents() {
  return (
    <div className="crm-page animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title flex items-center gap-2"><FileText className="h-5 w-5" /> Documents</h1>
          <p className="crm-page-subtitle">Create, send, sign & store documents linked to your leads</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled><Upload className="mr-1 h-3 w-3" /> Upload</Button>
          <Button size="sm" disabled><Plus className="mr-1 h-3 w-3" /> New Document</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="text-center py-6">
          <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{templateStubs.length}</p>
          <p className="text-xs text-muted-foreground">Templates</p>
        </Card>
        <Card className="text-center py-6">
          <FileSignature className="h-8 w-8 text-[hsl(var(--crm-success))] mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">1</p>
          <p className="text-xs text-muted-foreground">Signed</p>
        </Card>
        <Card className="text-center py-6">
          <PenTool className="h-8 w-8 text-[hsl(var(--crm-warning))] mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">1</p>
          <p className="text-xs text-muted-foreground">Awaiting Signature</p>
        </Card>
      </div>

      {/* Templates */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Contract Templates</CardTitle>
          <CardDescription>Pre-loaded templates for common real estate documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {templateStubs.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <File className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.status === 'ready' ? 'default' : 'secondary'}>{t.status}</Badge>
                  <Button size="sm" variant="ghost" className="text-xs" disabled>Use</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentDocs.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.lead} · {d.date}</p>
                  </div>
                </div>
                <Badge variant={d.status === 'signed' ? 'default' : d.status === 'sent' ? 'secondary' : 'outline'}>
                  {d.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-dashed">
        <CardContent className="py-8 text-center">
          <PenTool className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">Built-in eSignature Coming Soon</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Send, sign, and store documents directly from your CRM. 
            Requires backend integration for secure document storage and signing workflows.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
