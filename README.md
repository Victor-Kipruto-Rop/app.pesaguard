# PesaGuard tenant dashboard

A responsive React dashboard for tenant workspaces, payment activity, and
customer profiles. The interface follows the forest-green and white-surface
PesaGuard dashboard design used by the developer portal.

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. Create a production bundle with
`npm run build`.

## Preview-only behavior

This frontend currently uses clearly labeled in-memory sample data. It does
not authenticate users, connect to a backend, enforce tenant permissions,
read or write real customer data, or initiate, refund, or settle payments.
Adding a customer or exporting a table only affects/downloads preview data in
the current browser session. Do not use this preview with production records
or payment credentials.

The overview, transactions, reconciliation, customer directory, tenant
profile, and general settings have preview screens. Reconciliation review and
matching actions only update in-memory sample data. Other payment, reporting,
import, integration, monitoring, access-management, and support destinations
are present in the sidebar; sections without an implemented integration show
an explicit not-connected preview instead of live-looking placeholder
records.

Before production use, connect the identity and tenant authorization layers,
define and validate the API contracts, and add backend integration and
accessibility tests.
