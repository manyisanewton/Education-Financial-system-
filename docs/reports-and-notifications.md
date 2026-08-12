# Phase 7 — Reports and notifications

Phase 7 provides database-backed dashboard summaries, financial intelligence, server-side exports, and durable guardian notification jobs.

## Reporting

- `GET /api/v1/dashboard/summary` returns billed fees, collections, outstanding balances, approved expenses, collection rate, overdue accounts, monthly trends, class performance, payment channels, and recent receipts.
- `GET /api/v1/reports/financial` returns the complete active-term financial dataset.
- `GET /api/v1/reports/export?format=csv|pdf&type=financial` generates downloadable files on the server.
- All calculations are school- and term-scoped. Reversed payments and unapproved expenses are excluded.

## Notification jobs

- `POST /api/v1/notifications/overdue-reminders` queues SMS and email reminders for overdue accounts.
- `POST /api/v1/students/:id/reminders` queues a reminder for one student.
- `GET /api/v1/notifications/jobs` provides the recent job register.
- Jobs persist in PostgreSQL and use `FOR UPDATE SKIP LOCKED` for safe concurrent workers.
- Daily student/channel deduplication prevents repeated reminders.
- Failed jobs use exponential retry delays and stop after the configured maximum attempts.
- Recipient values are masked in application logs.

The included delivery worker uses a development delivery sink and records provider IDs. For production, connect its delivery method to the selected email provider (SMTP, SES, SendGrid) and SMS provider (Africa's Talking, Twilio) without changing the queue or reminder APIs.

## Permissions

- Dashboard summaries: `dashboard.view`
- Financial reports: `reports.view`
- Exports and bulk reminders: `reports.export`
- Individual student reminders: `students.manage`
