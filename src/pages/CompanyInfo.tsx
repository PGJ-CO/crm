import { useState } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Save, Globe, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CompanyInfo() {
  const { companyInfo, updateCompanyInfo } = useCRM();
  const { toast } = useToast();
  const [form, setForm] = useState({ ...companyInfo });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    updateCompanyInfo(form);
    toast({ title: 'Company info saved', description: 'Your company details have been updated.' });
  };

  return (
    <div className="crm-page animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="crm-page-title">Company Info</h1>
          <p className="crm-page-subtitle">Manage your company details for branding, communications & contracts</p>
        </div>
        <Button onClick={handleSave}><Save className="mr-1 h-3 w-3" /> Save Changes</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4" /> Business Details</CardTitle>
            <CardDescription>Used in email headers, contracts, and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Company Name *</Label>
              <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your Company LLC" />
            </div>
            <div>
              <Label className="text-xs">DBA / Trade Name</Label>
              <Input value={form.dba} onChange={e => update('dba', e.target.value)} placeholder="Your Brand Name" />
            </div>
            <div>
              <Label className="text-xs">Logo URL</Label>
              <Input value={form.logoUrl} onChange={e => update('logoUrl', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs">EIN / Tax ID</Label>
              <Input value={form.ein} onChange={e => update('ein', e.target.value)} placeholder="XX-XXXXXXX" />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Phone className="h-4 w-4" /> Contact Information</CardTitle>
            <CardDescription>Shown in outreach, signatures, and legal documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Primary Phone</Label>
              <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(555) 123-4567" />
            </div>
            <div>
              <Label className="text-xs">Primary Email</Label>
              <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="info@yourcompany.com" />
            </div>
            <div>
              <Label className="text-xs">Website</Label>
              <Input value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://yourcompany.com" />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4" /> Mailing Address</CardTitle>
            <CardDescription>Used on contracts, letters, and compliance docs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Street Address</Label>
              <Input value={form.street} onChange={e => update('street', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">City</Label>
                <Input value={form.city} onChange={e => update('city', e.target.value)} />
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
          </CardContent>
        </Card>

        {/* Legal / Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" /> Legal & Compliance</CardTitle>
            <CardDescription>Default text for contracts and disclosures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">License Number</Label>
              <Input value={form.licenseNumber} onChange={e => update('licenseNumber', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Default Email Signature</Label>
              <Textarea value={form.emailSignature} onChange={e => update('emailSignature', e.target.value)} rows={3} placeholder="Best regards,&#10;Your Name | Your Company" />
            </div>
            <div>
              <Label className="text-xs">Contract Footer / Disclaimer</Label>
              <Textarea value={form.contractDisclaimer} onChange={e => update('contractDisclaimer', e.target.value)} rows={3} placeholder="This agreement is entered into by..." />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
