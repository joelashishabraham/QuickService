import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ServicesPage(){

const { state } = useLocation();
const navigate = useNavigate();
const scrollRef = useRef(null);

const bundleServices = state?.bundle || [];
const title = state?.title || "Services";

/* ================= CATEGORY IMAGES ================= */

const categoryImages = {
  Plumbing: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
  Electrician: "https://images.unsplash.com/photo-1581092335397-9583eb92d232",
  Carpentry: "https://images.unsplash.com/photo-1582582429416-5b9c3e6c0b4c",
  Cleaning: "https://images.unsplash.com/photo-1581578017426-1a5a1d1f5f7c",
  Painting: "https://images.unsplash.com/photo-1581579185169-5c1c1f3d0e5f",
  "AC Repair": "https://images.unsplash.com/photo-1621905251918-48416bd8575a",
  "Pest Control": "https://images.unsplash.com/photo-1598514983318-2f64f8f4796c",
  "Home Repair": "https://images.unsplash.com/photo-1581093588401-16ec8f1d3f0b"
};

/* ================= STATE ================= */

const [services,setServices] = useState([]);
const [selectedCategory,setSelectedCategory] = useState(null);
const [loading,setLoading] = useState(true);

/* ================= LOAD ================= */

useEffect(()=>{

const loadServices = async()=>{

try{
const res = await axios.get("http://localhost:5000/api/services");

let data = res.data.data || [];

if(bundleServices.length > 0){
data = data.filter(s =>
bundleServices.includes(s.category)
);
}

setServices(data);

}catch(err){
console.log(err);
}

setLoading(false);
};

loadServices();

},[bundleServices]);

/* ================= FILTER ================= */

const categoryServices = selectedCategory
? services.filter(s => s.category === selectedCategory)
: [];

/* ================= SCROLL ================= */

const scroll = (dir)=>{
if(!scrollRef.current) return;
scrollRef.current.scrollLeft += dir === "left" ? -300 : 300;
};

/* ================= UI ================= */

return(

<div className="services-page">

{/* HEADER */}
<div className="services-top">
<h2>{title}</h2>
<p className="subtitle">
Choose a category to explore services near you
</p>
</div>

{/* BANNER */}
<div className="banner">
<h3>🔥 Best Services Near You</h3>
<p>Top-rated professionals with fast service</p>
</div>

{/* ================= CATEGORY ================= */}

{!selectedCategory && (

<div className="category-grid">

{loading ? (

/* SKELETON */
[1,2,3].map(i=>(
<div key={i} className="category-card skeleton"></div>
))

) : (

bundleServices.map((cat,i)=>(

<motion.div
key={i}
className="category-card"
onClick={()=>setSelectedCategory(cat)}
whileHover={{ scale:1.05 }}
whileTap={{ scale:0.95 }}
>

<div
className="category-img"
style={{
backgroundImage:`url(${categoryImages[cat] || "https://via.placeholder.com/400"})`
}}
>

<div className="overlay"></div>

<div className="category-content">

<span className="icon">
{cat === "Plumbing" && "💧"}
{cat === "Electrician" && "⚡"}
{cat === "Carpentry" && "🪵"}
{cat === "Cleaning" && "🧼"}
{cat === "Painting" && "🎨"}
</span>

<h4>{cat}</h4>

</div>

</div>

</motion.div>

))

)}

</div>

)}

{/* ================= SERVICES ================= */}

{selectedCategory && (

<>

<button
className="back-btn"
onClick={()=>setSelectedCategory(null)}
>
← Back
</button>

{/* STATS */}
<div className="stats">
<div><h3>{categoryServices.length}</h3><p>Services</p></div>
<div><h3>4.8 ⭐</h3><p>Rating</p></div>
<div><h3>30 min</h3><p>Response</p></div>
</div>

<div className="qs-wrapper">

<button className="qs-arrow left" onClick={()=>scroll("left")}>‹</button>

<div className="qs-scroll" ref={scrollRef}>

{categoryServices.map((s,i)=>(

<motion.div
key={s._id}
className={`qs-card ${s.premium ? "premium" : ""}`}
initial={{ opacity:0, y:30 }}
animate={{ opacity:1, y:0 }}
transition={{ delay:i*0.05 }}
whileHover={{ scale:1.05 }}
>

<div
className="qs-img"
style={{
backgroundImage:`url(http://localhost:5000/${s.images?.[0] || "default.jpg"})`
}}
>
<div className="img-overlay"></div>
</div>

{s.premium && (
<span className="premium-badge">⭐ Premium</span>
)}

<div className="qs-content">

<h3>{s.name}</h3>
<p className="price">₹{s.price}</p>
<p className="rating">⭐ {s.rating || 4.5}</p>

<button onClick={()=>navigate(`/service/${s._id}`)}>
View Details
</button>

</div>

</motion.div>

))}

</div>

<button className="qs-arrow right" onClick={()=>scroll("right")}>›</button>

</div>

</>

)}

</div>
);
}