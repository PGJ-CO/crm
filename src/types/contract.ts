export interface CompanyInfo {
  name: string;
  contactName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  tin: string;
  taxClassification: string;
  licenseNumber?: string;
  entityType?: string;
  signatoryTitle?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface ContractData {
  owner: CompanyInfo;
  contractor: CompanyInfo;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  projectName: string;
  projectDescription: string;
  startDate: string;
  estimatedCompletionDate: string;
  finalCompletionDays: number;
  lineItems: LineItem[];
  paymentSchedule: string;
  retainagePercent: number;
  billingDay: number;
  netPaymentDays: number;
  liquidatedDamagesPerDay: number;
  workHours: string;
  changeOrderProcess: string;
  overheadMarkupPercent: number;
  profitMarkupPercent: number;
  terminationNoticeDays: number;
  convenienceTerminationNoticeDays: number;
  warrantyPeriodMonths: number;
  disputeResolution: string;
  governingState: string;
  venueCounty: string;
}

/** A single contractor entry in the batch workflow */
export interface BatchContractorEntry {
  id: string;
  contractor: CompanyInfo;
  lineItems: LineItem[];
  scopeOfWork: string;
  timeline: string;
  startDate: string;
  estimatedCompletionDate: string;
  extractionStatus: "idle" | "loading" | "done" | "error";
}

/** Shared data entered once for all contractors */
export interface SharedContractData {
  owner: CompanyInfo;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  projectName: string;
  finalCompletionDays: number;
  paymentSchedule: string;
  retainagePercent: number;
  billingDay: number;
  netPaymentDays: number;
  liquidatedDamagesPerDay: number;
  workHours: string;
  changeOrderProcess: string;
  overheadMarkupPercent: number;
  profitMarkupPercent: number;
  terminationNoticeDays: number;
  convenienceTerminationNoticeDays: number;
  warrantyPeriodMonths: number;
  disputeResolution: string;
  governingState: string;
  venueCounty: string;
}

export const defaultCompanyInfo: CompanyInfo = {
  name: "",
  contactName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
  tin: "",
  taxClassification: "",
  entityType: "",
  signatoryTitle: "Member",
};

export const defaultSharedData: SharedContractData = {
  owner: { ...defaultCompanyInfo },
  propertyAddress: "",
  propertyCity: "",
  propertyState: "",
  propertyZip: "",
  projectName: "",
  finalCompletionDays: 30,
  paymentSchedule: "progress",
  retainagePercent: 10,
  billingDay: 1,
  netPaymentDays: 10,
  liquidatedDamagesPerDay: 250,
  workHours: "7:00 AM – 6:00 PM, Monday through Friday",
  changeOrderProcess: "written",
  overheadMarkupPercent: 10,
  profitMarkupPercent: 10,
  terminationNoticeDays: 14,
  convenienceTerminationNoticeDays: 14,
  warrantyPeriodMonths: 12,
  disputeResolution: "mediation",
  governingState: "",
  venueCounty: "",
};

export function createEmptyBatchEntry(): BatchContractorEntry {
  return {
    id: crypto.randomUUID(),
    contractor: { ...defaultCompanyInfo, licenseNumber: "" },
    lineItems: [],
    scopeOfWork: "",
    timeline: "",
    startDate: "",
    estimatedCompletionDate: "",
    extractionStatus: "idle",
  };
}

/** Merge shared data + batch entry into a full ContractData */
export function mergeToContractData(
  shared: SharedContractData,
  entry: BatchContractorEntry
): ContractData {
  return {
    owner: shared.owner,
    contractor: entry.contractor,
    propertyAddress: shared.propertyAddress,
    propertyCity: shared.propertyCity,
    propertyState: shared.propertyState,
    propertyZip: shared.propertyZip,
    projectName: shared.projectName,
    projectDescription: entry.scopeOfWork,
    startDate: entry.startDate || "",
    estimatedCompletionDate: entry.estimatedCompletionDate || "",
    finalCompletionDays: shared.finalCompletionDays,
    lineItems: entry.lineItems,
    paymentSchedule: shared.paymentSchedule,
    retainagePercent: shared.retainagePercent,
    billingDay: shared.billingDay,
    netPaymentDays: shared.netPaymentDays,
    liquidatedDamagesPerDay: shared.liquidatedDamagesPerDay,
    workHours: shared.workHours,
    changeOrderProcess: shared.changeOrderProcess,
    overheadMarkupPercent: shared.overheadMarkupPercent,
    profitMarkupPercent: shared.profitMarkupPercent,
    terminationNoticeDays: shared.terminationNoticeDays,
    convenienceTerminationNoticeDays: shared.convenienceTerminationNoticeDays,
    warrantyPeriodMonths: shared.warrantyPeriodMonths,
    disputeResolution: shared.disputeResolution,
    governingState: shared.governingState,
    venueCounty: shared.venueCounty,
  };
}

export const defaultContractData: ContractData = {
  owner: { ...defaultCompanyInfo },
  contractor: { ...defaultCompanyInfo, licenseNumber: "" },
  propertyAddress: "",
  propertyCity: "",
  propertyState: "",
  propertyZip: "",
  projectName: "",
  projectDescription: "",
  startDate: "",
  estimatedCompletionDate: "",
  finalCompletionDays: 30,
  lineItems: [],
  paymentSchedule: "progress",
  retainagePercent: 10,
  billingDay: 1,
  netPaymentDays: 10,
  liquidatedDamagesPerDay: 250,
  workHours: "7:00 AM – 6:00 PM, Monday through Friday",
  changeOrderProcess: "written",
  overheadMarkupPercent: 10,
  profitMarkupPercent: 10,
  terminationNoticeDays: 14,
  convenienceTerminationNoticeDays: 14,
  warrantyPeriodMonths: 12,
  disputeResolution: "mediation",
  governingState: "",
  venueCounty: "",
};
