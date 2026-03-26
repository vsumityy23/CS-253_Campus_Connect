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

    const normalizedEmail = email.toLowerCase();

    // 1. CHECK REGISTERED USERS: Is this email already an active account?
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ msg: "Email is already registered. Please log in." });
    }

    // 2. CHECK THE WHITELIST: Look up the email in the Admin's Professor list
    const authorizedProf = await Professor.findOne({ email: normalizedEmail });

    // 3. APPLY ROLE RULES
    if (role === "Student") {
      // If they want to be a student, but the email is reserved for a Professor, block them.
      if (authorizedProf) {
        return res.status(403).json({ msg: "This email is reserved for Faculty. Please select the Professor role." });
      }
    } else if (role === "Professor") {
      // If they want to be a professor, they MUST be on the whitelist.
      if (!authorizedProf) {
        return res.status(403).json({ msg: "Email not found in the authorized professor database." });
      }
    }

    // 4. GENERATE AND SEND OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email: normalizedEmail });
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await OTP.create({ email: normalizedEmail, otp, expiresAt });

    await sendEmail(email, "CampusConnect - Your OTP", `Your OTP is ${otp}. It expires in 5 minutes.`);

    res.json({ msg: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ msg: "Missing fields" });

    const record = await OTP.findOne({ email: email.toLowerCase() });
    if (!record || record.otp !== otp) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    // Do NOT delete the OTP here, we need it for the final signup step.
    res.json({ msg: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, username, email, password, otp, role } = req.body;
    if (!email || !password || !otp || !role) return res.status(400).json({ msg: "Missing fields" });
    
    const normalizedEmail = email.toLowerCase();

    // Verify OTP
    const record = await OTP.findOne({ email: normalizedEmail });
    if (!record || record.otp !== otp) return res.status(400).json({ msg: "Invalid or expired OTP" });

    // Check the Admin's Professor Whitelist
    const authorizedProf = await Professor.findOne({ email: normalizedEmail });

    // Role-specific validation
    if (role === "Student") {
      // Block if a student tries to use a whitelisted professor's email
      if (authorizedProf) {
        return res.status(403).json({ msg: "This email is reserved for Faculty. Please register as a Professor." });
      }

      if (!username) return res.status(400).json({ msg: "Username is required for students" });
      const existingUsername = await User.findOne({ username: username.trim() });
      if (existingUsername) return res.status(400).json({ msg: "Username is already taken" });
    }

    if (role === "Professor") {
      if (!name) return res.status(400).json({ msg: "Full name is required for professors" });
      if (!authorizedProf) return res.status(403).json({ msg: "Not an authorized professor" });
    }

    // Create Account
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      role,
      name: role === "Professor" ? name : "",
      username: role === "Student" ? username.trim() : "",
      email: normalizedEmail,
      password: hashed,
      isVerified: true
    });

    await OTP.deleteMany({ email: normalizedEmail }); 

    res.json({ msg: "Signup successful", user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// backend/controllers/authController.js -> login function update
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Missing fields" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    // ADDED: username to the response payload for Students
    res.json({ 
      msg: "Login success", 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        name: user.name, 
        username: user.username // Crucial for Student Dashboard visibility
      } 
    });
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