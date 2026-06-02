import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
FaUser,FaLock,FaBell,FaPalette,
FaSignOutAlt,FaTrash,FaCreditCard
} from "react-icons/fa";

import "../styles/settings.css";

export default function Settings(){

const navigate = useNavigate();

let user={};
try{ user=JSON.parse(localStorage.getItem("user"))||{} }catch{}

const token = localStorage.getItem("token");

/* ================= STATE ================= */

const [tab,setTab] = useState("profile");

const [name,setName] = useState(user.name||"");
const [email,setEmail] = useState(user.email||"");
const [avatar, setAvatar] = useState(user?.avatar || "");

const [password,setPassword] = useState("");
const [newPassword,setNewPassword] = useState("");

const [dark,setDark] = useState(localStorage.getItem("theme")==="dark");

const [upi,setUpi] = useState("");
const [bank,setBank] = useState("");

/* ================= THEME ================= */

useEffect(()=>{
document.body.classList.toggle("dark",dark);
localStorage.setItem("theme",dark?"dark":"light");
},[dark]);

/* ================= IMAGE UPLOAD ================= */
const [uploading, setUploading] = useState(false);
const [preview, setPreview] = useState(null);

const uploadImage = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  /* ✅ PREVIEW IMAGE */
  const localPreview = URL.createObjectURL(file);
  setPreview(localPreview);

  const form = new FormData();
  form.append("file", file);

  try {
    setUploading(true);

    const res = await fetch("http://localhost:5000/api/avatar", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (data.url) {

      /* ✅ FIX URL (important) */
      const finalUrl = data.url.startsWith("http")
        ? data.url
        : `http://localhost:5000/${data.url}`;

      /* ✅ UPDATE STATE */
      setAvatar(finalUrl);

      /* ✅ UPDATE LOCAL STORAGE */
      const updatedUser = {
        ...user,
        avatar: finalUrl,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      /* ✅ REMOVE PREVIEW AFTER UPLOAD */
      setPreview(null);
    }

  } catch (err) {
    console.log("Upload error:", err);
    showNotification("Upload failed ❌");
  }

  setUploading(false);
};

/* ================= PROFILE ================= */

const updateProfile = async()=>{
await fetch("/api/user/update",{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({name,email,avatar})
});
showNotification("Profile updated ✅");
};

/* ================= PASSWORD ================= */

const changePassword = async()=>{
await fetch("/api/user/password",{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({password,newPassword})
});
showNotification("Password updated 🔒");
};

/* ================= DELETE ACCOUNT ================= */

const deleteAccount = async()=>{

const confirm = window.confirm("Delete account permanently?");

if(!confirm) return;

await fetch("/api/user/delete",{
method:"DELETE",
headers:{ Authorization:`Bearer ${token}` }
});

localStorage.clear();
navigate("/register");
};

/* ================= PAYMENT ================= */

const savePayment = ()=>{
showNotification("Payment details saved 💳");
};

/* ================= LOGOUT ================= */

const logout=()=>{
localStorage.clear();
navigate("/login");
};

/* ================= UI ================= */

return(

<div className="settings-container">

{/* SIDEBAR */}
<div className="settings-sidebar">

<h2>⚙️ Settings</h2>

<div onClick={()=>setTab("profile")} className={tab==="profile"?"active":""}>
<FaUser/> Profile
</div>

<div onClick={()=>setTab("security")} className={tab==="security"?"active":""}>
<FaLock/> Security
</div>

<div onClick={()=>setTab("payment")} className={tab==="payment"?"active":""}>
<FaCreditCard/> Payments
</div>

<div onClick={()=>setTab("appearance")} className={tab==="appearance"?"active":""}>
<FaPalette/> Appearance
</div>

<div onClick={()=>setTab("danger")} className={tab==="danger"?"active":""}>
<FaTrash/> Danger
</div>

<div className="logout" onClick={logout}>
<FaSignOutAlt/> Logout
</div>

</div>

{/* CONTENT */}
<div className="settings-content">

<motion.div key={tab} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}>

{/* PROFILE */}
{tab==="profile" && (
<div className="card">

<h3>Profile</h3>

<div className="avatar-box">

<img
  src={
    preview ||
    avatar ||
    "https://via.placeholder.com/100"
  }
  alt="avatar"
  className="avatar-img"
/>

<label className="upload-btn">
  {uploading ? "Uploading..." : "Change Photo"}
  <input type="file" onChange={uploadImage} hidden />
</label>

</div>

<input value={name} onChange={e=>setName(e.target.value)} placeholder="Name"/>
<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>

<button onClick={updateProfile}>Save</button>

</div>
)}

{/* SECURITY */}
{tab==="security" && (
<div className="card">

<h3>Password</h3>

<input type="password" placeholder="Current Password" value={password} onChange={e=>setPassword(e.target.value)}/>
<input type="password" placeholder="New Password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/>

<button onClick={changePassword}>Update</button>

</div>
)}

{/* PAYMENT */}
{tab==="payment" && (
<div className="card">

<h3>Payment Settings</h3>

<input
placeholder="UPI ID (example@upi)"
value={upi}
onChange={e=>setUpi(e.target.value)}
/>

<input
placeholder="Bank Account / IFSC"
value={bank}
onChange={e=>setBank(e.target.value)}
/>

<button onClick={savePayment}>
Save Payment
</button>

</div>
)}

{/* APPEARANCE */}
{tab==="appearance" && (
<div className="card">

<h3>Dark Mode</h3>

<label className="switch">
<input type="checkbox" checked={dark} onChange={()=>setDark(!dark)}/>
<span className="slider"></span>
</label>

</div>
)}

{/* DELETE */}
{tab==="danger" && (
<div className="card danger">

<h3>Danger Zone</h3>

<button onClick={deleteAccount}>
Delete Account
</button>

</div>
)}

</motion.div>

</div>

</div>
);
}