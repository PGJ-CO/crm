export type UserRole = 'admin' | 'acquisitions' | 'dispositions' | 'va';

export type LeadStage =
  | 'new'
  | 'contacted'
  | 'warm'
  | 'appointment_set'
  | 'offer_sent'
  | 'negotiation'
  | 'under_contract'
  | 'closed_won'
  | 'dead_dnc';

export const LEAD_STAGES: { key: LeadStage; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'bg-stage-new' },
  { key: 'contacted', label: 'Contacted', color: 'bg-stage-contacted' },
  { key: 'warm', label: 'Warm', color: 'bg-stage-warm' },
  { key: 'appointment_set', label: 'Appt Set', color: 'bg-stage-appointment' },
  { key: 'offer_sent', label: 'Offer Sent', color: 'bg-stage-offer' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-stage-negotiation' },
  { key: 'under_contract', label: 'Under Contract', color: 'bg-stage-contract' },
  { key: 'closed_won', label: 'Closed Won', color: 'bg-stage-closed' },
  { key: 'dead_dnc', label: 'Dead/DNC', color: 'bg-stage-dead' },
];

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  phones: string[];
  emails: string[];
  mailingAddress: string;
  notes: string;
  consentSms: boolean;
  consentEmail: boolean;
  consentPhone: boolean;
  isDnc: boolean;
  createdAt: string;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  unitCount: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  occupancy: 'occupied' | 'vacant' | 'unknown';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'distressed';
  photos: string[];
  ownerId: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  ownerId: string;
  propertyId: string;
  source: string;
  stage: LeadStage;
  tags: string[];
  motivationScore: number;
  lastTouch: string;
  nextAction: string;
  assignedUserId: string;
  campaignId?: string;
  notes: string;
  createdAt: string;
}

export interface Communication {
  id: string;
  leadId: string;
  channel: 'sms' | 'email' | 'phone';
  direction: 'inbound' | 'outbound';
  content: string;
  summary?: string;
  optedOut: boolean;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  channels: ('sms' | 'email' | 'phone')[];
  schedule: { day: number; channel: 'sms' | 'email' | 'phone'; template: string }[];
  status: 'active' | 'paused' | 'draft';
  goal: string;
  leadsEnrolled: number;
  createdAt: string;
}

export interface Task {
  id: string;
  leadId?: string;
  title: string;
  dueDate: string;
  assignedUserId: string;
  status: 'pending' | 'completed' | 'snoozed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface Appointment {
  id: string;
  leadId: string;
  dateTime: string;
  type: 'virtual' | 'in_person';
  outcome?: 'completed' | 'no_show' | 'rescheduled' | 'cancelled';
  notes: string;
}

export interface Offer {
  id: string;
  leadId: string;
  mao: number;
  offerPrice: number;
  terms: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'countered';
  createdAt: string;
}

export interface Deal {
  id: string;
  leadId: string;
  offerId: string;
  closeDate: string;
  assignmentFee: number;
  status: 'pending' | 'closed' | 'fell_through';
}

export interface Buyer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  criteria: string;
  areas: string[];
  priceMin: number;
  priceMax: number;
  propertyTypes: string[];
  lastActive: string;
  rating: 'a' | 'b' | 'c';
  notes: string;
}

export interface CRMUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
