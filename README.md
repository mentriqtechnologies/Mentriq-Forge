# MentriQ Forge

> **A two-sided, project-based talent hiring platform.** Companies post real project briefs and job openings; candidates apply, actually execute the work, and submit; MentriQ **evaluators** score submissions on a 5-point rubric; companies review the scored shortlist and manage the interview → hire pipeline.

Deep architecture diagrams and the full end-to-end flow are in **[`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md)**.

---

## Table of Contents

- [How It Works](#how-it-works)
- [The Four Roles](#the-four-roles)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Data Model & Statuses](#data-model--statuses)
- [Evaluation Rubric](#evaluation-rubric)
- [Feature Map](#feature-map)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Demo Accounts](#demo-accounts)
- [Deployment](#deployment)
- [Known Gaps / Roadmap](#known-gaps--roadmap)

---

## How It Works

```
CANDIDATE        →  Browse Hiring → Apply to a project → Execute the brief → Submit work
                                                                                 │
                                                                                 ▼
EVALUATOR        →  Evaluation Command Center → Grade submission (5 scores + feedback
                    + recommendation: shortlist / needs upskilling / reject)      │
                                                                                 ▼
APPLICATION      →  applied → submitted → shortlisted / rejected / under_review
                                                                                 │  shortlisted
                                                                                 ▼
COMPANY          →  Reviews scored profile → Schedules interviews → Records verdict
                    → Hires                                                       │
                                                                                 ▼
ADMIN            →  Platform governance: users, jobs/projects, deleted items,
                    analytics, candidate verification
```

Key rule for **project-based hiring**: a company never sees a candidate's profile until an evaluator **shortlists / forwards** it. The candidate's submission score is what earns that forward.

---

## The Four Roles

| Role | What they do | Main areas |
|---|---|---|
| **Candidate** | Browse job + project-based opportunities, apply, execute work, submit (GitHub, live demo, Drive link), read evaluation feedback, get scheduled for interviews | `/candidate/*` |
| **Evaluator** | Review submitted work on the 5-point rubric, forward/reject candidate profiles, manage and record interviews | `/evaluator/*` |
| **Company** | Post jobs & project briefs, toggle applications, review shortlisted candidates (profile + scores + work), schedule interviews, hire | `/company/*` |
| **Admin** | Global control: users, jobs/projects, soft-deleted items, analytics, hired-candidates, candidate verification review | `/admin/*` |

---

## Tech Stack

### Backend (`backend/`)
- **Node.js + Express 4** — REST API (`commonjs`)
- **MongoDB + Mongoose 8** — data layer
- `jsonwebtoken` (JWT auth), `bcryptjs`, `helmet`, `cors`, `morgan`, `express-validator`
- `nodemailer` + **Resend** API for branded email (activation / password reset)
- **Firebase Admin + Google/Firebase auth** for social login
- **GitHub OAuth** for candidates to link repos & pull repo analytics
- `multer` (profile photo upload)

### Frontend (`frontend/`)
- **React 18 + Vite 5** SPA
- **Tailwind CSS 3** + custom design system in `src/components/ui`
- `react-router-dom` 6, `axios`, `framer-motion`, `lucide-react`

---

## Repository Structure

```
mentriq-forge/
├── backend/                    Node.js + Express + MongoDB API
│   ├── server.js               API entry + route mounting + CORS/helmet
│   ├── config/                 DB connection, firebase admin init
│   ├── models/                 User, Project, Application, Submission,
│   │                           Evaluation, Interview
│   ├── controllers/            Business logic per feature
│   ├── routes/                 Express routers (auth, projects, applications,
│   │                           submissions, evaluations, dashboard, admin,
│   │                           github, verification, interviews)
│   ├── middleware/             auth (protect/authorize), error handler
│   ├── utils/                  email, seed, token helpers, cleanup scripts
│   └── seed.js / utils/seed.js Demo data generator
├── frontend/                   React (Vite) SPA
│   └── src/
│       ├── App.jsx             All routes + role-protected layouts
│       ├── api/axios.js        Axios instance w/ auth interceptor
│       ├── context/            AuthContext (session, permissions)
│       ├── components/ui/      Reusable design system
│       └── pages/              public / candidate / company / evaluator / admin
├── SYSTEM_ARCHITECTURE.md      Flow + data-model + API-sequence diagrams
└── README.md                   This file
```

---

## Data Model & Statuses

### Models (`backend/models/`)
- **User** — role (`candidate | company | evaluator | admin`), profile (skills, experience, social links, resume), GitHub connection, `isVerified` (email activated), `verificationStatus` for candidates (platform verification).
- **Project** — company-owned job **or** project brief (type, domain, skills, difficulty, duration, deliverables, hiring goal) with soft-delete (`isDeleted`).
- **Application** — a candidate applying to a project; tracks the whole pipeline status + timestamps.
- **Submission** — the candidate's delivered work: `repoUrl`, `liveDemoUrl`, `driveLink`, `notes`, `submittedAt`, plus GitHub stats snapshot.
- **Evaluation** — the evaluator's verdict: 5 rubric scores, auto `overallScore`, `feedback`, `recommendation` (unique per submission).
- **Interview** — schedule + outcome for an application: `interviewType`, `date`, `mode`, `feedback`, `recommendation`.

### Application status lifecycle

```
applied → in_progress → submitted → shortlisted → interview_scheduled → hired
                                  ↘ rejected  ↘ under_review (needs upskilling)
```

### Submission status
`pending_review → reviewed`

### Interview recommendation (outcome)
`recommended` | `not_recommended` | `needs_further_review` — recorded with `feedback` on completion.

### Evaluation recommendation → Application status (auto)

| Evaluation recommendation | Application becomes |
|---|---|
| `shortlist` | `shortlisted` (forwarded to company) |
| `reject` | `rejected` |
| `needs_upskilling` | `under_review` |

---

## Evaluation Rubric

Evaluators score each submission **0–10** on:

1. **Code Quality**
2. **Problem Solving**
3. **Standards Adherence**
4. **Completeness**
5. **Communication**

`overallScore` is auto-calculated as the average. Evaluators also attach a **recommendation** and required **feedback** — which automatically moves the application in the pipeline (see table above).

---

## Feature Map

### Public
- Landing, How It Works, Terms, Privacy, Login, Register (email/Google), email activation, forgot/reset password
- **Browse Hiring** (`/projects`) — unified feed of Jobs & Project-briefs with filters and badges
- Job detail / Project detail pages

### Candidate (`/candidate/*`)
- Dashboard (my applications, submissions, interviews)
- Submit Work (repo, live demo, Drive link, notes) + GitHub stats fetch
- **Feedback** — per-evaluation scores, feedback & status
- Settings — profile, photo, resume Drive link, skills, social links, GitHub link, notification prefs, delete account

### Evaluator (`/evaluator/*`) — *Evaluation Command Center*
- **Dashboard** — Needs-Action stats (Pending, Overdue 7-day SLA, Profile Reviews, Interviews to Record), Performance strip, workload by domain, overdue submissions, pending interview outcomes, recent evaluations
- **Submissions** — searchable/filterable queue; **Evaluate Submission** workspace with Candidate Intel, Repo Analytics, live score-suggested recommendation, next-in-queue
- **Application Review** — forward/reject candidate profiles by application; per-app detail page linking profile review + submitted work
- **Interviews** — schedule, update, cancel, mark complete + record outcome (feedback + recommendation)

### Company (`/company/*`)
- Dashboard, create/edit job or project brief, toggle applications open/closed, soft-delete
- Applicants with evaluation scores + submitted work, shortlist review
- Company candidate review, final decision (Hire / Reject), and schedule interviews

### Admin (`/admin/*`)
- Analytics dashboard, Manage Users (Excel-style table, search/sort/pagination, activate/deactivate/delete), Manage Jobs/Projects, Deleted Reports (soft-delete restore/permanent), Hired Candidates, **Candidate Verification** review, Submissions Manager, Applications Manager

---

## API Reference

Base URL: `/api` — all routes below are mounted in `backend/server.js`.

### Auth `routes/authRoutes.js`
| Method | Route | Access |
|---|---|---|
| POST | `/auth/register` | public |
| POST | `/auth/login` | public |
| GET / PUT / DELETE | `/auth/me` | logged in |
| GET | `/auth/github`, `/auth/github/callback`, `/auth/github/link`, DELETE `/auth/github/link` | public / protected |
| GET | `/auth/google`, `/auth/google/callback` | public |
| POST | `/auth/google/signup`, `/auth/firebase`, `/auth/firebase/pending`, `/auth/firebase/migrate` | public / protected |
| POST | `/auth/send-verification-email` | public |
| POST | `/auth/forgot-password` | public |
| PUT | `/auth/reset-password/:token` | public |

### Projects `routes/projectRoutes.js`
| Method | Route | Access |
|---|---|---|
| GET | `/projects` | public (filters: domain, difficulty, search) |
| GET | `/projects/my/company` | company |
| GET | `/projects/:id` | public |
| POST | `/projects` | company |
| PUT / DELETE | `/projects/:id` | owner company / admin |

### Applications `routes/applicationRoutes.js`
| Method | Route | Access |
|---|---|---|
| POST | `/applications` | candidate |
| GET | `/applications/my` | candidate |
| GET | `/applications/all` | admin |
| GET | `/applications/queue` | evaluator (review queue) |
| GET | `/applications/project/:projectId` | company / admin |
| PUT | `/applications/:id/status` | company / admin |
| POST | `/applications/:id/shortlist` | evaluator / admin (forward to company) |
| POST | `/applications/:id/reject` | evaluator / admin |
| GET | `/applications/company/shortlisted` | company / admin |
| GET | `/applications/company/:applicationId` | company / admin |
| PUT | `/applications/company/:applicationId/review` | company / admin |
| PUT | `/applications/company/:applicationId/final-decision` | company (Hire is company-exclusive) |
| POST | `/applications/company/:applicationId/interview` | company / admin |
| GET | `/applications/:id` | all logged-in roles (context-aware) |

### Submissions `routes/submissionRoutes.js`
| Method | Route | Access |
|---|---|---|
| POST | `/submissions` | candidate |
| GET | `/submissions/pending` | evaluator / admin |
| GET | `/submissions/my` | candidate |
| GET | `/submissions/:id` | authenticated |
| PUT | `/submissions/:id/github-stats` | candidate |

### Evaluations `routes/evaluationRoutes.js`
| Method | Route | Access |
|---|---|---|
| POST | `/evaluations` | evaluator |
| GET | `/evaluations/my` | candidate |
| GET | `/evaluations` | evaluator / admin |
| GET | `/evaluations/submission/:submissionId` | authenticated |
| GET | `/evaluations/project/:projectId/shortlist` | company / admin / evaluator |

### Interviews `routes/interviewRoutes.js`
| Method | Route | Access |
|---|---|---|
| POST | `/interviews/:applicationId` | evaluator / company |
| GET | `/interviews` | evaluator / company / admin (with `evaluated` flag) |
| GET | `/interviews/application/:applicationId` | evaluator / company / admin |
| GET | `/interviews/candidate/:candidateId` | evaluator / admin |
| GET | `/interviews/my` | candidate |
| GET | `/interviews/:id` | authenticated |
| GET | `/interviews/:id/evaluations` | authenticated |
| PUT | `/interviews/:id` | evaluator / company |
| POST | `/interviews/:id/complete` | evaluator / company (records feedback + recommendation) |
| POST | `/interviews/:id/cancel` | evaluator / company |

### Dashboard `routes/dashboardRoutes.js`
| Method | Route | Access |
|---|---|---|
| GET | `/dashboard/company` | company |
| GET | `/dashboard/company/submissions` | company |
| GET | `/dashboard/candidate` | candidate |
| GET | `/dashboard/admin` | admin |
| GET | `/dashboard/evaluator` | evaluator (SLA-based command center stats) |

### Admin `routes/adminRoutes.js`
| Method | Route | Access |
|---|---|---|
| GET / POST | `/admin/users` | admin |
| PUT | `/admin/users/:id/status` | admin |
| DELETE | `/admin/users/:id` | admin |
| GET | `/admin/projects` | admin |
| DELETE | `/admin/projects/:id` | admin |
| GET | `/admin/deleted-items` | admin / evaluator |
| PUT | `/admin/deleted-items/:id/restore` | admin / evaluator |
| DELETE | `/admin/deleted-items/:id/permanent` | admin / evaluator |
| GET | `/admin/analytics` | admin / evaluator |
| GET | `/admin/hired-candidates`, `/admin/hired-candidates/:id` | admin / evaluator |

### Verification `routes/verificationRoutes.js`
| Method | Route | Access |
|---|---|---|
| GET | `/verification/me` | candidate |
| POST | `/verification/submit` | candidate (self-service profile verification) |
| GET | `/verification/candidates` | admin |
| PUT | `/verification/candidates/:userId` | admin |

### GitHub `routes/githubRoutes.js`
| Method | Route | Access |
|---|---|---|
| GET | `/github/repos` | logged in (candidate repo list for analytics) |

Also: `GET /api/health` — health check.

---

## Environment Variables

Create a `.env` in `backend/` (see `backend/.env.example` if present). The key variables used across the codebase:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `PORT` | API port (default `5000`) |
| `CLIENT_URL` / `FRONTEND_URL` | Allowed CORS origins + email links |
| `SERVER_URL` | Public backend URL (OAuth callbacks) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth + repo analytics |
| `GITHUB_TOKEN_ENCRYPTION_KEY` | Encrypt stored GitHub tokens |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `FIREBASE_SERVICE_ACCOUNT_JSON` / `FIREBASE_SERVICE_ACCOUNT_PATH` | Firebase Admin credentials (social auth) |
| `RESEND_API_KEY` | Transactional email via Resend |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_SECURE` / `SMTP_FROM` / `EMAIL_FROM` | Fallback SMTP email |
| `NODE_ENV` | `production` vs dev (affects logging, error stacks) |

> ⚠️ Never commit `.env` / `.env.production` — they contain real secrets.

---

## Local Setup

### Backend
```bash
cd backend
npm install
# create .env with MONGO_URI + JWT_SECRET (see above)
npm run seed        # optional: demo accounts + sample project
npm run dev         # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
```

Login at `http://localhost:5173` with any demo account below.

---

## Demo Accounts

Created by `npm run seed` (`backend/utils/seed.js`):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin@123` |
| Evaluator | `evaluator@example.com` | `Eval@123` |
| Company | `company@example.com` | `Company@123` |
| Candidate | `candidate@example.com` | `Candidate@123` |

---

## Deployment

**Frontend** static build: `cd frontend && npm run build` → deploy `frontend/dist/` (e.g. Vercel / Netlify).
**Backend** Node app: `cd backend && npm start` (e.g. Render) with the env vars set in the dashboard. CORS already whitelists `CLIENT_URL`, `FRONTEND_URL`, and `https://mentriq-forge.vercel.app`.

Due to the email-activation flow, remember to `npm run seed` (or otherwise create users) **before** registering new accounts in production, and configure your email provider (Resend/SMTP) so activation links can be delivered.

---

## Known Gaps / Roadmap

- **Monetization/billing** — no payment gateway yet (placeholder `isPaidSlot` on Project).
- **Notifications** — no SMS/push; email only for activation & password reset.
- **Direct file uploads** — candidates link repos/demos/Drive instead of uploading binaries.
- **Real GitHub verification** — repo analytics come from the linked GitHub account; scraping/private-repo deep analysis is future work.
- **Evaluator workload routing** — submissions are picked manually from the queue; auto-assignment/SLA alerts could be added on top of the existing 7-day SLA tracking.

---

> 📖 For the complete end-to-end flow, data-model relationships, and API call sequences, see [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md).