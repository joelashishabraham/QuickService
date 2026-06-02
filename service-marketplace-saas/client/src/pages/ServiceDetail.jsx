import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import {
FaArrowLeft, FaCalendarAlt, FaHeart, FaRegHeart,
FaPhone, FaComments, FaStar, FaEdit
} from "react-icons/fa";

export default function ServiceDetail(){

const location = useLocation();
const navigate = useNavigate();
const { id } = useParams();

const user = JSON.parse(localStorage.getItem("user"));

const [service,setService] = useState(null);
const [loading,setLoading] = useState(true);
const [saved,setSaved] = useState(false);
const [reviews,setReviews] = useState([]);
const [avgRating,setAvgRating] = useState(0);
const [activeImg,setActiveImg] = useState(0);

/* 🔥 NEW STATES */
const [aiSummary,setAiSummary] = useState("");
const [trustScore,setTrustScore] = useState(0);
const [similar,setSimilar] = useState([]);

/* IMAGE FIX */
const getImage = (img) => {
  if (!img) return "https://via.placeholder.com/400";
  if (img.startsWith("http")) return img;
  return `http://localhost:5000/${img.replace(/\\/g,"/")}`;
};

/* LOAD SERVICE */
useEffect(()=>{
const loadService = async()=>{
try{
if(location.state?.service){
setService(location.state.service);
setLoading(false);
return;
}

const res = await axios.get(`http://localhost:5000/api/services/${id}`);

if(res.data.success){
setService(res.data.data);
loadSimilar(res.data.data);
}

}catch(err){ console.log(err); }

setLoading(false);
};

loadService();
},[id]);

/* LOAD REVIEWS */
const loadReviews = async()=>{
try{
const res = await axios.get(`http://localhost:5000/api/reviews/service/${id}`);

if(res.data.success){

const list = res.data.data || [];
setReviews(list);

const avg =
list.length>0
? (list.reduce((s,r)=>s+r.rating,0)/list.length).toFixed(1)
: 0;

setAvgRating(avg);

/* 🔥 AI ANALYSIS */
generateAISummary(list);

}
}catch(err){ console.log(err); }
};

useEffect(()=>{ loadReviews(); },[id]);

/* 🔥 AI REVIEW SUMMARY */
const generateAISummary = (list) => {

if(list.length === 0){
setAiSummary("No reviews yet");
return;
}

const positives = list.filter(r => r.rating >= 4).length;
const negatives = list.filter(r => r.rating <= 2).length;

if(positives > negatives){
setAiSummary("😊 Customers are highly satisfied. Quality service.");
}else if(negatives > positives){
setAiSummary("⚠️ Some customers reported issues.");
}else{
setAiSummary("🙂 Mixed reviews. Check before booking.");
}

/* 🔥 TRUST SCORE */
const score =
(avgRating * 20) + (list.length * 2);

setTrustScore(Math.min(100, Math.round(score)));

};

/* 🔥 SIMILAR SERVICES */
const loadSimilar = async (svc)=>{
try{
const res = await axios.get("http://localhost:5000/api/services");

if(res.data.success){

const filtered = res.data.data
.filter(s =>
s.category === svc.category &&
s._id !== svc._id
)
.slice(0,3);

setSimilar(filtered);
}

}catch(err){ console.log(err); }
};

/* OWNER */
const ownerId =
service?.provider?._id ||
service?.user?._id ||
service?.owner;

const isOwnService =
user && ownerId && String(user._id) === String(ownerId);

/* CHAT */
const openChat = ()=>{
if(isOwnService) return alert("Your own service");
navigate("/chat",{state:{receiverId:ownerId}});
};

/* UI */
if(loading) return <div>Loading...</div>;
if(!service) return <div>Not found</div>;

return(

<div className="service1-detail">

<button onClick={()=>navigate(-1)}>
<FaArrowLeft/> Back
</button>

{/* ================= IMAGES ================= */}
<div className="hero-image">

  {service.images?.map((img, i)=>(
    i === activeImg && (
      <img key={i} src={getImage(img)} />
    )
  ))}

  <div className="hero-overlay">
    <h1>{service.name}</h1>
  </div>

</div>

<h1>{service.name}</h1>

<p>⭐ {avgRating} ({reviews.length} reviews)</p>
<p>₹ {service.price}</p>

{/* 🔥 AI SUMMARY */}
<div className="ai-box">
<h4>🤖 AI Insight</h4>
<p>{aiSummary}</p>
<p>Trust Score: {trustScore}%</p>
</div>


<div
  className="seller-floating"
  onClick={() => navigate(`/seller/${service.provider?._id}`)}
>

  <div className="seller-mini-card">

    {/* AVATAR */}
    <img
      src={service.provider?.avatar || "/user.png"}
      alt="seller"
      className="seller-avatar"
    />

    {/* DETAILS */}
    <div className="seller-info">
      <h4>{service.provider?.name || "Provider"}</h4>
      <p>⭐ {avgRating || 4.5}</p>
    </div>

    {/* ONLINE DOT */}
    <span className="online-dot"></span>

  </div>

</div>
{/* 📍 MAP */}
{service.location?.lat && (
<MapContainer
center={[service.location.lat, service.location.lng]}
zoom={13}
style={{height:"250px"}}
>
<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
<Marker position={[service.location.lat, service.location.lng]}>
<Popup>{service.name}</Popup>
</Marker>
</MapContainer>
)}

{/* ACTIONS */}
<div>

{isOwnService ? (
<button onClick={()=>navigate(`/edit-service/${service._id}`)}>
<FaEdit/> Edit
</button>
) : (
<button onClick={()=>navigate("/booking",{state:{service}})}>
<FaCalendarAlt/> Book
</button>
)}

<button onClick={()=>setSaved(!saved)}>
{saved ? <FaHeart color="red"/> : <FaRegHeart/>}
</button>

<button onClick={openChat}>
<FaComments/> Chat
</button>

<button onClick={()=>window.open(`tel:${service.phone}`)}>
<FaPhone/> Call
</button>

</div>

{/* 🔥 SIMILAR SERVICES */}
<h3>🔥 Similar Services</h3>

<div className="similar-grid">
{similar.map(s=>(
<div key={s._id} onClick={()=>navigate(`/service/${s._id}`)}>
<img src={getImage(s.images?.[0])} />
<p>{s.name}</p>
</div>
))}
</div>

{/* REVIEWS */}
<h3>Reviews</h3>

{reviews.map(r=>(
<div key={r._id}>
<p><strong>{r.customer?.name}</strong> ⭐ {r.rating}</p>
<p>{r.comment}</p>
</div>
))}

</div>
);
}