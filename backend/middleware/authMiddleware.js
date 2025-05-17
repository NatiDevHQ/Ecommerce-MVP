const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = "wM4+xop!Q^NxuFgfsdf9nVsx83kkxlnfF+Ffd==K!";

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user still exists
    const [user] = await db.pool.query("SELECT id FROM users WHERE id = ?", [
      decoded.userId,
    ]);

    if (user.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    // Add user to request
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
