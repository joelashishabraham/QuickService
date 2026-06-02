import { useEffect,useState,useMemo } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import { motion,AnimatePresence } from "framer-motion";

import {
FaHeart,
FaMapMarkerAlt,
FaStar,
FaPhone,
FaComments
} from "react-icons/fa";

import "../styles/services.css";

/* IMAGE HELPER */
const getImage = (img) => {
  if (!img) return "https://via.placeholder.com/400";

  // Cloudinary (works for webp too)
  if (img.startsWith("http")) return img;

  // 🔥 FIX WINDOWS + WEBP
  const fixed = img.replace(/\\/g, "/");

  return `http://localhost:5000/${fixed}`;
};

export default function Services(){

const navigate = useNavigate();
const location = useLocation();

const query = new URLSearchParams(location.search);
const searchQuery = query.get("search") || "";

const user = JSON.parse(localStorage.getItem("user") || "{}");
const token = localStorage.getItem("token");
const isGuest = !token;



const queryParams = new URLSearchParams(location.search);
const categoryFilter = queryParams.get("category");
const autoBook = queryParams.get("autoBook");
/* ================= STATES ================= */

const [services,setServices] = useState([]);
const [loading,setLoading] = useState(true);

const [favorites,setFavorites] = useState(
JSON.parse(localStorage.getItem("favorites")) || []
);

const [bookingService,setBookingService] = useState(null);

const [category,setCategory] = useState("all");
const [maxPrice,setMaxPrice] = useState(5000);
const [sort,setSort] = useState("latest");
const [search,setSearch] = useState(searchQuery);

const [userLocation,setUserLocation] = useState(null);

/* ================= LOCATION ================= */

useEffect(()=>{
navigator.geolocation?.getCurrentPosition(
(pos)=>{
setUserLocation({
lat:pos.coords.latitude,
lng:pos.coords.longitude
});
});
},[]);

/* ================= DISTANCE ================= */

const getDistance=(lat1,lon1,lat2,lon2)=>{
const R=6371;
const toRad=(d)=>d*Math.PI/180;

const dLat=toRad(lat2-lat1);
const dLon=toRad(lon2-lon1);

const a =
Math.sin(dLat/2)**2 +
Math.cos(toRad(lat1))*
Math.cos(toRad(lat2))*
Math.sin(dLon/2)**2;

return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
};

/* ================= LOAD ================= */

useEffect(()=>{

const fetchServices = async()=>{

try{

setLoading(true);

const res = await fetch("http://localhost:5000/api/services");
const data = await res.json();

if(data.success){

let list = data.data || [];

/* REMOVE OWN */
if(user?._id){
list = list.filter(s=>{
const owner = s.provider?._id || s.user?._id || s.provider || s.user;
return String(owner)!==String(user._id);
});
}

/* ADD DISTANCE */
if(userLocation){
list = list.map(s=>{
if(s.location?.lat){
return {
...s,
distance:getDistance(
userLocation.lat,
userLocation.lng,
s.location.lat,
s.location.lng
)
};
}
return s;
});
}

setServices(list);
}

}catch(err){
console.log(err);
}

setLoading(false);
};

fetchServices();

},[userLocation]);

/* ================= FAVORITES ================= */

useEffect(()=>{
localStorage.setItem("favorites",JSON.stringify(favorites));
},[favorites]);

const toggleFavorite=(id,e)=>{
e.stopPropagation();

if(isGuest){
navigate("/login");
return;
}

setFavorites(prev =>
prev.includes(id)
? prev.filter(f=>f!==id)
: [...prev,id]
);
};

/* ================= FILTER ================= */

const filtered = useMemo(()=>{

let result=[...services];

if(search){
result=result.filter(s =>
s.name?.toLowerCase().includes(search.toLowerCase())
);
}

// 🔥 PRIORITY: chatbot category filter
if(categoryFilter){
result = result.filter(s =>
s.category?.toLowerCase() === categoryFilter.toLowerCase()
);
}

// normal dropdown filter
else if(category !== "all"){
result = result.filter(s =>
s.category?.toLowerCase() === category.toLowerCase()
);
}

result=result.filter(s=>(s.price||0)<=maxPrice);

switch(sort){
case "price":
result.sort((a,b)=>a.price-b.price);
break;
case "rating":
result.sort((a,b)=>(b.rating||0)-(a.rating||0));
break;
default:
result.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}

return result;

},[services,search,category,maxPrice,sort]);

/* ================= ACTIONS ================= */

const openChat=(service,e)=>{
e.stopPropagation();

const providerId = service.provider?._id || service.provider;

navigate("/chat",{
state:{
receiverId:providerId,
receiverName:service.provider?.name || "Seller"
}
});
};

/* ================= UI ================= */

if(loading){
return <div className="loading">Loading services...</div>;
}

return(

<div className="services-page">

<h1>Explore Services</h1>

{/* SEARCH */}
<div className="services-search">

<input
placeholder="Search services..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

<select value={sort} onChange={(e)=>setSort(e.target.value)}>
<option value="latest">Latest</option>
<option value="price">Price</option>
<option value="rating">Rating</option>
</select>

</div>

{/* FILTER */}
<div className="services-filter">

<select value={category} onChange={(e)=>setCategory(e.target.value)}>
<option value="all">All</option>
<option value="Plumbing">Plumbing</option>
<option value="Cleaning">Cleaning</option>
<option value="Electrician">Electrician</option>
<option value="Painting">Painting</option>
</select>

<input
type="range"
min="200"
max="5000"
value={maxPrice}
onChange={(e)=>setMaxPrice(Number(e.target.value))}
/>

<span>₹{maxPrice}</span>

</div>

<p>{filtered.length} results</p>

{/* GRID */}
<div className="services-grid">

{filtered.map(service=>{

// DEBUG
console.log("IMAGE PATH:", service.images);

return(

<motion.div
key={service._id}
className="card"
whileHover={{scale:1.05}}
onClick={()=>navigate(`/service/${service._id}`)}
>

{/* ✅ SINGLE IMAGE */}
<img
src={getImage(service.images?.[0])}
alt={service.name}
/>

{/* FAVORITE */}
<button
className="fav"
onClick={(e)=>toggleFavorite(service._id,e)}
>
<FaHeart color={favorites.includes(service._id)?"red":"white"}/>
</button>

{/* INFO */}
<div className="info">

<h3>{service.name}</h3>

<p className="price">₹{service.price}</p>

<p><FaMapMarkerAlt/> {service.city}</p>

{service.distance && (
<p>📍 {service.distance.toFixed(1)} km</p>
)}

<p><FaStar/> {service.rating||4.5}</p>

</div>

{/* ACTIONS */}
<div className="actions">

<button>View</button>

<button onClick={(e)=>openChat(service,e)}>
<FaComments/>
</button>

<button onClick={(e)=>{
e.stopPropagation();
window.open(`tel:${service.phone}`);
}}>
<FaPhone/>
</button>

</div>

</motion.div>

);

})}

</div>

{/* BOOK MODAL */}
<AnimatePresence>
{bookingService && (
<motion.div className="modal">
<h2>Confirm Booking</h2>
<p>{bookingService.name}</p>

<button onClick={()=>navigate(`/booking/${bookingService._id}`)}>
Confirm
</button>

<button onClick={()=>setBookingService(null)}>
Cancel
</button>
</motion.div>
)}
</AnimatePresence>

</div>
);
}












