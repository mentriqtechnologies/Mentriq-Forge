const express = require("express");
const router = express.Router();
const { getPublicEvaluators } = require("../controllers/evaluatorMemberController");

router.get("/", getPublicEvaluators);

module.exports = router;