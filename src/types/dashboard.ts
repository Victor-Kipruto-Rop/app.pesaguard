export interface Workspace {
  id: string;
  name: string;
  category: string;
  initials: string;
}

export type CustomerStatus = "Active" | "Invited" | "Inactive";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  status: CustomerStatus;
  transactions: number;
  lifetimeValue: number;
}

export type TransactionStatus = "Matched" | "Pending" | "Unmatched" | "Disputed" | "Completed" | "Failed" | "Refunded" | "Unknown";

export interface TransactionTimelineEntry {
  id: string;
  label: string;
  description: string;
  timestamp: string;
  status: "detected" | "assigned" | "note" | "resolved";
}

export interface Transaction {
  id: string;
  customerId: string;
  customer: string;
  reference: string;
  accountReference?: string;
  method: string;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  timestamp: string;
  source: string;
  anomalyType: string;
  discrepancyId: string;
  severity: "Low" | "Medium" | "High" | "Unknown";
  notes: string;
  resolved: boolean;
  reviewed: boolean;
  timeline: TransactionTimelineEntry[];
}
