// controllers/analyticsController.js

const Booking = require("../models/Booking");

exports.getStats = async (req, res) => {
  try {
    const total = await Booking.countDocuments();

    const completed = await Booking.countDocuments({
      status: "completed"
    });

    const pending = await Booking.countDocuments({
      status: "pending"
    });

    const cancelled = await Booking.countDocuments({
      status: "cancelled"
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        pending,
        cancelled
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
};