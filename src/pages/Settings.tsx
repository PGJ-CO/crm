import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCRM } from '@/contexts/CRMContext';
import { Shield, Clock, MessageSquare, Users, Tag, MapPin } from 'lucide-react';

export default function SettingsPage() {
  const { users, campaigns } = useCRM();

  return (
    <div className="crm-page animate-slide-in">
      <h1 className="crm-page-title mb-6">Settings</h1>

      <div className="space-y-6 max-w-3xl">
        {/* Compliance */}
        <section className="crm-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Compliance & Legal</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0 text-[10px]">TCPA</Badge>
              <p>All SMS/email first messages include opt-out: "Reply STOP to opt out." Consent tracked per owner.</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0 text-[10px]">DNC</Badge>
              <p>DNC flags honored across all channels. Owners marked DNC receive zero outreach.</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="shrink-0 text-[10px]">Consent</Badge>
              <p>Per-channel consent flags (SMS, Email, Phone) tracked for every owner record.</p>
            </div>
          </div>
        </section>

        {/* Quiet Hours */}
        <section className="crm-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-crm-warning" />
            <h2 className="font-semibold text-foreground">Quiet Hours</h2>
          </div>
          <p className="text-sm text-muted-foreground">No automated outreach outside <span className="font-medium text-foreground">8:00 AM – 8:00 PM</span> local time. Manual messages will show a warning if sent during quiet hours.</p>
        </section>

        {/* Markets */}
        <section className="crm-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-crm-success" />
            <h2 className="font-semibold text-foreground">Markets</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Dallas', 'Fort Worth', 'Houston', 'San Antonio', 'Austin', 'Plano', 'Frisco', 'McKinney', 'Arlington', 'Irving'].map(m => (
              <Badge key={m} variant="secondary">{m}</Badge>
            ))}
          </div>
        </section>

        {/* Users */}
        <section className="crm-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Team</h2>
          </div>
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant="outline" className="capitalize text-[10px]">{u.role}</Badge>
              </div>
            ))}
          </div>
        </section>

        {/* Message Templates */}
        <section className="crm-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Default Templates</h2>
          </div>
          <div className="space-y-3">
            <TemplateItem label="First SMS" text="Hi {{first_name}}, I noticed your property at {{address}}. We buy houses as-is. Any interest? Reply STOP to opt out." />
            <TemplateItem label="First Email" text="Subject: Quick question about {{address}}\n\nHi {{first_name}}, I help homeowners sell quickly, as-is, with no fees or commissions. Would you be open to a conversation about your options?" />
            <TemplateItem label="Follow Up" text="Hi {{first_name}}, just circling back on {{address}}. We can close on your timeline. Let me know if you'd like to chat. Reply STOP to opt out." />
          </div>
        </section>

        {/* Tags */}
        <section className="crm-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-crm-warning" />
            <h2 className="font-semibold text-foreground">Tags</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['inherited', 'absentee', 'tax-lien', 'motivated', 'relocating', 'divorce', 'equity', 'vacant', 'tired-landlord', 'probate', 'pre-foreclosure', 'urgent', 'multi-family', 'portfolio', 'referral', 'distressed', 'dnc', 'quick-close', 'closing-soon'].map(t => (
              <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
            ))}
          </div>
        </section>

        {/* Webhooks Stub */}
        <section className="crm-card p-5">
          <h2 className="font-semibold text-foreground mb-2">Integrations & Webhooks</h2>
          <p className="text-sm text-muted-foreground">
            Inbound endpoints ready to wire:<br />
            <code className="text-xs bg-muted px-1 py-0.5 rounded">POST /api/inbound/sms</code> — Receive SMS from Twilio/etc<br />
            <code className="text-xs bg-muted px-1 py-0.5 rounded">POST /api/inbound/email</code> — Receive email via SendGrid/etc<br />
            <code className="text-xs bg-muted px-1 py-0.5 rounded">POST /api/inbound/call</code> — Log phone calls<br />
            <code className="text-xs bg-muted px-1 py-0.5 rounded">POST /api/outbound/sms</code> — Send SMS<br />
            <code className="text-xs bg-muted px-1 py-0.5 rounded">POST /api/outbound/email</code> — Send email
          </p>
        </section>
      </div>
    </div>
  );
}

function TemplateItem({ label, text }: { label: string; text: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      <p className="text-xs text-muted-foreground whitespace-pre-line">{text}</p>
    </div>
  );
}
