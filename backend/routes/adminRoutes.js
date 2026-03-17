// backend/routes/adminRoutes.js
const router = require("express").Router();
const admin = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/authMiddleware");

router.post("/login", admin.adminLogin);            // { password } -> returns admin token
router.post("/add-professor", verifyAdmin, admin.addProfessor); // protected

module.exports = router;