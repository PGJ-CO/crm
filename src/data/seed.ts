import type { Owner, Property, Lead, Task, Campaign, Buyer, Communication, CRMUser } from '@/types/crm';

export const seedUsers: CRMUser[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@company.com', role: 'admin' },
  { id: 'u2', name: 'Jordan Lee', email: 'jordan@company.com', role: 'acquisitions' },
  { id: 'u3', name: 'Sam Chen', email: 'sam@company.com', role: 'dispositions' },
  { id: 'u4', name: 'Maria Santos', email: 'maria@company.com', role: 'va' },
];

export const seedOwners: Owner[] = [
  { id: 'o1', firstName: 'Robert', lastName: 'Johnson', phones: ['(555) 123-4567'], emails: ['rjohnson@email.com'], mailingAddress: '123 Oak St, Dallas, TX 75201', notes: 'Inherited property, lives out of state', consentSms: true, consentEmail: true, consentPhone: true, isDnc: false, createdAt: '2025-01-15' },
  { id: 'o2', firstName: 'Maria', lastName: 'Garcia', phones: ['(555) 234-5678'], emails: ['mgarcia@email.com'], mailingAddress: '456 Elm Ave, Houston, TX 77001', notes: 'Behind on taxes, motivated', consentSms: true, consentEmail: true, consentPhone: false, isDnc: false, createdAt: '2025-01-18' },
  { id: 'o3', firstName: 'James', lastName: 'Williams', phones: ['(555) 345-6789'], emails: ['jwilliams@email.com'], mailingAddress: '789 Pine Rd, San Antonio, TX 78201', notes: 'Relocating for work', consentSms: true, consentEmail: true, consentPhone: true, isDnc: false, createdAt: '2025-02-01' },
  { id: 'o4', firstName: 'Patricia', lastName: 'Brown', phones: ['(555) 456-7890', '(555) 456-7891'], emails: ['pbrown@email.com'], mailingAddress: '321 Cedar Ln, Austin, TX 73301', notes: 'Divorce situation, wants quick close', consentSms: true, consentEmail: true, consentPhone: true, isDnc: false, createdAt: '2025-02-05' },
  { id: 'o5', firstName: 'David', lastName: 'Miller', phones: ['(555) 567-8901'], emails: ['dmiller@email.com'], mailingAddress: '654 Birch Dr, Fort Worth, TX 76101', notes: 'Vacant property, tired landlord', consentSms: false, consentEmail: true, consentPhone: true, isDnc: false, createdAt: '2025-02-10' },
  { id: 'o6', firstName: 'Linda', lastName: 'Davis', phones: ['(555) 678-9012'], emails: ['ldavis@email.com'], mailingAddress: '987 Maple Ct, Plano, TX 75023', notes: 'Probate property', consentSms: true, consentEmail: true, consentPhone: true, isDnc: false, createdAt: '2025-02-15' },
  { id: 'o7', firstName: 'Michael', lastName: 'Wilson', phones: ['(555) 789-0123'], emails: [], mailingAddress: '147 Walnut St, Arlington, TX 76001', notes: 'Do not contact - hostile', consentSms: false, consentEmail: false, consentPhone: false, isDnc: true, createdAt: '2025-02-20' },
  { id: 'o8', firstName: 'Susan', lastName: 'Taylor', phones: ['(555) 890-1234'], emails: ['staylor@email.com'], mailingAddress: '258 Ash Blvd, Irving, TX 75014', notes: 'Pre-foreclosure, needs help fast', consentSms: true, consentEmail: true, consentPhone: true, isDnc: false, createdAt: '2025-02-25' },
  { id: 'o9', firstName: 'Thomas', lastName: 'Anderson', phones: ['(555) 901-2345'], emails: ['tanderson@email.com'], mailingAddress: '369 Spruce Way, Frisco, TX 75034', notes: 'Has multiple properties', consentSms: true, consentEmail: true, consentPhone: true, isDnc: false, createdAt: '2025-03-01' },
  { id: 'o10', firstName: 'Karen', lastName: 'Martinez', phones: ['(555) 012-3456'], emails: ['kmartinez@email.com'], mailingAddress: '480 Poplar Ave, McKinney, TX 75069', notes: 'Referral from o1', consentSms: true, consentEmail: true, consentPhone: true, isDnc: false, createdAt: '2025-03-05' },
];

export const seedProperties: Property[] = [
  { id: 'p1', address: '1420 Commerce St', city: 'Dallas', state: 'TX', zip: '75201', unitCount: 1, beds: 3, baths: 2, sqft: 1450, yearBuilt: 1985, occupancy: 'vacant', condition: 'fair', photos: [], ownerId: 'o1', createdAt: '2025-01-15' },
  { id: 'p2', address: '8800 Westheimer Rd', city: 'Houston', state: 'TX', zip: '77001', unitCount: 2, beds: 4, baths: 2, sqft: 2100, yearBuilt: 1972, occupancy: 'occupied', condition: 'poor', photos: [], ownerId: 'o2', createdAt: '2025-01-18' },
  { id: 'p3', address: '5600 Fredericksburg Rd', city: 'San Antonio', state: 'TX', zip: '78201', unitCount: 1, beds: 3, baths: 1, sqft: 1200, yearBuilt: 1990, occupancy: 'vacant', condition: 'good', photos: [], ownerId: 'o3', createdAt: '2025-02-01' },
  { id: 'p4', address: '2300 S Lamar Blvd', city: 'Austin', state: 'TX', zip: '73301', unitCount: 1, beds: 4, baths: 3, sqft: 2400, yearBuilt: 2001, occupancy: 'occupied', condition: 'good', photos: [], ownerId: 'o4', createdAt: '2025-02-05' },
  { id: 'p5', address: '4100 Camp Bowie Blvd', city: 'Fort Worth', state: 'TX', zip: '76101', unitCount: 3, beds: 2, baths: 1, sqft: 900, yearBuilt: 1965, occupancy: 'vacant', condition: 'distressed', photos: [], ownerId: 'o5', createdAt: '2025-02-10' },
  { id: 'p6', address: '1900 Preston Rd', city: 'Plano', state: 'TX', zip: '75023', unitCount: 1, beds: 3, baths: 2, sqft: 1600, yearBuilt: 1978, occupancy: 'vacant', condition: 'fair', photos: [], ownerId: 'o6', createdAt: '2025-02-15' },
  { id: 'p7', address: '750 N Collins St', city: 'Arlington', state: 'TX', zip: '76001', unitCount: 1, beds: 2, baths: 1, sqft: 1050, yearBuilt: 1982, occupancy: 'unknown', condition: 'poor', photos: [], ownerId: 'o7', createdAt: '2025-02-20' },
  { id: 'p8', address: '300 E Las Colinas Blvd', city: 'Irving', state: 'TX', zip: '75014', unitCount: 1, beds: 3, baths: 2, sqft: 1550, yearBuilt: 1995, occupancy: 'occupied', condition: 'fair', photos: [], ownerId: 'o8', createdAt: '2025-02-25' },
  { id: 'p9', address: '6200 Main St', city: 'Frisco', state: 'TX', zip: '75034', unitCount: 4, beds: 2, baths: 1, sqft: 800, yearBuilt: 1970, occupancy: 'occupied', condition: 'poor', photos: [], ownerId: 'o9', createdAt: '2025-03-01' },
  { id: 'p10', address: '1100 Eldorado Pkwy', city: 'McKinney', state: 'TX', zip: '75069', unitCount: 1, beds: 4, baths: 2, sqft: 1900, yearBuilt: 2005, occupancy: 'vacant', condition: 'good', photos: [], ownerId: 'o10', createdAt: '2025-03-05' },
];

export const seedLeads: Lead[] = [
  { id: 'l1', ownerId: 'o1', propertyId: 'p1', source: 'Direct Mail', stage: 'warm', tags: ['inherited', 'absentee'], motivationScore: 75, lastTouch: '2025-03-06', nextAction: 'Schedule walkthrough', assignedUserId: 'u2', notes: 'Owner interested, wants to see offer', createdAt: '2025-01-15' },
  { id: 'l2', ownerId: 'o2', propertyId: 'p2', source: 'Cold Text', stage: 'appointment_set', tags: ['tax-lien', 'motivated'], motivationScore: 90, lastTouch: '2025-03-07', nextAction: 'Appointment 3/10 2pm', assignedUserId: 'u2', campaignId: 'c1', notes: 'Very motivated, behind on taxes 2 years', createdAt: '2025-01-18' },
  { id: 'l3', ownerId: 'o3', propertyId: 'p3', source: 'PPC', stage: 'contacted', tags: ['relocating'], motivationScore: 55, lastTouch: '2025-03-05', nextAction: 'Follow up call', assignedUserId: 'u2', notes: 'Moving in 60 days', createdAt: '2025-02-01' },
  { id: 'l4', ownerId: 'o4', propertyId: 'p4', source: 'Referral', stage: 'offer_sent', tags: ['divorce', 'equity'], motivationScore: 85, lastTouch: '2025-03-07', nextAction: 'Wait for response', assignedUserId: 'u2', notes: 'Sent offer at $285k, waiting on response', createdAt: '2025-02-05' },
  { id: 'l5', ownerId: 'o5', propertyId: 'p5', source: 'Driving for Dollars', stage: 'new', tags: ['vacant', 'tired-landlord'], motivationScore: 40, lastTouch: '2025-03-01', nextAction: 'Initial outreach', assignedUserId: 'u4', notes: 'Distressed multi-family', createdAt: '2025-02-10' },
  { id: 'l6', ownerId: 'o6', propertyId: 'p6', source: 'Direct Mail', stage: 'warm', tags: ['probate'], motivationScore: 70, lastTouch: '2025-03-06', nextAction: 'Send comps', assignedUserId: 'u2', notes: 'Probate just completed, ready to sell', createdAt: '2025-02-15' },
  { id: 'l7', ownerId: 'o7', propertyId: 'p7', source: 'Cold Text', stage: 'dead_dnc', tags: ['dnc'], motivationScore: 0, lastTouch: '2025-02-20', nextAction: 'None - DNC', assignedUserId: 'u4', notes: 'Hostile response, added to DNC', createdAt: '2025-02-20' },
  { id: 'l8', ownerId: 'o8', propertyId: 'p8', source: 'PPC', stage: 'negotiation', tags: ['pre-foreclosure', 'urgent'], motivationScore: 95, lastTouch: '2025-03-07', nextAction: 'Counter offer', assignedUserId: 'u2', notes: 'Foreclosure in 30 days, very motivated', createdAt: '2025-02-25' },
  { id: 'l9', ownerId: 'o9', propertyId: 'p9', source: 'Referral', stage: 'contacted', tags: ['multi-family', 'portfolio'], motivationScore: 50, lastTouch: '2025-03-04', nextAction: 'Send info packet', assignedUserId: 'u4', notes: 'Has 3 more properties to sell', createdAt: '2025-03-01' },
  { id: 'l10', ownerId: 'o10', propertyId: 'p10', source: 'Direct Mail', stage: 'new', tags: ['referral'], motivationScore: 60, lastTouch: '2025-03-05', nextAction: 'Initial call', assignedUserId: 'u2', notes: 'Referred by Robert Johnson', createdAt: '2025-03-05' },
  { id: 'l11', ownerId: 'o1', propertyId: 'p1', source: 'Cold Text', stage: 'under_contract', tags: ['inherited', 'closing-soon'], motivationScore: 80, lastTouch: '2025-03-07', nextAction: 'Coordinate with title company', assignedUserId: 'u2', notes: 'Under contract at $165k, closing 3/20', createdAt: '2025-01-20' },
  { id: 'l12', ownerId: 'o9', propertyId: 'p9', source: 'Referral', stage: 'new', tags: ['multi-family'], motivationScore: 45, lastTouch: '2025-03-02', nextAction: 'Qualify lead', assignedUserId: 'u4', notes: 'Second property from Thomas', createdAt: '2025-03-02' },
  { id: 'l13', ownerId: 'o4', propertyId: 'p4', source: 'Referral', stage: 'closed_won', tags: ['divorce', 'quick-close'], motivationScore: 95, lastTouch: '2025-03-01', nextAction: 'None - Closed', assignedUserId: 'u2', notes: 'Closed at $280k, $15k assignment fee', createdAt: '2025-01-10' },
  // Additional leads for variety
  { id: 'l14', ownerId: 'o2', propertyId: 'p2', source: 'PPC', stage: 'new', tags: ['tax-lien'], motivationScore: 65, lastTouch: '2025-03-06', nextAction: 'Send SMS', assignedUserId: 'u4', notes: 'New inbound from PPC', createdAt: '2025-03-06' },
  { id: 'l15', ownerId: 'o6', propertyId: 'p6', source: 'Direct Mail', stage: 'contacted', tags: ['probate'], motivationScore: 55, lastTouch: '2025-03-04', nextAction: 'Follow up', assignedUserId: 'u2', notes: '', createdAt: '2025-02-28' },
  { id: 'l16', ownerId: 'o8', propertyId: 'p8', source: 'Cold Text', stage: 'warm', tags: ['pre-foreclosure'], motivationScore: 80, lastTouch: '2025-03-05', nextAction: 'Present options', assignedUserId: 'u2', notes: 'Exploring options', createdAt: '2025-03-01' },
  { id: 'l17', ownerId: 'o10', propertyId: 'p10', source: 'Referral', stage: 'appointment_set', tags: ['referral'], motivationScore: 70, lastTouch: '2025-03-07', nextAction: 'Appt 3/12 10am', assignedUserId: 'u2', notes: '', createdAt: '2025-03-04' },
  { id: 'l18', ownerId: 'o3', propertyId: 'p3', source: 'PPC', stage: 'offer_sent', tags: ['relocating'], motivationScore: 60, lastTouch: '2025-03-06', nextAction: 'Follow up on offer', assignedUserId: 'u2', notes: 'Offer at $140k', createdAt: '2025-02-15' },
  { id: 'l19', ownerId: 'o5', propertyId: 'p5', source: 'Driving for Dollars', stage: 'contacted', tags: ['vacant', 'distressed'], motivationScore: 35, lastTouch: '2025-03-03', nextAction: 'Send mail piece', assignedUserId: 'u4', notes: '', createdAt: '2025-02-20' },
  { id: 'l20', ownerId: 'o9', propertyId: 'p9', source: 'Cold Text', stage: 'negotiation', tags: ['multi-family'], motivationScore: 72, lastTouch: '2025-03-07', nextAction: 'Revised offer', assignedUserId: 'u2', notes: 'Counter at $95k', createdAt: '2025-02-18' },
];

export const seedTasks: Task[] = [
  { id: 't1', leadId: 'l1', title: 'Schedule property walkthrough with Robert', dueDate: '2025-03-08', assignedUserId: 'u2', status: 'pending', priority: 'high', createdAt: '2025-03-06' },
  { id: 't2', leadId: 'l2', title: 'Prepare comps for Maria appointment', dueDate: '2025-03-09', assignedUserId: 'u2', status: 'pending', priority: 'high', createdAt: '2025-03-07' },
  { id: 't3', leadId: 'l3', title: 'Follow up call with James', dueDate: '2025-03-10', assignedUserId: 'u2', status: 'pending', priority: 'medium', createdAt: '2025-03-05' },
  { id: 't4', leadId: 'l8', title: 'Prepare counter offer for Susan', dueDate: '2025-03-08', assignedUserId: 'u2', status: 'pending', priority: 'high', createdAt: '2025-03-07' },
  { id: 't5', leadId: 'l5', title: 'Send initial outreach to David', dueDate: '2025-03-08', assignedUserId: 'u4', status: 'pending', priority: 'medium', createdAt: '2025-03-07' },
  { id: 't6', leadId: 'l6', title: 'Pull comps for Linda property', dueDate: '2025-03-09', assignedUserId: 'u2', status: 'pending', priority: 'medium', createdAt: '2025-03-06' },
  { id: 't7', leadId: 'l11', title: 'Coordinate title company for closing', dueDate: '2025-03-12', assignedUserId: 'u2', status: 'pending', priority: 'high', createdAt: '2025-03-07' },
  { id: 't8', leadId: 'l9', title: 'Send info packet to Thomas', dueDate: '2025-03-10', assignedUserId: 'u4', status: 'pending', priority: 'low', createdAt: '2025-03-04' },
  { id: 't9', title: 'Review new PPC leads', dueDate: '2025-03-07', assignedUserId: 'u2', status: 'completed', priority: 'medium', createdAt: '2025-03-06' },
  { id: 't10', title: 'Update buyer list with new contacts', dueDate: '2025-03-08', assignedUserId: 'u3', status: 'pending', priority: 'medium', createdAt: '2025-03-07' },
];

export const seedCampaigns: Campaign[] = [
  {
    id: 'c1', name: 'New Lead Drip', channels: ['sms', 'email'],
    schedule: [
      { day: 0, channel: 'sms', template: 'Hi {{first_name}}, I noticed your property at {{address}}. Are you considering selling? Reply STOP to opt out.' },
      { day: 2, channel: 'email', template: 'Subject: Quick question about {{address}}\n\nHi {{first_name}},\nI help homeowners sell quickly, as-is, with no fees. Would you be open to a conversation?' },
      { day: 5, channel: 'sms', template: 'Hi {{first_name}}, just following up on {{address}}. We buy houses as-is, close on your timeline. Any interest? Reply STOP to opt out.' },
      { day: 10, channel: 'email', template: 'Subject: Still interested in {{address}}\n\n{{first_name}}, just checking in. No pressure—we are here when you are ready.' },
      { day: 20, channel: 'sms', template: '{{first_name}}, last check-in about {{address}}. If timing isn\'t right, no worries. Reply STOP to opt out.' },
    ],
    status: 'active', goal: 'Convert new leads to warm within 20 days', leadsEnrolled: 8, createdAt: '2025-01-01',
  },
  {
    id: 'c2', name: 'Re-engagement 90 Day', channels: ['sms', 'email', 'phone'],
    schedule: [
      { day: 30, channel: 'sms', template: 'Hi {{first_name}}, checking back in on {{address}}. Anything changed? Reply STOP to opt out.' },
      { day: 60, channel: 'email', template: 'Subject: Thinking of you\n\n{{first_name}}, we\'re still interested in {{address}} whenever timing works for you.' },
      { day: 90, channel: 'phone', template: 'Call script: Re-check interest, ask about timeline changes.' },
    ],
    status: 'active', goal: 'Re-engage cold leads', leadsEnrolled: 12, createdAt: '2025-01-15',
  },
];

export const seedBuyers: Buyer[] = [
  { id: 'b1', name: 'Mike Thompson', company: 'Thompson Investments', phone: '(555) 111-2222', email: 'mike@thompsoninv.com', criteria: 'SFR, 3+ beds, needs work OK', areas: ['Dallas', 'Fort Worth'], priceMin: 80000, priceMax: 200000, propertyTypes: ['SFR'], lastActive: '2025-03-07', rating: 'a', notes: 'Cash buyer, closes in 7 days' },
  { id: 'b2', name: 'Sarah Park', company: 'Park Capital', phone: '(555) 222-3333', email: 'sarah@parkcap.com', criteria: 'Multi-family 2-4 units', areas: ['Houston', 'San Antonio'], priceMin: 100000, priceMax: 350000, propertyTypes: ['Multi-family'], lastActive: '2025-03-06', rating: 'a', notes: 'Repeat buyer, great to work with' },
  { id: 'b3', name: 'David King', company: '', phone: '(555) 333-4444', email: 'dking@email.com', criteria: 'Fix and flip, good neighborhoods', areas: ['Dallas', 'Plano', 'Frisco'], priceMin: 150000, priceMax: 300000, propertyTypes: ['SFR'], lastActive: '2025-03-01', rating: 'b', notes: 'Hard money lender, needs 14 day close' },
  { id: 'b4', name: 'Lisa Wang', company: 'Wang Properties', phone: '(555) 444-5555', email: 'lisa@wangprop.com', criteria: 'Turnkey rentals', areas: ['Austin'], priceMin: 200000, priceMax: 400000, propertyTypes: ['SFR', 'Multi-family'], lastActive: '2025-02-28', rating: 'b', notes: 'Buy and hold investor' },
  { id: 'b5', name: 'Carlos Mendez', company: 'Mendez Group', phone: '(555) 555-6666', email: 'carlos@mendezgrp.com', criteria: 'Any deal under $100k', areas: ['Fort Worth', 'Arlington', 'Irving'], priceMin: 30000, priceMax: 100000, propertyTypes: ['SFR', 'Multi-family'], lastActive: '2025-03-05', rating: 'a', notes: 'Volume buyer, wants 2-3/month' },
];

export const seedCommunications: Communication[] = [
  { id: 'cm1', leadId: 'l1', channel: 'sms', direction: 'outbound', content: 'Hi Robert, I noticed your property at 1420 Commerce St. Are you considering selling? Reply STOP to opt out.', optedOut: false, createdAt: '2025-02-15' },
  { id: 'cm2', leadId: 'l1', channel: 'sms', direction: 'inbound', content: 'Who is this? How did you get my number?', optedOut: false, createdAt: '2025-02-15' },
  { id: 'cm3', leadId: 'l1', channel: 'phone', direction: 'outbound', content: 'Called Robert, explained we buy houses as-is. He inherited the property and is open to selling. Wants to see an offer.', summary: '• Inherited property from uncle\n• Lives in California, doesn\'t want to manage\n• Open to as-is cash offer', optedOut: false, createdAt: '2025-03-01' },
  { id: 'cm4', leadId: 'l2', channel: 'sms', direction: 'outbound', content: 'Hi Maria, noticed your property on Westheimer. We help homeowners sell quickly. Any interest? Reply STOP to opt out.', optedOut: false, createdAt: '2025-01-20' },
  { id: 'cm5', leadId: 'l2', channel: 'sms', direction: 'inbound', content: 'Yes I need to sell. Behind on taxes. Can you help?', optedOut: false, createdAt: '2025-01-20' },
  { id: 'cm6', leadId: 'l8', channel: 'phone', direction: 'outbound', content: 'Called Susan about pre-foreclosure. Very motivated, foreclosure in 30 days. Needs fast close.', summary: '• Foreclosure sale date in 30 days\n• Owes $120k, property worth ~$180k\n• Wants to avoid foreclosure on record', optedOut: false, createdAt: '2025-03-05' },
];
