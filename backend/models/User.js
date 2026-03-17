// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["Student", "Professor"], required: true },
  name: { type: String },
  username: { type: String }, // students may have username
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);