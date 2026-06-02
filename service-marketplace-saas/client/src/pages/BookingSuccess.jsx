import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { jsPDF } from "jspdf";

export default function BookingSuccess(){

const location = useLocation();
const navigate = useNavigate();

const booking = location.state?.booking || {};

useEffect(()=>{
window.scrollTo(0,0);
},[]);

/* ================= DATA ================= */

const serviceName = booking?.service?.name || "Service";
const providerName = booking?.provider?.name || "Provider";
const bookingId = booking?.bookingId || booking?._id || "N/A";
const date = booking?.date
? new Date(booking.date).toLocaleDateString()
: "N/A";

const time = booking?.time || "N/A";
const address = booking?.address || "N/A";
const paymentMethod = booking?.paymentMethod || "COD";
const paymentStatus = booking?.paymentStatus || "Paid";
const total = booking?.price || 0;

/* ================= PDF DOWNLOAD ================= */

const downloadReceipt = () => {

const doc = new jsPDF();

doc.setFontSize(18);
doc.text("QuickService - Booking Receipt", 20, 20);

doc.setFontSize(12);

let y = 40;

const line = (label,value)=>{
doc.text(`${label}: ${value}`,20,y);
y+=10;
};

line("Booking ID", bookingId);
line("Service", serviceName);
line("Provider", providerName);
line("Date", date);
line("Time", time);
line("Address", address);
line("Payment Method", paymentMethod);
line("Payment Status", paymentStatus);

y+=10;

doc.setFontSize(14);
doc.text(`Total Paid: ₹ ${total}`,20,y);

doc.save(`receipt_${bookingId}.pdf`);
};

return(

<div className="booking-success-page">

<div className="success-card">

{/* ICON */}
<div className="success-icon">✔</div>

<h1>Booking Confirmed</h1>
<p>Your service has been successfully booked</p>

{/* DETAILS */}
<div className="details">

<div className="row">
<span>Booking ID</span>
<span className="highlight">{bookingId}</span>
</div>

<div className="row">
<span>Service</span>
<span>{serviceName}</span>
</div>

<div className="row">
<span>Provider</span>
<span>{providerName}</span>
</div>

<div className="row">
<span>Date & Time</span>
<span>{date} | {time}</span>
</div>

<div className="row">
<span>Address</span>
<span>{address}</span>
</div>

<div className="row">
<span>Payment</span>
<span>{paymentMethod}</span>
</div>

<div className="row">
<span>Status</span>
<span className="paid">{paymentStatus}</span>
</div>

<div className="row total">
<span>Total</span>
<span>₹ {total}</span>
</div>

</div>

{/* ACTIONS */}

<button className="receipt-btn" onClick={downloadReceipt}>
📄 Download PDF Receipt
</button>

<div className="actions">

<button
className="primary"
onClick={()=>navigate("/mybookings")}
>
View My Bookings
</button>

<button
className="secondary"
onClick={()=>navigate("/")}
>
Back to Home
</button>

</div>

</div>

</div>
);
}