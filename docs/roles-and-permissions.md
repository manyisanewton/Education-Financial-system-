# Roles and permissions

The Roles & Permissions screen is backed by PostgreSQL. It no longer stores role changes in browser local storage.

## API endpoints

- `GET /api/v1/roles` lists the current school's roles and member counts.
- `POST /api/v1/roles` creates a custom role.
- `PATCH /api/v1/roles/:roleId` updates a role and atomically replaces its grants.

Every endpoint requires the authenticated user to have `team.manage`. Requests are always scoped to the school ID obtained from the authenticated session; clients cannot provide or override a school ID.

## Permission levels

- **None** removes all grants for the module.
- **View** grants read access.
- **Manage** includes View and grants operational actions.
- **Approve** includes Manage and grants sensitive approval or reversal actions where the module supports them.

Permission updates are transactional. The previous and new permission matrices, actor, request ID, and IP address are written to the audit log. System roles can be edited but cannot be renamed. Duplicate role names within one school are rejected.

Frontend route visibility is a convenience only. The API permission guard remains the authoritative enforcement layer.

## Module visibility

The frontend uses the same permission codes for both sidebar visibility and route access:

| Module | Required permission |
| --- | --- |
| Dashboard | `dashboard.view` |
| Students | `students.view` |
| Fee structures | `fees.view` |
| Payments | `payments.view` |
| Expenses | `expenses.view` |
| Budgets | `budgets.view` |
| Reports | `reports.view` |
| Audit log | `audit.view` |
| Team & roles | `team.manage` |
| School settings | `settings.manage` |

Selecting **None** removes the module from the user's sidebar. Opening its URL directly redirects the user to their first permitted module. If no modules are assigned, the user sees a restricted-access message. The active user's permission snapshot is refreshed immediately after a role is saved.
