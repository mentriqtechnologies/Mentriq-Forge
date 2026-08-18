import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import AuthCallback from "./pages/AuthCallback";
import Landing from "./pages/Landing";
import HowItWorks from "./pages/HowItWorks";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Projects from "./pages/Projects";
import ProjectRouter from "./pages/ProjectRouter";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyCandidateReview from "./pages/company/CompanyCandidateReview";
import CreateProject from "./pages/company/CreateProject";
import ProjectApplicants from "./pages/company/ProjectApplicants";
import CompanySettings from "./pages/company/CompanySettings";

import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import SubmitWork from "./pages/candidate/SubmitWork";
import Feedback from "./pages/candidate/Feedback";
import CandidateSettings from "./pages/candidate/CandidateSettings";

import AdminDashboard from "./pages/admin/AdminDashboard";
import EvaluateSubmission from "./pages/admin/EvaluateSubmission";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageJobs from "./pages/admin/ManageJobs";
import SubmissionsManager from "./pages/admin/SubmissionsManager";
import DeletedReports from "./pages/admin/DeletedReports";
import CandidateVerification from "./pages/admin/CandidateVerification";
import ApplicationsManager from "./pages/admin/ApplicationsManager";
import HiredCandidates from "./pages/admin/HiredCandidates";
import EditProject from "./pages/company/EditProject";
import EvaluatorDashboard from "./pages/evaluator/Dashboard";
import EvaluatorInterviewDashboard from "./pages/evaluator/InterviewDashboard";
import EvaluatorEvaluationResults from "./pages/evaluator/EvaluationResults";
import ApplicationDetail from "./pages/evaluator/ApplicationDetail";
import InterviewForm from "./pages/evaluator/InterviewForm";
import ApplicationQueue from "./pages/evaluator/ApplicationQueue";

const PublicLayout = ({ children }) => (
  <>
    <a href="#main-content" className="skip-link" aria-label="Skip to main content">
      Skip to main content
    </a>
    <Navbar />
    <main id="main-content" tabIndex={-1} className="outline-none">{children}</main>
  </>
);

const AuthLayout = ({ children }) => <DashboardLayout>{children}</DashboardLayout>;

function App() {
  return (
    <div className="min-h-screen bg-surface">
      <Routes>
        <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
        <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
        <Route path="/auth/callback" element={ <PublicLayout> <AuthCallback /> </PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
        <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
        <Route path="/reset-password/:token" element={<PublicLayout><ResetPassword /></PublicLayout>} />
        <Route path="/verify-email" element={<PublicLayout><VerifyEmail /></PublicLayout>} />
        <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
        <Route path="/terms-of-service" element={<PublicLayout><TermsOfService /></PublicLayout>} />
        <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
        <Route path="/projects/:id" element={<PublicLayout><ProjectRouter /></PublicLayout>} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["candidate", "company", "evaluator", "admin"]}>
              <AuthLayout><Profile /></AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/dashboard"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <AuthLayout><CompanyDashboard /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/candidate-review/:applicationId"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <AuthLayout><CompanyCandidateReview /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/projects/new"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <AuthLayout><CreateProject /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/projects/:projectId/applicants"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <AuthLayout><ProjectApplicants /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/settings"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <AuthLayout><CompanySettings /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/profile"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <AuthLayout><CompanySettings /></AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AuthLayout><CandidateDashboard /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/applications/:applicationId/submit"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AuthLayout><SubmitWork /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/feedback"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AuthLayout><Feedback /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/settings"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AuthLayout><CandidateSettings /></AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuthLayout><AdminDashboard /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuthLayout><AdminDashboard /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator/profile"
          element={
            <ProtectedRoute allowedRoles={["evaluator"]}>
              <AuthLayout><Profile /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator/dashboard"
          element={
            <ProtectedRoute allowedRoles={["evaluator"]}>
              <AuthLayout><EvaluatorDashboard /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator/applications"
          element={
            <ProtectedRoute allowedRoles={["evaluator"]}>
              <AuthLayout><ApplicationQueue /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator/submissions"
          element={
            <ProtectedRoute allowedRoles={["evaluator"]}>
              <AuthLayout><SubmissionsManager /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator/submissions/:submissionId/evaluate"
          element={
            <ProtectedRoute allowedRoles={["evaluator"]}>
              <AuthLayout><EvaluateSubmission /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator/application/:applicationId"
          element={
            <ProtectedRoute allowedRoles={["evaluator"]}>
              <AuthLayout><ApplicationDetail /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator/interview/form/:applicationId"
          element={
            <ProtectedRoute allowedRoles={["evaluator"]}>
              <AuthLayout><InterviewForm /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator/interview/dashboard"
          element={
            <ProtectedRoute allowedRoles={["evaluator"]}>
              <AuthLayout><EvaluatorInterviewDashboard /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator/evaluations/:applicationId"
          element={
            <ProtectedRoute allowedRoles={["evaluator"]}>
              <AuthLayout><EvaluatorEvaluationResults /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuthLayout><ManageUsers /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuthLayout><CandidateVerification /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/deleted-reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuthLayout><DeletedReports /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-jobs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuthLayout><ManageJobs /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuthLayout><ApplicationsManager /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hired-candidates"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuthLayout><HiredCandidates /></AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/projects/:projectId/edit"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <AuthLayout><EditProject /></AuthLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}



export default App;
