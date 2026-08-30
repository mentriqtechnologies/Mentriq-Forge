const mongoose = require("mongoose");
const User = require("./models/User");

async function seedData() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mentriq-forge";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing test data (optional - uncomment if needed)
    // await User.deleteMany({ email: { $regex: /test|example/i } });

    // 1. Create a Candidate user (self-registerable role)
    const candidate = await User.create({
      name: "Test Candidate",
      email: "candidate@test.com",
      password: "password123",
      role: "candidate",
    });
    console.log("✓ Created candidate:", candidate.email);

    // 2. Create a Company user (self-registerable role)
    const company = await User.create({
      name: "Test Company",
      email: "company@test.com",
      password: "password123",
      role: "company",
      companyName: "Test Corp",
      industry: "Technology",
      companySize: "51-100",
    });
    console.log("✓ Created company:", company.email);

    // 3. Create an Admin user
    // NOTE: Admin accounts can ONLY be created by an existing admin via API:
    // POST /api/admin/users { name, email, password, role: "admin" }
    // OR by directly modifying the database as shown below:
    //
    // const admin = await User.create({
    //   name: "Yogesh Singh Shekhawat",
    //   email: "yogeshsingh48743@gmail.com",
    //   password: "Kunwar@48742",
    //   role: "admin",
    //   isActive: true,
    // });
    // console.log("✓ Created admin (direct DB):", admin.email);

    console.log("\nSeed data created successfully!");
    console.log("\nTo create an admin account, you have two options:");
    console.log("  1. Direct DB modification: Use MongoDB to set role='admin' on an existing user");
    console.log("  2. API method: Have an existing admin run: POST /api/admin/users {name, email, password, role: 'admin'}");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("✗ Seed error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedData();