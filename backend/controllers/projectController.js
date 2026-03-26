const Project = require("../models/Project");
const Application = require("../models/Application");

// --- PROFESSOR ACTIONS ---
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, professor: req.user.id });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ msg: "Server error creating project" });
  }
};

exports.getProfProjects = async (req, res) => {
  try {
    // Fetch professor's projects
    const projects = await Project.find({ professor: req.user.id }).sort({ createdAt: -1 });
    
    // For each project, fetch its applications
    const projectsWithApps = await Promise.all(projects.map(async (p) => {
      const applicants = await Application.find({ project: p._id }).populate("student", "email");
      return { ...p._doc, applicants };
    }));
    
    res.json(projectsWithApps);
  } catch (err) {
    res.status(500).json({ msg: "Server error fetching projects" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body; // "Accepted" or "Rejected"
    const application = await Application.findByIdAndUpdate(
      req.params.appId, 
      { status }, 
      { new: true }
    );
    res.json({ msg: `Application ${status}`, application });
  } catch (err) {
    res.status(500).json({ msg: "Server error updating status" });
  }
};

// --- STUDENT ACTIONS ---
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: "Open" }).populate("professor", "name email");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: "Server error fetching projects" });
  }
};

exports.applyForProject = async (req, res) => {
  try {
    const existing = await Application.findOne({ project: req.params.projectId, student: req.user.id });
    if (existing) return res.status(400).json({ msg: "You have already applied for this project." });

    const application = await Application.create({
      ...req.body,
      project: req.params.projectId,
      student: req.user.id
    });
    res.status(201).json({ msg: "Application submitted successfully!", application });
  } catch (err) {
    res.status(500).json({ msg: "Server error submitting application" });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id }).select("project status");
    res.json(applications);
  } catch (err) {
    res.status(500).json({ msg: "Server error fetching applications" });
  }
};