# MentriQ Forge

A two-sided, project-based talent hiring platform. Companies post real project briefs and job openings; candidates apply, execute work, and submit; MentriQ evaluators score submissions; companies review scored shortlists and manage their hiring pipeline.

```
mentriq-forge/
├── backend/     Node.js + Express + MongoDB (Mongoose) REST API
└── frontend/    React (Vite) + Tailwind CSS SPA
```

## Roles & Core Flow

1. **Company** posts a project (brief, skills, duration, deliverables) or a job (role, salary, location, requirements).
2. **Candidate** browses **Browse Hiring** — sees both Jobs and Project-based opportunities with clear badges.
3. Candidate applies, executes work, and **submits** with GitHub repo, live demo, Google Drive link, and notes.
4. **Evaluator** reviews using **Submissions Manager** — search, filter, score on 5-part rubric, leave feedback + recommendation.
5. **Company** manages pipeline through shortlisted → interview_scheduled → hired.
6. **Admin** has full platform control — manage users, projects, jobs, view deleted reports, analytics.

## New Features

### Admin Management
- **Admin Project & Job Management** — View all projects/jobs, edit any, delete (soft delete).
- **Deleted Reports** (`/admin/deleted-reports`) — View all soft-deleted jobs/projects with company name, type, posted/deleted dates, and who deleted. Restore or permanently delete.
- **Admin Dashboard Analytics** — Cards showing: Total Companies, Active Companies, Jobs/Projects Posted, Deleted Jobs/Projects, Active Jobs/Projects, Hired Candidates, Total Applications.
- **Advanced Search & Filters** — Search by company name, title, role, industry, experience, status, date range across all management pages.
- **Hired Candidates Tracking** — View who was hired, by which company, for which role, and when.

### Browse Hiring (for Candidates)
- **Unified Browse Page** (`/projects`) — Shows both Jobs and Project-based opportunities. Filter by All / Jobs / Projects with badges.
- **Job Detail Page** — Company, role, experience, salary, location, skills, job description, eligibility, direct apply form.
- **Project Detail Page** — Title, description, required skills, duration, deliverables, team size, deadline, participate button.
- **Correct Data Mapping** — Jobs show job-only fields; Projects show project-only fields. No mixing.

### Company Dashboard
- **Edit Job/Project** — Inline edit button on each card opens a full edit form.
- **Delete with Soft Delete** — Delete button with confirmation modal. Item is soft-deleted, disappears from active list, appears in Admin's Deleted Reports.
- **Toggle Applications** — Open/close applications directly from dashboard.

### Candidate Settings
- **Full Settings Page** (`/candidate/settings`) — Profile info, photo upload, resume drive link, skills, experience level, social links (LinkedIn, GitHub, Portfolio), notification preferences, change password, GitHub connection, delete account with confirmation.

### Soft Delete System
- Deleting a job/project sets `isDeleted=true` with timestamp and who deleted it.
- Data stays in database until admin permanently removes it.
- Admin can restore any deleted item.

## API Overview

| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| GET/PUT | /api/auth/me | logged in |
| GET | /api/projects | public (filters: domain, difficulty, search) |
| POST | /api/projects | company |
| GET/PUT/DELETE | /api/projects/:id | public (GET) / owning company or admin (PUT/DELETE) |
| GET | /api/projects/my/company | company |
| POST | /api/applications | candidate |
| GET | /api/applications/my | candidate |
| GET | /api/applications/project/:projectId | company/admin/evaluator |
| PUT | /api/applications/:id/status | company/admin/evaluator |
| POST | /api/submissions | candidate |
| GET | /api/submissions/pending | evaluator/admin |
| GET | /api/submissions/my | candidate |
| GET | /api/submissions/:id | authenticated |
| POST | /api/evaluations | evaluator/admin |
| GET | /api/evaluations/my | candidate |
| GET | /api/evaluations/project/:projectId/shortlist | company/admin/evaluator |
| GET | /api/dashboard/company \| /candidate \| /admin | role-matched |
| GET/POST | /api/admin/users | admin |
| PUT/DELETE | /api/admin/users/:id | admin |
| GET/DELETE | /api/admin/projects | admin (view all / delete any) |
| GET/PUT/DELETE | /api/admin/deleted-items | admin/evaluator (view, restore, permanently delete) |
| GET | /api/admin/analytics | admin/evaluator |
| GET | /api/admin/hired-candidates | admin/evaluator |

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env     # then edit MONGO_URI / JWT_SECRET
npm run seed              # optional: creates demo accounts + sample data
npm run dev                # starts on http://localhost:5000
```

### Seeded Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@123 |
| Evaluator | evaluator@example.com | Eval@123 |
| Company | company@example.com | Company@123 |
| Candidate | candidate@example.com | Candidate@123 |

## Frontend Setup

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:5173
```

### Pages

- **Public**: Landing, Login/Register, Browse Hiring, Job/Project Detail
- **Candidate**: Dashboard, Submit Work, Feedback, Settings
- **Company**: Dashboard, Create Project/Job, Edit Project/Job, Applicants, Settings
- **Admin**: Dashboard, Submissions Manager, Evaluate Submission, Manage Users, Deleted Reports

## Known Gaps

- **Monetization/billing** — No payment gateway. Placeholder `isPaidSlot` field on Project.
- **Notifications** — No email/SMS alerts.
- **Direct file uploads** — Candidates link to repos/demos/Drive instead of uploading directly.
