const router = require("express").Router();
const ctrl = require("../controllers/projectController");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

// Professor Routes
router.post("/", ctrl.createProject);
router.get("/managed", ctrl.getProfProjects);
router.put("/applications/:appId", ctrl.updateApplicationStatus);
router.put("/:id", ctrl.updateProject);
router.delete("/:id", ctrl.deleteProject);

// Student Routes
router.get("/my-applications", ctrl.getMyApplications);
router.get("/", ctrl.getAllProjects);
router.post("/:projectId/apply", ctrl.applyForProject);

module.exports = router;