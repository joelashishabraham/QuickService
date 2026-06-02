import { useEffect, useState } from "react";
import api from "../services/api";

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get("/api/bookings/provider/123")
      .then(res => setBookings(res.data));
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>Provider Dashboard</h2>
      {bookings.map(b => (
        <div key={b._id}>
          {b.service?.name} - {b.status}
        </div>
      ))}
    </div>
  );
}