const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe, updateMe, githubAuth, githubCallback, githubLink, githubUnlink, googleAuth, googleCallback, forgotPassword, resetPassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.get("/github", githubAuth);
router.get("/github/callback", githubCallback);
router.get("/github/link", protect, githubLink);
router.delete("/github/link", protect, githubUnlink);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
