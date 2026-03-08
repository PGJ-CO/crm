import { useCRM } from '@/contexts/CRMContext';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Building2, Bed, Bath, Ruler, Calendar } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Properties() {
  const { properties, getOwner } = useCRM();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return properties.filter(p =>
      !search || p.address.toLowerCase().includes(s) || p.city.toLowerCase().includes(s) || p.zip.includes(s)
    );
  }, [properties, search]);

  const conditionColor: Record<string, string> = {
    excellent: 'bg-crm-success/10 text-crm-success',
    good: 'bg-primary/10 text-primary',
    fair: 'bg-crm-warning/10 text-crm-warning',
    poor: 'bg-crm-danger/10 text-crm-danger',
    distressed: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="crm-page animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title">Properties</h1>
          <p className="crm-page-subtitle">{properties.length} properties tracked</p>
        </div>
      </div>

      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search address, city, zip..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(prop => {
          const owner = getOwner(prop.ownerId);
          return (
            <div key={prop.id} className="crm-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{prop.address}</h3>
                  <p className="text-xs text-muted-foreground">{prop.city}, {prop.state} {prop.zip}</p>
                </div>
                <Badge className={`crm-badge ${conditionColor[prop.condition] || ''}`}>{prop.condition}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Bed className="h-3 w-3" /> {prop.beds} bed</div>
                <div className="flex items-center gap-1"><Bath className="h-3 w-3" /> {prop.baths} bath</div>
                <div className="flex items-center gap-1"><Ruler className="h-3 w-3" /> {prop.sqft.toLocaleString()} sqft</div>
                <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Built {prop.yearBuilt}</div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-muted-foreground">
                  {prop.unitCount > 1 ? `${prop.unitCount} units · ` : ''}{prop.occupancy}
                </span>
                {owner && (
                  <span className="text-xs text-primary font-medium">{owner.firstName} {owner.lastName}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
