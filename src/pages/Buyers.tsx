import { useCRM } from '@/contexts/CRMContext';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Star, MapPin, DollarSign, Phone, Mail } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Buyers() {
  const { buyers } = useCRM();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return buyers.filter(b =>
      !search || b.name.toLowerCase().includes(s) || b.company.toLowerCase().includes(s) || b.areas.some(a => a.toLowerCase().includes(s))
    );
  }, [buyers, search]);

  const ratingColor: Record<string, string> = {
    a: 'bg-crm-success/10 text-crm-success',
    b: 'bg-primary/10 text-primary',
    c: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="crm-page animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="crm-page-title">Buyer List</h1>
          <p className="crm-page-subtitle">{buyers.length} buyers on disposition list</p>
        </div>
      </div>

      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search name, company, area..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(buyer => (
          <div key={buyer.id} className="crm-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground text-sm">{buyer.name}</h3>
                {buyer.company && <p className="text-xs text-muted-foreground">{buyer.company}</p>}
              </div>
              <Badge className={`crm-badge ${ratingColor[buyer.rating]}`}>
                <Star className="h-2 w-2 mr-0.5" />{buyer.rating.toUpperCase()}
              </Badge>
            </div>

            <p className="text-xs text-foreground mt-2 mb-2">{buyer.criteria}</p>

            <div className="flex flex-wrap gap-1 mb-3">
              {buyer.areas.map(area => (
                <Badge key={area} variant="outline" className="text-[10px]">
                  <MapPin className="h-2 w-2 mr-0.5" />{area}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <DollarSign className="h-3 w-3" />
              ${buyer.priceMin.toLocaleString()} – ${buyer.priceMax.toLocaleString()}
            </div>

            <div className="flex items-center gap-3 pt-3 border-t text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{buyer.phone}</span>
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{buyer.email}</span>
            </div>

            {buyer.notes && (
              <p className="text-[10px] text-muted-foreground mt-2 italic">{buyer.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
