// backend/routes/authRoutes.js
const router = require("express").Router();
const ctrl = require("../controllers/authController");

router.post("/send-otp", ctrl.sendOTP);       // { email, role }
router.post("/signup", ctrl.signup);           // { name, username, email, password, otp, role }
router.post("/login", ctrl.login);             // { email, password }
router.post("/forgot", ctrl.forgotPassword);   // { email }
router.post("/reset", ctrl.resetPassword);     // { email, otp, newPassword }

module.exports = router;