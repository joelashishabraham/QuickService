import Badge from "../ui/Badge";
import Button from "../ui/Button";
import api from "../../services/api";

export default function BookingCard({ booking }) {
  const cancelBooking = async () => {
    await api.patch(`/api/bookings/${booking._id}/cancel`);
    showNotification("Cancelled");
  };

  return (
    <div style={{ marginBottom: "20px", padding: "20px", background: "#fff" }}>
      <h3>{booking.service?.name}</h3>
      <p>Date: {booking.date}</p>
      <Badge status={booking.status} />
      <br /><br />
      {booking.status === "pending" && (
        <Button onClick={cancelBooking}>Cancel</Button>
      )}
    </div>
  );
}