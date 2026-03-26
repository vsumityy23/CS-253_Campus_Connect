const User = require("../models/User");
const Course = require("../models/Course");
const Application = require("../models/Application");
const ForumPost = require("../models/ForumPost");
const ForumComment = require("../models/ForumComment");
const Feedback = require("../models/Feedback");
const bcrypt = require("bcrypt");

// 1. Update Identity (Username for Students, Name for Professors)
exports.updateIdentity = async (req, res) => {
  try {
    const { newIdentity } = req.body;
    if (!newIdentity || newIdentity.trim() === "") {
      return res.status(400).json({ msg: "Field cannot be empty." });
    }

    const user = await User.findById(req.user.id);

    if (user.role === "Student") {
      // Must be unique
      const existingUser = await User.findOne({ username: newIdentity.trim() });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ msg: "Username already taken. Please choose another." });
      }
      user.username = newIdentity.trim();
    } else {
      // Professor name update
      user.name = newIdentity.trim();
    }

    await user.save();
    
    // Return sanitized user object to update frontend localStorage
    const updatedUser = { _id: user._id, email: user.email, role: user.role, name: user.name, username: user.username };
    res.json({ msg: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ msg: "Server error updating profile." });
  }
};

// 2. Update Password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect current password." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ msg: "Server error updating password." });
  }
};

// 3. Delete Account & All Associated Data
// 3. Delete Account (The Ghost Protocol / Anonymization)
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    // Verify password before destructive action
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password. Deletion denied." });
    }

    // Step 1: Delete temporary/active data (We don't need dead applications)
    if (user.role === "Student") {
      await Application.deleteMany({ student: user._id });
      await Feedback.deleteMany({ student: user._id });
      // Remove them from active course rosters
      await Course.updateMany(
        { students: user._id }, 
        { $pull: { students: user._id } }
      );
    } else if (user.role === "Professor") {
      // If a professor leaves, their active courses must be removed
      await Course.deleteMany({ professor: user._id });
    }

    // Step 2: Anonymize the User (Do NOT touch ForumPost or ForumComment!)
    // We scramble their credentials so they are permanently locked out, 
    // but their ID remains to keep the forum and chat history intact.
    
    user.email = `deleted_${Date.now()}@system.local`; // Free up their original IITK email
    user.password = await bcrypt.hash(Date.now().toString(), 10); // Unknowable password
    user.name = "[Deleted User]";
    user.username = "[deleted]";
    
    // Save the ghosted user back to the database
    await user.save();

    res.json({ msg: "Account securely anonymized. Public posts remain as [Deleted User]." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error during account deletion." });
  }
};