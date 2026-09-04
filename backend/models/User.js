const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { encrypt, decrypt } = require("../utils/encrypt");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["candidate", "company", "evaluator", "admin"],
      default: "candidate",
    },

    // Candidate-specific fields
    skills: [{ type: String }],
    experienceLevel: {
      type: String,
      enum: [
        "student",
        "fresher",
        "professional",
        "career_switcher",
        "freelancer",
        "internship_seeker",
      ],
    },
    education: { type: String },
    resumeUrl: { type: String },
    portfolioLinks: [{ type: String }],
    linkedinUrl: { type: String },

    // Company-specific fields
    companyName: { type: String },
    industry: { type: String },
    companySize: { type: String },
    website: { type: String },

    // GitHub OAuth (optional — only populated when user connects GitHub)
    githubId: { type: String, unique: true, sparse: true },
    githubUsername: { type: String },
    githubEmail: { type: String },
    githubAvatar: { type: String },
    githubProfile: { type: String },
    githubAccessToken: { type: String },
    githubConnectedAt: { type: Date },
    githubPublicRepos: { type: Number },
    githubFollowers: { type: Number },
    githubFollowing: { type: Number },
    githubBio: { type: String },
    githubCompany: { type: String },
    githubLocation: { type: String },

    // Google OAuth (optional — only populated when user signs in with Gmail)
    googleId: { type: String, unique: true, sparse: true },
    googleEmail: { type: String },
    googleName: { type: String },
    googlePicture: { type: String },
    googleConnectedAt: { type: Date },

    // Firebase Auth (optional — set when the account was created/signed in via Firebase)
    firebaseUid: { type: String, unique: true, sparse: true },

    // Common
    phone: { type: String },
    bio: { type: String },
    avatarUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Candidate verification (MentriQ team review)
    // none → candidate hasn't submitted for review; pending → under review;
    // approved → visible to companies; rejected → reason provided, can resubmit
    verificationStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    verificationReason: { type: String, default: "" },
    verificationSubmittedAt: { type: Date },
    verificationReviewedAt: { type: Date },
    verificationReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Password reset
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

// Encrypt password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Encrypt GitHub access token before save
userSchema.pre("save", function (next) {
  if (!this.isModified("githubAccessToken") || !this.githubAccessToken) return next();
  if (this.githubAccessToken.includes(":")) return next();
  this.githubAccessToken = encrypt(this.githubAccessToken);
  next();
});

// Enforce the "active user only" rule at the model level. Self-registered
// candidates/companies are only allowed to exist once they have activated their
// account (verified their email via the activation link). Un-activated
// registrations are rejected here — they must never be stored in the database.
// Staff (admin/evaluator) accounts created directly by admins are exempt, as
// are Google/Firebase sign-ins whose email is already verified by the provider.
userSchema.pre("validate", function (next) {
  const selfSignedRoles = ["candidate", "company"];
  if (selfSignedRoles.includes(this.role) && !this.isVerified) {
    return next(
      new Error(
        "Account is not activated yet. A candidate/company must click the activation link sent to their email before it can be created."
      )
    );
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getDecryptedGithubToken = function () {
  return decrypt(this.githubAccessToken);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.githubAccessToken;
  return obj;
};

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ verificationStatus: 1, verificationSubmittedAt: 1 });

module.exports = mongoose.model("User", userSchema);