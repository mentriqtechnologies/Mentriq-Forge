const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const User = require("../models/User");
const Application = require("../models/Application");
const Submission = require("../models/Submission");
const Evaluation = require("../models/Evaluation");

async function deleteCandidate() {
  try {
    await require("../config/db")();

    const name = "Yogesh Singh Shekhawat";

    const user = await User.findOne({ name });
    if (!user) {
      console.log(`❌ No user found with email "${email}" and name "${name}"`);
      process.exit(0);
    }

    console.log(`Found: ${user.name} (${user.email}) - ID: ${user._id}`);

    const applications = await Application.find({ candidate: user._id });
    const appIds = applications.map((a) => a._id);

    const submissions = await Submission.find({ candidate: user._id });
    const subIds = submissions.map((s) => s._id);

    const delEval = await Evaluation.deleteMany({ application: { $in: appIds } });
    const delSub = await Submission.deleteMany({ candidate: user._id });
    const delApp = await Application.deleteMany({ candidate: user._id });
    const delUser = await User.deleteOne({ _id: user._id });

    console.log(`Deleted:
  - ${delEval.deletedCount} evaluation(s)
  - ${delSub.deletedCount} submission(s)
  - ${delApp.deletedCount} application(s)
  - ${delUser.deletedCount} user`);

    console.log("✅ Candidate data deleted successfully.");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

deleteCandidate();
