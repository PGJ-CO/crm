import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, MapPin, Home, User, DollarSign, Calendar, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PropertyData {
  id: string;
  property_address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  year_built: number | null;
  lot_sqft: number | null;
  property_type: string | null;
  owner_name: string | null;
  last_sale_price: number | null;
  last_sale_date: string | null;
  tax_assessed_value: number | null;
  annual_taxes: number | null;
  data_source: string | null;
  updated_at: string;
}

interface LookupResult {
  success: boolean;
  source?: string;
  data?: PropertyData;
  cached_at?: string;
  stale?: boolean;
  error?: string;
}

interface PropertyLookupProps {
  onPropertyFound?: (data: PropertyData) => void;
  defaultAddress?: string;
  compact?: boolean;
}

export function PropertyLookup({ onPropertyFound, defaultAddress = '', compact = false }: PropertyLookupProps) {
  const [address, setAddress] = useState(defaultAddress);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const { toast } = useToast();

  const handleLookup = async () => {
    if (!address.trim() || address.trim().length < 5) {
      toast({ title: 'Invalid address', description: 'Please enter a valid property address.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('property-lookup', {
        body: { address: address.trim() },
      });

      if (error) {
        setResult({ success: false, error: error.message });
      } else {
        setResult(data as LookupResult);
        if (data?.success && data?.data && onPropertyFound) {
          onPropertyFound(data.data);
        }
      }
    } catch (err) {
      setResult({ success: false, error: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getDaysAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const formatCurrency = (val: number | null) =>
    val != null ? `$${val.toLocaleString()}` : '—';

  const formatDate = (val: string | null) => {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const d = result?.data;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className={`flex gap-2 ${compact ? '' : ''}`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter property address (e.g. 1234 Main St, Denver, CO 80202)"
            className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
        </div>
        <Button onClick={handleLookup} disabled={loading || !address.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {!compact && <span className="ml-1">{loading ? 'Searching…' : 'Get Property Info'}</span>}
        </Button>
      </div>

      {/* Error State */}
      {result && !result.success && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Property not found</p>
            <p className="text-xs text-muted-foreground mt-0.5">{result.error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result?.success && d && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {d.property_address}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {[d.city, d.state, d.zip].filter(Boolean).join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {result.stale && (
                  <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-600">
                    Stale Data
                  </Badge>
                )}
                {d.data_source && (
                  <Badge variant="secondary" className="text-[10px]">
                    {d.data_source}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Property Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{d.beds ?? '—'}</p>
                <p className="text-[10px] text-muted-foreground">Beds</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{d.baths ?? '—'}</p>
                <p className="text-[10px] text-muted-foreground">Baths</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{d.sqft?.toLocaleString() ?? '—'}</p>
                <p className="text-[10px] text-muted-foreground">Sqft</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{d.year_built ?? '—'}</p>
                <p className="text-[10px] text-muted-foreground">Year Built</p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <Home className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Lot Size:</span>
                <span className="font-medium text-foreground ml-auto">{d.lot_sqft?.toLocaleString() ?? '—'} sqft</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <Home className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium text-foreground ml-auto capitalize">{d.property_type?.replace('_', ' ') ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Owner:</span>
                <span className="font-medium text-foreground ml-auto">{d.owner_name ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Last Sale:</span>
                <span className="font-medium text-foreground ml-auto">
                  {formatCurrency(d.last_sale_price)} on {formatDate(d.last_sale_date)}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Assessed:</span>
                <span className="font-medium text-foreground ml-auto">{formatCurrency(d.tax_assessed_value)}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Annual Taxes:</span>
                <span className="font-medium text-foreground ml-auto">{formatCurrency(d.annual_taxes)}</span>
              </div>
            </div>

            {/* Cache Info */}
            {result.cached_at && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                <Clock className="h-3 w-3" />
                Last updated: {getDaysAgo(result.cached_at)}
                {result.source === 'cache' && ' (cached)'}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
