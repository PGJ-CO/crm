import { useMemo, useState } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { LEAD_STAGES } from '@/types/crm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Inbox, Phone, MessageSquare, Mail, Clock, Star, ChevronRight, Flame } from 'lucide-react';

type SortMode = 'engagement' | 'newest' | 'motivation' | 'last_touch';

export default function LeadsInbox() {
  const { leads, getOwner, getProperty, communications, updateLeadStage } = useCRM();
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('engagement');

  const scoredLeads = useMemo(() => {
    const now = Date.now();
    return leads
      .filter(l => l.stage !== 'dead_dnc' && l.stage !== 'closed_won')
      .map(lead => {
        const owner = getOwner(lead.ownerId);
        const prop = getProperty(lead.propertyId);
        const comms = communications.filter(c => c.leadId === lead.id);
        const lastInbound = comms.filter(c => c.direction === 'inbound').sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
        const daysSinceTouch = Math.floor((now - new Date(lead.lastTouch).getTime()) / 86400000);
        const recentInbound = lastInbound ? Math.floor((now - new Date(lastInbound.createdAt).getTime()) / 86400000) < 3 : false;

        // Engagement score: motivation + recency + inbound activity
        const engagementScore =
          lead.motivationScore * 1.5 +
          (recentInbound ? 80 : 0) +
          Math.max(0, 50 - daysSinceTouch * 2) +
          comms.length * 5;

        return { lead, owner, prop, comms, lastInbound, daysSinceTouch, recentInbound, engagementScore };
      })
      .filter(item => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
          `${item.owner?.firstName} ${item.owner?.lastName}`.toLowerCase().includes(s) ||
          item.prop?.address.toLowerCase().includes(s) ||
          item.owner?.phones.some(p => p.includes(search)) ||
          item.lead.tags.some(t => t.toLowerCase().includes(s))
        );
      })
      .sort((a, b) => {
        switch (sortMode) {
          case 'engagement': return b.engagementScore - a.engagementScore;
          case 'newest': return b.lead.createdAt.localeCompare(a.lead.createdAt);
          case 'motivation': return b.lead.motivationScore - a.lead.motivationScore;
          case 'last_touch': return a.daysSinceTouch - b.daysSinceTouch;
        }
      });
  }, [leads, communications, search, sortMode, getOwner, getProperty]);

  const stageInfo = (key: string) => LEAD_STAGES.find(s => s.key === key);

  return (
    <div className="crm-page animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title flex items-center gap-2"><Inbox className="h-5 w-5" /> Leads Inbox</h1>
          <p className="crm-page-subtitle">
            {scoredLeads.length} active leads · {scoredLeads.filter(s => s.recentInbound).length} re-engaged in last 3 days
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name, address, phone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sortMode} onValueChange={v => setSortMode(v as SortMode)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engagement">🔥 Most Engaged</SelectItem>
            <SelectItem value="newest">🆕 Newest First</SelectItem>
            <SelectItem value="motivation">⭐ Highest Motivation</SelectItem>
            <SelectItem value="last_touch">🕐 Recently Touched</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {scoredLeads.map(({ lead, owner, prop, comms, lastInbound, daysSinceTouch, recentInbound, engagementScore }) => {
          const stage = stageInfo(lead.stage);
          return (
            <div
              key={lead.id}
              className="crm-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer"
            >
              {/* Priority indicator */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex flex-col items-center gap-0.5">
                  {recentInbound && <Flame className="h-4 w-4 text-destructive animate-pulse" />}
                  {lead.motivationScore >= 70 && !recentInbound && <Star className="h-4 w-4 text-[hsl(var(--crm-warning))]" />}
                  {lead.motivationScore < 70 && !recentInbound && <div className="w-4" />}
                  <span className="text-[10px] font-mono text-muted-foreground">{Math.round(engagementScore)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {owner?.firstName} {owner?.lastName}
                    </span>
                    <Badge className={`crm-badge ${stage?.color} text-primary-foreground text-[10px]`}>{stage?.label}</Badge>
                    {recentInbound && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 animate-pulse">RE-ENGAGED</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{prop?.address}, {prop?.city}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lead.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comms summary */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                <div className="flex items-center gap-1" title="Total communications">
                  <MessageSquare className="h-3 w-3" />
                  <span>{comms.length}</span>
                </div>
                <div className="flex items-center gap-1" title="Days since last touch">
                  <Clock className="h-3 w-3" />
                  <span>{daysSinceTouch}d</span>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-[10px] text-muted-foreground">Next action</p>
                  <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{lead.nextAction}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          );
        })}

        {scoredLeads.length === 0 && (
          <div className="crm-card p-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No active leads match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
