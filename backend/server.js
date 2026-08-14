const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "https://mentriq-forge.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "MentriQ Forge API is running", time: new Date() });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/evaluations", require("./routes/evaluationRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/github", require("./routes/githubRoutes"));
app.use("/api/verification", require("./routes/verificationRoutes"));

// Admin analytics available to evaluators too
const { protect, authorize } = require("./middleware/auth");
const { getAdminAnalytics, getHiredCandidates, getDeletedItems } = require("./controllers/adminController");
app.get("/api/admin/analytics", protect, authorize("admin", "evaluator"), getAdminAnalytics);
app.get("/api/admin/hired-candidates", protect, authorize("admin", "evaluator"), getHiredCandidates);
app.get("/api/admin/deleted-items", protect, authorize("admin", "evaluator"), getDeletedItems);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MentriQ Forge API running on port ${PORT}`));
