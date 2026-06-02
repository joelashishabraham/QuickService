import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

import {
  FiHome,
  FiSearch,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiMessageCircle,
  FiHeart,
  FiSettings
} from "react-icons/fi";

export default function Sidebar() {

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [open, setOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const getAvatar = () => {
    if (user?.avatar) {
      return user.avatar.startsWith("http")
        ? user.avatar
        : `http://localhost:5000/${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${user?.name || "User"}`;
  };

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <div className="sidebar-toggle" onClick={() => setOpen(true)}>
        <FiMenu size={24} />
      </div>

      {/* OVERLAY */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)}></div>}

      {/* SIDEBAR */}
      <div className={`sidebar ${open ? "show" : ""}`}>

        {/* CLOSE BTN */}
        <div className="sidebar-close" onClick={() => setOpen(false)}>
          <FiX size={22} />
        </div>

        {/* PROFILE */}
        <div className="sidebar-profile">

          <div className="avatar-box">
            <img src={getAvatar()} alt="avatar" />
            <span className="online-dot"></span>
          </div>

          <h3>{user?.name || "Guest"}</h3>
          <p>{user?.email}</p>

        </div>

        {/* MENU */}
        <div className="sidebar-menu">

          <Link to="/" className={isActive("/") ? "active" : ""}>
            <FiHome /> Home
          </Link>

          <Link to="/services" className={isActive("/services") ? "active" : ""}>
            <FiSearch /> Services
          </Link>

          <Link to="/favorites" className={isActive("/favorites") ? "active" : ""}>
            <FiHeart /> Favorites
          </Link>

          <Link to="/chat-list" className={isActive("/chat-list") ? "active" : ""}>
            <FiMessageCircle /> Chat
            <span className="badge">3</span>
          </Link>

          <Link to="/profile" className={isActive("/profile") ? "active" : ""}>
            <FiUser /> Profile
          </Link>

          <Link to="/settings" className={isActive("/settings") ? "active" : ""}>
            <FiSettings /> Settings
          </Link>

        </div>

        {/* FOOTER */}
        <div className="sidebar-footer">

          <button onClick={() => navigate("/create-service")}>
            + Add Service
          </button>

          <button className="logout" onClick={logout}>
            <FiLogOut /> Logout
          </button>

        </div>

      </div>
    </>
  );
}