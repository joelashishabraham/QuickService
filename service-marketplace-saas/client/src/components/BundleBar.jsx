import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";

export default function BundleBar(){

const navigate = useNavigate();
const scrollRef = useRef(null);
const [active,setActive] = useState(null);
const [pause,setPause] = useState(false);

/* ================= DATA ================= */

const bundles = [
{ name:"Build House", icon:"🏠", services:["Carpentry","Electrician","Plumbing"] },
{ name:"Renovation", icon:"🧱", services:["Painting","Cleaning"] },
{ name:"Kitchen Setup", icon:"🍳", services:["Plumbing","Electrician"] },
{ name:"Deep Cleaning", icon:"🧼", services:["Cleaning","Pest Control"] },
{ name:"Home Maintenance", icon:"🔧", services:["AC Repair","Plumbing"] },
{ name:"Move Home", icon:"📦", services:["Cleaning","Repair"] },
{ name:"Office Setup", icon:"🏢", services:["Electrician","Cleaning"] },
{ name:"Quick Fix", icon:"⚡", services:["Electrician","Plumbing"] },
{ name:"Luxury Home", icon:"🏡", services:["Interior Design","Painting"] },
{ name:"Emergency Fix", icon:"🚨", services:["Electrician","Plumbing"] }
];

/* ================= AUTO SCROLL ================= */

useEffect(()=>{

const interval = setInterval(()=>{

if(!scrollRef.current || pause) return;

scrollRef.current.scrollLeft += 1;

/* LOOP */
if(
scrollRef.current.scrollLeft + scrollRef.current.clientWidth >=
scrollRef.current.scrollWidth
){
scrollRef.current.scrollLeft = 0;
}

},20);

return ()=>clearInterval(interval);

},[pause]);

/* ================= SCROLL ================= */

const scroll = (dir)=>{
if(!scrollRef.current) return;

const width = scrollRef.current.offsetWidth;

scrollRef.current.scrollBy({
left: dir === "left" ? -width : width,
behavior:"smooth"
});
};

/* ================= CLICK ================= */

const handleClick=(bundle,index)=>{

setActive(index);

navigate("/servicepage",{
state:{
bundle: bundle.services,
title: bundle.name
}
});
};

/* ================= UI ================= */

return(

<div className="bundle-wrapper">

<button className="bundle-arrow left" onClick={()=>scroll("left")}>
<FiChevronLeft size={20}/>
</button>

<div
className="bundle-scroll"
ref={scrollRef}
onMouseEnter={()=>setPause(true)}
onMouseLeave={()=>setPause(false)}
>

{bundles.map((b,i)=>(

<motion.div
key={i}
className={`bundle-item ${active===i ? "active" : ""}`}
onClick={()=>handleClick(b,i)}
whileHover={{ scale:1.08, y:-4 }}
whileTap={{ scale:0.95 }}
initial={{ opacity:0, y:20 }}
animate={{ opacity:1, y:0 }}
transition={{ delay:i*0.05 }}
>

<div className="bundle-icon">{b.icon}</div>

<p className="bundle-title">{b.name}</p>

{/* 🔥 SERVICES INSIDE */}
<p className="bundle-services">
{b.services.join(" • ")}
</p>

</motion.div>

))}

</div>

<button className="bundle-arrow right" onClick={()=>scroll("right")}>
<FiChevronRight size={20}/>
</button>

</div>

);
}