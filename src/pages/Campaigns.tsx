import { useCRM } from '@/contexts/CRMContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mail, Phone, Play, Pause, Users } from 'lucide-react';

export default function Campaigns() {
  const { campaigns } = useCRM();

  const channelIcon = { sms: MessageSquare, email: Mail, phone: Phone };

  return (
    <div className="crm-page animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title">Campaigns</h1>
          <p className="crm-page-subtitle">Manage your drip sequences and outreach</p>
        </div>
      </div>

      <div className="space-y-4">
        {campaigns.map(c => (
          <div key={c.id} className="crm-card p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                  <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                    {c.status === 'active' ? <><Play className="h-2 w-2 mr-1" />Active</> : <><Pause className="h-2 w-2 mr-1" />Paused</>}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.goal}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{c.leadsEnrolled} enrolled</span>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {c.channels.map(ch => {
                const Icon = channelIcon[ch];
                return (
                  <Badge key={ch} variant="outline" className="text-[10px]">
                    <Icon className="h-3 w-3 mr-1" />{ch}
                  </Badge>
                );
              })}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sequence</p>
              <div className="space-y-1">
                {c.schedule.map((step, i) => {
                  const Icon = channelIcon[step.channel];
                  return (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1 shrink-0 w-16">
                        <span className="text-xs font-medium text-foreground">Day {step.day}</span>
                      </div>
                      <Icon className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground line-clamp-2">{step.template}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl border-2 border-dashed border-border text-center">
        <p className="text-sm text-muted-foreground mb-2">TCPA/DNC Compliance</p>
        <p className="text-xs text-muted-foreground">All first outreach messages include opt-out instructions. No messages sent outside quiet hours (8am-8pm local). DNC flags are honored across all channels.</p>
      </div>
    </div>
  );
}
