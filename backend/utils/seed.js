// Run with: npm run seed
// Populates demo users (company, candidate, evaluator, admin) and one project.
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const Project = require("../models/Project");

dotenv.config();

const run = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Project.deleteMany({})]);

  const admin = await User.create({
    name: "MentriQ Forge - Admin",
    email: "admin@example.com",
    password: "Admin@123",
    role: "admin",
  });

  const evaluator = await User.create({
    name: "MentriQ Forge - Evaluator Team",
    email: "evaluator@example.com",
    password: "Eval@123",
    role: "evaluator",
  });

  const company = await User.create({
    name: "Recruiter",
    email: "company@example.com",
    password: "Company@123",
    role: "company",
    companyName: "TechNova Solutions",
    industry: "IT & Product",
  });

  const candidate = await User.create({
    name: "Aarav Sharma",
    email: "candidate@example.com",
    password: "Candidate@123",
    role: "candidate",
    skills: ["React", "Node.js", "MongoDB"],
    experienceLevel: "fresher",
  });

  await Project.create({
    company: company._id,
    title: "Build a Task Management Dashboard",
    description:
      "Design and build a full-stack task management dashboard with authentication, drag-and-drop boards, and REST API.",
    domain: "Full Stack",
    skillsRequired: ["React", "Node.js", "MongoDB"],
    difficulty: "intermediate",
    type: "simulated",
    deliverables: ["GitHub repo", "Live demo", "README with setup instructions"],
    durationDays: 7,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    hiringGoal: 2,
  });

  console.log("\n✅ Seed data created successfully!\n");
  console.log("=== MentriQ FORGE - EVALUATION TEAM ===");
  console.log("  👨‍💼 Admin:     admin@example.com / Admin@123");
  console.log("  👥 Evaluator: evaluator@example.com / Eval@123\n");
  console.log("=== DEMO USERS ===");
  console.log("  🏢 Company:   company@example.com / Company@123");
  console.log("  👨‍💻 Candidate: candidate@example.com / Candidate@123\n");
  console.log("💡 Tip: Admin/Evaluators review candidate submissions at /admin/submissions");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
