require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const [name, email, password, role] = process.argv.slice(2);

if (!name || !email || !password || !role) {
  console.log("Usage: node utils/createUser.js <name> <email> <password> <role>");
  console.log("Roles: candidate | company | evaluator | admin");
  process.exit(1);
}

if (!["candidate", "company", "evaluator", "admin"].includes(role)) {
  console.log(`Invalid role: ${role}`);
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mentriq-forge";

(async () => {
  try {
    await mongoose.connect(mongoUri);
    const user = await User.create({
      name,
      email,
      password,
      role,
      isActive: true,
    });
    console.log("User created successfully:");
    console.log("  Name:", user.name);
    console.log("  Email:", user.email);
    console.log("  Role:", user.role);
    console.log("  ID:", user._id.toString());
  } catch (err) {
    if (err.code === 11000) {
      console.error("Error: A user with this email already exists");
    } else {
      console.error("Error:", err.message);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();