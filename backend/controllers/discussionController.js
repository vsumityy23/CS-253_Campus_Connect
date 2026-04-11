// backend/controllers/discussionController.js
const Comment = require("../models/Comment");
const Feedback = require("../models/Feedback");
const Course = require("../models/Course");
const Session = require("../models/Session");
const UserSessionRead = require("../models/UserSessionRead");

// Mark a session as read for the current user (upsert lastSeenAt = now)
exports.markSessionRead = async (req, res) => {
  try {
    await UserSessionRead.findOneAndUpdate(
      { user: req.user.id, session: req.params.sessionId },
      { lastSeenAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error marking session read" });
  }
};

// --- DISCUSSION (CHAT) ---
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ session: req.params.sessionId })
      .populate("user", "role username name")
      // Deep populate the replyTo field so we can show the quoted message and its author
      .populate({
        path: "replyTo",
        select: "text user",
        populate: { path: "user", select: "role username name" }
      })
      .sort({ createdAt: 1 }); // Chronological order
    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: "Server error fetching comments" });
  }
};

exports.postComment = async (req, res) => {
  try {
    const { text, replyTo } = req.body;
    if (!text) return res.status(400).json({ msg: "Text is required" });

    const comment = await Comment.create({
      session: req.params.sessionId,
      user: req.user.id,
      text,
      replyTo: replyTo || null
    });

    // Populate before sending back to frontend
    const populatedComment = await Comment.findById(comment._id)
      .populate("user", "role username name")
      .populate({
        path: "replyTo",
        select: "text user",
        populate: { path: "user", select: "role username name" }
      });
      
    // ==========================================
    // NEW: SOCKET.IO BROADCAST LOGIC
    // ==========================================
    const io = req.app.get("io");
    if (io) {
      // Broadcast the populated comment to everyone in this specific session's room
      io.to(req.params.sessionId).emit("receive_message", populatedComment);
    }
    // ==========================================

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ msg: "Server error posting comment" });
  }
};

// --- FEEDBACK ---
exports.submitFeedback = async (req, res) => {
  try {
    const { courseId, ratings, comment } = req.body;
    
    // Check if already submitted to prevent duplicates
    const existing = await Feedback.findOne({ session: req.params.sessionId, student: req.user.id });
    if (existing) return res.status(400).json({ msg: "Feedback already submitted for this session." });

    const feedback = await Feedback.create({
      course: courseId,
      session: req.params.sessionId,
      student: req.user.id,
      ratings,
      comment
    });
    res.json({ msg: "Feedback submitted securely", feedback });
  } catch (err) {
    res.status(500).json({ msg: "Server error submitting feedback" });
  }
};

exports.checkFeedbackStatus = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ session: req.params.sessionId, student: req.user.id });
    res.json({ submitted: !!feedback }); // Returns true if feedback exists, false otherwise
  } catch (err) {
    res.status(500).json({ msg: "Server error checking feedback status" });
  }
};

// --- ANALYTICS ---
exports.getCourseAnalytics = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ course: req.params.courseId }).populate("session", "date");
    if (feedbacks.length === 0) return res.json({ available: false });

    // 1. Overall Averages (For Bar Chart)
    let totals = { content: 0, delivery: 0, clarity: 0, engagement: 0, pace: 0 };
    feedbacks.forEach(f => {
      totals.content += f.ratings.content;
      totals.delivery += f.ratings.delivery;
      totals.clarity += f.ratings.clarity;
      totals.engagement += f.ratings.engagement;
      totals.pace += f.ratings.pace;
    });

    const count = feedbacks.length;
    const averages = {
      content: (totals.content / count).toFixed(1),
      delivery: (totals.delivery / count).toFixed(1),
      clarity: (totals.clarity / count).toFixed(1),
      engagement: (totals.engagement / count).toFixed(1),
      pace: (totals.pace / count).toFixed(1)
    };

    // 2. Trend Line Data (Average overall score per session over time)
    const sessionMap = {};
    feedbacks.forEach(f => {
      const dateStr = new Date(f.session.date).toLocaleDateString();
      if (!sessionMap[dateStr]) sessionMap[dateStr] = { totalScore: 0, count: 0 };
      
      const avgRating = (f.ratings.content + f.ratings.delivery + f.ratings.clarity + f.ratings.engagement + f.ratings.pace) / 5;
      sessionMap[dateStr].totalScore += avgRating;
      sessionMap[dateStr].count += 1;
    });

    // Sort dates chronologically
    const trendDates = Object.keys(sessionMap).sort((a, b) => new Date(a) - new Date(b));
    const trendScores = trendDates.map(date => (sessionMap[date].totalScore / sessionMap[date].count).toFixed(2));

    // 3. Written Remarks
    const writtenFeedback = feedbacks.filter(f => f.comment).map(f => f.comment);

    res.json({ 
      available: true, 
      count, 
      averages, 
      trend: { labels: trendDates, data: trendScores },
      comments: writtenFeedback 
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error fetching analytics" });
  }
};