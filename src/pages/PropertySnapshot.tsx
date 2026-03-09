import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, User, DollarSign, AlertTriangle, MapPin, Phone, Mail, FileText, TrendingUp, Wrench, Target, Calendar, Send, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

// Mock property data
const getMockProperty = (id: string) => ({
  id,
  address: '1423 Oak Street',
  city: 'Denver',
  state: 'CO',
  zip: '80202',
  county: 'Denver',
  beds: 3,
  baths: 2,
  sqft: 1450,
  lotSqft: 6500,
  yearBuilt: 1972,
  propertyType: 'Single Family',
  zoning: 'R-1',
  owner: {
    name: 'John Smith',
    mailingAddress: '4521 Pine Ave, Phoenix, AZ 85001',
    type: 'Individual',
    isAbsentee: true,
    isOutOfState: true,
    ownershipYears: 14,
    phones: [{ number: '(303) 555-0123', type: 'Mobile', confidence: 92 }, { number: '(303) 555-0456', type: 'Landline', confidence: 78 }],
    emails: [{ address: 'jsmith72@email.com', confidence: 85 }],
  },
  financials: {
    purchaseDate: '2010-03-15',
    purchasePrice: 185000,
    currentValue: 425000,
    estimatedEquity: 340000,
    equityPercent: 80,
    mortgageBalance: 85000,
    mortgageLender: 'Wells Fargo',
    mortgageRate: 4.25,
    mortgageTerm: 30,
    taxAssessedValue: 395000,
    annualTaxes: 3200,
  },
  distressSignals: {
    isPreForeclosure: false,
    isVacant: true,
    taxDelinquent: false,
    taxDelinquentAmount: 0,
    hasCodeViolations: true,
    codeViolationCount: 2,
    isProbate: false,
    isDivorce: false,
    isHighEquity: true,
    isTiredLandlord: false,
  },
  market: {
    arv: 450000,
    rentalValue: 2200,
    daysOnMarket: 0,
    lastSaleDate: '2010-03-15',
    lastSalePrice: 185000,
  },
  comps: [
    { address: '1401 Oak St', soldDate: '2025-11-20', soldPrice: 435000, beds: 3, baths: 2, sqft: 1500, distance: 0.1 },
    { address: '1510 Elm Ave', soldDate: '2025-10-05', soldPrice: 415000, beds: 3, baths: 1.5, sqft: 1380, distance: 0.2 },
    { address: '1322 Pine Blvd', soldDate: '2025-12-10', soldPrice: 460000, beds: 4, baths: 2, sqft: 1620, distance: 0.3 },
    { address: '1489 Cedar Dr', soldDate: '2025-09-18', soldPrice: 428000, beds: 3, baths: 2, sqft: 1410, distance: 0.4 },
  ],
  dealScore: 78,
});

function DistressIcon({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
      active ? 'bg-destructive/10 text-destructive font-medium' : 'bg-muted text-muted-foreground'
    }`}>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-destructive' : 'bg-muted-foreground/30'}`} />
      {label}
    </div>
  );
}

export default function PropertySnapshot() {
  const { id } = useParams();
  const navigate = useNavigate();
  const prop = getMockProperty(id || '1');

  const activeSignals = Object.entries(prop.distressSignals).filter(([_, v]) => v === true || (typeof v === 'number' && v > 0));

  return (
    <div className="crm-page">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="crm-page-title">{prop.address}</h1>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
              prop.dealScore >= 70 ? 'bg-accent/10 text-accent' :
              prop.dealScore >= 40 ? 'bg-crm-warning/10 text-crm-warning' :
              'bg-muted text-muted-foreground'
            }`}>
              {prop.dealScore}
            </div>
          </div>
          <p className="crm-page-subtitle flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {prop.city}, {prop.state} {prop.zip} · {prop.county} County
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => toast.info('Skip trace placeholder')}>
            <Phone className="w-4 h-4 mr-1" /> Skip Trace
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.info('Add to campaign placeholder')}>
            <Send className="w-4 h-4 mr-1" /> Campaign
          </Button>
          <Button size="sm" onClick={() => toast.info('Generate offer placeholder')}>
            <FileText className="w-4 h-4 mr-1" /> Make Offer
          </Button>
        </div>
      </div>

      {/* Distress Signal Strip */}
      {activeSignals.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeSignals.map(([key]) => (
            <Badge key={key} className="bg-destructive/10 text-destructive border-destructive/20">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {key.replace(/^is|^has/, '').replace(/([A-Z])/g, ' $1').trim()}
            </Badge>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="owner">Owner</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="comps">Comps & Value</TabsTrigger>
          <TabsTrigger value="distress">Distress Signals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="crm-stat-card">
              <div className="text-xs text-muted-foreground">Estimated Value</div>
              <div className="text-2xl font-bold text-foreground">${prop.financials.currentValue.toLocaleString()}</div>
            </Card>
            <Card className="crm-stat-card">
              <div className="text-xs text-muted-foreground">Equity</div>
              <div className="text-2xl font-bold text-accent">{prop.financials.equityPercent}%</div>
              <div className="text-xs text-muted-foreground">${prop.financials.estimatedEquity.toLocaleString()}</div>
            </Card>
            <Card className="crm-stat-card">
              <div className="text-xs text-muted-foreground">ARV</div>
              <div className="text-2xl font-bold text-foreground">${prop.market.arv.toLocaleString()}</div>
            </Card>
            <Card className="crm-stat-card">
              <div className="text-xs text-muted-foreground">Distress Signals</div>
              <div className="text-2xl font-bold text-destructive">{activeSignals.length}</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" /> Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ['Type', prop.propertyType],
                  ['Beds / Baths', `${prop.beds} / ${prop.baths}`],
                  ['Sqft', prop.sqft.toLocaleString()],
                  ['Lot Size', `${prop.lotSqft.toLocaleString()} sqft`],
                  ['Year Built', prop.yearBuilt],
                  ['Zoning', prop.zoning],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Owner Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ['Name', prop.owner.name],
                  ['Type', prop.owner.type],
                  ['Mailing Address', prop.owner.mailingAddress],
                  ['Years Owned', `${prop.owner.ownershipYears} years`],
                  ['Absentee', prop.owner.isAbsentee ? 'Yes' : 'No'],
                  ['Out-of-State', prop.owner.isOutOfState ? 'Yes' : 'No'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Owner Tab */}
        <TabsContent value="owner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone Numbers
                  </h4>
                  {prop.owner.phones.map(p => (
                    <div key={p.number} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <span className="text-sm font-medium text-foreground">{p.number}</span>
                        <Badge variant="secondary" className="ml-2 text-[10px]">{p.type}</Badge>
                      </div>
                      <Badge variant="outline" className={p.confidence >= 80 ? 'text-accent' : 'text-muted-foreground'}>
                        {p.confidence}% confidence
                      </Badge>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Addresses
                  </h4>
                  {prop.owner.emails.map(e => (
                    <div key={e.address} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-foreground">{e.address}</span>
                      <Badge variant="outline" className={e.confidence >= 80 ? 'text-accent' : 'text-muted-foreground'}>
                        {e.confidence}% confidence
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Owner Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ['Full Name', prop.owner.name],
                  ['Owner Type', prop.owner.type],
                  ['Mailing Address', prop.owner.mailingAddress],
                  ['Years of Ownership', `${prop.owner.ownershipYears} years`],
                  ['Absentee Owner', prop.owner.isAbsentee ? 'Yes' : 'No'],
                  ['Out-of-State Owner', prop.owner.isOutOfState ? 'Yes' : 'No'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="crm-stat-card">
              <div className="text-xs text-muted-foreground">Current Value</div>
              <div className="text-2xl font-bold text-foreground">${prop.financials.currentValue.toLocaleString()}</div>
            </Card>
            <Card className="crm-stat-card">
              <div className="text-xs text-muted-foreground">Mortgage Balance</div>
              <div className="text-2xl font-bold text-foreground">${prop.financials.mortgageBalance.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{prop.financials.mortgageLender} · {prop.financials.mortgageRate}%</div>
            </Card>
            <Card className="crm-stat-card">
              <div className="text-xs text-muted-foreground">Estimated Equity</div>
              <div className="text-2xl font-bold text-accent">${prop.financials.estimatedEquity.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{prop.financials.equityPercent}% of value</div>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" /> Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ['Purchase Date', new Date(prop.financials.purchaseDate).toLocaleDateString()],
                ['Purchase Price', `$${prop.financials.purchasePrice.toLocaleString()}`],
                ['Mortgage Lender', prop.financials.mortgageLender],
                ['Interest Rate', `${prop.financials.mortgageRate}%`],
                ['Mortgage Term', `${prop.financials.mortgageTerm} years`],
                ['Tax Assessed Value', `$${prop.financials.taxAssessedValue.toLocaleString()}`],
                ['Annual Taxes', `$${prop.financials.annualTaxes.toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comps Tab */}
        <TabsContent value="comps">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card className="crm-stat-card">
              <div className="text-xs text-muted-foreground">ARV (After Repair Value)</div>
              <div className="text-2xl font-bold text-foreground">${prop.market.arv.toLocaleString()}</div>
            </Card>
            <Card className="crm-stat-card">
              <div className="text-xs text-muted-foreground">Estimated Rental Value</div>
              <div className="text-2xl font-bold text-foreground">${prop.market.rentalValue.toLocaleString()}/mo</div>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparable Sales (Last 6 Months, 0.5mi)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Sold Date</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Beds/Baths</TableHead>
                    <TableHead className="text-right">Sqft</TableHead>
                    <TableHead className="text-right">$/Sqft</TableHead>
                    <TableHead className="text-right">Distance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prop.comps.map(c => (
                    <TableRow key={c.address}>
                      <TableCell className="font-medium text-foreground">{c.address}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(c.soldDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">${c.soldPrice.toLocaleString()}</TableCell>
                      <TableCell>{c.beds}/{c.baths}</TableCell>
                      <TableCell className="text-right">{c.sqft.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${Math.round(c.soldPrice / c.sqft)}</TableCell>
                      <TableCell className="text-right">{c.distance} mi</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distress Tab */}
        <TabsContent value="distress">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" /> Distress Signal Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <DistressIcon active={prop.distressSignals.isPreForeclosure} label="Pre-Foreclosure" />
                <DistressIcon active={prop.distressSignals.isVacant} label="Vacant" />
                <DistressIcon active={prop.distressSignals.taxDelinquent} label="Tax Delinquent" />
                <DistressIcon active={prop.distressSignals.hasCodeViolations} label={`Code Violations (${prop.distressSignals.codeViolationCount})`} />
                <DistressIcon active={prop.distressSignals.isProbate} label="Probate" />
                <DistressIcon active={prop.distressSignals.isDivorce} label="Divorce" />
                <DistressIcon active={prop.distressSignals.isHighEquity} label="High Equity (70%+)" />
                <DistressIcon active={prop.distressSignals.isTiredLandlord} label="Tired Landlord" />
                <DistressIcon active={prop.owner.isAbsentee} label="Absentee Owner" />
                <DistressIcon active={prop.owner.isOutOfState} label="Out-of-State Owner" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
