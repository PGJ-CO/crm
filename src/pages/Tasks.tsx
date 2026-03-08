import { useCRM } from '@/contexts/CRMContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Clock, AlertTriangle, AlarmClock } from 'lucide-react';

export default function Tasks() {
  const { tasks, updateTaskStatus, getOwner, getLead, getProperty } = useCRM();

  const pending = tasks.filter(t => t.status === 'pending').sort((a, b) => {
    const prio = { high: 0, medium: 1, low: 2 };
    return prio[a.priority] - prio[b.priority] || a.dueDate.localeCompare(b.dueDate);
  });
  const completed = tasks.filter(t => t.status === 'completed');

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="crm-page animate-slide-in">
      <div className="mb-6">
        <h1 className="crm-page-title">Tasks</h1>
        <p className="crm-page-subtitle">{pending.length} pending · {completed.length} completed</p>
      </div>

      <div className="space-y-2">
        {pending.map(task => {
          const isOverdue = task.dueDate < today;
          const lead = task.leadId ? getLead(task.leadId) : undefined;
          const owner = lead ? getOwner(lead.ownerId) : undefined;
          return (
            <div key={task.id} className={`crm-card p-3 md:p-4 flex items-start gap-3 ${isOverdue ? 'border-destructive/30' : ''}`}>
              <Checkbox
                className="mt-0.5"
                checked={task.status === 'completed'}
                onCheckedChange={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                  <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px]">
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                    {isOverdue ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {task.dueDate}
                  </span>
                  {owner && <span>{owner.firstName} {owner.lastName}</span>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateTaskStatus(task.id, 'snoozed')}
                className="shrink-0"
              >
                <AlarmClock className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>

      {completed.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Completed ({completed.length})</h3>
          <div className="space-y-1">
            {completed.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-crm-success shrink-0" />
                <span className="text-sm text-muted-foreground line-through">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
