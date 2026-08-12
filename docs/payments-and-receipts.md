# Phase 5 — Payments and receipts

Phase 5 replaces frontend payment mock data with the PostgreSQL-backed payment ledger.

## Capabilities

- Payment capture with automatic oldest-invoice-first allocation or explicit API allocations.
- Atomic, school-specific receipt numbering using the configured receipt prefix.
- Audited reversals that restore invoice and student balances.
- Reconciliation with matched, missing-payment, and amount-mismatch outcomes.
- Printable receipts and structured receipt API data.
- Database duplicate constraints and idempotency keys for safe retries.

## API routes

| Method | Route | Permission | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/payments` | `payments.view` | Payment register and search |
| `POST` | `/api/v1/payments` | `payments.manage` | Capture and allocate a payment |
| `GET` | `/api/v1/payments/:id/receipt` | `payments.view` | Retrieve receipt data |
| `POST` | `/api/v1/payments/:id/reverse` | `payments.manage` | Reverse a completed payment |
| `GET` | `/api/v1/reconciliations` | `payments.view` | Recent reconciliation runs |
| `POST` | `/api/v1/reconciliations` | `payments.manage` | Match statement entries |

Every capture and reversal requires a unique `idempotencyKey`. Repeating the same key returns the original result and creates no duplicate transaction.

When allocations are omitted, the backend allocates the full amount across the student's oldest active invoices. Payments exceeding available invoice balances are rejected. The reconciliation dialog accepts one statement entry per line as `REFERENCE, AMOUNT`.
