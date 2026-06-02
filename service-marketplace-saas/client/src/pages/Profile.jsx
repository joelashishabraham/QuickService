import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Profile() {

const { user, setUser } = useContext(AuthContext);

const token = localStorage.getItem("token");

const safeUser = user || {
name: "Guest",
email: "guest@email.com",
};

/* ================= STATE ================= */

const [formData, setFormData] = useState({
name: safeUser.name,
email: safeUser.email,
phone: safeUser.phone || "",
address: safeUser.address || "",
newPassword: "",
});

const [avatar, setAvatar] = useState(safeUser.avatar || "");
const [preview, setPreview] = useState(null);
const [editMode, setEditMode] = useState(false);
const [success, setSuccess] = useState(false);
const [loading, setLoading] = useState(false);
const [location, setLocation] = useState("Detecting...");

/* ================= IMAGE HELPER ================= */

const getImage = (img)=>{
if(!img) return "https://via.placeholder.com/100";
if(img.startsWith("http")) return img;
return `http://localhost:5000/${img}`;
};

/* ================= LOCATION ================= */

useEffect(()=>{

if(!navigator.geolocation){
setLocation("Not supported");
return;
}

navigator.geolocation.getCurrentPosition(async(pos)=>{

try{

const res = await fetch(
`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
);

const data = await res.json();

const city =
data.address.city ||
data.address.town ||
data.address.village ||
data.address.state;

setLocation(city || "Unknown");

}catch{
setLocation("Unknown");
}

});

},[]);

/* ================= INPUT ================= */

const handleChange = (e)=>{
setFormData(prev=>({
...prev,
[e.target.name]: e.target.value
}));
};

/* ================= CLOUDINARY AVATAR UPLOAD ================= */

const uploadAvatar = async(e)=>{

const file = e.target.files[0];
if(!file) return;

/* PREVIEW */
const localPreview = URL.createObjectURL(file);
setPreview(localPreview);

const form = new FormData();
form.append("file", file);

try{

setLoading(true);

const res = await fetch("http://localhost:5000/api/avatar",{
method:"POST",
body: form
});

const data = await res.json();

if(data.url){

setAvatar(data.url);
setPreview(null);

/* update user */
const updatedUser = {
...user,
avatar: data.url
};

localStorage.setItem("user", JSON.stringify(updatedUser));
setUser(updatedUser);

}

}catch(err){
console.log("Upload error:",err);
}

setLoading(false);

};

/* ================= SAVE PROFILE ================= */

const handleSubmit = async(e)=>{

e.preventDefault();
setLoading(true);

try{

const res = await fetch("http://localhost:5000/api/user/update",{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body: JSON.stringify({
name: formData.name,
email: formData.email,
phone: formData.phone,
address: formData.address,
avatar
})
});

const data = await res.json();

if(data.success){

const updatedUser = {
...user,
...formData,
avatar
};

localStorage.setItem("user", JSON.stringify(updatedUser));
setUser(updatedUser);

setSuccess(true);

setTimeout(()=>{
setSuccess(false);
setEditMode(false);
},2000);

}

}catch(err){
console.log(err);
}

setLoading(false);

};

/* ================= UI ================= */

return(

<motion.div
className="profile-page"
initial={{opacity:0}}
animate={{opacity:1}}
>

<div className="profile-container">

{/* LEFT CARD */}
<motion.div
className="profile-card glass"
initial={{x:-50,opacity:0}}
animate={{x:0,opacity:1}}
>

<div className="avatar-section">

<div className="avatar">

{loading ? (
<span>Uploading...</span>
) : preview ? (
<img src={preview} alt="preview"/>
) : avatar ? (
<img src={getImage(avatar)} alt="avatar"/>
) : (
<span>{safeUser?.name?.charAt(0)}</span>
)}

</div>

{editMode && (
<label className="upload-btn">
Change Photo
<input type="file" onChange={uploadAvatar} hidden/>
</label>
)}

</div>

<div className="location-badge">
📍 {location}
</div>

<div className="profile-stats">
<div><h3>12</h3><p>Listings</p></div>
<div><h3>8</h3><p>Completed</p></div>
<div><h3>4.8 ⭐</h3><p>Rating</p></div>
</div>

</motion.div>

{/* RIGHT FORM */}
<motion.div
className="profile-form-card glass"
initial={{x:50,opacity:0}}
animate={{x:0,opacity:1}}
>

<div className="profile-header">

<h2>Profile Settings</h2>

<button
className="edit-btn"
onClick={()=>setEditMode(!editMode)}
>
{editMode ? "Cancel" : "Edit"}
</button>

</div>

<form onSubmit={handleSubmit}>

<input name="name" disabled={!editMode} value={formData.name} onChange={handleChange}/>
<input name="email" disabled={!editMode} value={formData.email} onChange={handleChange}/>
<input name="phone" disabled={!editMode} value={formData.phone} onChange={handleChange}/>
<textarea name="address" disabled={!editMode} value={formData.address} onChange={handleChange}/>

{editMode && (
<>
<input type="password" name="newPassword" placeholder="New Password" value={formData.newPassword} onChange={handleChange}/>

<button className="save-btn" disabled={loading}>
{loading ? "Saving..." : "Save Changes"}
</button>
</>
)}

</form>

{success && (
<motion.div className="success-toast" initial={{opacity:0}} animate={{opacity:1}}>
Profile updated ✅
</motion.div>
)}

</motion.div>

</div>

</motion.div>

);
}