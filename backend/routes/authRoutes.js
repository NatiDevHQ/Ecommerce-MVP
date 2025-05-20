const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout); // ⬅️ New logout route added

// Protected routes
router.get("/me", authMiddleware, authController.getUser);

module.exports = router;
