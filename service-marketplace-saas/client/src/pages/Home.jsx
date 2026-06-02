import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
FiSearch,FiMapPin,FiStar,FiTrendingUp
} from "react-icons/fi";

import AnimatedCards from "../components/AnimatedCards";
import AdBanner from "../components/AdBanner";
import TrendingServices from "../components/TrendingServices";
import BundleBar from "../components/BundleBar";
import FeaturedServices from "../components/FeaturedServices";
import NearMeServices from "../components/NearMeServices";
import SearchBox from "../components/SearchBox";
import ChatBot from "../components/ChatBot";

export default function Home(){

const navigate = useNavigate();

/* ================= USER ================= */

let user={};
try{ user=JSON.parse(localStorage.getItem("user"))||{} }catch{}
const userId=user?._id;

/* ================= DISTRICTS ================= */

const keralaDistricts=[
"Thiruvananthapuram","Kollam","Pathanamthitta","Alappuzha",
"Kottayam","Idukki","Ernakulam","Thrissur","Palakkad",
"Malappuram","Kozhikode","Wayanad","Kannur","Kasaragod"
];

/* ================= STATES ================= */

const [services,setServices]=useState([]);
const [featured,setFeatured]=useState([]);
const [trending,setTrending]=useState([]);
const [recommended,setRecommended]=useState([]);
const [bookedIds,setBookedIds]=useState([]);

const [search,setSearch]=useState("");
const [suggestions,setSuggestions]=useState([]);

const [userLocation,setUserLocation]=useState(null);
const [city,setCity]=useState(
localStorage.getItem("selectedCity") || "Ernakulam"
);

const [loading,setLoading]=useState(true);

/* ================= IMAGE ================= */

const getImage = (img) => {
  if (!img) return "https://via.placeholder.com/400";

  // Cloudinary (works for webp too)
  if (img.startsWith("http")) return img;

  // 🔥 FIX WINDOWS + WEBP
  const fixed = img.replace(/\\/g, "/");

  return `http://localhost:5000/${fixed}`;
};

/* ================= FILTER ================= */

const filterOwn=(list)=>list.filter(s=>{
const owner=s.user?._id||s.user||s.provider||s.owner;
return String(owner)!==String(userId);
});

/* ================= GPS ================= */
const handleLocation = () => {
navigator.geolocation.getCurrentPosition(

async (pos)=>{
const lat = pos.coords.latitude;
const lng = pos.coords.longitude;

setUserLocation({ lat, lng });

/* ✅ DO NOT OVERRIDE USER CITY */
const savedCity = localStorage.getItem("selectedCity");

if(savedCity) return; // 🔥 STOP here if already selected

try{
const res = await fetch(
`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
);

const data = await res.json();

const detectedCity =
data.address?.city ||
data.address?.town ||
data.address?.state_district ||
"";

if(detectedCity){
setCity(detectedCity);
localStorage.setItem("selectedCity", detectedCity);
}

}catch{}

},

()=> console.log("Location denied")
);
};

useEffect(()=>{

/* 🔥 ONLY AUTO DETECT IF NO SAVED CITY */
const savedCity = localStorage.getItem("selectedCity");

if(!savedCity){
  handleLocation();
}

},[]);

/* ================= DISTANCE ================= */

const getDistance=(lat1,lon1,lat2,lon2)=>{
const R=6371;
const toRad=(d)=>d*Math.PI/180;

const dLat=toRad(lat2-lat1);
const dLon=toRad(lon2-lon1);

const a=
Math.sin(dLat/2)**2+
Math.cos(toRad(lat1))*
Math.cos(toRad(lat2))*
Math.sin(dLon/2)**2;

return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
};

/* ================= LOAD ================= */

useEffect(()=>{

const load=async()=>{

try{
const res=await fetch("http://localhost:5000/api/services");
const data=await res.json();

if(data.success){
let list=filterOwn(data.data||[]);
setServices(list);
setFeatured(list.filter(s=>s.premium));
setRecommended(getAI(list));
}
}catch{}

try{
const res=await fetch("http://localhost:5000/api/services/trending");
const data=await res.json();
if(data.success) setTrending(filterOwn(data.data));
}catch{}

try{
const token=localStorage.getItem("token");

const res=await fetch(
"http://localhost:5000/api/bookings/my",
{
headers:{ Authorization:`Bearer ${token}` }
}
);

const data=await res.json();

if(data.success){
setBookedIds(data.data.map(b=>b.serviceId));
}

}catch{}

setLoading(false);

};

load();

},[]);

/* ================= AI ================= */

const getAI=(list)=>{
return [...list]
.sort((a,b)=>((b.rating||0)*2+(b.orders||0))-((a.rating||0)*2+(a.orders||0)))
.slice(0,6);
};

/* ================= SEARCH ================= */

useEffect(()=>{
if(!search) return setSuggestions([]);

fetch(`http://localhost:5000/api/search/suggest?q=${search}`)
.then(res=>res.json())
.then(setSuggestions)
.catch(()=>{});
},[search]);

/* ================= FILTER BY CITY + DISTANCE ================= */

const nearServices = services
.filter(s => {

  /* ✅ MATCH BY CITY FIRST */
  if(city && s.city){
    if(s.city.toLowerCase() === city.toLowerCase()){
      return true;
    }
  }

  /* ✅ OR MATCH BY DISTANCE */
  if(userLocation && s.location?.lat){
    const distance = getDistance(
      userLocation.lat,
      userLocation.lng,
      s.location.lat,
      s.location.lng
    );

    return distance <= maxDistance;
  }

  return false;
})
.map(s=>{

  let distance = null;

  if(userLocation && s.location?.lat){
    distance = getDistance(
      userLocation.lat,
      userLocation.lng,
      s.location.lat,
      s.location.lng
    );
  }

  return {...s, distance};
});
/* ================= CARD ================= */

const Card=({service})=>(
<motion.div
className="card"
whileHover={{scale:1.05}}
onClick={()=>navigate(`/service/${service._id}`)}
>

{service.premium && <div className="badge">FEATURED</div>}

<img src={getImage(service.images?.[0])} alt=""/>

<div className="info">
<h3>{service.name}</h3>
<p><FiMapPin/> {service.city}</p>
<p><FiStar/> {service.rating||4.5}</p>
</div>

</motion.div>
);

/* ================= UI ================= */

if(loading) return <div className="loading">Loading...</div>;

return(

<div className="home">

{/* HERO */}
<div className="hero">
<div className="hero-overlay"></div>

<div className="hero-content">

<h1>Find Trusted Services Near You</h1>
<p>Book plumbers, electricians, cleaners & more</p>

<div className="hero-controls">

<select
className="city-select"
value={city}
onChange={(e)=>{
  setCity(e.target.value);
  localStorage.setItem("selectedCity", e.target.value);
}}
>
<option value="">Select City</option>
{keralaDistricts.map(d=>(
<option key={d}>{d}</option>
))}
</select>

<button className="gps-btn" onClick={handleLocation}>
📍
</button>

<SearchBox />



</div>

{/* Suggestions */}
{suggestions.length>0 && (
<div className="suggestions-box">
{suggestions.map((s,i)=>(
<div key={i} onClick={()=>navigate(`/services?search=${s}&city=${city}`)}>
{s}
</div>
))}
</div>
)}

</div>
</div>

{/* COMPONENTS */}
<AnimatedCards/>
<BundleBar/>



{/* NEAR */}
<div id="nearServices" className="section">
<h2>📍 Services in {city}</h2>
<div className="grid">
{nearServices.slice(0,6).map(s=><Card key={s._id} service={s}/>)}
</div>
</div>


<AdBanner/>
<TrendingServices/>
<FeaturedServices/>


<ChatBot/>
{/* AI */}
<div className="section">
<h2>🤖 Recommended</h2>
<div className="grid">
{recommended.map(s=><Card key={s._id} service={s}/>)}
</div>
</div>
{/* FOOTER */}
<footer className="footer">

<div className="footer-container">

{/* BRAND */}
<div className="footer-col brand">
<h2>Quick<span>Service</span></h2>
<p>Your trusted platform for home services.</p>

<div className="socials">
<i className="fab fa-facebook"></i>
<i className="fab fa-instagram"></i>
<i className="fab fa-twitter"></i>
<i className="fab fa-linkedin"></i>
</div>
</div>

{/* SERVICES */}
<div className="footer-col">
<h4>Services</h4>

<p onClick={()=>navigate("/services?search=Plumbing")}>Plumbing</p>
<p onClick={()=>navigate("/services?search=Cleaning")}>Cleaning</p>
<p onClick={()=>navigate("/services?search=Electrician")}>Electrician</p>
<p onClick={()=>navigate("/services?search=Painting")}>Painting</p>
<p onClick={()=>navigate("/services?search=AC Repair")}>AC Repair</p>

</div>

{/* COMPANY */}
<div className="footer-col">
<h4>Company</h4>

<p onClick={()=>navigate("/about")}>About Us</p>
<p onClick={()=>navigate("/contact")}>Contact</p>
<p onClick={()=>navigate("/privacy")}>Privacy Policy</p>
<p onClick={()=>navigate("/terms")}>Terms & Conditions</p>

</div>

{/* NEWSLETTER */}
<div className="footer-col">
<h4>Subscribe</h4>

<p>Get latest offers & updates</p>

<div className="newsletter">
<input placeholder="Enter email"/>
<button>Subscribe</button>
</div>

</div>

</div>

{/* BOTTOM */}
<div className="footer-bottom">
<p>© 2026 QuickService. All rights reserved.</p>
</div>

</footer>
</div>
);
}