import { useContext,useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

import {
FiHome,FiTool,FiGrid,FiCalendar,FiUser,FiSettings,
FiLogOut,FiMessageCircle,FiSearch,FiTrash,FiEdit,FiEye
} from "react-icons/fi";

import { MdAttachMoney } from "react-icons/md";

export default function Dashboard(){

const navigate = useNavigate();
const { user,logout } = useContext(AuthContext);
const token = localStorage.getItem("token");

/* STATES */
const [activeTab,setActiveTab] = useState("overview");
const [services,setServices] = useState([]);
const [providerBookings,setProviderBookings] = useState([]);
const [myBookings,setMyBookings] = useState([]);
const [search,setSearch] = useState("");
const [notifications,setNotifications] = useState(0);
const [loading,setLoading] = useState(true);
const [mobileMenu,setMobileMenu] = useState(false);

/* ⭐ REVIEW STATE */
const [reviewData,setReviewData] = useState({
rating:5,
comment:"",
bookingId:null
});

/* AUTH */
useEffect(()=>{
if(!token){ navigate("/login"); return; }
loadDashboard();
},[]);

/* AUTO REFRESH */
useEffect(()=>{
const interval=setInterval(loadDashboard,10000);
return ()=>clearInterval(interval);
},[]);

/* CLOSE MOBILE MENU */
useEffect(()=>{
const handleClick = (e)=>{
if(!e.target.closest(".dashboard-sidebar") && !e.target.closest(".mobile-menu-btn")){
setMobileMenu(false);
}
};
document.addEventListener("click", handleClick);
return ()=>document.removeEventListener("click", handleClick);
},[]);

/* LOAD */
const loadDashboard=async()=>{
await fetchServices();
await fetchProviderBookings();
await fetchMyBookings();
setLoading(false);
};

/* FETCH */
const fetchServices=async()=>{
const res=await fetch("http://localhost:5000/api/services/my",
{headers:{Authorization:`Bearer ${token}`}}
);
const data=await res.json();
if(data.success) setServices(data.data||[]);
};

const fetchProviderBookings=async()=>{
const res=await fetch("http://localhost:5000/api/bookings/provider",
{headers:{Authorization:`Bearer ${token}`}}
);
const data=await res.json();
if(data.success){
setProviderBookings(data.data||[]);
setNotifications(data.data.filter(b=>b.status==="pending").length);
}
};

const fetchMyBookings=async()=>{
const res=await fetch("http://localhost:5000/api/bookings/customer",
{headers:{Authorization:`Bearer ${token}`}}
);
const data=await res.json();
if(data.success) setMyBookings(data.data||[]);
};

/* ACTIONS */
const deleteService = async (id) => {
  try {

    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/services/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`   // 🔥 MUST
      }
    });

    const data = await res.json();

    if(data.success){
      alert("Deleted successfully");

      // remove from UI
      setServices(prev => prev.filter(s => s._id !== id));
    } else {
      alert(data.message || "Delete failed");
    }

  } catch (err) {
    console.log(err);
    alert("Error deleting service");
  }
};

const updateBooking=async(id,status)=>{
await fetch(`http://localhost:5000/api/bookings/${id}/status`,{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({status})
});
fetchProviderBookings();
};

/* ⭐ SUBMIT REVIEW */
const submitReview = async()=>{
try{
await fetch("http://localhost:5000/api/reviews",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify(reviewData)
});
alert("Review submitted ✅");

setReviewData({
rating:5,
comment:"",
bookingId:null
});

fetchMyBookings();

}catch(err){
console.log(err);
}
};

/* CALC */
const earnings=providerBookings
.filter(b=>b.status==="completed")
.reduce((sum,b)=>sum+(b.price||0),0);

const filteredServices=services.filter(s=>
s.name?.toLowerCase().includes(search.toLowerCase())
);

/* LOADING */
if(loading){
return <div className="dashboard-loading">Loading Dashboard...</div>
}

return(
<div className="dashboard-wrapper">

<button className="mobile-menu-btn" onClick={()=>setMobileMenu(!mobileMenu)}>☰</button>

{/* SIDEBAR */}
<aside className={`dashboard-sidebar ${mobileMenu?"open":""}`}>

<h2>QuickService</h2>

<div onClick={()=>{navigate("/");setMobileMenu(false);}}><FiHome/> Home</div>
<div onClick={()=>{navigate("/services");setMobileMenu(false);}}><FiTool/> Services</div>

<div onClick={()=>{setActiveTab("overview");setMobileMenu(false);}}><FiGrid/> Overview</div>
<div onClick={()=>{setActiveTab("services");setMobileMenu(false);}}><FiTool/> My Services</div>

<div onClick={()=>{setActiveTab("providerBookings");setMobileMenu(false);}}>
<FiCalendar/> Bookings <span className="badge">{notifications}</span>
</div>

<div onClick={()=>{setActiveTab("myBookings");setMobileMenu(false);}}>
<FiUser/> My Orders
</div>

<div onClick={()=>navigate("/chat-list")}><FiMessageCircle/> Message</div>
<div onClick={()=>navigate("/Settings")}><FiSettings/> Settings</div>

<button className="logout-btn" onClick={()=>{
localStorage.clear();
logout();
navigate("/login");
}}>
<FiLogOut/> Logout
</button>

</aside>

{/* MAIN */}
<div className="dashboard-main">

{/* HEADER */}
<div className="dashboard-header">
<h2>Hello {user?.name}</h2>

<div className="header-actions">
<button onClick={()=>navigate("/")}>🏠</button>
<button onClick={()=>navigate("/create-service")}>+ Create</button>

<div className="profile-icon" onClick={()=>navigate("/profile")}>
<img src={user?.avatar || "/user.png"} alt="profile"/>
</div>

</div>
</div>

{/* OVERVIEW */}
{activeTab==="overview" &&(
<div className="stats-grid">
<div className="stat-card"><h3>{services.length}</h3><p>Services</p></div>
<div className="stat-card"><h3>{providerBookings.length}</h3><p>Bookings</p></div>
<div className="stat-card"><h3><MdAttachMoney/> {earnings}</h3><p>Earnings</p></div>
<div className="stat-card"><h3>{myBookings.length}</h3><p>Orders</p></div>
</div>
)}

{/* SERVICES */}
{activeTab==="services" &&(
<>
<div className="search-box">
<FiSearch/>
<input placeholder="Search..." value={search} onChange={(e)=>setSearch(e.target.value)}/>
</div>

<div className="my-services-grid">
{filteredServices.map(service=>(
<motion.div key={service._id} className="service-card modern-card">

<img
  src={
    service.images?.[0]
      ? service.images[0].startsWith("http")
        ? service.images[0]
        : `http://localhost:5000/${service.images[0].replace(/\\/g,"/")}`
      : "/no-image.png"
  }
  onError={(e)=>{
    e.target.src="/no-image.png";
  }}
/>

<h3>{service.name}</h3>
<p>₹{service.price}</p>

<div className="card-actions">
<button onClick={()=>navigate(`/service/${service._id}`)}><FiEye/></button>
<button onClick={()=>navigate(`/edit-service/${service._id}`)}><FiEdit/></button>
<button onClick={()=>deleteService(service._id)}><FiTrash/></button>
</div>

</motion.div>
))}
</div>
</>
)}

{/* PROVIDER BOOKINGS */}
{activeTab==="providerBookings" &&(
<div className="booking-list">

{providerBookings.map(b=>(

<div key={b._id} className="booking-card modern-booking">

<h3>{b.service?.name}</h3>
<p>Customer: {b.customer?.name}</p>
<p>₹{b.price}</p>

{b.status==="pending" &&(
<>
<button onClick={()=>updateBooking(b._id,"accepted")}>✅ Accept</button>
<button onClick={()=>updateBooking(b._id,"rejected")}>❌ Reject</button>
</>
)}

{b.status==="accepted" &&(
<button onClick={()=>updateBooking(b._id,"completed")}>✔ Complete</button>
)}

{b.status==="completed" && <span>✔ Completed</span>}
{b.status==="rejected" && <span>❌ Rejected</span>}

</div>

))}

</div>
)}
{/* MY BOOKINGS */}
{activeTab==="myBookings" &&(

<div className="booking-list">

{myBookings.length===0 &&(
<p>No orders yet 😢</p>
)}

{myBookings.map(b=>(

<div key={b._id} className="booking-card modern-booking">

<h3>{b.service?.name}</h3>
<p>Provider: {b.provider?.name}</p>
<p>₹{b.price}</p>
<p>Status: <b>{b.status}</b></p>

{/* ✅ REVIEW BUTTON → REDIRECT */}

{b.status==="completed" &&(
<button 
onClick={()=>navigate(`/review/${b._id}`)}
>
⭐ Give Review
</button>
)}

</div>

))}

</div>

)}


</div>
</div>
);
}