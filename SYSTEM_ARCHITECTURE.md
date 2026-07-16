# MentriQ Forge - System Architecture & Flow Diagram

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MENTRIQ FORGE - END-TO-END FLOW                      │
└─────────────────────────────────────────────────────────────────────────────┘

                          ┌──────────────────┐
                          │    CANDIDATES    │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
              ┌─────▼────────┐          ┌─────────▼──────┐
              │  1. REGISTER │          │  2. BROWSE     │
              │  as Candidate│          │  PROJECTS      │
              └─────┬────────┘          └─────────┬──────┘
                    │                             │
                    └──────────────┬──────────────┘
                                   │
                         ┌─────────▼────────┐
                         │  3. APPLY FOR    │
                         │  PROJECT         │
                         └────────┬─────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │  Application Created      │
                    │  Status: "applied"        │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼──────────────────┐
                    │  4. SUBMIT WORK              │
                    │  /candidate/applications/:id/submit
                    └──────┬──────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │      FILL SUBMISSION FORM            │
        │  ┌──────────────────────────────┐   │
        │  │ □ GitHub Repo URL            │   │
        │  │ □ Live Demo URL              │   │
        │  │ □ Google Drive Link (NEW) ✨ │   │
        │  │ □ Candidate Notes            │   │
        │  └──────────────────────────────┘   │
        └──────────────────┬───────────────────┘
                           │
               ┌───────────▼────────────┐
               │  Submission Created    │
               │  Status: "pending_review"
               │  Application: "submitted"
               └───────────┬────────────┘
                           │
    ┌──────────────────────▼─────────────────────┐
    │                                            │
    │       ⏳ WAITING FOR EVALUATION            │
    │       (3-5 business days)                  │
    │                                            │
    └──────────────┬───────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   ADMIN/EVALUATOR   │
        └────────┬─────────────┘
                 │
    ┌────────────▼──────────────┐
    │  1. LOGIN AS ADMIN        │
    │  /admin/dashboard         │
    └────────────┬──────────────┘
                 │
    ┌────────────▼──────────────────────────┐
    │  2. CLICK "VIEW ALL SUBMISSIONS"      │
    │  /admin/submissions                   │
    └────────────┬──────────────────────────┘
                 │
    ┌────────────▼──────────────────────────┐
    │  SUBMISSIONS MANAGER (NEW) ✨         │
    │  ┌────────────────────────────────┐   │
    │  │ 🔍 Search:                     │   │
    │  │    - Candidate name            │   │
    │  │    - Email                     │   │
    │  │    - Project title             │   │
    │  │                                │   │
    │  │ 📊 Filter:                     │   │
    │  │    - All                       │   │
    │  │    - Pending                   │   │
    │  │    - Reviewed                  │   │
    │  │                                │   │
    │  │ 📈 Statistics:                 │   │
    │  │    - Total: X                  │   │
    │  │    - Pending: Y                │   │
    │  │    - Reviewed: Z               │   │
    │  │                                │   │
    │  │ Quick Links per Submission:    │   │
    │  │    📦 GitHub Repo              │   │
    │  │    🌐 Live Demo                │   │
    │  │    📁 Google Drive Link        │   │
    │  └────────────────────────────────┘   │
    └────────────┬──────────────────────────┘
                 │
    ┌────────────▼──────────────────────────┐
    │  3. CLICK SUBMISSION TO EVALUATE      │
    │  /admin/submissions/:submissionId/evaluate
    └────────────┬──────────────────────────┘
                 │
    ┌────────────▼──────────────────────────┐
    │  REVIEW SUBMISSION PAGE              │
    │  ┌────────────────────────────────┐   │
    │  │ CANDIDATE INFO                  │   │
    │  │ ├─ Name                         │   │
    │  │ ├─ Email                        │   │
    │  │ ├─ Experience Level             │   │
    │  │ └─ Skills                       │   │
    │  │                                 │   │
    │  │ SUBMISSION LINKS                │   │
    │  │ ├─ 📦 GitHub Repo (click)      │   │
    │  │ ├─ 🌐 Live Demo (click)        │   │
    │  │ ├─ 📁 DRIVE LINK (NEW) ✨      │   │
    │  │ │  "Complete Code Folder"      │   │
    │  │ │  Click to see entire project  │   │
    │  │ └─ Candidate Notes              │   │
    │  │                                 │   │
    │  │ EVALUATION FORM                 │   │
    │  │ ├─ Code Quality          [8/10]│   │
    │  │ ├─ Problem Solving       [7/10]│   │
    │  │ ├─ Standards Adherence   [8/10]│   │
    │  │ ├─ Completeness          [9/10]│   │
    │  │ ├─ Communication         [7/10]│   │
    │  │ └─ Overall: 7.8/10 (AUTO-CALC) │   │
    │  │                                 │   │
    │  │ FEEDBACK (required)             │   │
    │  │ ┌─────────────────────────────┐ │   │
    │  │ │ Detailed feedback text...   │ │   │
    │  │ └─────────────────────────────┘ │   │
    │  │                                 │   │
    │  │ RECOMMENDATION                  │   │
    │  │ [ ✅ Shortlist ]               │   │
    │  │ [ 🔄 Needs Upskilling ]       │   │
    │  │ [ ❌ Reject ]                 │   │
    │  │                                 │   │
    │  │ [Submit Evaluation] BUTTON      │   │
    │  └────────────────────────────────┘   │
    └────────────┬──────────────────────────┘
                 │
    ┌────────────▼──────────────────────────┐
    │  Evaluation Submitted                 │
    │  ┌────────────────────────────────┐   │
    │  │ Submission Status: "reviewed"   │   │
    │  │ Overall Score: 7.8/10           │   │
    │  │ Recommendation Saved            │   │
    │  └────────────────────────────────┘   │
    └────────────┬──────────────────────────┘
                 │
        ┌────────┴─────────────────────┐
        │  APPLICATION STATUS UPDATE   │
        │                              │
        │  If ✅ SHORTLIST             │
        │  └─ Status: "shortlisted"   │
        │                              │
        │  If ❌ REJECT               │
        │  └─ Status: "rejected"      │
        │                              │
        │  If 🔄 NEEDS UPSKILLING    │
        │  └─ Status: "under_review" │
        └────────┬─────────────────────┘
                 │
    ┌────────────▼──────────────────────────┐
    │  Feedback Sent to Candidate           │
    │                                       │
    │  Candidate Views at:                  │
    │  /candidate/feedback                  │
    │  ┌────────────────────────────────┐   │
    │  │ Project: React Todo App        │   │
    │  │ Evaluator: John Doe            │   │
    │  │                                 │   │
    │  │ SCORES                          │   │
    │  │ Code Quality:      8/10         │   │
    │  │ Problem Solving:   7/10         │   │
    │  │ Standards:         8/10         │   │
    │  │ Completeness:      9/10         │   │
    │  │ Communication:     7/10         │   │
    │  │ OVERALL: 7.8/10                │   │
    │  │                                 │   │
    │  │ FEEDBACK:                       │   │
    │  │ "Great submission!..."          │   │
    │  │                                 │   │
    │  │ STATUS: ✅ SHORTLISTED        │   │
    │  └────────────────────────────────┘   │
    └────────┬───────────────────────────────┘
             │
    ┌────────┴──────────────────────────┐
    │                                   │
    │  ✅ SHORTLISTED?                 │
    │  ↓                               │
    │  Company sees candidate at       │
    │  /company/projects/:id/applicants│
    │                                  │
    │  COMPANY CAN:                    │
    │  • View full profile             │
    │  • See evaluation scores         │
    │  • Review submitted work         │
    │  • Schedule interview            │
    │  • Extend offer                  │
    │                                  │
    │  ✅ HIRED!                       │
    │                                  │
    │  ❌ REJECTED?                    │
    │  ↓                               │
    │  Candidate can apply to          │
    │  other projects                  │
    │                                  │
    │  🔄 NEEDS UPSKILLING?           │
    │  ↓                               │
    │  Candidate reads feedback        │
    │  and improves skills             │
    │  Can apply to other projects     │
    │                                  │
    └─────────────────────────────────┘
```

## Data Model Relationships

```
┌────────────────┐
│     USER       │
│ (Candidate)    │
└────────┬───────┘
         │
         │ applies_for
         ▼
┌────────────────────┐
│   APPLICATION      │
│  ┌──────────────┐  │
│  │ status       │  │ applied → submitted → shortlisted/rejected
│  │ appliedAt    │  │
│  │ submittedAt  │  │
│  └──────────────┘  │
└────────┬───────────┘
         │
         │ has_one
         ▼
┌────────────────────────────────┐
│      SUBMISSION (NEW)          │
│  ┌──────────────────────────┐  │
│  │ repoUrl                  │  │
│  │ liveDemoUrl              │  │
│  │ driveLink ✨ (NEW)       │  │
│  │ notes                    │  │
│  │ status                   │  │
│  │ submittedAt              │  │
│  └──────────────────────────┘  │
└────────┬────────────────────────┘
         │
         │ has_one
         ▼
┌────────────────────────────────┐
│     EVALUATION                 │
│  ┌──────────────────────────┐  │
│  │ scores.codeQuality       │  │
│  │ scores.problemSolving    │  │
│  │ scores.standardsAdherence│  │
│  │ scores.completeness      │  │
│  │ scores.communication     │  │
│  │ overallScore (auto)      │  │
│  │ feedback                 │  │
│  │ recommendation           │  │
│  │ evaluator                │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

## Key Status Transitions

```
                ┌──────────────┐
                │  registered  │
                └──────┬───────┘
                       │
            ┌──────────▼──────────┐
            │     Applied for     │
            │ Project Application │
            │ status: "applied"   │
            └──────────┬──────────┘
                       │
            ┌──────────▼──────────┐
            │   Submitted Work    │
            │ status: "submitted" │
            │   SUBMISSION:       │
            │ status: "pending_.. │
            └──────────┬──────────┘
                       │
         ┌─────────────▼─────────────┐
         │   EVALUATION COMPLETE     │
         │   SUBMISSION: "reviewed"  │
         └─────────────┬─────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼─────┐  ┌────▼─────┐  ┌──────▼──────┐
   │ SHORTLIST │  │  REJECT  │  │ UPSKILLING  │
   │ COMPANY   │  │ REJECTED │  │ UNDER REVIEW│
   │ INTERVIEWS│  │          │  │             │
   │   HIRE    │  │REAPPLY   │  │ FEEDBACK    │
   └───────────┘  │ELSEWHERE │  │ IMPROVE     │
                  └──────────┘  └─────────────┘
```

## Technology Stack

```
FRONTEND (React)
├── Pages:
│   ├── /candidate/applications/:id/submit (SubmitWork.jsx - ENHANCED)
│   ├── /admin/submissions (SubmissionsManager.jsx - NEW)
│   ├── /admin/submissions/:id/evaluate (EvaluateSubmission.jsx - ENHANCED)
│   └── /candidate/feedback (Feedback.jsx)
├── Components:
│   └── Used by above pages
└── API:
    └── axios interceptor for auth

BACKEND (Node.js + Express)
├── Models:
│   ├── Submission.js (+ driveLink field)
│   ├── Evaluation.js
│   └── Application.js
├── Controllers:
│   ├── submissionController.js (ENHANCED)
│   ├── evaluationController.js
│   └── applicationController.js
├── Routes:
│   ├── /api/submissions
│   └── /api/evaluations
└── Database:
    └── MongoDB

FEATURES
├── Google Drive Integration
├── 5-Point Evaluation Rubric
├── Auto-Score Calculation
├── Advanced Search & Filtering
├── Real-time Status Updates
└── Feedback Loop for Candidates
```

## API Call Sequence

```
CANDIDATE SUBMIT:
1. GET /api/submissions/my
   └─ Show existing submissions

2. POST /api/submissions
   Payload: {
     applicationId: "...",
     repoUrl: "https://github.com/...",
     liveDemoUrl: "https://demo.app/",
     driveLink: "https://drive.google.com/..." ← NEW
     notes: "My approach..."
   }
   └─ Create submission with drive link

ADMIN REVIEW:
1. GET /api/submissions/pending
   Query: ?search=john&projectId=123
   └─ Get list with filtering

2. GET /api/submissions/:id
   └─ Get single submission details

3. POST /api/evaluations
   Payload: {
     submissionId: "...",
     scores: { codeQuality: 8, ... },
     feedback: "...",
     recommendation: "shortlist"
   }
   └─ Create evaluation, update application status

CANDIDATE FEEDBACK:
1. GET /api/evaluations/my
   └─ Get all feedback for their submissions
```

