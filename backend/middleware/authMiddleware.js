// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

exports.verifyAdmin = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ msg: "No token provided" });

  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Invalid token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ msg: "Not admin" });
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};