const nodemailer = require("nodemailer");

/* ================= CREATE TRANSPORT ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= VERIFY EMAIL SERVER ================= */

transporter.verify((error) => {
  if (error) {
    console.log("❌ Email server error:", error);
  } else {
    console.log("✅ Email server ready");
  }
});

/* ================= SEND BOOKING EMAILS ================= */

const sendBookingEmails = async (customerEmail, providerEmail, booking) => {
  try {

    /* ================= EMAIL TO CUSTOMER ================= */

    await transporter.sendMail({
      from: `"QuickService" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "Booking Confirmed ✅",
      html: `
        <h2>Your Booking is Confirmed</h2>

        <p><b>Service:</b> ${booking.service}</p>
        <p><b>Date:</b> ${booking.date}</p>
        <p><b>Address:</b> ${booking.address}</p>
        <p><b>Price:</b> ₹${booking.price}</p>

        <p>Thank you for using <b>QuickService</b>.</p>
      `
    });

    /* ================= EMAIL TO PROVIDER ================= */

    await transporter.sendMail({
      from: `"QuickService" <${process.env.EMAIL_USER}>`,
      to: providerEmail,
      subject: "New Booking Received 📦",
      html: `
        <h2>You received a new booking</h2>

        <p><b>Service:</b> ${booking.service}</p>
        <p><b>Date:</b> ${booking.date}</p>
        <p><b>Customer Address:</b> ${booking.address}</p>
        <p><b>Price:</b> ₹${booking.price}</p>
      `
    });

    console.log("✅ Booking emails sent");

  } catch (err) {
    console.log("❌ Email error:", err.message);
  }
};

/* ================= NEW: REVIEW EMAIL ================= */

const sendReviewEmail = async (customerEmail, customerName, bookingId) => {
  try {

    const reviewLink = `http://localhost:5173/review/${bookingId}`;

    await transporter.sendMail({
      from: `"QuickService" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "⭐ Please rate your service",
      html: `
        <h2>Hello ${customerName},</h2>

        <p>Your service has been <b>completed</b> ✅</p>

        <p>We’d love your feedback!</p>

        <a href="${reviewLink}" 
           style="
             display:inline-block;
             padding:12px 18px;
             background:#25d366;
             color:white;
             text-decoration:none;
             border-radius:6px;
             font-weight:bold;
           ">
           ⭐ Leave a Review
        </a>

        <p style="margin-top:15px;">
          Your feedback helps us improve 🙌
        </p>
      `
    });

    console.log("✅ Review email sent");

  } catch (err) {
    console.log("❌ Review email error:", err.message);
  }
};

/* ================= EXPORT ================= */
module.exports = {
  sendBookingEmails,
  sendReviewEmail
};