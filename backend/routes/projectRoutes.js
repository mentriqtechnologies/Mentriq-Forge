const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyCompanyProjects,
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getProjects);
router.get("/my/company", protect, authorize("company"), getMyCompanyProjects);
router.get("/:id", getProjectById);
router.post("/", protect, authorize("company"), createProject);
router.put("/:id", protect, authorize("company", "admin"), updateProject);
router.delete("/:id", protect, authorize("company", "admin"), deleteProject);

module.exports = router;
