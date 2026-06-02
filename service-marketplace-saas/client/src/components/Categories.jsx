import { useNavigate } from "react-router-dom";

import {
FiZap, FiDroplet, FiTool, FiHome
} from "react-icons/fi";

import {
MdOutlineCleaningServices,
MdOutlinePestControl,
MdCarpenter
} from "react-icons/md";

import { TbAirConditioning } from "react-icons/tb";
import { FaPaintRoller } from "react-icons/fa";

export default function Categories(){

const navigate = useNavigate();

const categories = [

{ name:"Plumbing", icon:<FiDroplet/>, color:"#00bcd4" },
{ name:"Electrician", icon:<FiZap/>, color:"#ffc107", tag:"Hot" },
{ name:"Cleaning", icon:<MdOutlineCleaningServices/>, color:"#4caf50" },

{ name:"Painting", icon:<FaPaintRoller/>, color:"#ff5722" },
{ name:"AC Repair", icon:<TbAirConditioning/>, color:"#03a9f4" },

{ name:"Carpentry", icon:<MdCarpenter/>, color:"#795548" },
{ name:"Pest Control", icon:<MdOutlinePestControl/>, color:"#9c27b0" },

{ name:"Home Repair", icon:<FiTool/>, color:"#607d8b" },
{ name:"Interior Design", icon:<FiHome/>, color:"#e91e63", tag:"New" }

];

return(

<div className="categories">

<h2 className="cat-title">Popular Categories</h2>

<div className="cat-grid">

{categories.map((cat,i)=>(

<div
key={i}
className="cat-card"
style={{ borderTop:`4px solid ${cat.color}` }}
onClick={()=>navigate(`/services?search=${cat.name}`)}
>

{/* TAG */}
{cat.tag && <span className="cat-badge">{cat.tag}</span>}

<div className="cat-icon" style={{ color:cat.color }}>
{cat.icon}
</div>

<p>{cat.name}</p>

</div>

))}

</div>

</div>

);
}