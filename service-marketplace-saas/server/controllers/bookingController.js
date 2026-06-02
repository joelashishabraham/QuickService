const Booking = require("../models/Booking");
const Service = require("../models/Service");
const User = require("../models/User");

const { sendBookingEmails, sendReviewEmail } = require("../utils/sendBookingEmail");

/* ================= REALTIME ================= */

const notify = (userId, data) => {
  if (global.io) {
    global.io.to(userId.toString()).emit("notification", data);
  }
};

/* =====================================================
   CREATE BOOKING
===================================================== */

exports.createBooking = async (req, res) => {
  try {
    const { service, date, time, address, problem, price } = req.body;

    const serviceData = await Service.findById(service)
      .populate("provider", "email name");

    if (!serviceData) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    /* PREVENT SELF BOOK */
    if (serviceData.provider._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own service"
      });
    }

    /* SLOT CHECK */
    const existing = await Booking.findOne({
      service: serviceData._id,
      date,
      time,
      status: { $in: ["pending", "accepted"] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Time slot already booked"
      });
    }

    const bookingId = "BK" + Date.now();

    const booking = await Booking.create({
      bookingId,
      service: serviceData._id,
      customer: req.user._id,
      provider: serviceData.provider._id,
      date,
      time,
      address,
      problem: problem || "General Service",
      price: price || serviceData.price,
      phone: req.user.phone || "N/A",   // ✅ SAFE FIX
      status: "pending"
    });

    /* REALTIME */
    notify(serviceData.provider._id, {
      type: "booking",
      message: `New booking for ${serviceData.name}`
    });

    /* EMAIL (SAFE) */
    try {
      const customer = await User.findById(req.user._id);

      if (customer?.email && serviceData.provider?.email) {
        await sendBookingEmails(
          customer.email,
          serviceData.provider.email,
          {
            service: serviceData.name,
            date,
            time,
            address,
            price: booking.price,
            bookingId
          }
        );
      }

    } catch (emailErr) {
      console.log("⚠️ Email failed but booking created:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Booking created",
      data: booking
    });

  } catch (err) {
    console.log("❌ BOOKING ERROR:", err.message);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =====================================================
   COMPLETE BOOKING + REVIEW EMAIL
===================================================== */
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "email name")
      .populate("service", "name")
      .populate("provider", "name");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    /* UPDATE STATUS */
    booking.status = "completed";
    await booking.save();

    /* 🔥 SEND REVIEW EMAIL HERE */
    try {
      if (booking.customer?.email) {
        await sendReviewEmail(
          booking.customer.email,
          booking.customer.name,
          booking.bookingId
        );
      }
    } catch (err) {
      console.log("❌ Review email failed:", err.message);
    }

    res.json({
      success: true,
      message: "Booking completed"
    });

  } catch (err) {
    console.log("❌ COMPLETE ERROR:", err.message);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
/* =====================================================
   CUSTOMER BOOKINGS
===================================================== */

exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate("service")
      .populate("provider", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });

  } catch {
    res.status(500).json({ success: false });
  }
};

/* =====================================================
   PROVIDER BOOKINGS
===================================================== */

exports.getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate("service")
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });

  } catch {
    res.status(500).json({ success: false });
  }
};

/* =====================================================
   DELETE BOOKING
===================================================== */

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false });

    await booking.deleteOne();

    res.json({
      success: true,
      message: "Booking deleted"
    });

  } catch {
    res.status(500).json({ success: false });
  }
};
/* =====================================================
   CHECK SLOT AVAILABILITY
===================================================== */

exports.checkSlotAvailability = async (req, res) => {
  try {
    const { service, date, time } = req.body;

    const booking = await Booking.findOne({
      service,
      date,
      time,
      status: { $in: ["pending", "accepted"] }
    });

    res.json({ available: !booking });

  } catch {
    res.status(500).json({ success: false });
  }
};


/* =====================================================
   BOOKING ANALYTICS
===================================================== */

exports.getBookingAnalytics = async (req, res) => {
  try {
    const providerId = req.user._id;

    const total = await Booking.countDocuments({ provider: providerId });

    const completed = await Booking.countDocuments({
      provider: providerId,
      status: "completed"
    });

    const pending = await Booking.countDocuments({
      provider: providerId,
      status: "pending"
    });

    res.json({
      success: true,
      total,
      completed,
      pending
    });

  } catch {
    res.status(500).json({ success: false });
  }
};


/* =====================================================
   SEARCH BOOKINGS
===================================================== */

exports.searchBookings = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("service")
      .populate("customer", "name email");

    res.json({
      success: true,
      data: bookings
    });

  } catch {
    res.status(500).json({ success: false });
  }
};


/* =====================================================
   UPDATE STATUS
===================================================== */

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate("service")
      .populate("customer", "email name");

    if (!booking) {
      return res.status(404).json({ success: false });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: "Status updated"
    });

  } catch {
    res.status(500).json({ success: false });
  }
};


/* =====================================================
   GET SINGLE BOOKING
===================================================== */

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("service")
      .populate("customer", "name email")
      .populate("provider", "name email");

    if (!booking) {
      return res.status(404).json({ success: false });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch {
    res.status(500).json({ success: false });
  }
};
/* ================= ACCEPT BOOKING ================= */
exports.acceptBooking = async (req, res) => {
  try {
    req.body.status = "accepted";
    return exports.updateStatus(req, res);
  } catch {
    res.status(500).json({ success: false });
  }
};

/* ================= REJECT BOOKING ================= */
exports.rejectBooking = async (req, res) => {
  try {
    req.body.status = "rejected";
    return exports.updateStatus(req, res);
  } catch {
    res.status(500).json({ success: false });
  }
};

/* ================= CANCEL BOOKING ================= */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled"
    });

  } catch {
    res.status(500).json({ success: false });
  }
};