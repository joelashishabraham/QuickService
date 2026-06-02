import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

import {
FaArrowLeft,
FaStar,
FaMapMarkerAlt,
FaComments,
FaPhone,
FaHeart
} from "react-icons/fa";

/* ================= IMAGE FIX ================= */
const getImage = (img) => {
  if (!img) return "https://via.placeholder.com/400";

  // Cloudinary or any external URL
  if (img.startsWith("http")) return img;

  // fallback (only if old images exist)
  return `http://localhost:5000/${img}`;
};

export default function SellerProfile(){

const { id } = useParams();
const navigate = useNavigate();

const [seller,setSeller] = useState(null);
const [services,setServices] = useState([]);
const [loading,setLoading] = useState(true);

/* ================= LOAD ================= */

useEffect(()=>{

const loadSeller = async()=>{

try{

const res = await axios.get(
`http://localhost:5000/api/services?seller=${id}`
);

if(res.data.success){

const list = res.data.data || [];

/* FILTER SELLER SERVICES */
const sellerServices = list.filter(
s => String(s.provider?._id) === String(id)
);

setServices(sellerServices);

/* SET SELLER */
if(sellerServices.length > 0){
setSeller(sellerServices[0].provider);
}

}

}catch(err){
console.log("Seller load error:",err);
}

setLoading(false);

};

loadSeller();

},[id]);

/* ================= ACTIONS ================= */

const openChat = ()=>{
navigate("/chat",{
state:{
receiverId:seller._id,
receiverName:seller.name
}
});
};

const callSeller = ()=>{
window.open(`tel:${seller.phone || "9999999999"}`);
};

/* ================= LOADING ================= */

if(loading){
return(
<div className="seller-loading">
<div className="spinner"></div>
<p>Loading seller...</p>
</div>
);
}

/* ================= NOT FOUND ================= */

if(!seller){
return(
<div className="seller-loading">
<h2>Seller not found</h2>
<button onClick={()=>navigate("/")}>Go Home</button>
</div>
);
}

/* ================= UI ================= */

return(

<div className="seller-page">

{/* BACK */}
<button
className="back-btn"
onClick={()=>navigate(-1)}
>
<FaArrowLeft/> Back
</button>

{/* ================= HEADER ================= */}

<div className="seller-header">

{/* AVATAR */}
<div className="seller-avatar">

{seller.avatar ? (
<img src={getImage(seller.avatar)} alt="avatar"/>
) : (
<span>{seller.name?.charAt(0)}</span>
)}

</div>

<h1>{seller.name}</h1>
<p>{seller.email}</p>

{/* ACTIONS */}
<div className="seller-actions">

<button className="chat-btn" onClick={openChat}>
<FaComments/> Chat
</button>

<button className="call-btn" onClick={callSeller}>
<FaPhone/> Call
</button>

</div>

{/* STATS */}
<div className="seller-stats">

<div>
<h3>{services.length}</h3>
<p>Services</p>
</div>

<div>
<h3><FaStar/> {seller.rating || "4.5"}</h3>
<p>Rating</p>
</div>

<div>
<h3>{seller.experience || "2+"}</h3>
<p>Years</p>
</div>

</div>

</div>

{/* ================= SERVICES ================= */}

<h2 className="seller-title">
Services by this seller
</h2>

<div className="seller-grid">

{services.length === 0 && (
<p className="empty">No services available</p>
)}

{services.map(service=>{

const image = service.images?.[0];

return(

<motion.div
key={service._id}
className="seller-card"
whileHover={{y:-5}}
onClick={()=>navigate(`/service/${service._id}`)}
>

{/* IMAGE */}
<div className="seller-img">

<img
src={getImage(image)}
alt={service.name}
/>

{service.premium && (
<div className="premium-badge">
FEATURED
</div>
)}

</div>

{/* INFO */}
<div className="seller-info">

<h2>₹ {service.price}</h2>

<h3>{service.name}</h3>

<p>
<FaMapMarkerAlt/> {service.city}
</p>

<p className="desc">
{service.description?.slice(0,80)}...
</p>

</div>

{/* FAVORITE */}
<div className="fav">
<FaHeart/>
</div>

</motion.div>

);

})}

</div>

</div>
);
}