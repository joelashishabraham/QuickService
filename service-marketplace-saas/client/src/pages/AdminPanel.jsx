import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
FaUsers,
FaClipboardList,
FaTools,
FaTrash,
FaBan,
FaStar,
FaRocket,
FaCheck,
FaTimes
} from "react-icons/fa";

export default function AdminPanel(){

const user = JSON.parse(localStorage.getItem("user") || "null");
const token = localStorage.getItem("token");

if(!user) return <Navigate to="/login"/>;
if(user.role !== "admin") return <Navigate to="/"/>;

/* ================= STATES ================= */

const [users,setUsers] = useState([]);
const [services,setServices] = useState([]);
const [reports,setReports] = useState([]);
const [bookings,setBookings] = useState([]);
const [loading,setLoading] = useState(true);

const headers = {
Authorization:`Bearer ${token}`,
"Content-Type":"application/json"
};

/* ================= LOAD DATA ================= */

const loadData = async()=>{

try{

const [usersRes,servicesRes,bookingsRes,reportsRes] = await Promise.all([

fetch("http://localhost:5000/api/admin/users",{headers}),
fetch("http://localhost:5000/api/admin/services",{headers}),
fetch("http://localhost:5000/api/admin/bookings",{headers}),
fetch("http://localhost:5000/api/admin/reports",{headers})

]);

const usersData = await usersRes.json();
const servicesData = await servicesRes.json();
const bookingsData = await bookingsRes.json();
const reportsData = await reportsRes.json();

setUsers(usersData.users || []);
setServices(servicesData.services || []);
setBookings(bookingsData.bookings || []);
setReports(reportsData.reports || []);

}catch(err){

console.error("Admin load error:",err);

}

setLoading(false);

};

/* ================= INITIAL LOAD ================= */

useEffect(()=>{

loadData();

/* auto refresh every 30 seconds */

const interval = setInterval(()=>{
loadData();
},30000);

return ()=>clearInterval(interval);

},[]);

/* ================= USER ACTIONS ================= */

const deleteUser = async(id)=>{

if(!window.confirm("Delete this user?")) return;

await fetch(`http://localhost:5000/api/admin/users/${id}`,{
method:"DELETE",
headers
});

loadData();

};

const blockUser = async(id)=>{

await fetch(`http://localhost:5000/api/admin/users/block/${id}`,{
method:"PUT",
headers
});

loadData();

};

/* ================= SERVICE ACTIONS ================= */

const deleteService = async(id)=>{

if(!window.confirm("Delete this service?")) return;

await fetch(`http://localhost:5000/api/admin/services/${id}`,{
method:"DELETE",
headers
});

loadData();

};

const premiumService = async(id)=>{

await fetch(`http://localhost:5000/api/admin/services/premium/${id}`,{
method:"PUT",
headers
});

loadData();

};

const boostService = async(id)=>{

await fetch(`http://localhost:5000/api/admin/services/boost/${id}`,{
method:"PUT",
headers
});

loadData();

};

const toggleService = async(id)=>{

await fetch(`http://localhost:5000/api/admin/services/status/${id}`,{
method:"PUT",
headers
});

loadData();

};

/* ================= REPORT ACTIONS ================= */

const resolveReport = async(id)=>{

await fetch(`http://localhost:5000/api/admin/reports/${id}`,{
method:"PUT",
headers
});

loadData();

};

const deleteReport = async(id)=>{

await fetch(`http://localhost:5000/api/admin/reports/${id}`,{
method:"DELETE",
headers
});

loadData();

};

/* ================= LOADING ================= */

if(loading){
return <h2 style={{padding:40}}>Loading Admin Dashboard...</h2>;
}

/* ================= UI ================= */

return(

<div className="admin-container">

<h1>Admin Dashboard</h1>

{/* ================= STATS ================= */}

<div className="admin-stats">

<div className="stat-card">
<FaUsers size={28}/>
<h3>{users.length}</h3>
<p>Total Users</p>
</div>

<div className="stat-card">
<FaClipboardList size={28}/>
<h3>{services.length}</h3>
<p>Total Services</p>
</div>

<div className="stat-card">
<FaTools size={28}/>
<h3>{bookings.length}</h3>
<p>Total Bookings</p>
</div>

</div>

{/* ================= USERS ================= */}

<h2>Users Management</h2>

<table className="admin-table">

<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Role</th>
<th>Actions</th>
</tr>
</thead>

<tbody>

{users.map(u=>(
<tr key={u._id}>
<td>{u.name}</td>
<td>{u.email}</td>
<td>{u.role}</td>

<td>

<button onClick={()=>blockUser(u._id)}>
<FaBan/>
</button>

<button onClick={()=>deleteUser(u._id)}>
<FaTrash/>
</button>

</td>

</tr>
))}

</tbody>

</table>

{/* ================= SERVICES ================= */}

<h2>Ads / Services Control</h2>

<table className="admin-table">

<thead>
<tr>
<th>Service</th>
<th>Provider</th>
<th>City</th>
<th>Price</th>
<th>Premium</th>
<th>Boosted</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>

<tbody>

{services.map(s=>(
<tr key={s._id}>

<td>{s.name}</td>
<td>{s.provider?.name}</td>
<td>{s.city}</td>
<td>₹{s.price}</td>

<td>{s.premium ? "⭐" : "-"}</td>
<td>{s.boosted ? "🚀" : "-"}</td>
<td>{s.active ? "Active" : "Hidden"}</td>

<td>

<button onClick={()=>premiumService(s._id)}>
<FaStar/>
</button>

<button onClick={()=>boostService(s._id)}>
<FaRocket/>
</button>

<button onClick={()=>toggleService(s._id)}>
{s.active ? <FaTimes/> : <FaCheck/>}
</button>

<button onClick={()=>deleteService(s._id)}>
<FaTrash/>
</button>

</td>

</tr>
))}

</tbody>

</table>

{/* ================= BOOKINGS ================= */}

<h2>Bookings</h2>

<table className="admin-table">

<thead>
<tr>
<th>Customer</th>
<th>Provider</th>
<th>Service</th>
<th>Date</th>
<th>Status</th>
</tr>
</thead>

<tbody>

{bookings.map(b=>(
<tr key={b._id}>

<td>{b.customer?.name}</td>
<td>{b.provider?.name}</td>
<td>{b.service?.name}</td>
<td>{new Date(b.date).toLocaleDateString()}</td>
<td>{b.status}</td>

</tr>
))}

</tbody>

</table>

{/* ================= REPORTS ================= */}

<h2>User Reports</h2>

{reports.map(r=>(
<div className="report-card" key={r._id}>

<p><b>User:</b> {r.user?.name}</p>
<p>{r.message}</p>

<button onClick={()=>resolveReport(r._id)}>Resolve</button>
<button onClick={()=>deleteReport(r._id)}>Delete</button>

</div>
))}

</div>

);

}