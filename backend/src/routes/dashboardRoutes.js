const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Dashboard routes are protected
router.use(protect);

// Get dashboard statistics
router.get("/", getDashboardStats);

module.exports = router;