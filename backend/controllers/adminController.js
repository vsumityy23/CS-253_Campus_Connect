// backend/controllers/adminController.js
const Professor = require("../models/Professor");
const jwt = require("jsonwebtoken");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

exports.adminLogin = async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ msg: "Password required" });

  if (password !== ADMIN_PASSWORD) return res.status(401).json({ msg: "Invalid admin password" });

  // produce admin token
  const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ msg: "Admin login success", token });
};

exports.addProfessor = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !email.toLowerCase().endsWith("@iitk.ac.in")) return res.status(400).json({ msg: "Professor email must end with @iitk.ac.in" });

    const existing = await Professor.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ msg: "Professor already exists" });

    await Professor.create({ email: email.toLowerCase(), name: name || "" });
    res.json({ msg: "Professor added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};