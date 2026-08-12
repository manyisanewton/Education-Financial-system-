# Academic records

Phase Three makes PostgreSQL the source of truth for students and academic records. The frontend no longer reads or writes student records in browser local storage.

## Endpoints

### Students

- `GET /api/v1/students?page=1&pageSize=20&search=&classId=&termId=&status=`
- `GET /api/v1/students/:studentId`
- `POST /api/v1/students`
- `PATCH /api/v1/students/:studentId`

Search matches student names, admission numbers, guardian names, and guardian phones. `pageSize` is limited to 100. Student creation atomically creates or links the guardian and creates the term enrolment.

### Guardians

- `GET /api/v1/guardians?page=1&pageSize=20&search=`
- `POST /api/v1/guardians`

Guardian phone numbers are unique within one school and may be shared by linked siblings.

### Academic structure

- `GET /api/v1/classes`
- `POST /api/v1/classes`
- `GET /api/v1/academic-years`
- `POST /api/v1/academic-years`
- `POST /api/v1/terms`
- `POST /api/v1/enrolments`

An enrolment is unique per student and term. Posting another class for the same term updates the existing enrolment instead of creating conflicting records.

## Authorization and tenancy

- Read endpoints require `students.view`.
- Write endpoints require `students.manage`.
- The school ID always comes from the authenticated session, never the request body.
- Class, term, guardian, and student relationships are verified against that school.
- Student create and update operations write audit events with actor, request ID, and IP address.

## Financial presentation

Student billed totals are calculated from active invoice items. Paid totals are calculated from completed payment allocations. The student table does not store a mutable balance column.
