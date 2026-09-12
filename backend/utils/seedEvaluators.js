const EvaluatorMember = require("../models/EvaluatorMember");

const defaultMembers = [
  {
    name: "Aarav Sharma",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    evaluates: "Frontend Engineering",
    experience: "12+ years",
    rating: 4.9,
    reviews: 1240,
    bio: "Ex-senior engineer turned hiring advisor. Reviews component architecture, polish, and production-readiness of web submissions.",
    tags: ["React & Next.js", "UI/UX Quality", "Performance", "Accessibility"],
    sortOrder: 1,
  },
  {
    name: "Priya Patel",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    evaluates: "Full Stack & Backend",
    experience: "10+ years",
    rating: 4.8,
    reviews: 980,
    bio: "Full-stack generalist who digs into data modelling, API contracts, and clean, maintainable backends behind every submission.",
    tags: ["Node.js & Express", "Databases", "API Design", "Testing"],
    sortOrder: 2,
  },
  {
    name: "Rohan Mehta",
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
    evaluates: "AI & Data Science",
    experience: "9+ years",
    rating: 4.9,
    reviews: 1120,
    bio: "ML engineer and educator who scores problem framing, model quality, and the real-world impact of AI solutions.",
    tags: ["Machine Learning", "Data Analysis", "LLM Apps", "MLOps"],
    sortOrder: 3,
  },
  {
    name: "Sneha Iyer",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
    evaluates: "UI/UX & Product Design",
    experience: "8+ years",
    rating: 4.8,
    reviews: 860,
    bio: "Product designer reviewing visual craft, interaction flow, and how well submissions balance creativity with usability.",
    tags: ["Design Systems", "Prototyping", "Usability", "Visual Design"],
    sortOrder: 4,
  },
  {
    name: "Vikram Nair",
    photo: "https://randomuser.me/api/portraits/men/45.jpg",
    evaluates: "DevOps & Cloud",
    experience: "11+ years",
    rating: 4.7,
    reviews: 730,
    bio: "Cloud architect who evaluates infrastructure decisions, deployment readiness, and operational robustness.",
    tags: ["CI/CD", "AWS & GCP", "Containerisation", "Reliability"],
    sortOrder: 5,
  },
  {
    name: "Ananya Verma",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    evaluates: "Mobile Engineering",
    experience: "7+ years",
    rating: 4.8,
    reviews: 640,
    bio: "Mobile specialist focusing on cross-platform code, app performance, and delightful on-device experiences.",
    tags: ["React Native", "Flutter", "Native iOS/Android", "App Quality"],
    sortOrder: 6,
  },
];

const seedEvaluatorMembers = async () => {
  try {
    const count = await EvaluatorMember.countDocuments();
    if (count > 0) return;
    await EvaluatorMember.insertMany(defaultMembers);
    console.log(`Seeded ${defaultMembers.length} evaluator team members`);
  } catch (err) {
    console.error("Failed to seed evaluator members:", err.message);
  }
};

module.exports = { seedEvaluatorMembers };