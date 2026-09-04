// Cleanup script: removes self-registered candidate/company users that exist
// in the database but have NOT activated their account (verified their email).
// Per the registration flow requirement, such users must never be stored — this
// script cleans up any that were created before the enforcement was added.
// Usage: node utils/cleanupUnactivatedUsers.js [--dry-run]
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const dryRun = process.argv.includes("--dry-run");
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mentriq-forge";

(async () => {
  let deleted = 0;
  try {
    await mongoose.connect(mongoUri);

    // Self-registered roles that require activation to be considered active.
    const query = {
      role: { $in: ["candidate", "company"] },
      isVerified: false,
    };
    const count = await User.countDocuments(query);
    console.log(`Found ${count} un-activated candidate/company user(s).`);

    if (dryRun) {
      console.log("Dry run — no changes made. Re-run without --dry-run to delete them.");
    } else {
      const result = await User.deleteMany(query);
      deleted = result.deletedCount;
      console.log(`Deleted ${deleted} un-activated user(s) from the database.`);
    }
  } catch (err) {
    console.error("Error:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
  console.log(deleted, mongoUri.includes("127.0.0.1") ? "(local DB)" : "");
})();
