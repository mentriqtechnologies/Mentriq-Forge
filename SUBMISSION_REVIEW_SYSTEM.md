# MentriQ Forge - Project Submission & Review System

## Overview
MentriQ Forge uses a structured project-based evaluation system where candidates submit their work for evaluation, and MentriQ's expert evaluators review and shortlist top talent.

---

## 1. CANDIDATE SUBMISSION FLOW

### Step 1: Apply for Project
- Candidate finds a project and applies
- Application is created with `applied` status

### Step 2: Submit Work
**URL:** `/candidate/applications/:applicationId/submit`

Candidates can submit:
- **GitHub Repository URL** - Link to their code repository
- **Live Demo URL** - Link to the deployed/working application  
- **Google Drive Link** - Direct access to the complete code folder and project structure
- **Candidate Notes** - Additional context about their approach

**Backend Endpoint:**
```
POST /api/submissions
Body: {
  applicationId: string,
  repoUrl: string (optional),
  liveDemoUrl: string (optional),
  driveLink: string (optional) - NEW FIELD,
  notes: string (optional)
}
```

**Database Fields Added:**
- `driveLink` - Stores the Google Drive or code repository folder link
- All submissions start with `status: "pending_review"`

---

## 2. ADMIN REVIEW PROCESS

### Admin Dashboard (`/admin/dashboard`)
- Quick overview of platform statistics
- List of latest pending submissions
- Direct links to evaluate submissions

### Submissions Manager (`/admin/submissions`)
**New Comprehensive Interface** with:

#### Features:
- 🔍 **Search** - Find submissions by candidate name, email, or project title
- 📊 **Filtering** - View all, pending, or reviewed submissions
- 📈 **Statistics** - See total, pending, and reviewed submission counts
- 📁 **Drive Link Display** - Quick access to candidate's complete code folder

#### Quick Access Links:
Each submission card displays:
- 📦 GitHub Repo button
- 🌐 Live Demo button
- 📁 **Google Drive Link** button (NEW - highlighted in amber)

**Information Displayed:**
```
- Project Title
- Candidate Name & Email
- Experience Level (Student, Fresher, Professional, etc.)
- Submission Date
- Status (Pending/Reviewed)
- All submission links
```

---

## 3. EVALUATION FLOW

### Evaluate Submission (`/admin/submissions/:submissionId/evaluate`)

**Evaluator Reviews:**

#### Submission Details Section:
```
CANDIDATE INFO
├── Name
├── Email
├── Experience Level
└── Skills

SUBMISSION LINKS
├── GitHub Repo (if provided)
├── Live Demo (if provided)
├── 📁 COMPLETE CODE FOLDER (Google Drive/Code Repository Link)
│   └── "Click to access the full code structure and all project files"
└── Candidate Notes
```

#### Evaluation Rubric (0-10 scale):
1. **Code Quality** - Clean, readable, maintainable code
2. **Problem Solving** - Approach and logic used
3. **Standards Adherence** - Following best practices
4. **Completeness** - Feature implementation
5. **Communication** - Code comments, documentation

#### Recommendation Options:
- ✅ **Shortlist** - Candidate moves to company interview
- 🔄 **Needs Upskilling** - Good potential but areas to improve
- ❌ **Reject** - Not ready for this role

#### Output:
- **Overall Score** - Auto-calculated average
- **Detailed Feedback** - Constructive evaluation
- **Status Update** - Submission marked as `reviewed`
- **Application Status Updated:**
  - Shortlist → Application becomes `shortlisted`
  - Needs Upskilling → Application becomes `under_review`
  - Reject → Application becomes `rejected`

---

## 4. DATA MODEL

### Submission Schema
```javascript
{
  application: ObjectId,           // Reference to Application
  project: ObjectId,               // Reference to Project
  candidate: ObjectId,             // Reference to User (Candidate)
  repoUrl: String,                 // GitHub/Git repository link
  liveDemoUrl: String,             // Deployed application link
  driveLink: String,               // NEW: Google Drive/Code folder link
  fileUrls: [String],              // Array of file links
  notes: String,                   // Candidate's notes
  submittedAt: Date,               // Timestamp
  status: Enum,                    // pending_review | reviewed
  timestamps: true                 // createdAt, updatedAt
}
```

### Evaluation Schema
```javascript
{
  submission: ObjectId,             // Reference to Submission
  application: ObjectId,            // Reference to Application
  evaluator: ObjectId,              // Reference to User (Admin/Evaluator)
  scores: {
    codeQuality: 0-10,
    problemSolving: 0-10,
    standardsAdherence: 0-10,
    completeness: 0-10,
    communication: 0-10
  },
  overallScore: Number,             // Auto-calculated average
  feedback: String,                 // Detailed feedback
  recommendation: String,           // shortlist | needs_upskilling | reject
  timestamps: true
}
```

---

## 5. SHORTLISTING PROCESS

### How Candidates Get Shortlisted:
1. ✅ Evaluator reviews submission and gives "Shortlist" recommendation
2. ✅ Application status changes to `shortlisted`
3. ✅ Candidate feedback is recorded with scores and recommendations
4. ✅ Company can view shortlisted candidates for each project

### Company View - Shortlisted Candidates
**URL:** `/company/projects/:projectId/applicants`

Companies can:
- See all candidates with `shortlisted` status
- View evaluation scores
- Access candidate profiles and contact information
- Schedule interviews or send offers

### Candidate View - Feedback
**URL:** `/candidate/feedback`

Candidates can:
- View evaluation scores on their submissions
- Read detailed feedback from evaluators
- Understand areas to improve
- Track their application status

---

## 6. API ENDPOINTS

### Submission Endpoints
```
POST   /api/submissions                    - Create submission
GET    /api/submissions/pending            - Get pending submissions (admin/evaluator)
GET    /api/submissions/my                 - Get candidate's submissions
GET    /api/submissions/:id                - Get specific submission
```

### Evaluation Endpoints
```
POST   /api/evaluations                    - Create evaluation
GET    /api/evaluations/my                 - Get candidate's feedback
GET    /api/evaluations/submission/:id     - Get evaluation for submission
GET    /api/evaluations/project/:id/shortlist - Get shortlisted candidates
```

---

## 7. COMPLETE USER JOURNEYS

### Candidate Journey
```
1. Register as Candidate
   ↓
2. Browse Projects (/projects)
   ↓
3. Apply for Project
   ↓
4. Submit Work with:
   - GitHub Repo Link
   - Live Demo Link
   - Google Drive Link (Full Code Folder)
   - Notes
   ↓
5. Wait for Evaluation
   ↓
6. View Feedback (/candidate/feedback)
   ↓
7a. If Shortlisted → Company Interview
7b. If Rejected → Try Another Project
```

### Company Journey
```
1. Register as Company
   ↓
2. Create Project (/company/projects/new)
   ↓
3. Candidates Apply & Submit Work
   ↓
4. MentriQ Evaluates Submissions
   ↓
5. View Shortlisted Candidates (/company/projects/:id/applicants)
   ↓
6. Interview & Hire Top Talent
```

### Admin/Evaluator Journey
```
1. Login as Admin/Evaluator
   ↓
2. View Admin Dashboard (/admin/dashboard)
   ↓
3. Access Submissions Manager (/admin/submissions)
   ↓
4. Search & Filter Pending Submissions
   ↓
5. Click on Submission to Evaluate
   ↓
6. Review:
   - Candidate Info
   - GitHub Repo
   - Live Demo
   - COMPLETE CODE FOLDER (Google Drive)
   - Candidate Notes
   ↓
7. Score Using Rubric (0-10 each)
   ↓
8. Provide Detailed Feedback
   ↓
9. Make Recommendation:
   - Shortlist
   - Needs Upskilling
   - Reject
   ↓
10. Submit Evaluation
   ↓
11. Application Status Updated
    (Shortlist → shortlisted)
    (Reject → rejected)
    (Needs Upskilling → under_review)
```

---

## 8. KEY FEATURES

✅ **Google Drive Integration**
- Candidates share complete project folder
- Evaluators can review full code structure
- Easy access to all project files

✅ **Comprehensive Evaluation Rubric**
- 5-point scoring system
- Auto-calculated overall score
- Detailed feedback collection

✅ **Smart Recommendation System**
- Shortlist candidates who meet standards
- Identify upskilling opportunities
- Clear rejection criteria

✅ **Submissions Manager**
- Advanced search and filtering
- Quick link access to all resources
- Status tracking

✅ **Candidate Feedback Loop**
- View evaluation scores
- Read detailed feedback
- Understand improvement areas
- Track application journey

---

## 9. NEXT STEPS FOR ENHANCEMENT

- [ ] Email notifications for candidates when evaluation is complete
- [ ] Bulk evaluation export for companies
- [ ] Score analytics and trends
- [ ] Customizable evaluation rubric per project
- [ ] Interview scheduling integration
- [ ] Offer management system
- [ ] Candidate ranking/comparison view
