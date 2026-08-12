# Phase 6 — Expenses and budgets

Phase 6 replaces browser-local expense and budget records with PostgreSQL-backed workflows.

## Expense workflow

- Vendors and categories are school-scoped master records.
- Creating an expense reuses or creates its vendor and category.
- Requests belong to the active term and retain the requester identity.
- Document metadata is attached with a storage key for a production object-storage adapter.
- Only pending requests can be approved or rejected.
- Decisions retain the approver, note, timestamp, request ID, and audit event.

## Budget workflow

- Budgets contain unique category allocations for a term.
- Draft and pending budgets can be edited; approved and archived budgets are immutable.
- Only pending budgets can be approved or rejected.
- Approval archives the previous approved budget for the same term.
- Budget-versus-actual includes approved expenses only, grouped by term and category.

## Routes

| Method | Route | Permission |
| --- | --- | --- |
| `GET/POST` | `/api/v1/vendors` | `expenses.view` / `expenses.create` |
| `GET/POST` | `/api/v1/expense-categories` | `expenses.view` / `expenses.create` |
| `GET/POST` | `/api/v1/expenses` | `expenses.view` / `expenses.create` |
| `POST` | `/api/v1/expenses/:id/review` | `expenses.approve` |
| `GET` | `/api/v1/budgets` | `budgets.view` |
| `POST/PATCH` | `/api/v1/budgets` | `budgets.manage` |
| `POST` | `/api/v1/budgets/:id/review` | `budgets.approve` |
