import { useState, useCallback, useRef } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CSVRow {
  [key: string]: string;
}

type ImportStep = 'upload' | 'map' | 'preview' | 'done';

const REQUIRED_FIELDS = ['firstName', 'lastName'] as const;
const OPTIONAL_FIELDS = [
  'phone', 'email', 'address', 'city', 'state', 'zip',
  'beds', 'baths', 'sqft', 'yearBuilt',
  'source', 'motivationScore', 'notes', 'tags',
] as const;

const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

const FIELD_LABELS: Record<string, string> = {
  firstName: 'First Name *',
  lastName: 'Last Name *',
  phone: 'Phone',
  email: 'Email',
  address: 'Property Address',
  city: 'City',
  state: 'State',
  zip: 'Zip',
  beds: 'Beds',
  baths: 'Baths',
  sqft: 'Sqft',
  yearBuilt: 'Year Built',
  source: 'Lead Source',
  motivationScore: 'Motivation (0-100)',
  notes: 'Notes',
  tags: 'Tags (comma-sep)',
};

function parseCSV(text: string): { headers: string[]; rows: CSVRow[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
      current += char;
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(line => {
    const values = parseRow(line);
    const row: CSVRow = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
  return { headers, rows };
}

function autoMapColumns(csvHeaders: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const hints: Record<string, string[]> = {
    firstName: ['firstname', 'first', 'fname'],
    lastName: ['lastname', 'last', 'lname', 'surname'],
    phone: ['phone', 'mobile', 'cell', 'telephone'],
    email: ['email', 'emailaddress', 'mail'],
    address: ['address', 'propertyaddress', 'streetaddress', 'street'],
    city: ['city'],
    state: ['state', 'st'],
    zip: ['zip', 'zipcode', 'postalcode', 'postal'],
    beds: ['beds', 'bedrooms', 'bed'],
    baths: ['baths', 'bathrooms', 'bath'],
    sqft: ['sqft', 'squarefeet', 'sqfootage', 'size'],
    yearBuilt: ['yearbuilt', 'year', 'built'],
    source: ['source', 'leadsource', 'origin'],
    motivationScore: ['motivation', 'motivationscore', 'score'],
    notes: ['notes', 'note', 'comments', 'comment'],
    tags: ['tags', 'tag', 'labels'],
  };

  csvHeaders.forEach(header => {
    const norm = normalize(header);
    for (const [field, patterns] of Object.entries(hints)) {
      if (patterns.includes(norm) && !Object.values(mapping).includes(header)) {
        mapping[field] = header;
        break;
      }
    }
  });
  return mapping;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CSVImportDialog({ open, onOpenChange }: Props) {
  const { addLead, addOwner, addProperty, owners, users } = useCRM();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ImportStep>('upload');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<CSVRow[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState({ imported: 0, duplicates: 0, errors: 0 });

  const reset = () => {
    setStep('upload');
    setCsvHeaders([]);
    setCsvRows([]);
    setColumnMap({});
    setImportResult({ imported: 0, duplicates: 0, errors: 0 });
  };

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);
      if (!headers.length) return;
      setCsvHeaders(headers);
      setCsvRows(rows);
      setColumnMap(autoMapColumns(headers));
      setStep('map');
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) handleFile(file);
  }, [handleFile]);

  const canProceedToPreview = REQUIRED_FIELDS.every(f => columnMap[f]);

  const getMappedValue = (row: CSVRow, field: string) => {
    const csvCol = columnMap[field];
    return csvCol ? row[csvCol] || '' : '';
  };

  const isDuplicate = (phone: string, email: string) => {
    if (!phone && !email) return false;
    return owners.some(o =>
      (phone && o.phones.some(p => p.replace(/\D/g, '') === phone.replace(/\D/g, ''))) ||
      (email && o.emails.some(e => e.toLowerCase() === email.toLowerCase()))
    );
  };

  const handleImport = () => {
    let imported = 0, duplicates = 0, errors = 0;
    const now = new Date().toISOString().split('T')[0];

    csvRows.forEach((row, i) => {
      try {
        const firstName = getMappedValue(row, 'firstName').trim();
        const lastName = getMappedValue(row, 'lastName').trim();
        if (!firstName || !lastName) { errors++; return; }

        const phone = getMappedValue(row, 'phone').trim();
        const email = getMappedValue(row, 'email').trim();

        if (isDuplicate(phone, email)) { duplicates++; return; }

        const ts = Date.now() + i;
        const ownerId = `o_csv_${ts}`;
        const propId = `p_csv_${ts}`;
        const leadId = `l_csv_${ts}`;

        const address = getMappedValue(row, 'address') || 'Unknown';
        const city = getMappedValue(row, 'city') || '';
        const state = getMappedValue(row, 'state') || 'TX';
        const zip = getMappedValue(row, 'zip') || '';

        addOwner({
          id: ownerId, firstName, lastName,
          phones: phone ? [phone] : [], emails: email ? [email] : [],
          mailingAddress: `${address}, ${city}, ${state} ${zip}`.trim(),
          notes: getMappedValue(row, 'notes'),
          consentSms: true, consentEmail: true, consentPhone: true, isDnc: false, createdAt: now,
        });

        addProperty({
          id: propId, address, city, state, zip,
          unitCount: 1,
          beds: parseInt(getMappedValue(row, 'beds')) || 0,
          baths: parseInt(getMappedValue(row, 'baths')) || 0,
          sqft: parseInt(getMappedValue(row, 'sqft')) || 0,
          yearBuilt: parseInt(getMappedValue(row, 'yearBuilt')) || 0,
          occupancy: 'unknown', condition: 'fair', photos: [], ownerId, createdAt: now,
        });

        const tagsRaw = getMappedValue(row, 'tags');
        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

        addLead({
          id: leadId, ownerId, propertyId: propId,
          source: getMappedValue(row, 'source') || 'CSV Import',
          stage: 'new', tags,
          motivationScore: Math.min(100, Math.max(0, parseInt(getMappedValue(row, 'motivationScore')) || 50)),
          lastTouch: now, nextAction: 'Initial outreach',
          assignedUserId: users[0]?.id || 'u1',
          notes: getMappedValue(row, 'notes'), createdAt: now,
        });
        imported++;
      } catch {
        errors++;
      }
    });

    setImportResult({ imported, duplicates, errors });
    setStep('done');
  };

  const previewRows = csvRows.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Import Leads from CSV
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {(['upload', 'map', 'preview', 'done'] as ImportStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              {i > 0 && <span className="text-border">→</span>}
              <span className={step === s ? 'text-primary font-semibold' : ''}>{s === 'upload' ? 'Upload' : s === 'map' ? 'Map Columns' : s === 'preview' ? 'Preview' : 'Done'}</span>
            </div>
          ))}
        </div>

        {/* Upload step */}
        {step === 'upload' && (
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }} />
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">Drop a CSV file here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">Columns: First Name, Last Name, Phone, Email, Address, City, State, Zip, Source, Motivation, Notes, Tags</p>
          </div>
        )}

        {/* Map columns step */}
        {step === 'map' && (
          <div className="space-y-3 flex-1 overflow-hidden">
            <p className="text-xs text-muted-foreground">Found <strong>{csvRows.length}</strong> rows. Map your CSV columns to CRM fields:</p>
            <ScrollArea className="h-[340px] pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_FIELDS.map(field => (
                  <div key={field} className="flex items-center gap-2">
                    <span className="text-xs w-32 shrink-0 text-foreground">{FIELD_LABELS[field]}</span>
                    <Select value={columnMap[field] || '_none'} onValueChange={v => setColumnMap(prev => ({ ...prev, [field]: v === '_none' ? '' : v }))}>
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="— skip —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">— skip —</SelectItem>
                        {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep('upload')}>Back</Button>
              <Button size="sm" disabled={!canProceedToPreview} onClick={() => setStep('preview')}>
                Preview Import
              </Button>
            </div>
          </div>
        )}

        {/* Preview step */}
        {step === 'preview' && (
          <div className="space-y-3 flex-1 overflow-hidden">
            <p className="text-xs text-muted-foreground">
              Showing first {previewRows.length} of {csvRows.length} rows. Duplicates detected by phone/email match.
            </p>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {previewRows.map((row, i) => {
                  const phone = getMappedValue(row, 'phone');
                  const email = getMappedValue(row, 'email');
                  const dup = isDuplicate(phone, email);
                  return (
                    <div key={i} className={`p-3 rounded-lg border text-xs ${dup ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">
                          {getMappedValue(row, 'firstName')} {getMappedValue(row, 'lastName')}
                        </span>
                        {dup && <Badge variant="destructive" className="text-[10px]">Duplicate</Badge>}
                      </div>
                      <div className="text-muted-foreground space-y-0.5">
                        {phone && <p>📱 {phone}</p>}
                        {email && <p>✉️ {email}</p>}
                        {getMappedValue(row, 'address') && <p>🏠 {getMappedValue(row, 'address')}, {getMappedValue(row, 'city')} {getMappedValue(row, 'state')}</p>}
                        {getMappedValue(row, 'source') && <p>Source: {getMappedValue(row, 'source')}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep('map')}>Back</Button>
              <Button size="sm" onClick={handleImport}>
                Import {csvRows.length} Leads
              </Button>
            </div>
          </div>
        )}

        {/* Done step */}
        {step === 'done' && (
          <div className="py-6 text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-accent" />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">Import Complete</p>
              <div className="flex justify-center gap-4 text-sm">
                <span className="text-accent">{importResult.imported} imported</span>
                {importResult.duplicates > 0 && (
                  <span className="text-crm-warning flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{importResult.duplicates} duplicates skipped</span>
                )}
                {importResult.errors > 0 && (
                  <span className="text-destructive">{importResult.errors} errors</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">New leads are added as "New" stage and ready for outreach.</p>
            </div>
            <Button size="sm" onClick={() => { reset(); onOpenChange(false); }}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
