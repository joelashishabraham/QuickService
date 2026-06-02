const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const bookingController = require("../controllers/bookingController");


/* ================= CREATE BOOKING ================= */
/* Customer creates booking after payment */

router.post(
"/",
auth,
bookingController.createBooking
);


/* ================= CUSTOMER BOOKINGS ================= */
/* Logged-in customer booking history */

router.get(
"/customer",
auth,
bookingController.getCustomerBookings
);


/* ================= PROVIDER BOOKINGS ================= */
/* Provider dashboard bookings */

router.get(
"/provider",
auth,
bookingController.getProviderBookings
);


/* ================= BOOKING ANALYTICS ================= */
/* Provider statistics */

router.get(
"/analytics",
auth,
bookingController.getBookingAnalytics
);


/* ================= CHECK SLOT AVAILABILITY ================= */
/* Prevent double booking */

router.post(
"/check-slot",
auth,
bookingController.checkSlotAvailability
);


/* ================= SEARCH BOOKINGS ================= */
/* Admin or provider filter */

router.get(
"/search",
auth,
bookingController.searchBookings
);


/* ================= GET SINGLE BOOKING ================= */

router.get(
"/:id",
auth,
bookingController.getBookingById
);


/* ================= UPDATE STATUS ================= */
/* Generic update */

router.put(
"/:id/status",
auth,
bookingController.updateStatus
);


/* ================= ACCEPT BOOKING ================= */

router.put(
"/:id/accept",
auth,
bookingController.acceptBooking
);


/* ================= REJECT BOOKING ================= */

router.put(
"/:id/reject",
auth,
bookingController.rejectBooking
);


/* ================= COMPLETE BOOKING ================= */

router.put(
"/:id/complete",
auth,
bookingController.completeBooking
);


/* ================= CANCEL BOOKING ================= */

router.put(
"/:id/cancel",
auth,
bookingController.cancelBooking
);


/* ================= DELETE BOOKING ================= */

router.delete(
"/:id",
auth,
bookingController.deleteBooking
);


module.exports = router;