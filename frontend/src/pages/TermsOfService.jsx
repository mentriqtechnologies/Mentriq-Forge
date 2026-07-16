import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, ChevronUp, Scale, ArrowLeft, FileText, Eye, CheckCircle } from "lucide-react";

const sections = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "platform-description", title: "Platform Description" },
  { id: "user-accounts", title: "User Accounts & Registration" },
  { id: "candidate-accounts", title: "Candidate Accounts & Responsibilities" },
  { id: "company-accounts", title: "Company Accounts & Responsibilities" },
  { id: "admin-role", title: "Admin Role & Platform Management" },
  { id: "github-oauth", title: "GitHub OAuth Authentication" },
  { id: "project-submissions", title: "Project Submissions & Intellectual Property" },
  { id: "company-confidential", title: "Company Confidential Projects" },
  { id: "evaluation-process", title: "Evaluation Process" },
  { id: "prohibited-activities", title: "Prohibited Activities" },
  { id: "fake-accounts", title: "Fake Accounts & Fraud Prevention" },
  { id: "plagiarism", title: "Plagiarism & Original Work" },
  { id: "ai-generated-content", title: "AI-Generated Submissions Disclosure" },
  { id: "account-suspension", title: "Account Suspension & Termination" },
  { id: "intellectual-property", title: "Intellectual Property Rights" },
  { id: "limitation-liability", title: "Limitation of Liability" },
  { id: "disclaimer", title: "Disclaimer of Warranties" },
  { id: "indemnification", title: "Indemnification" },
  { id: "governing-law", title: "Governing Law & Jurisdiction" },
  { id: "dispute-resolution", title: "Dispute Resolution" },
  { id: "changes-to-terms", title: "Changes to These Terms" },
  { id: "grievance-officer", title: "Grievance Officer" },
  { id: "contact", title: "Contact Information" },
];

const termsContent = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    icon: "scale",
    content: (
      <>
        <p>
          By accessing or using MentriQ Forge ("the Platform"), operated by MentriQ Technologies
          ("MentriQ," "we," "us," or "our"), you agree to be bound by these Terms of Service
          ("Terms"). If you do not agree to these Terms, you must not access or use the Platform.
        </p>
        <p>
          These Terms constitute a legally binding agreement between you ("User," "you," or "your")
          and MentriQ Technologies. By creating an account, submitting projects, evaluating
          candidates, or otherwise using the Platform, you acknowledge that you have read,
          understood, and agree to be bound by these Terms.
        </p>
        <p>
          If you are accessing the Platform on behalf of a company or other legal entity, you
          represent that you have the authority to bind such entity to these Terms.
        </p>
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 mt-6">
          <p className="text-sm text-blue-800 mb-0">
            <strong>Platform:</strong> MentriQ Forge &mdash; A Project-Based Hiring Platform by MentriQ Technologies.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "platform-description",
    title: "Platform Description",
    content: (
      <>
        <p>
          MentriQ Forge is a skill-first hiring platform that facilitates project-based assessments
          and hiring. The Platform enables:
        </p>
        <ul>
          <li><strong>Candidates</strong> to create profiles, upload resumes, connect GitHub accounts, submit project work, and get evaluated for hiring opportunities.</li>
          <li><strong>Companies</strong> to create project assessments, evaluate candidate submissions, and identify top talent based on demonstrated skills.</li>
          <li><strong>Administrators</strong> to manage the Platform, oversee evaluations, and ensure compliance with these Terms.</li>
        </ul>
        <p>
          MentriQ Forge acts as an intermediary platform connecting candidates and companies.
          MentriQ does not guarantee employment, hiring, or any specific outcome from the use of
          the Platform.
        </p>
      </>
    ),
  },
  {
    id: "user-accounts",
    title: "User Accounts &amp; Registration",
    content: (
      <>
        <h3>Eligibility</h3>
        <p>
          You must be at least 18 years of age to create an account on MentriQ Forge. By registering,
          you represent and warrant that you are at least 18 years old and have the legal capacity to
          enter into these Terms.
        </p>
        <h3>Account Registration</h3>
        <ul>
          <li>You may register using an email address and password or through GitHub OAuth authentication.</li>
          <li>You must provide accurate, current, and complete information during the registration process.</li>
          <li>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</li>
          <li>You must notify MentriQ immediately of any unauthorized use of your account or any other breach of security.</li>
        </ul>
        <h3>Account Types</h3>
        <ul>
          <li><strong>Candidate Account:</strong> For individuals seeking project-based hiring opportunities.</li>
          <li><strong>Company Account:</strong> For organizations seeking to evaluate and hire talent through project assessments.</li>
          <li><strong>Admin/Evaluator Account:</strong> For MentriQ-authorized personnel to manage and evaluate Platform activities.</li>
        </ul>
        <h3>Accuracy of Information</h3>
        <p>
          You agree to maintain accurate and up-to-date account information. Providing false,
          misleading, or inaccurate information is a violation of these Terms and may result in
          immediate account suspension or termination.
        </p>
      </>
    ),
  },
  {
    id: "candidate-accounts",
    title: "Candidate Accounts &amp; Responsibilities",
    content: (
      <>
        <p>As a candidate on MentriQ Forge, you:</p>
        <ul>
          <li><strong>Profile Accuracy:</strong> Must provide accurate information including your name, skills, experience, and qualifications.</li>
          <li><strong>Resume Uploads:</strong> Are responsible for the accuracy and authenticity of any resumes, portfolios, or documents you upload.</li>
          <li><strong>GitHub Integration:</strong> May optionally connect your GitHub account to showcase your work. You are responsible for the accuracy of the GitHub profile information shared.</li>
          <li><strong>Project Submissions:</strong> Must submit original work unless otherwise specified. All project submissions must comply with the Plagiarism and AI-Generated Content policies in these Terms.</li>
          <li><strong>Professional Conduct:</strong> Must communicate professionally with companies and evaluators. Harassment, abuse, or discriminatory behavior will result in immediate account termination.</li>
          <li><strong>Honest Representation:</strong> Must not misrepresent your skills, experience, or identity. Fake accounts, identity misrepresentation, or credential fraud are strictly prohibited.</li>
          <li><strong>Application Limits:</strong> Must comply with any reasonable limits on project applications set by the Platform or companies.</li>
        </ul>
      </>
    ),
  },
  {
    id: "company-accounts",
    title: "Company Accounts &amp; Responsibilities",
    content: (
      <>
        <p>As a company on MentriQ Forge, you:</p>
        <ul>
          <li><strong>Accurate Representation:</strong> Must provide accurate company information, including legal name, industry, and representative details.</li>
          <li><strong>Project Creation:</strong> Are solely responsible for the content and accuracy of project descriptions, assessment criteria, and evaluation rubrics you create.</li>
          <li><strong>Confidential Projects:</strong> May mark projects as confidential. See the Company Confidential Projects section for specific terms.</li>
          <li><strong>Fair Evaluation:</strong> Must evaluate candidate submissions fairly, based on the stated criteria, and without discrimination based on race, gender, religion, caste, or any other protected characteristic under Indian law.</li>
          <li><strong>Communication:</strong> Must communicate professionally with candidates. You must not use the Platform to solicit candidates for opportunities outside the Platform without MentriQ's consent.</li>
          <li><strong>Data Protection:</strong> Must handle candidate personal data accessed through the Platform in compliance with applicable data protection laws, including the DPDP Act, 2023.</li>
          <li><strong>Payment Obligations:</strong> Are responsible for any fees associated with your use of the Platform as specified in your separate commercial agreement with MentriQ.</li>
        </ul>
      </>
    ),
  },
  {
    id: "admin-role",
    title: "Admin Role &amp; Platform Management",
    content: (
      <>
        <p>
          MentriQ Forge administrators and authorized evaluators have the right to:
        </p>
        <ul>
          <li>Review user accounts, project submissions, and Platform activity to ensure compliance with these Terms.</li>
          <li>Moderate, edit, or remove any content that violates these Terms or applicable law.</li>
          <li>Suspend or terminate accounts that violate these Terms, without prior notice, at MentriQ's sole discretion.</li>
          <li>Access Platform data as necessary for maintenance, security, and legal compliance.</li>
          <li>Update Platform features, modify evaluation processes, or change Platform functionality with reasonable notice to users.</li>
        </ul>
      </>
    ),
  },
  {
    id: "github-oauth",
    title: "GitHub OAuth Authentication",
    content: (
      <>
        <p>
          MentriQ Forge provides GitHub OAuth as an authentication method. By using GitHub OAuth:
        </p>
        <ul>
          <li>You authorize MentriQ Forge to access your GitHub public profile information as described in our Privacy Policy.</li>
          <li>You represent that you are the owner of the GitHub account used for authentication.</li>
          <li>You agree to comply with GitHub's Terms of Service and Privacy Policy in addition to these Terms.</li>
          <li>MentriQ is not responsible for any issues arising from your GitHub account, including but not limited to account suspension, data loss, or unauthorized access.</li>
          <li>You may disconnect your GitHub account from your profile settings at any time.</li>
        </ul>
      </>
    ),
  },
  {
    id: "project-submissions",
    title: "Project Submissions &amp; Intellectual Property",
    content: (
      <>
        <h3>Ownership of Submitted Projects</h3>
        <p>
          As between you and MentriQ, you retain full ownership of your project submissions,
          including code, documentation, designs, and any accompanying materials ("Submitted Work").
          MentriQ does not claim ownership of your Submitted Work.
        </p>
        <h3>License to MentriQ</h3>
        <p>
          By submitting work to the Platform, you grant MentriQ a non-exclusive, royalty-free,
          worldwide, limited license to:
        </p>
        <ul>
          <li>Store, display, and process your Submitted Work for the purposes of evaluation and hiring.</li>
          <li>Share your Submitted Work with companies and evaluators for assessment.</li>
          <li>Use anonymized aspects of your Submitted Work for Platform improvement and demonstration purposes.</li>
        </ul>
        <h3>License to Companies</h3>
        <p>
          When you submit work in response to a company's project, you grant the company a
          non-exclusive, royalty-free license to view, evaluate, and retain copies of your submitted
          work solely for the purpose of evaluating your candidacy. Companies may not use your
          Submitted Work for commercial purposes without your explicit written consent.
        </p>
        <h3>No Transfer of Ownership</h3>
        <p>
          These Terms do not transfer any intellectual property rights from you to MentriQ or to
          any company. You retain all rights to your Submitted Work, subject to the limited licenses
          granted above.
        </p>
      </>
    ),
  },
  {
    id: "company-confidential",
    title: "Company Confidential Projects",
    content: (
      <>
        <p>
          Companies may designate project assessments as confidential. When you apply to or
          participate in a confidential project:
        </p>
        <ul>
          <li>You agree not to disclose, share, publish, or reproduce any part of the project brief, assessment criteria, or related confidential materials outside the Platform.</li>
          <li>You agree not to discuss the confidential project with any third party, including on public forums, social media, or portfolio platforms.</li>
          <li>Your Submitted Work for a confidential project may be shared with the company for evaluation purposes but must not be displayed on your public portfolio or GitHub profile without the company's prior written consent.</li>
          <li>Violation of confidentiality terms may result in immediate account termination and legal action for damages.</li>
        </ul>
      </>
    ),
  },
  {
    id: "evaluation-process",
    title: "Evaluation Process",
    content: (
      <>
        <ul>
          <li>Evaluations are conducted based on criteria established by companies and may be supplemented by MentriQ's rubric-based evaluation system.</li>
          <li>Evaluations are subjective and based on the professional judgment of the evaluator. MentriQ does not guarantee any particular evaluation outcome.</li>
          <li>Candidates may receive feedback on their submissions. Feedback is provided for guidance purposes and does not guarantee improvement in future evaluations.</li>
          <li>Companies retain sole discretion over hiring decisions. MentriQ does not guarantee that any candidate will be hired or that any company will fill its positions.</li>
          <li>Evaluation results are confidential between the candidate and the evaluating company unless otherwise specified.</li>
        </ul>
      </>
    ),
  },
  {
    id: "prohibited-activities",
    title: "Prohibited Activities",
    content: (
      <>
        <p>You agree not to engage in any of the following prohibited activities:</p>
        <ul>
          <li><strong>Illegal Use:</strong> Using the Platform for any unlawful purpose or in violation of any applicable local, state, national, or international law.</li>
          <li><strong>Unauthorized Access:</strong> Attempting to access, interfere with, or bypass security measures of the Platform, other users' accounts, or MentriQ's systems.</li>
          <li><strong>Data Scraping:</strong> Scraping, crawling, or harvesting any data from the Platform without prior written consent.</li>
          <li><strong>Abuse:</strong> Harassing, threatening, or abusing any user, evaluator, or MentriQ employee.</li>
          <li><strong>Spam:</strong> Sending unsolicited communications through the Platform or using the Platform to collect information for spamming purposes.</li>
          <li><strong>Manipulation:</strong> Artificially inflating or deflating evaluation scores, creating fake submissions, or otherwise manipulating Platform metrics.</li>
          <li><strong>Competitive Harm:</strong> Using the Platform to recruit users for competing platforms or services.</li>
          <li><strong>Reverse Engineering:</strong> Decompiling, reverse engineering, or disassembling the Platform or its components.</li>
          <li><strong>Malicious Code:</strong> Introducing viruses, worms, Trojan horses, or any other malicious code into the Platform.</li>
        </ul>
      </>
    ),
  },
  {
    id: "fake-accounts",
    title: "Fake Accounts &amp; Fraud Prevention",
    content: (
      <>
        <p>
          MentriQ Forge maintains a zero-tolerance policy for fake accounts and fraudulent
          activity. The following actions are strictly prohibited and will result in permanent
          account suspension and potential legal action:
        </p>
        <ul>
          <li>Creating multiple accounts for the purpose of manipulating evaluations or bypassing Platform restrictions.</li>
          <li>Using false identities, including fake names, fabricated credentials, or misrepresented company affiliations.</li>
          <li>Impersonating another person or entity, including MentriQ employees, evaluators, or company representatives.</li>
          <li>Using stolen or unauthorized payment methods for any Platform services.</li>
          <li>Engaging in any activity that artificially inflates project application counts, evaluation scores, or Platform engagement metrics.</li>
          <li>Submitting fraudulent or fabricated project work, including code, documentation, or other materials that the user did not create.</li>
        </ul>
        <p>
          MentriQ reserves the right to verify user identities through additional documentation
          requests. Failure to provide satisfactory verification may result in account suspension or
          termination.
        </p>
      </>
    ),
  },
  {
    id: "plagiarism",
    title: "Plagiarism &amp; Original Work",
    content: (
      <>
        <p>
          MentriQ Forge is built on the principle of authentic skill demonstration. All project
          submissions must represent the original work of the submitting candidate.
        </p>
        <ul>
          <li><strong>Original Work:</strong> Candidates must submit work that they have personally created. Using someone else's code, designs, or content without proper attribution constitutes plagiarism.</li>
          <li><strong>Open Source Attribution:</strong> If your submission incorporates open-source libraries or code, you must comply with the respective license terms and provide proper attribution.</li>
          <li><strong>Detection:</strong> MentriQ reserves the right to use plagiarism detection tools to verify the originality of submissions.</li>
          <li><strong>Consequences:</strong> Plagiarism in any form will result in immediate disqualification from the relevant project, account suspension, and potential permanent ban from the Platform.</li>
        </ul>
      </>
    ),
  },
  {
    id: "ai-generated-content",
    title: "AI-Generated Submissions Disclosure",
    content: (
      <>
        <p>
          MentriQ Forge recognizes the growing role of AI tools in software development and
          content creation. To maintain transparency and fairness in evaluations:
        </p>
        <ul>
          <li><strong>Mandatory Disclosure:</strong> Candidates must clearly disclose if and to what extent AI-assisted tools (including but not limited to GitHub Copilot, ChatGPT, Claude, or similar) were used in creating their project submissions.</li>
          <li><strong>Acceptable Use:</strong> Using AI tools as aids (e.g., debugging, code suggestions, documentation assistance) is generally acceptable, provided the candidate has substantially directed, reviewed, and understood the output.</li>
          <li><strong>Prohibited Use:</strong> Submitting entirely AI-generated work without meaningful human contribution or without disclosure is prohibited and treated as a form of misrepresentation.</li>
          <li><strong>Company Discretion:</strong> Companies may specify the extent to which AI tools are permitted or prohibited in their project assessments. Candidates must comply with such requirements.</li>
          <li><strong>Disclosure Method:</strong> AI disclosure should be included in a comment at the top of the submission or in a dedicated field provided in the submission form.</li>
          <li><strong>Non-Compliance:</strong> Failure to disclose AI usage when required may result in disqualification, score reduction, or account suspension at the sole discretion of MentriQ or the evaluating company.</li>
        </ul>
      </>
    ),
  },
  {
    id: "account-suspension",
    title: "Account Suspension &amp; Termination",
    content: (
      <>
        <h3>Suspension</h3>
        <p>
          MentriQ may suspend your account immediately, without prior notice, if:
        </p>
        <ul>
          <li>You violate any provision of these Terms.</li>
          <li>Your conduct poses a security risk to the Platform or other users.</li>
          <li>You engage in fraudulent, abusive, or illegal activities.</li>
          <li>Required by applicable law or regulatory authority.</li>
        </ul>
        <h3>Termination by User</h3>
        <p>
          You may terminate your account at any time by:
        </p>
        <ul>
          <li>Deleting your account through the Platform settings, or</li>
          <li>Contacting our support team at support@mentriqtechnologies.in</li>
        </ul>
        <h3>Termination by MentriQ</h3>
        <p>
          MentriQ may terminate your account for any reason, including:
        </p>
        <ul>
          <li>Extended period of inactivity (12 months or more).</li>
          <li>Violation of these Terms.</li>
          <li>At our sole discretion, with 30 days' notice.</li>
        </ul>
        <h3>Effect of Termination</h3>
        <p>
          Upon termination: (a) your access to the Platform will cease immediately; (b) your
          personal data will be processed in accordance with our Privacy Policy and data retention
          practices; (c) any licenses granted to MentriQ and companies regarding Submitted Work will
          survive termination for the purpose of completing ongoing evaluations; and (d) sections
          of these Terms intended to survive termination shall remain in effect.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property Rights",
    content: (
      <>
        <h3>Platform IP</h3>
        <p>
          MentriQ Forge, including its code, design, logo, branding, and proprietary technology, is
          the exclusive property of MentriQ Technologies. You may not copy, modify, distribute,
          sell, or create derivative works of the Platform without our prior written consent.
        </p>
        <h3>User Content License</h3>
        <p>
          By posting, uploading, or submitting content through the Platform (other than Submitted
          Work governed by the Project Submissions section), you grant MentriQ a non-exclusive,
          royalty-free, perpetual, irrevocable license to use, reproduce, modify, and display such
          content for the purpose of operating and improving the Platform.
        </p>
        <h3>Feedback</h3>
        <p>
          Any feedback, suggestions, or ideas you provide regarding the Platform may be used by
          MentriQ without restriction or compensation.
        </p>
      </>
    ),
  },
  {
    id: "limitation-liability",
    title: "Limitation of Liability",
    content: (
      <>
        <p>
          To the maximum extent permitted by applicable law, MentriQ Technologies, its officers,
          directors, employees, and agents shall not be liable for:
        </p>
        <ul>
          <li>Any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses.</li>
          <li>Any damages resulting from: (a) your access to or use of or inability to access or use the Platform; (b) any conduct or content of any third party on the Platform; (c) any content obtained from the Platform; or (d) unauthorized access, use, or alteration of your transmissions or content.</li>
          <li>Any damages arising from hiring decisions, evaluation outcomes, or any employment-related decisions made based on Platform activities.</li>
        </ul>
        <p>
          In no event shall MentriQ's total liability to you exceed the amount paid by you (if any)
          to MentriQ in the twelve (12) months preceding the claim.
        </p>
        <p>
          Some jurisdictions do not allow the exclusion of certain warranties or the limitation or
          exclusion of liability for incidental or consequential damages. Accordingly, some of the
          above limitations may not apply to you.
        </p>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer of Warranties",
    content: (
      <>
        <p>
          THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY
          KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
        </p>
        <ul>
          <li>IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.</li>
          <li>WARRANTIES THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS.</li>
          <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR QUALITY OF ANY CONTENT, EVALUATIONS, OR USER PROFILES ON THE PLATFORM.</li>
        </ul>
        <p>
          MentriQ does not warrant, endorse, guarantee, or assume responsibility for any product or
          service advertised or offered by a third party through the Platform, including companies
          posting projects or candidates submitting work. MentriQ is not responsible for any
          transaction between users of the Platform, including hiring decisions, employment
          contracts, or payment arrangements.
        </p>
      </>
    ),
  },
  {
    id: "indemnification",
    title: "Indemnification",
    content: (
      <>
        <p>
          You agree to indemnify, defend, and hold harmless MentriQ Technologies, its affiliates,
          officers, directors, employees, and agents from and against any and all claims, damages,
          losses, liabilities, costs, and expenses (including reasonable legal fees) arising from or
          related to:
        </p>
        <ul>
          <li>Your use of the Platform in violation of these Terms.</li>
          <li>Your violation of any applicable law or regulation.</li>
          <li>Your Submitted Work or any content you provide through the Platform.</li>
          <li>Your violation of any third-party rights, including intellectual property or privacy rights.</li>
          <li>Any fraudulent, deceptive, or illegal activity engaged in by you.</li>
        </ul>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law &amp; Jurisdiction",
    content: (
      <>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of
          <strong> India</strong>.
        </p>
        <ul>
          <li><strong>Governing Law:</strong> The laws of the Republic of India shall govern these Terms, without regard to conflict of law principles.</li>
          <li><strong>Courts of Jurisdiction:</strong> Any disputes arising out of or relating to these Terms or the use of the Platform shall be subject to the exclusive jurisdiction of the courts located in <strong>[City, State, India]</strong>.</li>
          <li><strong>Applicable Legislation:</strong> These Terms are subject to the Indian Contract Act, 1872; the Information Technology Act, 2000; the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021; and the Digital Personal Data Protection Act, 2023.</li>
        </ul>
      </>
    ),
  },
  {
    id: "dispute-resolution",
    title: "Dispute Resolution",
    content: (
      <>
        <ul>
          <li><strong>Informal Resolution:</strong> Before initiating any formal dispute resolution process, you agree to first contact MentriQ at grievance@mentriqtechnologies.in to attempt to resolve the dispute informally.</li>
          <li><strong>Arbitration:</strong> If the dispute cannot be resolved informally within 30 days, the dispute shall be finally settled by arbitration in accordance with the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted in [City, State, India] by a sole arbitrator appointed by mutual agreement.</li>
          <li><strong>Language:</strong> The arbitration proceedings shall be conducted in English.</li>
          <li><strong>Class Action Waiver:</strong> You agree to resolve disputes with MentriQ on an individual basis and waive any right to participate in a class action, class arbitration, or representative proceeding.</li>
        </ul>
      </>
    ),
  },
  {
    id: "changes-to-terms",
    title: "Changes to These Terms",
    content: (
      <>
        <p>
          We reserve the right to modify these Terms at any time. Material changes will be notified
          to you via email or through a prominent notice on the Platform. Your continued use of the
          Platform after the effective date of the modified Terms constitutes your acceptance of the
          changes. If you do not agree to the modified Terms, you must stop using the Platform and
          terminate your account.
        </p>
        <p>
          <strong>Last Updated:</strong> July 2026
        </p>
      </>
    ),
  },
  {
    id: "grievance-officer",
    title: "Grievance Officer",
    content: (
      <>
        <p>
          In compliance with the Information Technology Act, 2000, the Information Technology
          (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the Digital
          Personal Data Protection Act, 2023, MentriQ Technologies has appointed a Grievance Officer
          to address user concerns regarding the Platform, including violations of these Terms.
        </p>
        <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-6 mt-6 shadow-sm">
          <h3 className="mt-0 text-forge-primary">Grievance Officer Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Name</p>
              <p className="text-slate-900 font-medium">[Grievance Officer Name]</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Designation</p>
              <p className="text-slate-900 font-medium">Grievance Officer &mdash; MentriQ Forge</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email</p>
              <p className="text-forge-primary font-medium">grievance@mentriqtechnologies.in</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Address</p>
              <p className="text-slate-900 font-medium">[Company Registered Address]</p>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Response Time</p>
              <p className="text-slate-900 font-medium">We acknowledge complaints within 24 hours and resolve them within 15 days from receipt, as prescribed under applicable law.</p>
            </div>
          </div>
        </div>
        <p className="mt-6">
          When filing a complaint, please provide your registered email address, a detailed
          description of the issue, and any supporting evidence. We will investigate and respond
          within the statutory timelines.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact Information",
    content: (
      <>
        <p>
          For questions, concerns, or inquiries regarding these Terms of Service, please contact us:
        </p>
        <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-6 mt-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Company</p>
              <p className="text-slate-900 font-medium">MentriQ Technologies</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Platform</p>
              <p className="text-slate-900 font-medium">MentriQ Forge</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email</p>
              <p className="text-forge-primary font-medium">support@mentriqtechnologies.in</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Grievance Officer</p>
              <p className="text-forge-primary font-medium">grievance@mentriqtechnologies.in</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Website</p>
              <a href="https://www.mentriqtechnologies.in" target="_blank" rel="noopener noreferrer" className="text-forge-primary font-medium hover:underline">https://www.mentriqtechnologies.in</a>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Address</p>
              <p className="text-slate-900 font-medium">34/501 Pratap Nagar Sec - 3, Jaipur, Rajasthan, India</p>
            </div>
          </div>
        </div>
      </>
    ),
  },
];

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileToc, setShowMobileToc] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i].id);
          break;
        }
      }
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return sections.filter((s) => s.title.toLowerCase().includes(q));
  }, [searchQuery]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setShowMobileToc(false);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-forge-primary/20 flex items-center justify-center shrink-0 ring-1 ring-white/10">
              <Scale className="w-7 h-7 text-forge-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
                Terms of Service
              </h1>
              <p className="text-white/50 mt-2 text-sm sm:text-base">
                Last updated: July 2026 &bull; MentriQ Forge by MentriQ Technologies
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">
          <button
            onClick={() => setShowMobileToc(!showMobileToc)}
            className="lg:hidden w-full flex items-center justify-between gap-2 p-3.5 bg-white border border-slate-200 rounded-xl mb-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-forge-primary" />
              Table of Contents
            </span>
            <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showMobileToc ? "rotate-180" : ""}`} />
          </button>

          {showMobileToc && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden bg-white border border-slate-200 rounded-xl p-2 mb-6 shadow-lg"
            >
              <nav className="space-y-0.5 max-h-72 overflow-y-auto">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                      activeSection === section.id
                        ? "bg-forge-primary/10 text-forge-primary font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forge-primary/20 focus:border-forge-primary transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>

              {searchQuery && searchResults && (
                <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-lg">
                  {searchResults.length > 0 ? (
                    <nav className="space-y-0.5">
                      {searchResults.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => {
                            scrollToSection(section.id);
                            setSearchQuery("");
                          }}
                          className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm text-slate-600 hover:text-forge-primary hover:bg-forge-primary/5 transition-colors"
                        >
                          {section.title}
                        </button>
                      ))}
                    </nav>
                  ) : (
                    <p className="px-3.5 py-3 text-sm text-slate-400">No sections found</p>
                  )}
                </div>
              )}

              <nav className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-0.5">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                        activeSection === section.id
                          ? "bg-forge-primary/10 text-forge-primary font-semibold shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </aside>

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-w-0 mt-6 lg:mt-0"
          >
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12">
                <div className="prose prose-slate max-w-none
                  prose-headings:font-heading prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
                  prose-h1:text-4xl prose-h1:mt-0 prose-h1:mb-8
                  prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-slate-100
                  prose-h3:text-lg prose-h3:mt-10 prose-h3:mb-4
                  prose-p:text-slate-600 prose-p:leading-7 prose-p:mb-5
                  prose-a:text-forge-primary prose-a:no-underline hover:prose-a:underline
                  prose-ul:text-slate-600 prose-ul:space-y-2 prose-ul:ml-0
                  prose-li:text-slate-600 prose-li:leading-7 prose-li:pl-1
                  prose-strong:text-slate-900 prose-strong:font-semibold
                  prose-ol:text-slate-600 prose-ol:space-y-2">

                  {termsContent.map((section, idx) => (
                    <section key={section.id} id={section.id} className="scroll-mt-28">
                      <h2 className="flex items-center gap-3">
                        {section.icon === "scale" && <Scale className="w-5 h-5 text-forge-primary shrink-0" />}
                        {section.title}
                      </h2>
                      {section.content}
                      {idx < termsContent.length - 1 && (
                        <hr className="mt-16 mb-0 border-slate-100" />
                      )}
                    </section>
                  ))}
                </div>
              </div>

              <div className="px-6 sm:px-8 lg:px-12 py-6 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <Link
                  to="/privacy-policy"
                  className="inline-flex items-center gap-2 text-sm font-medium text-forge-primary hover:text-forge-primary-dark transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Privacy Policy &rarr;
                </Link>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  Print Terms
                </button>
              </div>
            </div>
          </motion.main>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 bg-forge-primary text-white rounded-xl shadow-lg hover:bg-forge-primary-dark hover:shadow-xl transition-all flex items-center justify-center print:hidden"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default TermsOfService;
