const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");
const { getMissingProfileFields } = require("../utils/profileCompleteness");
const { deleteUserWithCascade } = require("../utils/userCascade");
const { firebaseAuth: adminFirebaseAuth, verifyFirebaseToken } = require("../config/firebase");

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
  // Prevent role changes through profile update - role is immutable via this endpoint
  const { role, ...updates } = req.body;

  // Define field groups per role to prevent cross-role field modification
  const user = req.user;

  // Only allow role-appropriate fields to be updated
  if (user.role === "candidate") {
    // Candidates can only update candidate-specific fields
    user.name = updates.name !== undefined ? updates.name : user.name;
    user.phone = updates.phone !== undefined ? updates.phone : user.phone;
    user.bio = updates.bio !== undefined ? updates.bio : user.bio;
    user.avatarUrl = updates.avatarUrl !== undefined ? updates.avatarUrl : user.avatarUrl;
    user.skills = updates.skills !== undefined ? updates.skills : user.skills;
    user.experienceLevel = updates.experienceLevel !== undefined ? updates.experienceLevel : user.experienceLevel;
    user.education = updates.education !== undefined ? updates.education : user.education;
    user.resumeUrl = updates.resumeUrl !== undefined ? updates.resumeUrl : user.resumeUrl;
    user.portfolioLinks = updates.portfolioLinks !== undefined ? updates.portfolioLinks : user.portfolioLinks;
    user.linkedinUrl = updates.linkedinUrl !== undefined ? updates.linkedinUrl : user.linkedinUrl;
    user.githubProfile = updates.githubProfile !== undefined ? updates.githubProfile : user.githubProfile;
  } else if (user.role === "company") {
    // Companies can only update company-specific fields
    user.name = updates.name !== undefined ? updates.name : user.name;
    user.phone = updates.phone !== undefined ? updates.phone : user.phone;
    user.bio = updates.bio !== undefined ? updates.bio : user.bio;
    user.avatarUrl = updates.avatarUrl !== undefined ? updates.avatarUrl : user.avatarUrl;
    user.companyName = updates.companyName !== undefined ? updates.companyName : user.companyName;
    user.industry = updates.industry !== undefined ? updates.industry : user.industry;
    user.companySize = updates.companySize !== undefined ? updates.companySize : user.companySize;
    user.website = updates.website !== undefined ? updates.website : user.website;
  } else if (user.role === "evaluator") {
    // Evaluators can update name, phone, bio, avatar
    user.name = updates.name !== undefined ? updates.name : user.name;
    user.phone = updates.phone !== undefined ? updates.phone : user.phone;
    user.bio = updates.bio !== undefined ? updates.bio : user.bio;
    user.avatarUrl = updates.avatarUrl !== undefined ? updates.avatarUrl : user.avatarUrl;
  } else if (user.role === "admin") {
    // Admins can update name, phone, bio, avatar
    user.name = updates.name !== undefined ? updates.name : user.name;
    user.phone = updates.phone !== undefined ? updates.phone : user.phone;
    user.bio = updates.bio !== undefined ? updates.bio : user.bio;
    user.avatarUrl = updates.avatarUrl !== undefined ? updates.avatarUrl : user.avatarUrl;
  }

  // Candidate profile updates must keep the profile complete (all fields + GitHub
  // connection) before the update can be saved. Password-only updates are exempt.
  if (user.role === "candidate" && updates.password === undefined && Object.keys(updates).length > 0) {
    const missing = getMissingProfileFields(user);
    if (missing.length > 0) {
      res.status(400);
      throw new Error(`Complete your profile before saving. Missing: ${missing.join(", ")}`);
    }
  }

  const updated = await user.save();
  res.json({ success: true, user: updated.toSafeObject() });
});

// @desc Delete own account (cascades through all owned data)
// @route DELETE /api/auth/me
const deleteMe = asyncHandler(async (req, res) => {
  if (req.user.role === "admin") {
    res.status(400);
    throw new Error("Admin accounts cannot be deleted from the app. Ask another admin to delete it.");
  }

  await deleteUserWithCascade(req.user);
  res.json({ success: true, message: "Account deleted successfully" });
});

// @desc Redirect user to GitHub OAuth (login / signup)
// @route GET /api/auth/github
const githubAuth = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    res.status(500).json({
      success: false,
      message: "GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to backend/.env before enabling Continue with GitHub.",
    });
    return;
  }
  const redirectUri = `${process.env.SERVER_URL}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email`;
  res.redirect(url);
};

// @desc GitHub OAuth callback (signup/login OR account linking)
// @route GET /api/auth/github/callback
const githubCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;

  // Failures redirect back to the app with a readable message instead of raw JSON
  const errorRedirect = (msg) => {
    const target = state
      ? `${process.env.CLIENT_URL}/profile?github_error=${encodeURIComponent(msg)}`
      : `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(msg)}`;
    return res.redirect(target);
  };

  if (!code) {
    return errorRedirect("GitHub authorization was cancelled or failed");
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
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    console.warn("GitHub token exchange failed:", tokenData);
    const msg = tokenData.error_description || tokenData.error || "GitHub token exchange failed";
    return errorRedirect(msg);
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
    });
  }

  const token = generateToken(user._id);
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user.toSafeObject()))}`);
});

// @desc Initiate GitHub account linking from profile settings
// Returns the signed GitHub authorize URL (frontend calls this with its auth token,
// then redirects the browser) — @route GET /api/auth/github/link
const githubLink = asyncHandler(async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    res.status(500);
    throw new Error("GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to backend/.env");
  }
  const state = jwt.sign({ id: req.user._id, action: "link" }, process.env.JWT_SECRET, { expiresIn: "5m" });
  const redirectUri = `${process.env.SERVER_URL}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=read:user,user:email`;
  res.json({ success: true, url });
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

// @desc Initiate Google OAuth (signup / login)
// @route GET /api/auth/google
// role is a self-signup hint only (candidate|company); signed so it cannot be tampered with.
const googleAuth = (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!googleClientId || !googleClientSecret) {
    res.status(500).json({
      success: false,
      message: "Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env before enabling Continue with Google.",
    });
    return;
  }

  const redirectUri = `${process.env.SERVER_URL}/api/auth/google/callback`;
  const role = ["candidate", "company"].includes(req.query.role) ? req.query.role : "candidate";
  const state = jwt.sign({ role }, process.env.JWT_SECRET, { expiresIn: "5m" });
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${googleClientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent("openid email profile")}` +
    `&prompt=select_account` +
    `&state=${encodeURIComponent(state)}`;
  res.redirect(url);
};

// @desc Google OAuth callback (signup/login)
// @route GET /api/auth/google/callback
const googleCallback = asyncHandler(async (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  // Failures redirect back to the app with a readable message instead of raw JSON
  const errorRedirect = (msg) => {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(msg)}`);
  };

  if (!googleClientId || !googleClientSecret) {
    return errorRedirect("Google sign-in is not configured. Please try again later.");
  }

  const { code, state } = req.query;
  if (!code) {
    return errorRedirect("Google sign-in was cancelled or failed");
  }

  let requestedRole = "candidate";
  if (state) {
    try {
      const decoded = jwt.verify(state, process.env.JWT_SECRET);
      if (["candidate", "company"].includes(decoded.role)) requestedRole = decoded.role;
    } catch {
      requestedRole = "candidate";
    }
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      client_id: googleClientId,
      client_secret: googleClientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.SERVER_URL}/api/auth/google/callback`,
    }).toString(),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error("Google token exchange failed:", tokenData.error || tokenData.error_description || "unknown error");
    return errorRedirect("Google sign-in could not be completed. Please try again.");
  }

  const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const googleUser = await userRes.json();
  if (!googleUser || !googleUser.sub) {
    return errorRedirect("Could not fetch your Google profile. Please try again.");
  }

  // Existing account: match by Google ID, then by verified email
  let user = await User.findOne({ googleId: String(googleUser.sub) });
  if (!user && googleUser.email) {
    user = await User.findOne(buildEmailQuery(googleUser.email));
  }

  if (user) {
    if (!user.isActive) {
      return errorRedirect("Account has been deactivated. Please contact support.");
    }
    user.googleId = String(googleUser.sub);
    user.googleEmail = googleUser.email;
    user.googleName = googleUser.name;
    user.googlePicture = googleUser.picture;
    user.googleConnectedAt = user.googleConnectedAt || new Date();
    if (!user.avatarUrl && googleUser.picture) {
      user.avatarUrl = googleUser.picture;
    }
    await user.save();

    const token = generateToken(user._id);
    return res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user.toSafeObject()))}`);
  }

  // New user: no auto-signup. Send them to the sign-up page with their Google
  // profile in a short-lived signed token so they can pick a role and finish.
  const signupToken = jwt.sign(
    {
      action: "google-signup",
      sub: String(googleUser.sub),
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      role: requestedRole,
    },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );
  return res.redirect(`${process.env.CLIENT_URL}/register?google_signup=${encodeURIComponent(signupToken)}`);
});

// @desc Complete Google sign-up (new user picks role and finishes)
// @route POST /api/auth/google/signup
const googleSignup = asyncHandler(async (req, res) => {
  const { signupToken, role, companyName } = req.body;

  let draft;
  try {
    draft = jwt.verify(signupToken, process.env.JWT_SECRET);
  } catch {
    res.status(400);
    throw new Error("Your Google sign-up link has expired. Please try again.");
  }

  if (draft.action !== "google-signup" || !draft.sub) {
    res.status(400);
    throw new Error("Invalid Google sign-up request. Please try again.");
  }

  const allowedRoles = ["candidate", "company"];
  const finalRole = allowedRoles.includes(role) ? role : "candidate";

  // Re-check: account may have been created in another tab between consent and the form
  let user = await User.findOne({ googleId: String(draft.sub) });
  if (!user && draft.email) {
    user = await User.findOne(buildEmailQuery(draft.email));
  }

  if (user) {
    if (!user.isActive) {
      res.status(403);
      throw new Error("Account has been deactivated. Please contact support.");
    }
    user.googleId = String(draft.sub);
    user.googleEmail = draft.email;
    user.googleName = draft.name;
    user.googlePicture = draft.picture;
    user.googleConnectedAt = user.googleConnectedAt || new Date();
    if (!user.avatarUrl && draft.picture) {
      user.avatarUrl = draft.picture;
    }
    await user.save();
  } else {
    user = await User.create({
      name: draft.name || draft.email?.split("@")[0] || "Google User",
      email: draft.email || `${draft.sub}@google.local`,
      password: crypto.randomBytes(24).toString("hex"),
      role: finalRole,
      companyName: finalRole === "company" ? companyName : undefined,
      googleId: String(draft.sub),
      googleEmail: draft.email,
      googleName: draft.name,
      googlePicture: draft.picture,
      googleConnectedAt: new Date(),
      avatarUrl: draft.picture,
      isVerified: false,
    });
  }

  const token = generateToken(user._id);
  res.json({ success: true, user: user.toSafeObject(), token });
});

// @desc Firebase Auth — exchange a Firebase ID token for a session
// Called after Google sign-in, email/password sign-in or email verification.
// Finds the Mongo user and keeps verification status in sync.
// intent = "login"  → account MUST already exist (no auto-create)
// intent = "signup" → new users are created (register page Google sign-in)
// @route POST /api/auth/firebase
const firebaseAuth = asyncHandler(async (req, res) => {
  const { idToken, role, companyName, intent = "login" } = req.body;
  if (!idToken) {
    res.status(400);
    throw new Error("idToken is required");
  }

  let claims;
  try {
    claims = await verifyFirebaseToken(idToken);
  } catch {
    res.status(401);
    throw new Error("Invalid or expired Firebase token");
  }

  const firebaseUid = claims.uid;
  const email = (claims.email || "").toLowerCase().trim();
  const provider = claims.firebase?.sign_in_provider || "";
  const isGoogle = provider === "google.com";

  let user = await User.findOne({ firebaseUid });
  if (!user && email) {
    user = await User.findOne(buildEmailQuery(email));
  }

  if (!user) {
    // Logging in with an account that was never registered on the platform
    if (intent !== "signup") {
      res.status(404);
      throw new Error("No account found. Please create an account first before logging in.");
    }
    const allowedRoles = ["candidate", "company"];
    const finalRole = allowedRoles.includes(role) ? role : "candidate";
    user = await User.create({
      name: claims.name || email.split("@")[0] || "New User",
      email: email || `${firebaseUid}@firebase.local`,
      password: crypto.randomBytes(24).toString("hex"),
      role: finalRole,
      companyName: finalRole === "company" ? companyName : undefined,
      firebaseUid,
      googleId: isGoogle ? claims.uid : undefined,
      googleEmail: isGoogle ? email : undefined,
      googleName: isGoogle ? claims.name : undefined,
      googlePicture: isGoogle ? claims.picture : undefined,
      googleConnectedAt: isGoogle ? new Date() : undefined,
      avatarUrl: claims.picture || undefined,
      isVerified: Boolean(claims.email_verified),
    });
  } else {
    if (!user.isActive) {
      res.status(403);
      throw new Error("Account has been deactivated. Please contact support.");
    }
    // Link the Firebase account if it isn't linked yet (e.g. legacy users logging in)
    if (!user.firebaseUid) user.firebaseUid = firebaseUid;
    if (isGoogle && !user.googleId) {
      user.googleId = claims.uid;
      user.googleEmail = email;
      user.googleName = claims.name;
      user.googlePicture = claims.picture;
      user.googleConnectedAt = new Date();
    }
    // Sync email verification status (activation from the Gmail link)
    if (!user.isVerified && claims.email_verified) {
      user.isVerified = true;
    }
    if (claims.picture && !user.avatarUrl) {
      user.avatarUrl = claims.picture;
    }
    await user.save();
  }

  res.json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @desc Migrate a legacy (pre-Firebase) email/password user into Firebase Auth
// Called by the frontend when Firebase says "user not found" but the
// credentials are valid against the Mongo user — so old accounts can still
// use Firebase features (verification, password reset).
// @route POST /api/auth/firebase/migrate
const firebaseMigrate = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne(buildEmailQuery(normalizedEmail)).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error("Account has been deactivated");
  }

  if (!user.firebaseUid) {
    try {
      const firebaseUser = await adminFirebaseAuth.createUser({
        email: user.email,
        password,
        displayName: user.name,
        emailVerified: true, // legacy accounts were already verified
      });
      user.firebaseUid = firebaseUser.uid;
      await user.save();
    } catch (err) {
      // Account may already exist in Firebase (e.g. created from another device)
      if (err.code !== "auth/email-already-exists") {
        console.error("Firebase migration failed:", err.message);
        res.status(500);
        throw new Error("Account could not be migrated to Firebase. Please try again.");
      }
    }
  }

  res.json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
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
    console.error("Forgot password email failed:", err.message, err.code);
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

module.exports = { registerUser, loginUser, getMe, updateMe, deleteMe, githubAuth, githubCallback, githubLink, githubUnlink, googleAuth, googleCallback, googleSignup, forgotPassword, resetPassword, firebaseAuth, firebaseMigrate };
