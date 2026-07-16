import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, ChevronUp, Shield, ArrowLeft, FileText, Eye, CheckCircle } from "lucide-react";

const sections = [
  { id: "introduction", title: "Introduction" },
  { id: "information-we-collect", title: "Information We Collect" },
  { id: "how-we-collect", title: "How We Collect Information" },
  { id: "purpose-of-collection", title: "Purpose of Data Collection" },
  { id: "lawful-basis", title: "Lawful Basis for Processing" },
  { id: "github-oauth", title: "GitHub OAuth Integration" },
  { id: "cookies-tracking", title: "Cookies & Tracking Technologies" },
  { id: "jwt-authentication", title: "JWT Authentication & Security" },
  { id: "data-storage-security", title: "Data Storage & Security Measures" },
  { id: "data-sharing-disclosure", title: "Data Sharing & Disclosure" },
  { id: "data-retention", title: "Data Retention" },
  { id: "your-rights", title: "Your Rights Under DPDP Act" },
  { id: "account-deletion", title: "Account Deletion & Data Erasure" },
  { id: "children-privacy", title: "Children's Privacy" },
  { id: "third-party-links", title: "Third-Party Links & Services" },
  { id: "changes-to-policy", title: "Changes to This Policy" },
  { id: "grievance-officer", title: "Grievance Officer" },
  { id: "contact-us", title: "Contact Us" },
];

const policyContent = [
  {
    id: "introduction",
    title: "Introduction",
    icon: "shield",
    content: (
      <>
        <p>
          MentriQ Technologies ("MentriQ," "we," "us," or "our") operates MentriQ Forge
          ("the Platform"), a project-based hiring platform that connects companies with skilled
          candidates through real-world project evaluations. This Privacy Policy explains how we
          collect, use, store, process, and protect your personal data when you access or use the
          Platform.
        </p>
        <p>
          We are committed to protecting your privacy in compliance with the <strong>Digital Personal
          Data Protection Act, 2023 (DPDP Act, India)</strong>, the <strong>Information Technology Act,
          2000</strong>, and the <strong>Information Technology (Reasonable Security Practices and Procedures
          and Sensitive Personal Data or Information) Rules, 2011</strong>.
        </p>
        <p>
          By creating an account or using MentriQ Forge, you acknowledge that you have read and
          understood this Privacy Policy. If you do not agree, please do not use the Platform.
        </p>
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 mt-6">
          <p className="text-sm text-blue-800 mb-0">
            <strong>Platform Type:</strong> Skill-First Hiring Platform &mdash; Project-Based Assessments &bull; Candidate Accounts &bull; Company Accounts &bull; Admin Management
          </p>
        </div>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: (
      <>
        <p>We collect the following categories of personal data depending on your role and usage of the Platform:</p>
        <h3>Information You Provide Directly</h3>
        <ul>
          <li><strong>Account Registration Data:</strong> Full name, email address, password (hashed and salted), account role (candidate, company, evaluator, admin), and company name (if registering as a company).</li>
          <li><strong>Candidate Profile Data:</strong> Resume/CV uploads, portfolio links, GitHub profile URL, skills, work experience, education history, and project submissions.</li>
          <li><strong>Company Profile Data:</strong> Company name, company description, industry, company size, and company representative details.</li>
          <li><strong>Project Data:</strong> Project descriptions, assessment criteria, evaluation rubrics, and confidential project briefs created by companies.</li>
          <li><strong>Submission Data:</strong> Project submissions, code repositories, attachments, descriptions, and any accompanying notes.</li>
          <li><strong>Evaluation Data:</strong> Scores, feedback, ratings, and review comments provided by evaluators and companies.</li>
          <li><strong>Communication Data:</strong> Messages, inquiries, and support requests submitted through the Platform.</li>
        </ul>
        <h3>Information Collected Automatically</h3>
        <ul>
          <li><strong>Log Data:</strong> IP address, browser type and version, operating system, device information, pages visited, timestamps of access, and clickstream data.</li>
          <li><strong>Usage Data:</strong> Features accessed, projects viewed, applications submitted, time spent on pages, and interaction patterns.</li>
          <li><strong>JWT Token Data:</strong> Session tokens, token expiration timestamps, and refresh token metadata.</li>
          <li><strong>Cookie Data:</strong> Session cookies, preference cookies, and authentication cookies as described in the Cookies section.</li>
        </ul>
        <h3>Information from Third Parties</h3>
        <ul>
          <li><strong>GitHub OAuth Data:</strong> When you connect your GitHub account, we collect your GitHub username, public profile information, public repositories, and email address (if permissions granted). We do not access private repositories unless explicitly authorized for a project submission.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-collect",
    title: "How We Collect Information",
    content: (
      <>
        <p>We collect personal data through the following means:</p>
        <ul>
          <li><strong>Direct Registration:</strong> When you create an account using email and password.</li>
          <li><strong>GitHub OAuth:</strong> When you sign in or link your GitHub account via OAuth 2.0 authentication.</li>
          <li><strong>Form Submissions:</strong> When you upload resumes, submit projects, create assessments, or fill out profile forms.</li>
          <li><strong>Automated Tracking:</strong> Through cookies, server logs, and analytics technologies when you interact with the Platform.</li>
          <li><strong>API Interactions:</strong> When you or automated systems interact with our backend APIs.</li>
        </ul>
      </>
    ),
  },
  {
    id: "purpose-of-collection",
    title: "Purpose of Data Collection",
    content: (
      <>
        <p>We collect and process your personal data for the following purposes:</p>
        <ul>
          <li><strong>Platform Operation:</strong> To create and manage user accounts, authenticate users via JWT, authorize role-based access, and provide Platform functionality.</li>
          <li><strong>Project-Based Hiring:</strong> To enable companies to create project assessments, candidates to submit work, and evaluators to review submissions.</li>
          <li><strong>Profile Management:</strong> To maintain candidate portfolios, company profiles, and facilitate skill-based matching.</li>
          <li><strong>Resume &amp; GitHub Integration:</strong> To allow candidates to showcase their work and skills through uploaded resumes and connected GitHub profiles.</li>
          <li><strong>Communication:</strong> To send account-related notifications, project updates, evaluation results, and hiring-related communications.</li>
          <li><strong>Platform Improvement:</strong> To analyze usage patterns, improve user experience, and enhance Platform features.</li>
          <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes under Indian law.</li>
          <li><strong>Security:</strong> To detect, prevent, and respond to fraud, unauthorized access, and security incidents.</li>
        </ul>
      </>
    ),
  },
  {
    id: "lawful-basis",
    title: "Lawful Basis for Processing",
    content: (
      <>
        <p>Under the DPDP Act, 2023, we process your personal data on the following lawful bases:</p>
        <ul>
          <li><strong>Consent:</strong> We obtain your explicit consent before collecting and processing your personal data. You may withdraw consent at any time by contacting our Grievance Officer, subject to contractual or legal limitations.</li>
          <li><strong>Contractual Necessity:</strong> Processing is necessary for the performance of the Terms of Service and to provide you with access to the Platform features you have registered for.</li>
          <li><strong>Legal Obligation:</strong> Processing is necessary to comply with our legal obligations under Indian law, including the DPDP Act, IT Act, and judicial or regulatory requirements.</li>
          <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate interests in operating and improving the Platform, ensuring security, and preventing fraud, provided such interests do not override your fundamental rights.</li>
        </ul>
      </>
    ),
  },
  {
    id: "github-oauth",
    title: "GitHub OAuth Integration",
    content: (
      <>
        <p>
          MentriQ Forge offers GitHub OAuth authentication as an alternative to email/password
          registration. When you choose to sign in with GitHub:
        </p>
        <ul>
          <li>We use the OAuth 2.0 protocol to authenticate your identity without receiving or storing your GitHub password.</li>
          <li>We request access to your GitHub public profile information, including username, display name, avatar URL, and public email address.</li>
          <li>If you link your GitHub account as a candidate, we may access your public repository list to verify your coding activity and portfolio.</li>
          <li>We do <strong>not</strong> access your private repositories unless you explicitly authorize this for a specific project submission.</li>
          <li>You may disconnect your GitHub account at any time from your account settings. Disconnecting will not delete data already imported.</li>
          <li>GitHub's own privacy policy and terms apply to your use of their service. We encourage you to review GitHub's Privacy Policy at <a href="https://docs.github.com/en/site-policy/privacy-policies" target="_blank" rel="noopener noreferrer">https://docs.github.com/en/site-policy/privacy-policies</a>.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies-tracking",
    title: "Cookies &amp; Tracking Technologies",
    content: (
      <>
        <p>We use cookies and similar tracking technologies to enhance your experience on MentriQ Forge. Below is a description of the types of cookies we use:</p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-100/80">
                <th className="p-3.5 text-left font-semibold text-slate-700">Cookie Type</th>
                <th className="p-3.5 text-left font-semibold text-slate-700">Purpose</th>
                <th className="p-3.5 text-left font-semibold text-slate-700">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="p-3.5 font-medium text-slate-900">Essential / Session</td>
                <td className="p-3.5 text-slate-600">Maintain your login session, JWT token management, and authentication state</td>
                <td className="p-3.5 text-slate-600">Session / 24 hours</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3.5 font-medium text-slate-900">Preference</td>
                <td className="p-3.5 text-slate-600">Remember your UI preferences, theme selection, and language settings</td>
                <td className="p-3.5 text-slate-600">1 year</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3.5 font-medium text-slate-900">Analytics</td>
                <td className="p-3.5 text-slate-600">Collect anonymized usage data to improve Platform performance and user experience</td>
                <td className="p-3.5 text-slate-600">13 months</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-slate-900">Security</td>
                <td className="p-3.5 text-slate-600">Detect fraudulent activity, prevent CSRF attacks, and protect account integrity</td>
                <td className="p-3.5 text-slate-600">Session</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-6">
          You can control cookie preferences through your browser settings. Disabling essential cookies
          may affect the functionality of the Platform. We do not use cookies for targeted advertising
          or third-party marketing.
        </p>
      </>
    ),
  },
  {
    id: "jwt-authentication",
    title: "JWT Authentication &amp; Security",
    content: (
      <>
        <p>
          MentriQ Forge uses JSON Web Token (JWT) based authentication for secure, stateless session
          management. Key security measures include:
        </p>
        <ul>
          <li><strong>Token Generation:</strong> JWTs are generated server-side using a secure secret key and signed with industry-standard algorithms (HS256).</li>
          <li><strong>Token Storage:</strong> JWTs are stored in localStorage on the client side and transmitted via HTTP Authorization headers (Bearer scheme) over HTTPS.</li>
          <li><strong>Token Expiration:</strong> Access tokens have a limited lifespan and are validated on every API request.</li>
          <li><strong>Password Security:</strong> Passwords are never stored in plain text. They are hashed and salted using bcrypt before being stored in MongoDB.</li>
          <li><strong>Session Management:</strong> Users can log out from any active session, which invalidates the token on the client side. Server-side token blacklisting is also supported for security events.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-storage-security",
    title: "Data Storage &amp; Security Measures",
    content: (
      <>
        <p>
          Your data is stored and processed using the following security infrastructure:
        </p>
        <ul>
          <li><strong>Database:</strong> Data is stored in MongoDB with encryption at rest. Database access is restricted to authorized services through network security groups and firewalls.</li>
          <li><strong>Encryption in Transit:</strong> All data transmitted between clients and servers is encrypted using TLS 1.2 or higher.</li>
          <li><strong>Encryption at Rest:</strong> Database storage volumes are encrypted using AES-256 encryption.</li>
          <li><strong>Access Controls:</strong> Role-based access control (RBAC) ensures that users can only access data appropriate to their role (candidate, company, evaluator, admin).</li>
          <li><strong>API Security:</strong> All API endpoints are protected by JWT authentication middleware. Rate limiting and CORS policies are enforced.</li>
          <li><strong>Infrastructure Security:</strong> Our servers are hosted in secure data centers with physical access controls, 24/7 monitoring, and DDoS protection.</li>
        </ul>
        <p>
          While we implement industry-standard security measures, no method of electronic storage or
          transmission is 100% secure. We cannot guarantee absolute security of your data.
        </p>
      </>
    ),
  },
  {
    id: "data-sharing-disclosure",
    title: "Data Sharing &amp; Disclosure",
    content: (
      <>
        <p>We may share your personal data in the following circumstances:</p>
        <h3>Within the Platform</h3>
        <ul>
          <li><strong>Candidates to Companies:</strong> When you apply to a project, your profile, resume, portfolio links, GitHub profile, and project submissions are shared with the company that created the project for evaluation purposes.</li>
          <li><strong>Companies to Evaluators:</strong> Companies' project assessment materials may be shared with MentriQ evaluators for rubric-based evaluation.</li>
          <li><strong>Admin Access:</strong> Platform administrators have access to data necessary for Platform maintenance, security, and compliance.</li>
        </ul>
        <h3>Third-Party Service Providers</h3>
        <ul>
          <li><strong>Cloud Infrastructure:</strong> We use MongoDB Atlas for database hosting and cloud infrastructure providers for server hosting. These providers are GDPR and DPDP Act compliant.</li>
          <li><strong>GitHub:</strong> When you use GitHub OAuth, your data is shared with GitHub subject to their privacy policy.</li>
          <li><strong>Email Services:</strong> We may use transactional email services for account-related communications.</li>
        </ul>
        <h3>Legal Compliance</h3>
        <ul>
          <li>We may disclose your data if required by law, court order, or governmental authority in India.</li>
          <li>We may disclose data to enforce our Terms of Service, protect our rights, or investigate fraud and policy violations.</li>
        </ul>
        <p>
          We do <strong>not</strong> sell, rent, or trade your personal data to third parties for
          marketing or advertising purposes.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: (
      <>
        <p>
          We retain your personal data only as long as necessary to fulfill the purposes described in
          this Privacy Policy, or as required by applicable law:
        </p>
        <ul>
          <li><strong>Active Accounts:</strong> Data is retained for the duration of your active account on the Platform.</li>
          <li><strong>Deleted Accounts:</strong> Upon account deletion, we retain certain data for a period of 90 days for legal and audit purposes before permanent erasure, except where retention is required by law.</li>
          <li><strong>Backup Retention:</strong> Archived or backed-up data may be retained for up to 180 days before complete deletion from all storage systems.</li>
          <li><strong>Legal Holds:</strong> Data subject to ongoing litigation, investigation, or legal proceedings will be retained until the matter is resolved.</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights Under the DPDP Act",
    content: (
      <>
        <p>
          Under the Digital Personal Data Protection Act, 2023 (DPDP Act, India), you have the
          following rights regarding your personal data:
        </p>
        <ul>
          <li><strong>Right to Access:</strong> You have the right to request a summary of the personal data we hold about you and how it has been processed.</li>
          <li><strong>Right to Correction:</strong> You have the right to correct inaccurate or incomplete personal data. You can update most data directly through your account settings.</li>
          <li><strong>Right to Erasure:</strong> You have the right to request deletion of your personal data, subject to certain exceptions (e.g., legal obligations, ongoing disputes).</li>
          <li><strong>Right to Grievance Redressal:</strong> You have the right to file a grievance regarding the processing of your personal data. We will respond within the timelines prescribed by the DPDP Act.</li>
          <li><strong>Right to Withdraw Consent:</strong> You have the right to withdraw consent previously provided for processing of your personal data. Withdrawal will not affect the lawfulness of processing conducted prior to withdrawal.</li>
          <li><strong>Right to Nominate:</strong> You have the right to nominate a person who will exercise your rights under the DPDP Act in the event of your death or incapacity.</li>
        </ul>
        <p>
          To exercise any of these rights, please contact our Grievance Officer using the details
          provided in the Grievance Officer section below. We will respond to your request within the
          timelines prescribed under the DPDP Act.
        </p>
      </>
    ),
  },
  {
    id: "account-deletion",
    title: "Account Deletion &amp; Data Erasure Request",
    content: (
      <>
        <p>
          You may request account deletion and data erasure through the following methods:
        </p>
        <ul>
          <li><strong>Self-Service Deletion:</strong> You can delete your account from the Platform settings page. This will initiate the account deletion process.</li>
          <li><strong>Data Erasure Request:</strong> You can submit a formal data erasure request by contacting our Grievance Officer via email at grievance@mentriqtechnologies.in.</li>
        </ul>
        <p><strong>Account Deletion Process:</strong></p>
        <ol>
          <li>Upon initiating account deletion, your account will be deactivated immediately and will no longer be accessible.</li>
          <li>Your profile, resumes, project submissions, and personal data will be scheduled for permanent deletion within 90 days.</li>
          <li>Certain data may be retained for legal compliance, fraud prevention, or audit purposes as required by applicable law.</li>
          <li>Data that has been shared with other users (e.g., project submissions shared with companies) may not be fully deletable from the recipient's records.</li>
        </ol>
        <p>
          We will confirm the deletion of your data via email once the process is complete.
        </p>
      </>
    ),
  },
  {
    id: "children-privacy",
    title: "Children's Privacy",
    content: (
      <>
        <p>
          MentriQ Forge is not intended for use by individuals under the age of 18. We do not
          knowingly collect personal data from minors. If we become aware that a minor has created an
          account or provided personal data, we will take steps to delete such data and terminate the
          account without delay. If you believe a minor has provided us with personal data, please
          contact our Grievance Officer immediately.
        </p>
      </>
    ),
  },
  {
    id: "third-party-links",
    title: "Third-Party Links &amp; Services",
    content: (
      <>
        <p>
          The Platform may contain links to third-party websites, including GitHub, portfolio links
          provided by candidates, and external resources. This Privacy Policy applies only to MentriQ
          Forge. We are not responsible for the privacy practices of third-party websites. We encourage
          you to review the privacy policies of any third-party services you access through the
          Platform.
        </p>
      </>
    ),
  },
  {
    id: "changes-to-policy",
    title: "Changes to This Policy",
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices,
          legal requirements, or Platform features. Material changes will be notified to you via email
          or through a notice on the Platform. Your continued use of the Platform after such changes
          constitutes your acceptance of the updated policy. We encourage you to review this policy
          periodically.
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
          In compliance with the Digital Personal Data Protection Act, 2023, and the Information
          Technology Act, 2000 (including the IT (Intermediary Guidelines and Digital Media Ethics
          Code) Rules, 2021), MentriQ Technologies has appointed a Grievance Officer to address
          any concerns, complaints, or queries regarding the processing of your personal data.
        </p>
        <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-6 mt-6 shadow-sm">
          <h3 className="mt-0 text-forge-primary">Grievance Officer Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Name</p>
              <p className="text-slate-900 font-medium">Mannat Kanwar</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Designation</p>
              <p className="text-slate-900 font-medium">Grievance Officer &mdash; Data Protection</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email</p>
              <p className="text-forge-primary font-medium">grievance@mentriqtechnologies.in</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Address</p>
              <p className="text-slate-900 font-medium">34/501 Pratap Nagar Sec - 3, Jaipur, Rajasthan, India</p>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Response Time</p>
              <p className="text-slate-900 font-medium">We acknowledge receipt of grievances within 24 hours and resolve them within the timelines prescribed under the DPDP Act (not exceeding 30 days from receipt).</p>
            </div>
          </div>
        </div>
        <p className="mt-6">
          When filing a grievance, please provide your registered email address, a detailed
          description of your concern, and any supporting documentation. You may also escalate
          unresolved grievances to the designated Data Protection Board of India (DPBI) after
          exhausting our internal grievance redressal process.
        </p>
      </>
    ),
  },
  {
    id: "contact-us",
    title: "Contact Us",
    content: (
      <>
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or our data
          practices, please contact us:
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

const PrivacyPolicy = () => {
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
              <Shield className="w-7 h-7 text-forge-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white tracking-tight">
                Privacy Policy
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
                  placeholder="Search policy..."
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

                  {policyContent.map((section, idx) => (
                    <section key={section.id} id={section.id} className="scroll-mt-28">
                      <h2 className="flex items-center gap-3">
                        {section.icon === "shield" && <Shield className="w-5 h-5 text-forge-primary shrink-0" />}
                        {section.title}
                      </h2>
                      {section.content}
                      {idx < policyContent.length - 1 && (
                        <hr className="mt-16 mb-0 border-slate-100" />
                      )}
                    </section>
                  ))}
                </div>
              </div>

              <div className="px-6 sm:px-8 lg:px-12 py-6 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <Link
                  to="/terms-of-service"
                  className="inline-flex items-center gap-2 text-sm font-medium text-forge-primary hover:text-forge-primary-dark transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Terms of Service &rarr;
                </Link>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  Print Policy
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

export default PrivacyPolicy;
