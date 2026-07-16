# Quick Start Guide - Submission & Review System

## For Candidates: How to Submit Your Project

### Step 1: Apply for a Project
1. Go to **Projects** (`/projects`)
2. Find a project that interests you
3. Click "Apply Now"

### Step 2: Submit Your Work
1. Once your application is approved, you'll see a "Submit Work" button
2. Go to your **Candidate Dashboard** (`/candidate/dashboard`)
3. Click **"Submit Work"** for the project

### Step 3: Fill the Submission Form
Fill in as much as you can:

**GitHub Repository URL** (Optional)
- Example: `https://github.com/yourname/project-name`
- Your actual code that evaluators will review

**Live Demo URL** (Optional)
- Example: `https://your-project.vercel.app`
- Your deployed/working application

**Google Drive Link** (Optional but RECOMMENDED)
- Example: `https://drive.google.com/drive/folders/your-folder-id`
- **Important**: Share the COMPLETE FOLDER with all your code, documentation, and files
- This allows evaluators to see your entire project structure
- Make sure the folder is accessible and organized well

**Notes for the Evaluator** (Optional)
- Explain your approach
- Mention any challenges you faced
- Highlight important implementation details

### Step 4: Submit
Click **"Submit for Review"** and wait for evaluation!

### Step 5: View Your Feedback
1. Go to **Candidate Dashboard**
2. Click **"View Feedback"** 
3. See your evaluation scores and detailed feedback
4. Check if you were **Shortlisted** or need improvement

---

## For Admin/Evaluators: How to Review Submissions

### Step 1: Access the Submissions Manager
1. Login as Admin or Evaluator
2. Go to **Admin Dashboard** (`/admin/dashboard`)
3. Click **"View All Submissions"** button OR
4. Go directly to `/admin/submissions`

### Step 2: Find Submissions to Review

**Search:**
- Type candidate name, email, or project title
- Real-time filtering

**Filter by Status:**
- **All** - Show all submissions
- **Pending** - Submissions waiting for review
- **Reviewed** - Already evaluated

**View Quick Stats:**
- Total Submissions
- Pending Reviews (to-do count)
- Already Reviewed (done count)

### Step 3: Open a Submission for Evaluation

Click on any submission card to open the **Evaluate Submission** page.

You'll see:

**Candidate Information**
- Name, Email, Experience Level
- Skills and background

**Submission Links** (Click to review)
- 📦 **GitHub Repo** - View the actual code
- 🌐 **Live Demo** - Test the working application
- 📁 **Google Drive Link** - Access complete project folder
  - This is the MOST IMPORTANT - see full code structure, docs, assets
- Candidate's Notes - Their explanation

### Step 4: Evaluate Using the Rubric

Score each category from **0-10**:

1. **Code Quality** (0-10)
   - Is the code clean, readable, maintainable?
   - Does it follow best practices?

2. **Problem Solving** (0-10)
   - Is the approach logical and efficient?
   - Are edge cases handled?

3. **Standards Adherence** (0-10)
   - Does it follow industry standards?
   - Correct patterns and conventions used?

4. **Completeness** (0-10)
   - Are all features implemented?
   - Is the project finished and polished?

5. **Communication** (0-10)
   - Is the code well-commented?
   - Are there good documentation/README?

**Overall Score** = Auto-calculated average (shown in real-time)

### Step 5: Provide Feedback

Write **detailed, constructive feedback**:
- What they did well ✅
- Areas to improve 🔧
- Specific suggestions for enhancement
- Overall impressions

### Step 6: Make a Recommendation

Choose one:

✅ **SHORTLIST**
- Candidate is ready for company interview
- Application moves to `shortlisted` status
- Company can see this candidate

🔄 **NEEDS UPSKILLING**
- Good potential but not quite ready
- Suggest areas to improve
- Application stays `under_review`

❌ **REJECT**
- Not suitable for this role currently
- Application becomes `rejected`
- Candidate can apply to other projects

### Step 7: Submit Evaluation

Click **"Submit Evaluation"**

Done! ✅
- Scores and feedback saved
- Application status updated
- Candidate will see the evaluation

---

## Example Workflow

### Scenario: Evaluating a Web Development Project

1. **Open Submissions Manager** → See 5 pending reviews
2. **Search for** → "John" (find John's React project submission)
3. **Click on it** → Opens evaluation page
4. **Review the code** → Click GitHub repo link to see code
5. **Test the app** → Click Live Demo to test functionality
6. **Check project structure** → Click Google Drive link to see:
   - Project organization
   - Documentation/README
   - Assets and resources
   - Dependencies
7. **Score:**
   - Code Quality: 8/10 (clean but some optimization possible)
   - Problem Solving: 7/10 (good approach, missed edge case)
   - Standards: 8/10 (follows React patterns well)
   - Completeness: 9/10 (all features done)
   - Communication: 7/10 (some comments, README needs work)
   - **Overall: 7.8/10**
8. **Write Feedback:**
   ```
   Great submission John! Your code is well-structured and the app works smoothly. 
   The React component architecture is clean. 
   
   Areas to improve:
   - Add error handling for API failures
   - Consider accessibility (WCAG compliance)
   - Add more inline code comments
   - Improve README with setup instructions
   
   Great work on the project structure and organization!
   ```
9. **Recommend: SHORTLIST** ✅
10. **Submit** → John gets shortlisted for company interview

---

## Tips for Better Reviews

✅ **DO:**
- Check all links (repo, demo, drive folder)
- Review the complete code structure
- Test the live demo thoroughly
- Be specific in feedback
- Look at code organization, not just functionality
- Consider experience level when scoring

❌ **DON'T:**
- Rush through evaluations
- Skip checking the Google Drive folder
- Be vague in feedback
- Only look at live demo, not the code
- Score too harshly or too generously
- Make subjective decisions

---

## For Companies: View Shortlisted Candidates

Once candidates are shortlisted by MentriQ evaluators:

1. Go to **Company Dashboard** (`/company/dashboard`)
2. Click on a **Project** you created
3. Go to **Applicants** section
4. See **Shortlisted** candidates with:
   - Evaluation scores
   - Experience level
   - Contact information
   - Performance ranking

5. **Interview** or **Send Offers** to top candidates!

---

## Important Links

| Role | Page | URL |
|------|------|-----|
| Candidate | Submit Work | `/candidate/applications/:id/submit` |
| Candidate | View Feedback | `/candidate/feedback` |
| Admin | Submissions Manager | `/admin/submissions` |
| Admin | Evaluate | `/admin/submissions/:id/evaluate` |
| Company | Shortlist | `/company/projects/:id/applicants` |

---

## Status Progression Chart

```
CANDIDATE
  ↓ (Applies)
APPLICATION: "applied"
  ↓ (Submits work)
APPLICATION: "submitted"
  ↓
SUBMISSION: "pending_review"
  ↓ (Admin evaluates)
SUBMISSION: "reviewed"
  ↓
  ├─ (Shortlist) → APPLICATION: "shortlisted" → COMPANY INTERVIEW
  ├─ (Reject) → APPLICATION: "rejected" → Try other projects
  └─ (Upskill) → APPLICATION: "under_review" → Feedback for improvement
```

---

## FAQ

**Q: Can candidates submit only Google Drive, without code demo?**
A: Yes! Candidates need at least one of: Repo URL, Live Demo, or Drive Link.

**Q: How do I access the Google Drive folder as an evaluator?**
A: Click the blue "📁 Drive Link" button in the evaluation page. The folder must be shared with your email.

**Q: Can I re-evaluate a submission?**
A: No, once evaluated, it's marked as "reviewed". If you need to change, contact admin to create a new evaluation.

**Q: How long does evaluation take?**
A: Usually 3-5 business days for MentriQ to evaluate and respond.

**Q: What if I'm not shortlisted?**
A: You can apply to other projects and get another chance! Use the feedback to improve.
