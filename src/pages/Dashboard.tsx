import { useCRM } from '@/contexts/CRMContext';
import { LEAD_STAGES } from '@/types/crm';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, DollarSign, Phone, MessageSquare, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const { leads, tasks, owners, properties, campaigns, buyers, communications, getOwner, getProperty } = useCRM();

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.dueDate <= today && t.status === 'pending');
  const overdueTasks = tasks.filter(t => t.dueDate < today && t.status === 'pending');
  const newLeadsThisWeek = leads.filter(l => {
    const d = new Date(l.createdAt);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  });
  const closedDeals = leads.filter(l => l.stage === 'closed_won');
  const hotLeads = leads.filter(l => l.motivationScore >= 70 && l.stage !== 'dead_dnc' && l.stage !== 'closed_won');
  const pipelineCounts = LEAD_STAGES.map(s => ({
    ...s,
    count: leads.filter(l => l.stage === s.key).length,
  }));

  const sourceBreakdown = leads.reduce((acc, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const channelBreakdown = communications.reduce((acc, c) => {
    acc[c.channel] = (acc[c.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="crm-page animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title">Dashboard</h1>
          <p className="crm-page-subtitle">Welcome back. Here's your pipeline overview.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to="/leads">View Pipeline <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={<Users className="h-4 w-4" />} label="Active Leads" value={leads.filter(l => l.stage !== 'dead_dnc' && l.stage !== 'closed_won').length} accent="text-primary" />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Hot Leads" value={hotLeads.length} accent="text-crm-warning" />
        <StatCard icon={<DollarSign className="h-4 w-4" />} label="Deals Closed" value={closedDeals.length} accent="text-crm-success" />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Tasks Due Today" value={todayTasks.length} accent={overdueTasks.length > 0 ? 'text-crm-danger' : 'text-primary'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Pipeline Overview */}
        <div className="lg:col-span-2 crm-card p-4 md:p-5">
          <h3 className="font-semibold text-foreground mb-4">Pipeline Overview</h3>
          <div className="space-y-3">
            {pipelineCounts.filter(s => s.count > 0).map(s => (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-28 text-xs text-muted-foreground truncate">{s.label}</div>
                <div className="flex-1">
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full flex items-center justify-end pr-2 transition-all`}
                      style={{ width: `${Math.max((s.count / leads.length) * 100, 8)}%` }}
                    >
                      <span className="text-[10px] font-bold text-primary-foreground">{s.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="crm-card p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Today's Tasks</h3>
            <Badge variant={overdueTasks.length > 0 ? 'destructive' : 'secondary'} className="text-[10px]">
              {overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : 'On track'}
            </Badge>
          </div>
          <div className="space-y-2">
            {todayTasks.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${t.priority === 'high' ? 'bg-crm-danger' : t.priority === 'medium' ? 'bg-crm-warning' : 'bg-muted-foreground'}`} />
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground">{t.dueDate}</p>
                </div>
              </div>
            ))}
            {todayTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks due today ✓</p>
            )}
            <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
              <Link to="/tasks">View All Tasks</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
        {/* Source Performance */}
        <div className="crm-card p-4 md:p-5">
          <h3 className="font-semibold text-foreground mb-4">Lead Sources</h3>
          <div className="space-y-2">
            {Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{source}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Activity */}
        <div className="crm-card p-4 md:p-5">
          <h3 className="font-semibold text-foreground mb-4">Channel Activity</h3>
          <div className="space-y-3">
            {Object.entries(channelBreakdown).map(([ch, count]) => (
              <div key={ch} className="flex items-center gap-3">
                {ch === 'sms' ? <MessageSquare className="h-4 w-4 text-primary" /> : ch === 'email' ? <Mail className="h-4 w-4 text-crm-success" /> : <Phone className="h-4 w-4 text-crm-warning" />}
                <span className="text-sm capitalize text-foreground">{ch}</span>
                <Badge variant="secondary" className="ml-auto">{count}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Hot Leads */}
        <div className="crm-card p-4 md:p-5">
          <h3 className="font-semibold text-foreground mb-4">🔥 Hot Leads</h3>
          <div className="space-y-2">
            {hotLeads.slice(0, 5).map(l => {
              const owner = getOwner(l.ownerId);
              const prop = getProperty(l.propertyId);
              return (
                <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{owner?.firstName} {owner?.lastName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{prop?.address}</p>
                  </div>
                  <Badge className="crm-badge bg-crm-warning/10 text-crm-warning shrink-0">{l.motivationScore}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) {
  return (
    <div className="crm-stat-card">
      <div className="flex items-center gap-2 mb-2">
        <div className={accent}>{icon}</div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl md:text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
