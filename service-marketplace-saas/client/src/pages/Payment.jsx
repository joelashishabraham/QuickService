import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Payment() {

  const navigate = useNavigate();
  const location = useLocation();

  /* ================= GET BOOKING ================= */

  const bookingState = location.state?.booking;

  const [booking, setBooking] = useState(
    bookingState || JSON.parse(localStorage.getItem("currentBooking"))
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ================= PAYMENT METHOD ================= */

  const [method, setMethod] = useState("card");

  /* ================= COUPON ================= */

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  /* ================= CARD DATA ================= */

  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });

  /* ================= REDIRECT IF NO BOOKING ================= */

  useEffect(() => {
    if (!booking) {
      alert("Booking data missing");
      navigate("/");
    }
  }, [booking]);

  /* ================= PRICE ================= */

  const price = booking?.totalPrice || 0;
  const total = price - discount;

  /* ================= CARD INPUT ================= */

  const handleCardChange = (e) => {
    let value = e.target.value;

    if (e.target.name === "number") {
      value = value.replace(/\D/g, "").slice(0, 16);
      value = value.replace(/(.{4})/g, "$1 ").trim();
    }

    setCard({
      ...card,
      [e.target.name]: value
    });
  };

  /* ================= VALIDATE CARD ================= */

  const validateCard = () => {
    return (
      card.number.replace(/\s/g, "").length === 16 &&
      card.name &&
      card.expiry &&
      card.cvv.length >= 3
    );
  };

  /* ================= APPLY COUPON ================= */

  const applyCoupon = () => {
    const code = coupon.toUpperCase();

    if (code === "SAVE100") {
      setDiscount(100);
      alert("Coupon applied");
    } else if (code === "OFF50") {
      setDiscount(50);
      alert("Coupon applied");
    } else {
      alert("Invalid coupon");
    }
  };

  /* ================= PAYMENT ================= */

  const handlePayment = async (e) => {
    e.preventDefault();

    if (method === "card" && !validateCard()) {
      alert("Invalid card details");
      return;
    }

    setLoading(true);

    try {
      // 💳 Simulate payment delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(true);

      // Clear booking from localStorage
      localStorage.removeItem("currentBooking");

      // Redirect after success
      setTimeout(() => {
        navigate("/booking-success", {
          state: { booking }
        });
      }, 1500);

    } catch (err) {
      alert("Payment failed");
    }

    setLoading(false);
  };

  /* ================= LOADING ================= */

  if (!booking) {
    return (
      <div className="payment-page">
        <p>Loading payment details...</p>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="payment-page">

      {!success ? (

        <div className="payment-container">

          {/* ================= PAYMENT FORM ================= */}

          <motion.div
            className="payment-form"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >

            <h2>Secure Payment</h2>

            <div className="payment-methods">
              <button className={method === "card" ? "active" : ""} onClick={() => setMethod("card")}>
                💳 Card
              </button>

              <button className={method === "upi" ? "active" : ""} onClick={() => setMethod("upi")}>
                📱 UPI
              </button>

              <button className={method === "cod" ? "active" : ""} onClick={() => setMethod("cod")}>
                Pay Later
              </button>
            </div>

            <form onSubmit={handlePayment}>

              {/* CARD */}
              {method === "card" && (
                <>
                  <input name="number" placeholder="Card Number" value={card.number} onChange={handleCardChange} />
                  <input name="name" placeholder="Card Holder Name" value={card.name} onChange={handleCardChange} />

                  <div className="card-row">
                    <input name="expiry" placeholder="MM/YY" value={card.expiry} onChange={handleCardChange} />
                    <input type="password" name="cvv" placeholder="CVV" value={card.cvv} onChange={handleCardChange} />
                  </div>
                </>
              )}

              {/* UPI */}
              {method === "upi" && (
                <input placeholder="Enter UPI ID" />
              )}

              {/* COD */}
              {method === "cod" && (
                <p className="cod-note">
                  Payment will be collected after service completion.
                </p>
              )}

              {/* COUPON */}
              <div className="coupon-box">
                <input
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button type="button" onClick={applyCoupon}>
                  Apply
                </button>
              </div>

              <button className="pay-btn" disabled={loading}>
                {loading ? "Processing..." : `Pay ₹${total}`}
              </button>

            </form>

          </motion.div>

          {/* ================= ORDER SUMMARY ================= */}

          <motion.div
            className="payment-summary"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >

            <h3>Order Summary</h3>

            <p><b>Service:</b> {booking.serviceData?.name}</p>
            <p><b>Date:</b> {booking.date}</p>
            <p><b>Time:</b> {booking.time}</p>
            <p><b>Address:</b> {booking.address}</p>

            <hr />

            <p><b>Price:</b> ₹{price}</p>
            <p><b>Discount:</b> -₹{discount}</p>

            <h3>Total ₹{total}</h3>

            <div className="secure-box">
              🔒 Secure Payment
            </div>

          </motion.div>

        </div>

      ) : (

        <div className="payment-success">
          <div className="success-icon">✔</div>
          <h2>Payment Successful</h2>
          <p>Redirecting...</p>
        </div>

      )}

    </div>
  );
}