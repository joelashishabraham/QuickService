import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion,AnimatePresence } from "framer-motion";

export default function MyBookings(){

const navigate = useNavigate();

const [bookings,setBookings] = useState([]);
const [loading,setLoading] = useState(true);
const [selectedBooking,setSelectedBooking] = useState(null);
const [confirmDelete,setConfirmDelete] = useState(null);

const token = localStorage.getItem("token");

/* ================= FETCH BOOKINGS ================= */

const fetchBookings = async()=>{

try{

const res = await fetch(
"http://localhost:5000/api/bookings/customer",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

const data = await res.json();

if(data.success){
setBookings(data.data || []);
}else{
setBookings([]);
}

}catch(err){
console.log("Booking error:",err);
}

setLoading(false);

};

useEffect(()=>{

fetchBookings();

},[]);

/* ================= DELETE BOOKING ================= */

const deleteBooking = async(id)=>{

await fetch(
`http://localhost:5000/api/bookings/${id}`,
{
method:"DELETE",
headers:{
Authorization:`Bearer ${token}`
}
}
);

setConfirmDelete(null);
fetchBookings();

};

/* ================= STATUS LABEL ================= */

const getStatus = (status)=>{

if(status==="completed"){
return {label:"Completed",color:"completed"};
}

if(status==="rejected" || status==="cancelled"){
return {label:"Cancelled",color:"cancelled"};
}

return {label:"Pending",color:"pending"};

};

/* ================= LOADING ================= */

if(loading){

return(
<div className="booking-loading">
Loading bookings...
</div>
)

}

/* ================= UI ================= */

return(

<div className="my-bookings-page">

<h1 className="booking-title">
My Bookings
</h1>

{bookings.length===0 ?(

<div className="empty-bookings">

<h3>No bookings found</h3>

<p>Book a service to see it here.</p>

<button onClick={()=>navigate("/services")}>
Browse Services
</button>

</div>

):( 

<div className="bookings-grid">

{bookings.map(b=>{

const status = getStatus(b.status)

return(

<motion.div
key={b._id}
className="booking-card"
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
whileHover={{scale:1.03}}
>

<div className="booking-header">

<h3>{b.service?.name || "Service"}</h3>

<span className={`status ${status.color}`}>
{status.label}
</span>

</div>

<p>Booking ID: {b._id}</p>

<p>Date: {new Date(b.createdAt).toLocaleDateString()}</p>

<p>Provider: {b.provider?.name || "Provider"}</p>

{/* ================= ACTION BUTTONS ================= */}

<div className="booking-actions">

<button onClick={()=>setSelectedBooking(b)}>
View
</button>

<button
onClick={()=>navigate("/chat",{
state:{
provider:b.provider,
serviceId:b.service?._id
}
})}
>
Chat
</button>

<button
onClick={()=>window.open(`tel:${b.provider?.phone || ""}`)}
>
Call
</button>

{/* SHOW REVIEW ONLY AFTER COMPLETION */}

{b.status === "completed" && (

<button
className="review-btn"
onClick={()=>navigate(`/review/${b._id}`)}
>
⭐ Leave Review
</button>

)}

<button
className="delete-btn"
onClick={()=>setConfirmDelete(b)}
>
Delete
</button>

</div>

</motion.div>

)

})}

</div>

)}

{/* ================= BOOKING DETAILS POPUP ================= */}

<AnimatePresence>

{selectedBooking &&(

<motion.div
className="popup-overlay"
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
>

<motion.div
className="booking-popup"
initial={{scale:0.8,y:50}}
animate={{scale:1,y:0}}
exit={{scale:0.8}}
>

<h2>{selectedBooking.service?.name}</h2>

<p><b>Provider:</b> {selectedBooking.provider?.name}</p>

<p><b>Status:</b> {getStatus(selectedBooking.status).label}</p>

<p><b>Booking ID:</b> {selectedBooking._id}</p>

<p><b>Date:</b> {new Date(selectedBooking.createdAt).toLocaleDateString()}</p>

<p><b>Price:</b> ₹ {selectedBooking.price}</p>

<p><b>Address:</b> {selectedBooking.address || "Not provided"}</p>

<div className="popup-actions">

<button
onClick={()=>navigate("/chat",{
state:{
provider:selectedBooking.provider,
serviceId:selectedBooking.service?._id
}
})}
>
Chat
</button>

<button
onClick={()=>window.open(`tel:${selectedBooking.provider?.phone || ""}`)}
>
Call
</button>

{selectedBooking.status === "completed" && (

<button
className="review-btn"
onClick={()=>navigate(`/review/${selectedBooking._id}`)}
>
Leave Review
</button>

)}

<button
className="delete-btn"
onClick={()=>{
setConfirmDelete(selectedBooking)
setSelectedBooking(null)
}}
>
Delete
</button>

<button
className="close-btn"
onClick={()=>setSelectedBooking(null)}
>
Close
</button>

</div>

</motion.div>

</motion.div>

)}

</AnimatePresence>

{/* ================= DELETE CONFIRM ================= */}

<AnimatePresence>

{confirmDelete &&(

<motion.div
className="popup-overlay"
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
>

<motion.div
className="delete-popup"
initial={{scale:0.8}}
animate={{scale:1}}
exit={{scale:0.8}}
>

<h3>Delete Booking?</h3>

<p>This action cannot be undone.</p>

<div className="popup-actions">

<button
className="confirm-btn"
onClick={()=>deleteBooking(confirmDelete._id)}
>
Delete
</button>

<button
onClick={()=>setConfirmDelete(null)}
>
Cancel
</button>

</div>

</motion.div>

</motion.div>

)}

</AnimatePresence>

</div>

);

}