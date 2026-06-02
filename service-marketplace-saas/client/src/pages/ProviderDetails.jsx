import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ProviderDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const service = location.state?.service;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const timeSlots = [
    "09:00 AM",
    "11:00 AM",
    "01:00 PM",
    "03:00 PM",
    "05:00 PM",
    "07:00 PM",
  ];

  if (!service) {
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <h2>Service not found ❌</h2>
      </div>
    );
  }

  const handleContinue = () => {
    if (!selectedDate || !selectedSlot) {
      showNotification("Please select date and time slot");
      return;
    }

    navigate("/payment", {
      state: {
        service,
        date: selectedDate,
        time: selectedSlot,
      },
    });
  };

  return (
    <div className="provider-page">
      <div className="provider-container">

        {/* LEFT SIDE */}
        <div className="provider-info">

          <h2>{service.name}</h2>
          <p className="provider-price">₹ {service.price}</p>

          {/* DATE */}
          <div className="booking-section">
            <h3>Select Date</h3>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* TIME SLOT */}
          <div className="booking-section">
            <h3>Select Time Slot</h3>

            <div className="time-slots">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`time-slot ${
                    selectedSlot === slot ? "active-slot" : ""
                  }`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </div>
              ))}
            </div>
          </div>

          {/* PREVIEW */}
          {selectedDate && selectedSlot && (
            <div className="booking-preview">
              📅 {selectedDate} <br />
              ⏰ {selectedSlot}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="provider-actions">

            <button
              className="primary-btn"
              onClick={handleContinue}
            >
              💳 Continue to Payment
            </button>

            <button
              className="secondary-btn"
              onClick={() =>
                navigate("/chat", {
                  state: { provider: service }
                })
              }
            >
              💬 Chat with Provider
            </button>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="provider-card">

          <div className="provider-avatar">
            {service.name.charAt(0)}
          </div>

          <h3>Verified Provider</h3>
          <p>Available Today</p>

          <div className="review-box">
            ⭐ {service.rating} Rating <br />
            120+ Completed Jobs
          </div>

        </div>

      </div>
    </div>
  );
}