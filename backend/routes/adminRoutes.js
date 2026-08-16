const express = require("express");
const router = express.Router();
const {
  createStaffUser,
  getAllUsers,
  setUserActiveStatus,
  deleteUser,
  getAdminProjects,
  adminDeleteProject,
  getDeletedItems,
  restoreDeletedItem,
  permanentDeleteItem,
  getAdminAnalytics,
  getHiredCandidates,
  getHiredCandidateDetail,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.post("/users", createStaffUser);
router.put("/users/:id/status", setUserActiveStatus);
router.delete("/users/:id", deleteUser);

router.get("/projects", getAdminProjects);
router.delete("/projects/:id", adminDeleteProject);

router.get("/deleted-items", getDeletedItems);
router.put("/deleted-items/:id/restore", restoreDeletedItem);
router.delete("/deleted-items/:id/permanent", permanentDeleteItem);

router.get("/analytics", getAdminAnalytics);
router.get("/hired-candidates", getHiredCandidates);
router.get("/hired-candidates/:id", getHiredCandidateDetail);

module.exports = router;
