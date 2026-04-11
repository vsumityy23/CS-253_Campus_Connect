const router = require("express").Router();
const ctrl = require("../controllers/discussionController");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

// Session Discussions
router.get("/session/:sessionId/comments", ctrl.getComments);
router.post("/session/:sessionId/comments", ctrl.postComment);
router.post("/session/:sessionId/mark-read", ctrl.markSessionRead); // unread tracking

// Session Feedback
router.post("/session/:sessionId/feedback", ctrl.submitFeedback);
router.get("/session/:sessionId/feedback-status", ctrl.checkFeedbackStatus); // NEW ROUTE

// Course Analytics
router.get("/course/:courseId/analytics", ctrl.getCourseAnalytics);

module.exports = router;