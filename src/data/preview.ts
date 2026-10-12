import type { Customer, Transaction, TransactionStatus, TransactionTimelineEntry, Workspace } from "../types/dashboard";

export const workspaces: Workspace[] = [
  { id: "mwanga-retail", name: "Mwangaza Retail", category: "Retail", initials: "MR" },
  { id: "safi-logistics", name: "Safi Logistics", category: "Logistics", initials: "SL" },
  { id: "kifaru-digital", name: "Kifaru Digital", category: "Technology", initials: "KD" },
];

export const customers: Customer[] = [
  { id: "cus-2048", name: "Amina Wanjiku", email: "amina.wanjiku@example.test", phone: "Not provided", joined: "Oct 08, 2026", status: "Active", transactions: 24, lifetimeValue: 82400 },
  { id: "cus-2047", name: "Brian Otieno", email: "brian.otieno@example.test", phone: "Not provided", joined: "Oct 07, 2026", status: "Active", transactions: 18, lifetimeValue: 63200 },
  { id: "cus-2046", name: "Njeri Kamau", email: "njeri.kamau@example.test", phone: "Not provided", joined: "Oct 06, 2026", status: "Invited", transactions: 0, lifetimeValue: 0 },
  { id: "cus-2045", name: "David Mwangi", email: "david.mwangi@example.test", phone: "Not provided", joined: "Oct 04, 2026", status: "Active", transactions: 11, lifetimeValue: 48150 },
  { id: "cus-2044", name: "Wanjiru Njoroge", email: "wanjiru.njoroge@example.test", phone: "Not provided", joined: "Oct 02, 2026", status: "Inactive", transactions: 6, lifetimeValue: 27100 },
  { id: "cus-2043", name: "Kevin Kiptoo", email: "kevin.kiptoo@example.test", phone: "Not provided", joined: "Sep 29, 2026", status: "Active", transactions: 31, lifetimeValue: 118900 },
  { id: "cus-2042", name: "Zawadi Muthoni", email: "zawadi.muthoni@example.test", phone: "Not provided", joined: "Sep 26, 2026", status: "Active", transactions: 9, lifetimeValue: 35900 },
];

const transactionSamples: Array<Pick<Transaction, "customerId" | "customer" | "amount" | "status" | "anomalyType" | "severity" | "notes">> = [
  { customerId: "cus-2048", customer: "Amina Wanjiku", amount: 1200, status: "Matched", anomalyType: "none", severity: "Low", notes: "Matched against the expected ledger entry." },
  { customerId: "cus-2047", customer: "Brian Otieno", amount: 500, status: "Pending", anomalyType: "awaiting_reconciliation", severity: "Medium", notes: "Awaiting automated reconciliation." },
  { customerId: "cus-2045", customer: "David Mwangi", amount: 2000, status: "Unmatched", anomalyType: "amount_mismatch", severity: "High", notes: "Amount does not match expected ledger entry." },
  { customerId: "cus-2043", customer: "Kevin Kiptoo", amount: 750, status: "Disputed", anomalyType: "reference_mismatch", severity: "Medium", notes: "Reference requires manual review." },
  { customerId: "cus-2044", customer: "Wanjiru Njoroge", amount: 300, status: "Pending", anomalyType: "awaiting_reconciliation", severity: "Low", notes: "Awaiting automated reconciliation." },
  { customerId: "cus-2042", customer: "Zawadi Muthoni", amount: 1500, status: "Matched", anomalyType: "none", severity: "Low", notes: "Matched against the expected ledger entry." },
  { customerId: "cus-2048", customer: "Amina Wanjiku", amount: 2500, status: "Unmatched", anomalyType: "missing_ledger_entry", severity: "High", notes: "No matching entry found in the sample ledger." },
  { customerId: "cus-2047", customer: "Brian Otieno", amount: 950, status: "Pending", anomalyType: "awaiting_reconciliation", severity: "Low", notes: "Awaiting automated reconciliation." },
  { customerId: "cus-2045", customer: "David Mwangi", amount: 430, status: "Unmatched", anomalyType: "provider_timeout", severity: "Medium", notes: "Sample provider request timed out." },
  { customerId: "cus-2043", customer: "Kevin Kiptoo", amount: 1800, status: "Disputed", anomalyType: "reference_mismatch", severity: "Low", notes: "Sample record flagged for manual review." },
  { customerId: "cus-2044", customer: "Wanjiru Njoroge", amount: 680, status: "Matched", anomalyType: "none", severity: "Low", notes: "Matched against the expected ledger entry." },
  { customerId: "cus-2042", customer: "Zawadi Muthoni", amount: 3200, status: "Disputed", anomalyType: "duplicate_reference", severity: "High", notes: "A duplicate reference requires manual review." },
];

const transactionTimes = ["10:42", "10:41", "10:39", "10:38", "10:34", "10:31", "10:28", "10:24", "10:19", "10:14", "10:08", "10:02"];
const transactionAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function sampleTransactionId(index: number): string {
  let value = index + 120_482;
  let suffix = "";
  for (let digit = 0; digit < 16; digit += 1) {
    suffix = transactionAlphabet[value % transactionAlphabet.length] + suffix;
    value = Math.floor(value / transactionAlphabet.length) + index + 3;
  }
  return suffix;
}

function transactionTimeline(status: TransactionStatus, timestamp: string, notes: string): TransactionTimelineEntry[] {
  const details: TransactionTimelineEntry[] = [
    { id: "detected", label: "Detected", description: status === "Unmatched" ? "Amount mismatch detected during reconciliation." : "Transaction received in the sandbox preview.", timestamp, status: "detected" },
    { id: "assigned", label: "Assigned", description: "Assigned to the automated reconciliation engine.", timestamp: "May 15, 2025 10:41 AM", status: "assigned" },
  ];
  if (status === "Unmatched" || status === "Disputed") {
    details.push({ id: "note", label: "Note added", description: notes, timestamp: "May 15, 2025 10:42 AM", status: "note" });
  }
  return details;
}

export const transactions: Transaction[] = Array.from({ length: 152 }, (_, index) => {
  const sample = transactionSamples[index % transactionSamples.length];
  const date = `May ${15 - Math.floor(index / 48)}, 2025`;
  const hour = index < 48 ? "10" : index < 96 ? "09" : "08";
  const minute = transactionTimes[index % transactionTimes.length].slice(3);
  const time = `${hour}:${minute}`;
  const timestamp = `${date} ${time} AM`;
  const id = sampleTransactionId(index);
  const isSelectedExample = index === 2;
  const status = isSelectedExample ? "Unmatched" : sample.status;
  const anomalyType = isSelectedExample ? "amount_mismatch" : sample.anomalyType;
  const notes = isSelectedExample ? "Amount does not match expected ledger entry." : sample.notes;

  return {
    id: `txn-${index + 1}`,
    customerId: sample.customerId,
    customer: sample.customer,
    reference: id,
    accountReference: index % 5 === 0 ? undefined : `INV-${4589 - index}`,
    method: "M-Pesa Daraja",
    amount: sample.amount + ((index * 37) % 5) * 50,
    status,
    createdAt: timestamp,
    timestamp,
    source: "M-Pesa Daraja",
    anomalyType,
    discrepancyId: `disc_01JY3H6ZQ2X8V4M7P9R${index.toString().padStart(2, "0")}`,
    severity: isSelectedExample ? "High" : sample.severity,
    notes,
    resolved: status === "Matched" || status === "Completed",
    reviewed: false,
    timeline: transactionTimeline(status, timestamp, notes),
  };
});

export function previewDataFor(workspace: Workspace): { customers: Customer[]; transactions: Transaction[] } {
  if (workspace.id === workspaces[0].id) {
    return { customers, transactions };
  }

  const prefix = workspace.initials.toLowerCase();
  const workspaceCustomers = customers.map((customer, index) => ({
    ...customer,
    id: `${prefix}-${customer.id}`,
    lifetimeValue: Math.round(customer.lifetimeValue * (index % 2 === 0 ? 0.8 : 1.15)),
  }));
  const customerByOriginalId = new Map(customers.map((customer, index) => [customer.id, workspaceCustomers[index]]));
  const workspaceTransactions = transactions.map((transaction) => {
    const customer = customerByOriginalId.get(transaction.customerId);
    return {
      ...transaction,
      id: `${prefix}-${transaction.id}`,
      customerId: customer?.id ?? `${prefix}-${transaction.customerId}`,
      customer: customer?.name ?? transaction.customer,
      reference: `${workspace.initials.toUpperCase()}-${transaction.reference.slice(3)}`,
    };
  });

  return { customers: workspaceCustomers, transactions: workspaceTransactions };
}
