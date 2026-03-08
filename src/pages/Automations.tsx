import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Play, Pause, Plus, ArrowRight, Bell, Mail, MessageSquare, CheckSquare } from 'lucide-react';

const prebuiltWorkflows = [
  {
    id: 'w1', name: 'New Lead Auto-Assign', status: 'active' as const,
    trigger: 'Lead created', actions: ['Assign to round-robin user', 'Create follow-up task', 'Start drip sequence'],
    icon: Zap,
  },
  {
    id: 'w2', name: 'Stage Change → Follow Up', status: 'active' as const,
    trigger: 'Lead stage updated', actions: ['Send notification to assignee', 'Create next task', 'Update campaign enrollment'],
    icon: ArrowRight,
  },
  {
    id: 'w3', name: 'Missed Call → Task', status: 'paused' as const,
    trigger: 'Inbound call missed', actions: ['Create urgent callback task', 'Send SMS acknowledgment', 'Notify team lead'],
    icon: Bell,
  },
  {
    id: 'w4', name: 'Offer Accepted → Docs', status: 'draft' as const,
    trigger: 'Offer status = accepted', actions: ['Generate contract from template', 'Send for eSignature', 'Create closing checklist'],
    icon: CheckSquare,
  },
];

export default function Automations() {
  return (
    <div className="crm-page animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title flex items-center gap-2"><Zap className="h-5 w-5" /> Workflow Automations</h1>
          <p className="crm-page-subtitle">Trigger actions automatically based on lead status changes and events</p>
        </div>
        <Button size="sm" disabled><Plus className="mr-1 h-3 w-3" /> Create Workflow</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {prebuiltWorkflows.map(wf => (
          <Card key={wf.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <wf.icon className="h-4 w-4 text-primary" />
                  {wf.name}
                </CardTitle>
                <Badge variant={wf.status === 'active' ? 'default' : wf.status === 'paused' ? 'secondary' : 'outline'}>
                  {wf.status === 'active' && <Play className="h-2 w-2 mr-1" />}
                  {wf.status === 'paused' && <Pause className="h-2 w-2 mr-1" />}
                  {wf.status}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Trigger: <span className="font-medium text-foreground">{wf.trigger}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {wf.actions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</div>
                    {action}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="text-xs" disabled>Edit</Button>
                <Button size="sm" variant="outline" className="text-xs" disabled>
                  {wf.status === 'active' ? 'Pause' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-dashed">
        <CardContent className="py-8 text-center">
          <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">Custom Workflows Coming Soon</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Build custom automation rules with triggers, conditions, and multi-step actions. 
            Requires backend integration with Lovable Cloud for event processing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
