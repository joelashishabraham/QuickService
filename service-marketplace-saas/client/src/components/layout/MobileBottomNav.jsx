import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FiHome, FiSearch, FiPlus, FiUser, FiMessageCircle
} from "react-icons/fi";

export default function MobileBottomNav() {

  const location = useLocation();
  const [hide,setHide] = useState(false);

  const isActive = (path) => location.pathname === path;

  /* 🔥 HIDE ON SCROLL */
  useEffect(()=>{
    let lastScroll = 0;

    const handleScroll = ()=>{
      if(window.scrollY > lastScroll){
        setHide(true);
      } else {
        setHide(false);
      }
      lastScroll = window.scrollY;
    };

    window.addEventListener("scroll",handleScroll);
    return ()=>window.removeEventListener("scroll",handleScroll);

  },[]);

  return (
    <div className={`mobile-nav-pro ${hide ? "hide" : ""}`}>

      <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>
        <FiHome/>
        <span>Home</span>
      </Link>

      <Link to="/services" className={`nav-item ${isActive("/services") ? "active" : ""}`}>
        <FiSearch/>
        <span>Search</span>
      </Link>

      {/* CENTER FAB */}
      <Link to="/create-service" className="nav-fab">
        <FiPlus/>
      </Link>

      {/* CHAT WITH BADGE */}
      <Link to="/chat-list" className={`nav-item ${isActive("/chat-list") ? "active" : ""}`}>
        <div className="icon-wrapper">
          <FiMessageCircle/>
          <span className="badge">3</span>
        </div>
        <span>Chat</span>
      </Link>

      <Link to="/profile" className={`nav-item ${isActive("/profile") ? "active" : ""}`}>
        <FiUser/>
        <span>Profile</span>
      </Link>

    </div>
  );
}