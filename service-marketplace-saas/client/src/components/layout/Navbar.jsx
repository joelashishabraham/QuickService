import { useState,useContext,useRef,useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { io } from "socket.io-client";

import {
FiHeart,
FiMessageCircle,
FiBell,
FiSearch,
FiMenu,
FiUser,
FiLogOut,
FiSettings,
FiMapPin
} from "react-icons/fi";

export default function Navbar(){

const navigate = useNavigate();
const { user,logout } = useContext(AuthContext);

const socketRef = useRef(null);

/* ================= STATES ================= */

const [search,setSearch] = useState("");
const [city,setCity] = useState(
localStorage.getItem("selectedCity") || "Kochi"
);

const [notifOpen,setNotifOpen] = useState(false);
const [profileOpen,setProfileOpen] = useState(false);
const [mobileMenu,setMobileMenu] = useState(false);

const [notifications,setNotifications] = useState([]);
const [unread,setUnread] = useState(0);
const [chatUnread,setChatUnread] = useState(0);

const [onlineUsers,setOnlineUsers] = useState([]);

const notifRef = useRef();
const profileRef = useRef();

/* ================= AVATAR (FIXED) ================= */

const getAvatar = ()=>{
if(user?.avatar){
return user.avatar.startsWith("http")
? user.avatar
: `http://localhost:5000/${user.avatar}`;
}
return `https://ui-avatars.com/api/?name=${user?.name || "User"}`;
};

/* ================= ONLINE CHECK ================= */

const isOnline = onlineUsers.includes(user?._id);

/* ================= AUTO LOCATION ================= */

useEffect(()=>{

if(!navigator.geolocation) return;

navigator.geolocation.getCurrentPosition(async(pos)=>{

try{
const res = await fetch(
`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
);

const data = await res.json();

const cityName =
data.address.city ||
data.address.town ||
data.address.village ||
"Kochi";

setCity(cityName);
localStorage.setItem("selectedCity",cityName);

}catch{}

});

},[]);

/* ================= LOCATION SYNC ================= */

useEffect(()=>{
localStorage.setItem("selectedCity",city);
window.dispatchEvent(new Event("cityChanged"));
},[city]);

/* ================= HELPER: TIME ================= */

const formatTime = (time) => {
const diff = Math.floor((Date.now() - new Date(time)) / 1000);

if(diff < 60) return "Just now";
if(diff < 3600) return Math.floor(diff/60)+" min ago";
if(diff < 86400) return Math.floor(diff/3600)+" hr ago";

return new Date(time).toLocaleDateString();
};

/* ================= SOCKET ================= */

useEffect(()=>{

if(!user?._id) return;

if(!socketRef.current){
socketRef.current = io("http://localhost:5000",{
transports:["websocket"]
});
}

const socket = socketRef.current;

socket.emit("join",user._id);

socket.on("onlineUsers",(users)=>{
setOnlineUsers(users);
});

/* 🔥 UPDATED NOTIFICATION */
socket.on("notification",(data)=>{

const newNotif = {
id: Date.now(),
text: data.text || data.message,
link: data.link || "/",
time: new Date(),
read: false
};

setNotifications(prev => [newNotif, ...prev]);
setUnread(prev => prev + 1);

});

/* CHAT */
socket.on("newMessage",(msg)=>{
if(msg.sender !== user._id){
setChatUnread(prev=>prev+1);
}
});

return ()=>{
socket.off("notification");
socket.off("newMessage");
socket.off("onlineUsers");
};

},[user]);

/* ================= CLOSE DROPDOWN ================= */

useEffect(()=>{

const handler=(e)=>{

if(notifRef.current && !notifRef.current.contains(e.target)){
setNotifOpen(false);
}

if(profileRef.current && !profileRef.current.contains(e.target)){
setProfileOpen(false);
}

};

document.addEventListener("click",handler);

return ()=>document.removeEventListener("click",handler);

},[]);

/* ================= SEARCH (FIXED) ================= */

const handleSearch=()=>{
if(!search.trim()) return;
navigate(`/services?search=${search}&city=${city}`);
};

/* ================= NOTIFICATION ACTIONS ================= */

const markAsRead = ()=>{
setUnread(0);
setNotifications(prev => prev.map(n => ({...n, read:true})));
};

const clearNotifications = ()=>{
setNotifications([]);
setUnread(0);
};

/* ================= SCROLL ================= */

const goToSection=(id)=>{
const section=document.getElementById(id);
if(section){
section.scrollIntoView({behavior:"smooth"});
}
};

/* ================= UI ================= */

return(

<header className="navbar">

<div className="nav-top">

<div className="mobile-menu-btn" onClick={()=>setMobileMenu(!mobileMenu)}>
<FiMenu size={24}/>
</div>

<Link to="/" className="logo">
Quick<span>Service</span>
</Link>

<div className="location-box">
<FiMapPin/>
<select value={city} onChange={(e)=>setCity(e.target.value)}>
<option>Kochi</option>
<option>Trivandrum</option>
<option>Kottayam</option>
<option>Calicut</option>
<option>Bangalore</option>
</select>
</div>

<div className="search-box">
<input
placeholder="Search services..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
onKeyDown={(e)=>e.key==="Enter" && handleSearch()}
/>

<button onClick={handleSearch}>
<FiSearch/>
</button>
</div>

<div className={`nav-actions ${mobileMenu ? "show" : ""}`}>

<div className="icon-btn" onClick={()=>navigate("/favorites")}>
<FiHeart/>
<span>Favorites</span>
</div>

<div className="icon-btn" onClick={()=>{
setChatUnread(0);
navigate("/chat-list");
}}>
<FiMessageCircle/>
{chatUnread > 0 && <span className="notif-count">{chatUnread}</span>}
<span>Chat</span>
</div>

{/* PROFILE */}
{user ? (

<div className="profile-avatar" ref={profileRef} onClick={()=>setProfileOpen(!profileOpen)}>

<div className="avatar-ring">
<img src={getAvatar()} alt="avatar"/>
{isOnline && <span className="online-dot"></span>}
</div>

{profileOpen &&(
<div className="profile-dropdown">
<div className="profile-header">
<img src={getAvatar()} className="profile-big"/>
<h3>{user.name}</h3>
<button onClick={()=>navigate("/profile")}>View Profile</button>
</div>

<div className="profile-menu">
<div onClick={()=>navigate("/dashboard")}><FiUser/> Dashboard</div>
<div onClick={()=>navigate("/mybookings")}><FiMessageCircle/> Bookings</div>
<div onClick={()=>navigate("/settings")}><FiSettings/> Settings</div>
<hr/>
<div onClick={logout}><FiLogOut/> Logout</div>
</div>
</div>
)}

</div>

) : (
<div className="auth-buttons">
<button onClick={()=>navigate("/login")}>Login</button>
<button onClick={()=>navigate("/register")}>Register</button>
</div>
)}

<div className="sell-btn-olx" onClick={()=>navigate("/create-service")}>
+ SELL SERVICE
</div>

{/* 🔥 NEW NOTIFICATION UI */}
<div
className="notification"
ref={notifRef}
onClick={()=>{
setNotifOpen(!notifOpen);
markAsRead();
}}
>

<FiBell/>
{unread > 0 && <span className="notif-count">{unread}</span>}

{notifOpen &&(
<div className="notif-dropdown">

<div className="notif-header">
<h4>Notifications</h4>
<button onClick={clearNotifications}>Clear</button>
</div>

{notifications.length===0 && <p>No notifications</p>}

{notifications.map((n)=>(
<div
key={n.id}
className={`notif-item ${!n.read ? "unread":""}`}
onClick={()=>navigate(n.link)}
>
<p>{n.text}</p>
<span>{formatTime(n.time)}</span>
</div>
))}

</div>
)}

</div>

</div>
</div>

<div className="category-bar">
<button onClick={()=>goToSection("categories")}>Categories</button>
<button onClick={()=>goToSection("nearServices")}>Near You</button>

<button onClick={()=>goToSection("featured")}>Featured</button>
<button onClick={()=>goToSection("trending")}>Trending</button>
<button onClick={()=>goToSection("bestServices")}>Best Rated</button>
</div>

</header>
);
}