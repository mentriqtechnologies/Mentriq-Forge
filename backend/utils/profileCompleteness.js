// Profile fields a candidate must complete before applying to any role
// (and before the MentriQ team reviews their profile for verification).
const REQUIRED_FIELDS = [
  { key: "name", label: "Full Name" },
  { key: "phone", label: "Phone Number" },
  { key: "bio", label: "Bio" },
  { key: "skills", label: "Skills" },
  { key: "experienceLevel", label: "Experience Level" },
  { key: "education", label: "Education" },
  { key: "resumeUrl", label: "Resume Link" },
  { key: "githubUsername", label: "GitHub Connection" },
  { key: "portfolioLinks", label: "Portfolio Link" },
  { key: "linkedinUrl", label: "LinkedIn URL" },
];

const getMissingProfileFields = (user) => {
  const missing = [];
  for (const { key, label } of REQUIRED_FIELDS) {
    const value = user[key];
    if (Array.isArray(value)) {
      if (value.length === 0) missing.push(label);
    } else if (!value || !String(value).trim()) {
      missing.push(label);
    }
  }
  return missing;
};

const isProfileComplete = (user) => getMissingProfileFields(user).length === 0;

module.exports = { getMissingProfileFields, isProfileComplete };
