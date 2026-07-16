const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const normalizeEmail = (value = "") => value.trim().toLowerCase();

const buildEmailQuery = (email) => {
  const normalizedEmail = normalizeEmail(email);
  return {
    email: {
      $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    },
  };
};

// @desc Register a new user (candidate / company / evaluator)
// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName, skills, experienceLevel } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!name || !normalizedEmail || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const userExists = await User.findOne(buildEmailQuery(normalizedEmail));
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  // Only admins can create evaluator/admin accounts through a separate seed/admin flow.
  const allowedSelfSignupRoles = ["candidate", "company"];
  const finalRole = allowedSelfSignupRoles.includes(role) ? role : "candidate";

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: finalRole,
    companyName: finalRole === "company" ? companyName : undefined,
    skills: finalRole === "candidate" ? skills : undefined,
    experienceLevel: finalRole === "candidate" ? experienceLevel : undefined,
  });

  res.status(201).json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @desc Login user
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne(buildEmailQuery(normalizedEmail)).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.email !== normalizedEmail) {
    user.email = normalizedEmail;
    await user.save();
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Account has been deactivated");
  }

  res.json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @desc Get current logged-in user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc Update profile
// @route PUT /api/auth/me
const updateMe = asyncHandler(async (req, res) => {
  const updatableFields = [
    "name",
    "phone",
    "bio",
    "avatarUrl",
    "skills",
    "experienceLevel",
    "resumeUrl",
    "portfolioLinks",
    "companyName",
    "industry",
    "companySize",
    "website",
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  const updated = await req.user.save();
  res.json({ success: true, user: updated.toSafeObject() });
});

// @desc Redirect user to GitHub OAuth (login / signup)
// @route GET /api/auth/github
const githubAuth = (req, res) => {
  const redirectUri = `${process.env.SERVER_URL}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email`;
  res.redirect(url);
};

// @desc GitHub OAuth callback (signup/login OR account linking)
// @route GET /api/auth/github/callback
const githubCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  if (!code) {
    res.status(400);
    throw new Error("Missing authorization code");
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  // const tokenData = await tokenRes.json();
  // if (!tokenData.access_token) {
  //   res.status(401);
  //   throw new Error("Failed to get GitHub access token");
  // }

  const tokenData = await tokenRes.json();

console.log("GitHub Token Response:", tokenData);

if (!tokenData.access_token) {
  res.status(401);
  throw new Error(JSON.stringify(tokenData));
}

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const githubUser = await userRes.json();

  const emailRes = await fetch("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const emails = await emailRes.json();
  const primaryEmail = emails.find((e) => e.primary)?.email || githubUser.email;

  // --- ACCOUNT LINKING FLOW (state contains signed user ID) ---
  if (state) {
    try {
      const decoded = jwt.verify(state, process.env.JWT_SECRET);
      if (decoded.action === "link" && decoded.id) {
        const existing = await User.findOne({ githubId: String(githubUser.id) });
        if (existing && existing._id.toString() !== decoded.id) {
          return res.redirect(`${process.env.CLIENT_URL}/profile?github_error=This+GitHub+account+is+already+linked+to+another+user`);
        }

        const targetUser = await User.findById(decoded.id);
        if (!targetUser) {
          return res.redirect(`${process.env.CLIENT_URL}/profile?github_error=User+not+found`);
        }

        targetUser.githubId = String(githubUser.id);
        targetUser.githubUsername = githubUser.login;
        targetUser.githubEmail = primaryEmail;
        targetUser.githubAvatar = githubUser.avatar_url;
        targetUser.githubProfile = githubUser.html_url;
        targetUser.githubAccessToken = tokenData.access_token;
        targetUser.githubConnectedAt = new Date();
        targetUser.githubPublicRepos = githubUser.public_repos;
        targetUser.githubFollowers = githubUser.followers;
        targetUser.githubFollowing = githubUser.following;
        targetUser.githubBio = githubUser.bio;
        targetUser.githubCompany = githubUser.company;
        targetUser.githubLocation = githubUser.location;
        if (!targetUser.avatarUrl && githubUser.avatar_url) {
          targetUser.avatarUrl = githubUser.avatar_url;
        }
        await targetUser.save();

        return res.redirect(`${process.env.CLIENT_URL}/profile?github=connected`);
      }
    } catch {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=Invalid+link+state`);
    }
  }

  // --- SIGNUP / LOGIN FLOW (no state) ---
  let user = await User.findOne({ githubId: String(githubUser.id) });
  if (!user && primaryEmail) {
    user = await User.findOne({ email: primaryEmail });
  }

  if (user) {
    user.githubId = String(githubUser.id);
    user.githubUsername = githubUser.login;
    user.githubEmail = primaryEmail;
    user.githubAvatar = githubUser.avatar_url;
    user.githubProfile = githubUser.html_url;
    user.githubAccessToken = tokenData.access_token;
    user.githubConnectedAt = user.githubConnectedAt || new Date();
    user.githubPublicRepos = githubUser.public_repos;
    user.githubFollowers = githubUser.followers;
    user.githubFollowing = githubUser.following;
    user.githubBio = githubUser.bio;
    user.githubCompany = githubUser.company;
    user.githubLocation = githubUser.location;
    if (!user.avatarUrl && githubUser.avatar_url) {
      user.avatarUrl = githubUser.avatar_url;
    }
    await user.save();
  } else {
    user = await User.create({
      name: githubUser.name || githubUser.login,
      email: primaryEmail || `${githubUser.login}@github.local`,
      githubId: String(githubUser.id),
      githubUsername: githubUser.login,
      githubEmail: primaryEmail,
      githubAvatar: githubUser.avatar_url,
      githubProfile: githubUser.html_url,
      githubAccessToken: tokenData.access_token,
      githubConnectedAt: new Date(),
      githubPublicRepos: githubUser.public_repos,
      githubFollowers: githubUser.followers,
      githubFollowing: githubUser.following,
      githubBio: githubUser.bio,
      githubCompany: githubUser.company,
      githubLocation: githubUser.location,
      avatarUrl: githubUser.avatar_url,
      role: "candidate",
      isVerified: true,
    });
  }

  const token = generateToken(user._id);
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user.toSafeObject()))}`);
});

// @desc Initiate GitHub account linking from profile settings
// @route GET /api/auth/github/link
const githubLink = asyncHandler(async (req, res) => {
  const state = jwt.sign({ id: req.user._id, action: "link" }, process.env.JWT_SECRET, { expiresIn: "5m" });
  const redirectUri = `${process.env.SERVER_URL}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=read:user,user:email`;
  res.redirect(url);
});

// @desc Unlink GitHub account from profile
// @route DELETE /api/auth/github/link
const githubUnlink = asyncHandler(async (req, res) => {
  const user = req.user;
  user.githubId = undefined;
  user.githubUsername = undefined;
  user.githubEmail = undefined;
  user.githubAvatar = undefined;
  user.githubProfile = undefined;
  user.githubAccessToken = undefined;
  user.githubConnectedAt = undefined;
  user.githubPublicRepos = undefined;
  user.githubFollowers = undefined;
  user.githubFollowing = undefined;
  user.githubBio = undefined;
  user.githubCompany = undefined;
  user.githubLocation = undefined;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc Forgot password — send reset token email
// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne(buildEmailQuery(normalizedEmail));

  if (!user) {
    res.status(404);
    throw new Error("No account found with this email address");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request — MentriQ Forge",
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:system-ui,sans-serif;">
          <h2 style="color:#1e293b;">Password Reset Request</h2>
          <p style="color:#475569;">You requested a password reset for your MentriQ Forge account.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6C63FF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0;">
            Reset Password
          </a>
          <p style="color:#94a3b8;font-size:13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Password reset email sent" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Email could not be sent");
  }
});

// @desc Reset password using token
// @route PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful" });
});

module.exports = { registerUser, loginUser, getMe, updateMe, githubAuth, githubCallback, githubLink, githubUnlink, forgotPassword, resetPassword };
