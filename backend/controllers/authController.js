// backend/controllers/authController.js
const User = require("../models/User");
const OTP = require("../models/OTP");
const Professor = require("../models/Professor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET;

function isIITK(email) {
  return typeof email === "string" && email.toLowerCase().endsWith("@iitk.ac.in");
}

exports.sendOTP = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });
    if (!isIITK(email)) return res.status(400).json({ msg: "Use IITK email (@iitk.ac.in)" });

    if (role === "Professor") {
      const prof = await Professor.findOne({ email: email.toLowerCase() });
      if (!prof) return res.status(403).json({ msg: "Email not in professor database" });
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // remove previous OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await OTP.create({ email: email.toLowerCase(), otp, expiresAt });

    await sendEmail(email, "CampusConnect - Your OTP", `Your OTP is ${otp}. It expires in 5 minutes.`);

    res.json({ msg: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, username, email, password, otp, role } = req.body;
    if (!email || !password || !otp || !role) return res.status(400).json({ msg: "Missing fields" });
    if (!isIITK(email)) return res.status(400).json({ msg: "Use IITK email (@iitk.ac.in)" });

    // Verify OTP
    const record = await OTP.findOne({ email: email.toLowerCase() });
    if (!record || record.otp !== otp) return res.status(400).json({ msg: "Invalid or expired OTP" });

    // optional: ensure professor email exists (we already checked on sendOTP but double-check)
    if (role === "Professor") {
      const prof = await Professor.findOne({ email: email.toLowerCase() });
      if (!prof) return res.status(403).json({ msg: "Not authorized professor" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ msg: "User already exists with this email" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      role,
      name: name || "",
      username: username || "",
      email: email.toLowerCase(),
      password: hashed,
      isVerified: true
    });

    // remove used OTP
    await OTP.deleteMany({ email: email.toLowerCase() });

    res.json({ msg: "Signup successful", user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Missing fields" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ msg: "Login success", token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });
    if (!isIITK(email)) return res.status(400).json({ msg: "Use IITK email (@iitk.ac.in)" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // create OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email: email.toLowerCase() });
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await OTP.create({ email: email.toLowerCase(), otp, expiresAt });

    await sendEmail(email, "CampusConnect - Password Reset OTP", `Your password reset OTP is ${otp}. It expires in 5 minutes.`);

    res.json({ msg: "OTP sent for password reset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ msg: "Missing fields" });

    const record = await OTP.findOne({ email: email.toLowerCase() });
    if (!record || record.otp !== otp) return res.status(400).json({ msg: "Invalid or expired OTP" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email: email.toLowerCase() }, { $set: { password: hashed } });

    await OTP.deleteMany({ email: email.toLowerCase() });

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};