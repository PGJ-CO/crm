import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Owner, Property, Lead, Task, Campaign, Buyer, Communication, CRMUser, LeadStage } from '@/types/crm';
import { seedOwners, seedProperties, seedLeads, seedTasks, seedCampaigns, seedBuyers, seedCommunications, seedUsers } from '@/data/seed';

interface CRMState {
  owners: Owner[];
  properties: Property[];
  leads: Lead[];
  tasks: Task[];
  campaigns: Campaign[];
  buyers: Buyer[];
  communications: Communication[];
  users: CRMUser[];
  currentUser: CRMUser;
}

interface CRMActions {
  updateLeadStage: (leadId: string, stage: LeadStage) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  addLead: (lead: Lead) => void;
  addTask: (task: Task) => void;
  addOwner: (owner: Owner) => void;
  addProperty: (property: Property) => void;
  getOwner: (id: string) => Owner | undefined;
  getProperty: (id: string) => Property | undefined;
  getLead: (id: string) => Lead | undefined;
}

const CRMContext = createContext<(CRMState & CRMActions) | null>(null);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [owners, setOwners] = useState<Owner[]>(seedOwners);
  const [properties, setProperties] = useState<Property[]>(seedProperties);
  const [leads, setLeads] = useState<Lead[]>(seedLeads);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [campaigns] = useState<Campaign[]>(seedCampaigns);
  const [buyers] = useState<Buyer[]>(seedBuyers);
  const [communications] = useState<Communication[]>(seedCommunications);
  const [users] = useState<CRMUser[]>(seedUsers);
  const [currentUser] = useState<CRMUser>(seedUsers[0]);

  const updateLeadStage = useCallback((leadId: string, stage: LeadStage) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage, lastTouch: new Date().toISOString().split('T')[0] } : l));
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  }, []);

  const addLead = useCallback((lead: Lead) => setLeads(prev => [lead, ...prev]), []);
  const addTask = useCallback((task: Task) => setTasks(prev => [task, ...prev]), []);
  const addOwner = useCallback((owner: Owner) => setOwners(prev => [owner, ...prev]), []);
  const addProperty = useCallback((property: Property) => setProperties(prev => [property, ...prev]), []);

  const getOwner = useCallback((id: string) => owners.find(o => o.id === id), [owners]);
  const getProperty = useCallback((id: string) => properties.find(p => p.id === id), [properties]);
  const getLead = useCallback((id: string) => leads.find(l => l.id === id), [leads]);

  return (
    <CRMContext.Provider value={{
      owners, properties, leads, tasks, campaigns, buyers, communications, users, currentUser,
      updateLeadStage, updateTaskStatus, addLead, addTask, addOwner, addProperty, getOwner, getProperty, getLead,
    }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM must be used within CRMProvider');
  return ctx;
}
