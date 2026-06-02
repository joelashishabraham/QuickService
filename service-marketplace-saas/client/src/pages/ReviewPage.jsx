import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import {
FaStar,
FaRegStar,
FaCamera,
FaPaperPlane,
FaArrowLeft,
FaTimes
} from "react-icons/fa";

export default function ReviewPage(){

const { id } = useParams();
const navigate = useNavigate();

const [rating,setRating] = useState(5);
const [hover,setHover] = useState(0);
const [comment,setComment] = useState("");
const [image,setImage] = useState(null);
const [preview,setPreview] = useState(null);
const [loading,setLoading] = useState(false);
const [service,setService] = useState("");

const maxChars = 300;

/* ================= TOKEN ================= */

const token = localStorage.getItem("token");

/* ================= RATING LABEL ================= */

const getRatingText = () => {
switch(rating){
case 1: return "😡 Very Bad";
case 2: return "😕 Poor";
case 3: return "🙂 Average";
case 4: return "😊 Good";
case 5: return "😍 Excellent";
default: return "";
}
};

/* ================= LOAD BOOKING ================= */

useEffect(()=>{

if(!token){
alert("Login required");
navigate("/login");
return;
}

const loadBooking = async()=>{

try{

const res = await axios.get(
`http://localhost:5000/api/bookings/${id}`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

if(res.data.success){
setService(res.data.data.service?.name || "");
}

}catch(err){
console.log("BOOKING ERROR:",err);
alert("Failed to load booking");
}

};

loadBooking();

/* CLEANUP PREVIEW */
return ()=>{
if(preview) URL.revokeObjectURL(preview);
};

},[id]);

/* ================= IMAGE ================= */

const handleImage = (file)=>{
if(!file) return;

/* VALIDATION */
if(!file.type.startsWith("image/")){
alert("Only image files allowed");
return;
}

/* SIZE LIMIT (optional) */
if(file.size > 5 * 1024 * 1024){
alert("Max 5MB allowed");
return;
}

/* CLEAN OLD PREVIEW */
if(preview){
URL.revokeObjectURL(preview);
}

setImage(file);
setPreview(URL.createObjectURL(file));
};

const removeImage = ()=>{
if(preview){
URL.revokeObjectURL(preview);
}
setImage(null);
setPreview(null);
};

/* ================= SUBMIT ================= */

const submitReview = async ()=>{

if(loading) return; // prevent double click

if(comment.trim().length < 3){
alert("Write at least 3 characters");
return;
}

try{

setLoading(true);

const formData = new FormData();
formData.append("bookingId",id);
formData.append("rating",rating);
formData.append("comment",comment);

if(image){
formData.append("image",image);
}

const res = await axios.post(
"http://localhost:5000/api/reviews",
formData,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

if(res.data.success){
alert("⭐ Review submitted");
navigate("/mybookings");
}

}catch(err){

console.log("REVIEW ERROR:",err);

if(err.response?.status === 401){
alert("Session expired, login again");
navigate("/login");
}else{
alert(
err?.response?.data?.message ||
"Failed to submit review"
);
}

}finally{
setLoading(false);
}

};

/* ================= UI ================= */

return(

<div className="review-page">

<div className="review-card">

<button className="back-btn" onClick={()=>navigate(-1)}>
<FaArrowLeft/> Back
</button>

<h2>Leave a Review</h2>

{service && (
<p className="service-name">
Service: <b>{service}</b>
</p>
)}

{/* ⭐ RATING */}

<div className="rating-stars">
{[1,2,3,4,5].map(star=>(
<span
key={star}
onClick={()=>setRating(star)}
onMouseEnter={()=>setHover(star)}
onMouseLeave={()=>setHover(0)}
className={star <= (hover || rating) ? "active-star" : ""}
>
{star <= (hover || rating)
? <FaStar/>
: <FaRegStar/>
}
</span>
))}
</div>

<p className="rating-text">{getRatingText()}</p>

{/* COMMENT */}

<textarea
placeholder="Write your experience..."
value={comment}
maxLength={maxChars}
onChange={(e)=>setComment(e.target.value)}
/>

<div className="char-count">
{comment.length}/{maxChars}
</div>

{/* IMAGE */}

<label className="upload-box">
<FaCamera/> Add Photo
<input
type="file"
hidden
accept="image/*"
onChange={(e)=>handleImage(e.target.files[0])}
/>
</label>

{preview && (
<div className="image-preview">
<img src={preview} alt="preview"/>
<button onClick={removeImage}>
<FaTimes/>
</button>
</div>
)}

{/* ACTIONS */}

<div className="review-actions">

<button
className="cancel-btn"
onClick={()=>navigate(-1)}
disabled={loading}
>
Cancel
</button>

<button
className="submit-btn"
onClick={submitReview}
disabled={loading}
>
{loading ? "Submitting..." : (
<>
<FaPaperPlane/> Submit
</>
)}
</button>

</div>

</div>
</div>
);
}