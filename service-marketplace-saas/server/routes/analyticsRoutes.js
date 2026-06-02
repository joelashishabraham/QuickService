// routes/analyticsRoutes.js

const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const analyticsController = require("../controllers/analyticsController");

router.get(
  "/stats",
  auth,
  role(["admin"]),
  analyticsController.getStats
);

module.exports = router;