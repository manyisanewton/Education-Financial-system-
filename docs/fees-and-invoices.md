# Fees and invoices

Phase Four makes PostgreSQL the source of truth for fee structures, class assignments, invoices, credits, adjustments, and student statements.

## Fee structures and assignments

- `GET /api/v1/fee-structures`
- `POST /api/v1/fee-structures`
- `PATCH /api/v1/fee-structures/:id`

A structure belongs to one school and academic term, contains one or more positive fee items, and is assigned to one or more classes. Draft and active structures can be edited. Archived structures are immutable.

## Batch invoice generation

- `POST /api/v1/fee-structures/:id/generate-invoices`
- `GET /api/v1/invoice-batches`

Only active structures can generate invoices. The backend selects active students enrolled in assigned classes for the structure's term. Every invoice copies the current fee items, preserving the issued amount if the structure changes later.

Generation requires an `idempotencyKey`. Repeating the same key in one school returns the existing batch and does not create duplicate invoices.

## Invoices and states

- `GET /api/v1/invoices`
- `PATCH /api/v1/invoices/:id/state`

Supported controlled transitions are:

- Draft → Active or Voided
- Active → Archived or Voided

Archived and voided invoices are terminal. An invoice with a completed payment or active credit note cannot be voided.

## Credits and adjustments

- `POST /api/v1/invoices/:id/credit-notes`
- `POST /api/v1/invoices/:id/adjustments`

Credit notes and adjustments are separate immutable ledger records. They never overwrite original invoice items. Credit amounts cannot exceed the remaining adjusted invoice value.

## Student statements

- `GET /api/v1/students/:id/statement`

The statement combines invoices and debit adjustments as debits, and payments, credit notes, and credit adjustments as credits. It returns a chronological running balance and debit/credit totals.

## Authorization and auditing

- Fee and invoice reads require `fees.view`.
- Structure, state, credit, and adjustment writes require `fees.manage`.
- Batch generation requires `invoices.generate`.
- Every mutation is tenant-scoped, transactional, and written to the audit log with actor, IP, and request ID.
