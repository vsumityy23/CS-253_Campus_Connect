// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const courseRoutes = require("./routes/courseRoutes");

const discussionRoutes = require("./routes/discussionRoutes");




const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/forum', require('./routes/forumRoutes'));
app.use("/api/courses", courseRoutes);
app.use("/api/engage",discussionRoutes)
app.use('/api/users', require('./routes/userRoutes'));

app.get("/", (req, res) => res.send("CampusConnect backend running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));