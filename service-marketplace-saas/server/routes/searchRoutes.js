const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

/* ================= SEARCH SERVICES ================= */

router.get("/", async (req, res) => {
  try {
    const { search = "", city = "" } = req.query;

    const query = {};

    // 🔍 Search by name OR category OR area
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } }
      ];
    }

    // 📍 Filter by city
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    const services = await Service.find(query)
      .limit(10)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: services
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;