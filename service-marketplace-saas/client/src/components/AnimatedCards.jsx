import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

export default function AnimatedCards(){

const navigate = useNavigate();
const containerRef = useRef();

/* AUTO SCROLL */
useEffect(()=>{

let scrollAmount = 0;

const autoScroll = setInterval(()=>{

if(!containerRef.current) return;

scrollAmount += 1;

containerRef.current.scrollLeft += 1;

/* LOOP BACK */
if(
containerRef.current.scrollLeft + containerRef.current.clientWidth >=
containerRef.current.scrollWidth
){
containerRef.current.scrollLeft = 0;
scrollAmount = 0;
}

},20);

return ()=>clearInterval(autoScroll);

},[]);

/* ARROWS */
const scroll = (dir)=>{
const amount = 300;

if(dir==="left"){
containerRef.current.scrollLeft -= amount;
}else{
containerRef.current.scrollLeft += amount;
}
};

/* DATA */
const data = [
{ title:"Electrician", icon:"⚡", img:"https://images.unsplash.com/photo-1581092335397-9583eb92d232"},
{ title:"Plumbing", icon:"💧", img:"https://images.unsplash.com/photo-1581578731548-c64695cc6952"},
{ title:"Cleaning", icon:"🧼", img:"https://images.unsplash.com/photo-1581578017426-1a5a1d1f5f7c"},
{ title:"AC Repair", icon:"❄️", img:"https://images.unsplash.com/photo-1621905251918-48416bd8575a"},
{ title:"Painting", icon:"🎨", img:"https://images.unsplash.com/photo-1581579185169-5c1c1f3d0e5f"},
{ title:"Carpentry", icon:"🪵", img:"https://images.unsplash.com/photo-1582582429416-5b9c3e6c0b4c"},
{ title:"Pest Control", icon:"🐜", img:"https://images.unsplash.com/photo-1598514983318-2f64f8f4796c"},
{ title:"Home Repair", icon:"🔧", img:"https://images.unsplash.com/photo-1581093588401-16ec8f1d3f0b"}
];

return(

<div className="qs-wrapper">

{/* LEFT ARROW */}
<button className="qs-arrow left" onClick={()=>scroll("left")}>‹</button>

{/* SCROLL CONTAINER */}
<div className="qs-scroll" ref={containerRef}>

{data.map((item,i)=>(

<div
key={i}
className="qs-card"
onClick={()=>navigate(`/services?search=${item.title}`)}
>

<div
className="qs-img"
style={{ backgroundImage:`url(${item.img})` }}
></div>

<div className="qs-content">

<div className="qs-icon">{item.icon}</div>

<h3>{item.title}</h3>

</div>

</div>

))}

</div>

{/* RIGHT ARROW */}
<button className="qs-arrow right" onClick={()=>scroll("right")}>›</button>

</div>

);
}