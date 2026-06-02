import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

import {
FaUser,
FaEnvelope,
FaLock,
FaPhone,
FaMapMarkerAlt,
FaEye,
FaEyeSlash
} from "react-icons/fa";

export default function Register(){

const { register } = useContext(AuthContext);
const navigate = useNavigate();

/* ================= STATES ================= */

const [step,setStep] = useState(1);
const [loading,setLoading] = useState(false);
const [error,setError] = useState("");
const [acceptTerms,setAcceptTerms] = useState(false);
const [showPassword,setShowPassword] = useState(false);
const [detectingCity,setDetectingCity] = useState(false);

const [formData,setFormData] = useState({

name:"",
email:"",
password:"",
confirmPassword:"",
phone:"",
city:""

});

/* ================= AUTO DETECT CITY ================= */

useEffect(()=>{

if(!navigator.geolocation) return;

setDetectingCity(true);

navigator.geolocation.getCurrentPosition(

async(pos)=>{

const lat = pos.coords.latitude;
const lng = pos.coords.longitude;

try{

const res = await fetch(
`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
);

const data = await res.json();

const city =
data.address.city ||
data.address.town ||
data.address.village ||
data.address.county ||
"";

setFormData(prev=>({
...prev,
city:city
}));

}catch(err){
console.log("City detection failed");
}

setDetectingCity(false);

},

()=> setDetectingCity(false)

);

},[]);

/* ================= INPUT ================= */

const handleChange=(e)=>{

setFormData(prev=>({
...prev,
[e.target.name]:e.target.value
}));

};

/* ================= PASSWORD STRENGTH ================= */

const getStrengthScore=()=>{

let score=0;

if(formData.password.length>6) score++;
if(/[A-Z]/.test(formData.password)) score++;
if(/[0-9]/.test(formData.password)) score++;
if(/[^A-Za-z0-9]/.test(formData.password)) score++;

return score;

};

const strengthLabels=["Weak","Medium","Good","Strong"];

/* ================= STEP 1 ================= */

const handleNext=(e)=>{

e.preventDefault();
setError("");

if(!formData.name || !formData.email){
return setError("Please fill all fields");
}

const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!emailRegex.test(formData.email)){
return setError("Invalid email address");
}

if(formData.password.length < 6){
return setError("Password must be at least 6 characters");
}

if(formData.password !== formData.confirmPassword){
return setError("Passwords do not match");
}

setStep(2);

};

/* ================= REGISTER ================= */

const handleRegister=async(e)=>{

e.preventDefault();
setError("");

if(!formData.phone || !formData.city){
return setError("Please fill all fields");
}

if(!acceptTerms){
return setError("You must accept Terms & Conditions");
}

setLoading(true);

try{

await register(formData);

navigate("/dashboard",{replace:true});

}catch(err){

setError(
err?.response?.data?.message || "Registration failed"
);

}finally{

setLoading(false);

}

};

/* ================= UI ================= */

return(

<div className="olx-auth-wrapper">

{/* LEFT */}

<div className="auth-left">

<h1>Welcome to QuickService</h1>

<p>India’s trusted service marketplace</p>

<ul>
<li>✔ Verified Providers</li>
<li>✔ Secure Booking</li>
<li>✔ Fast Support</li>
</ul>

</div>

{/* RIGHT */}

<div className="auth-right">

<div className="olx-auth-card">

<h2>Create Your Account</h2>

<p className="auth-sub">Step {step} of 2</p>

{error && (
<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
className="auth-error"
>
{error}
</motion.div>
)}

<AnimatePresence mode="wait">

{/* ================= STEP 1 ================= */}

{step===1 &&(

<motion.form
key="step1"
initial={{opacity:0,x:50}}
animate={{opacity:1,x:0}}
exit={{opacity:0,x:-50}}
transition={{duration:0.3}}
onSubmit={handleNext}
>

<div className="input-group">
<FaUser className="input-icon"/>
<input
type="text"
name="name"
required
value={formData.name}
onChange={handleChange}
/>
<label>Full Name</label>
</div>

<div className="input-group">
<FaEnvelope className="input-icon"/>
<input
type="email"
name="email"
required
value={formData.email}
onChange={handleChange}
/>
<label>Email Address</label>
</div>

<div className="input-group">
<FaLock className="input-icon"/>
<input
type={showPassword ? "text":"password"}
name="password"
required
value={formData.password}
onChange={handleChange}
/>
<label>Password</label>

<span
className="toggle-pass"
onClick={()=>setShowPassword(!showPassword)}
>
{showPassword ? <FaEyeSlash/> : <FaEye/>}
</span>

</div>

{formData.password &&(

<div className="strength-bar">

<div
className={`strength-fill strength-${getStrengthScore()}`}
/>

<span>
{strengthLabels[getStrengthScore()-1] || "Very Weak"}
</span>

</div>

)}

<div className="input-group">
<FaLock className="input-icon"/>
<input
type={showPassword ? "text":"password"}
name="confirmPassword"
required
value={formData.confirmPassword}
onChange={handleChange}
/>
<label>Confirm Password</label>
<span
className="toggle-pass"
onClick={()=>setShowPassword(!showPassword)}
>
{showPassword ? <FaEyeSlash/> : <FaEye/>}
</span>


</div>


<button className="primary-btn">
Continue →
</button>

</motion.form>

)}

{/* ================= STEP 2 ================= */}

{step===2 &&(

<motion.form
key="step2"
initial={{opacity:0,x:50}}
animate={{opacity:1,x:0}}
exit={{opacity:0,x:-50}}
transition={{duration:0.3}}
onSubmit={handleRegister}
>

<div className="input-group">
<FaPhone className="input-icon"/>
<input
type="text"
name="phone"
required
value={formData.phone}
onChange={handleChange}
/>
<label>Phone Number</label>
</div>

<div className="input-group">
<FaMapMarkerAlt className="input-icon"/>
<input
type="text"
name="city"
required
value={formData.city}
onChange={handleChange}
/>
<label>
{detectingCity ? "Detecting city..." : "City"}
</label>
</div>

<label className="terms">

<input
type="checkbox"
checked={acceptTerms}
onChange={()=>setAcceptTerms(!acceptTerms)}
/>

I agree to Terms & Conditions

</label>

<div className="step-buttons">

<button
type="button"
className="secondary-btn"
onClick={()=>setStep(1)}
>
← Back
</button>

<button
className="primary-btn"
disabled={loading}
>

{loading ? "Creating..." : "Create Account"}

</button>

</div>

</motion.form>

)}

</AnimatePresence>

<div className="auth-footer">

Already have an account?  
<Link to="/login">Login</Link>

</div>

</div>

</div>

</div>

);

}