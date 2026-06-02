import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import API from "../utils/api"; // ✅ use axios instance

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [service, setService] = useState(location.state?.service || null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  /* ================= LOAD SERVICE ================= */
  useEffect(() => {
    const loadService = async () => {
      try {
        if (service) {
          setLoading(false);
          return;
        }

        const res = await API.get(`/api/services/${id}`);
        setService(res.data.data);
      } catch (err) {
        console.log(err);
        alert("Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id]);

  /* ================= LOGIN CHECK ================= */
  useEffect(() => {
    if (!token) {
      alert("Please login to book services");
      navigate("/login");
    }
  }, [token]);

  /* ================= FORM STATES ================= */
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(localStorage.getItem("lastAddress") || "");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [express, setExpress] = useState(false);
  const [materials, setMaterials] = useState(false);

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  /* ================= GPS ================= */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        setAddress(data.display_name);
      } catch {
        setAddress(`Lat:${latitude}, Lng:${longitude}`);
      }
    });
  };

  /* ================= PRICE ================= */
  const servicePrice = service?.price || 0;
  const tax = Math.round(servicePrice * 0.05);
  const expressFee = express ? 150 : 0;
  const materialsFee = materials ? 200 : 0;

  const total = servicePrice + tax + expressFee + materialsFee - discount;

  /* ================= COUPON ================= */
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

  /* ================= BOOKING ================= */
  const placeBooking = async () => {
    try {
      if (bookingLoading) return;

      if (!name || !phone || !address || !date || !time) {
        alert("Please fill all details");
        return;
      }

      if (!/^[0-9]{10}$/.test(phone)) {
        alert("Enter valid phone number");
        return;
      }

      setBookingLoading(true);

      localStorage.setItem("lastAddress", address);

      const bookingData = {
        service: service._id,
        serviceData: service,
        name,
        phone,
        address,
        date,
        time,
        express,
        materials,
        tax,
        discount,
        totalPrice: total,
      };

      // ✅ Save to backend
      const res = await API.post("/api/bookings", bookingData);

      // Save for payment page
  localStorage.setItem("currentBooking", JSON.stringify(bookingData));

navigate("/payment", {
  state: { booking: bookingData },
});

    } catch (err) {
      console.log(err);

      if (err.response?.status === 401) {
        alert("Session expired");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Booking failed");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) return <div className="loading">Loading service...</div>;
  if (!service) return <div className="loading">Service not found</div>;

  /* ================= UI ================= */
  return (
    <div className="booking-page">
      <div className="booking-wrapper">

        {/* FORM */}
        <motion.div className="booking-form" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <h2>Booking Details</h2>

          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" />

          <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />

          <button type="button" onClick={getCurrentLocation}>📍 Use Current Location</button>

          <input type="date"
            min={new Date().toISOString().split("T")[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <select value={time} onChange={(e) => setTime(e.target.value)}>
            <option value="">Choose Slot</option>
            <option>9 AM - 11 AM</option>
            <option>12 PM - 2 PM</option>
            <option>3 PM - 5 PM</option>
            <option>6 PM - 8 PM</option>
          </select>

          <label>
            <input type="checkbox" checked={express} onChange={(e) => setExpress(e.target.checked)} />
            Express Service (+₹150)
          </label>

          <label>
            <input type="checkbox" checked={materials} onChange={(e) => setMaterials(e.target.checked)} />
            Include Materials (+₹200)
          </label>

          <div className="price-box">
            <p>Service: ₹{servicePrice}</p>
            <p>Tax: ₹{tax}</p>
            <p>Extras: ₹{expressFee + materialsFee}</p>
            <p>Discount: -₹{discount}</p>
            <h3>Total: ₹{total}</h3>
          </div>
        </motion.div>

        {/* SERVICE */}
        <motion.div className="booking-service" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2>Service Summary</h2>

          <div className="service-card">
            <h3>{service.name}</h3>
            <p>Provider: {service?.provider?.name}</p>
            <p>⭐ {service?.rating || 4.5}</p>
            <h2>₹ {service.price}</h2>
          </div>

          <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon Code" />
          <button onClick={applyCoupon}>Apply</button>
        </motion.div>

        {/* SUMMARY */}
        <motion.div className="booking-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2>Total: ₹{total}</h2>

          <button onClick={placeBooking} disabled={bookingLoading}>
            {bookingLoading ? "Processing..." : "Proceed to Payment"}
          </button>
        </motion.div>

      </div>
    </div>
  );
}