const Project = require("../models/Project");
const Application = require("../models/Application");
const Submission = require("../models/Submission");
const Evaluation = require("../models/Evaluation");
const User = require("../models/User");

// Deletes every record owned by or tied to a user so no orphaned data stays
// in the database. Used by both admin account deletion and self-deletion.
//
// - Candidate: applications, submissions, and evaluations of those submissions
// - Company: projects, plus every application/submission/evaluation tied to them
// - Evaluator: evaluations written and verification reviews performed
const deleteUserWithCascade = async (user) => {
  if (user.role === "candidate") {
    const submissions = await Submission.find({ candidate: user._id }).select("_id");
    await Evaluation.deleteMany({ submission: { $in: submissions.map((s) => s._id) } });
    await Submission.deleteMany({ candidate: user._id });
    await Application.deleteMany({ candidate: user._id });
  } else if (user.role === "company") {
    const projects = await Project.find({ company: user._id }).select("_id");
    const projectIds = projects.map((p) => p._id);
    if (projectIds.length > 0) {
      const submissions = await Submission.find({ project: { $in: projectIds } }).select("_id");
      await Evaluation.deleteMany({ submission: { $in: submissions.map((s) => s._id) } });
      await Submission.deleteMany({ project: { $in: projectIds } });
      await Application.deleteMany({ project: { $in: projectIds } });
      await Project.deleteMany({ _id: { $in: projectIds } });
    }
  } else {
    await Evaluation.deleteMany({ evaluator: user._id });
    await User.updateMany(
      { verificationReviewedBy: user._id },
      { $unset: { verificationReviewedBy: "" } }
    );
  }

  await user.deleteOne();
};

module.exports = { deleteUserWithCascade };