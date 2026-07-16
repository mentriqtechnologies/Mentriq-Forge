require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  await require("../config/db")();
  const users = await User.find({
    $or: [
      { name: /mentriq/i },
      { companyName: /mentriq/i },
      { email: /mentriq/i }
    ]
  }).lean();
  console.log(JSON.stringify(users, null, 2));
  await mongoose.disconnect();
})();
