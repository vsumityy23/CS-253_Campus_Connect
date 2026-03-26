const router = require("express").Router();
const ctrl = require("../controllers/courseController");
const { verifyToken } = require("../middleware/authMiddleware");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.use(verifyToken); // ALL routes below require token

// Fetch courses
router.get("/managed", ctrl.getMyCourses); // <--- FIXED: Changed to getMyCourses
router.get("/enrolled", ctrl.getEnrolledCourses); // For students
router.get("/:id/sessions", ctrl.getCourseSessions); // For viewing dates

// Manage courses (Professor)
router.post("/", ctrl.createCourse);
router.delete("/:id", ctrl.deleteCourse);
router.post("/:id/co-instructors", ctrl.addCoInstructor);
router.post("/:id/students/manual", ctrl.addStudentManual);
router.post("/:id/students/upload", upload.single("file"), ctrl.addStudentsExcel);

module.exports = router;