const express = require("express");
const router = express.Router();

const { loginAdmin, updateAdmin } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

// ==========================
// AUTH ROUTES
// ==========================
router.post("/login", loginAdmin);
router.put("/update-admin", verifyToken, updateAdmin);

module.exports = router;